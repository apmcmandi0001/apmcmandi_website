-- =============================================================================
-- Public website (multi-mandi): mandi pages, live rates, notices, demo requests
-- Run in Supabase → SQL Editor → New query → paste → Run.  Safe to run again.
--
-- The website can ONLY:
--   • read public info of active mandis (name, city, address, phone…; never GST/PAN/plan)
--   • read per-crop rate totals (min / max / average, number of lots)
--   • read published notices
--   • ADD a demo request (it can never read them back)
-- It can NOT read farmer names, phone numbers, bills or any other table.
-- =============================================================================

-- 1) Extra website fields on each mandi (edit them in Supabase Table Editor → mandi)
alter table public.mandi add column if not exists website_slug text;           -- e.g. 'yavatmal' → site.in/m/yavatmal
alter table public.mandi add column if not exists website_enabled boolean default true;
alter table public.mandi add column if not exists website_about text;           -- a few lines about the mandi
alter table public.mandi add column if not exists website_hours text;           -- e.g. 'सोम ते शनि · ९ ते ६'
alter table public.mandi add column if not exists whatsapp_number text;         -- e.g. 919876543210
alter table public.mandi add column if not exists map_query text;               -- e.g. 'MIDC Darwha Road Yavatmal'
alter table public.mandi add column if not exists logo_url text;

create unique index if not exists mandi_website_slug_key on public.mandi (lower(website_slug)) where website_slug is not null;

-- 2) List of mandis shown on the website ----------------------------------------
drop function if exists public.public_mandis();
create or replace function public.public_mandis()
returns table (
  id uuid, slug text, mandi_name text, operator_name text, city text, district text, state text,
  license_no text, address text, contact_phone text, logo_url text
)
language sql stable security definer set search_path = public as $$
  select m.id,
         coalesce(nullif(lower(m.website_slug), ''), lower(m.mandi_code), m.id::text),
         m.mandi_name::text,
         m.bill_header_line1::text,
         m.city::text, m.district::text, m.state::text,
         m.license_no::text,
         coalesce(m.bill_address, m.address)::text,
         m.contact_phone::text,
         m.logo_url::text
    from mandi m
   where coalesce(m.status, 'active') = 'active'
     and coalesce(m.website_enabled, true)
   order by m.mandi_name;
$$;

-- 3) One mandi's page (by slug, code or id) ---------------------------------------
drop function if exists public.public_mandi(text);
create or replace function public.public_mandi(p_slug text)
returns table (
  id uuid, slug text, mandi_name text, operator_name text, header_line2 text,
  city text, district text, state text, pincode text, license_no text, address text,
  contact_phone text, contact_email text, whatsapp_number text,
  website_about text, website_hours text, map_query text, logo_url text, crops text[]
)
language sql stable security definer set search_path = public as $$
  select m.id,
         coalesce(nullif(lower(m.website_slug), ''), lower(m.mandi_code), m.id::text),
         m.mandi_name::text,
         m.bill_header_line1::text,
         m.bill_header_line2::text,
         m.city::text, m.district::text, m.state::text, m.pincode::text,
         m.license_no::text,
         coalesce(m.bill_address, m.address)::text,
         m.contact_phone::text, m.contact_email::text, m.whatsapp_number::text,
         m.website_about::text, m.website_hours::text, m.map_query::text, m.logo_url::text,
         coalesce((select array_agg(c.commodity_name::text order by c.commodity_name)
                     from commodity c
                    where c.mandi_id = m.id and coalesce(c.status, 'active') = 'active'), '{}')
    from mandi m
   where coalesce(m.status, 'active') = 'active'
     and coalesce(m.website_enabled, true)
     and (lower(m.website_slug) = lower(p_slug)
          or lower(m.mandi_code) = lower(p_slug)
          or m.id::text = p_slug)
   limit 1;
$$;

-- 4) Daily rates per crop (p_date NULL = latest auction day; p_mandi_id NULL = all mandis)
create or replace function public.public_rates(p_date date default null, p_mandi_id uuid default null)
returns table (rate_date date, commodity text, lots bigint, min_rate numeric, max_rate numeric, avg_rate numeric)
language sql stable security definer set search_path = public as $$
  with d as (
    select coalesce(
      p_date,
      (select max(t.token_date)
         from auction a join token t on t.id = a.token_id
        where (p_mandi_id is null or t.mandi_id = p_mandi_id)
          and t.token_date <= current_date
          and a.rate_per_quintal > 0)
    ) as day
  )
  select d.day,
         coalesce(c.commodity_name, '-')::text,
         count(*)::bigint,
         min(a.rate_per_quintal)::numeric,
         max(a.rate_per_quintal)::numeric,
         round(avg(a.rate_per_quintal))::numeric
    from d
    join token t on t.token_date = d.day
    join auction a on a.token_id = t.id
    left join commodity c on c.id = t.commodity_id
   where (p_mandi_id is null or t.mandi_id = p_mandi_id)
     and a.rate_per_quintal > 0
   group by d.day, c.commodity_name
   order by count(*) desc, c.commodity_name;
$$;

-- 5) Small numbers for the home page ----------------------------------------------
drop function if exists public.public_platform_stats();
create or replace function public.public_platform_stats()
returns table (mandis bigint, lots_30d bigint, crops bigint)
language sql stable security definer set search_path = public as $$
  select (select count(*) from mandi m where coalesce(m.status,'active') = 'active' and coalesce(m.website_enabled, true)),
         (select count(*) from token t where t.token_date >= current_date - 30),
         (select count(distinct lower(c.commodity_name)) from commodity c where coalesce(c.status,'active') = 'active');
$$;

revoke all on function public.public_mandis() from public;
revoke all on function public.public_mandi(text) from public;
revoke all on function public.public_rates(date, uuid) from public;
revoke all on function public.public_platform_stats() from public;
grant execute on function public.public_mandis() to anon, authenticated;
grant execute on function public.public_mandi(text) to anon, authenticated;
grant execute on function public.public_rates(date, uuid) to anon, authenticated;
grant execute on function public.public_platform_stats() to anon, authenticated;

-- 6) Notices (mandi_id empty = shown on the main site; otherwise on that mandi's page)
create table if not exists public.website_notice (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  notice_date date not null default current_date,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.website_notice add column if not exists mandi_id uuid references public.mandi(id) on delete cascade;

alter table public.website_notice enable row level security;
drop policy if exists "website can read published notices" on public.website_notice;
create policy "website can read published notices"
  on public.website_notice for select to anon, authenticated using (is_published);
grant select on public.website_notice to anon, authenticated;

-- 7) Demo requests from mandi owners (website can add, never read) -----------------
create table if not exists public.website_lead (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  mandi_name text,
  city text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
alter table public.website_lead enable row level security;
drop policy if exists "website can add leads" on public.website_lead;
create policy "website can add leads"
  on public.website_lead for insert to anon, authenticated
  with check (length(name) between 2 and 100 and length(phone) between 8 and 20 and coalesce(length(message), 0) <= 1000);
grant insert on public.website_lead to anon, authenticated;

notify pgrst, 'reload schema';

-- -----------------------------------------------------------------------------
-- AFTER RUNNING: give each mandi a web address, e.g.
--   update mandi set website_slug = 'yavatmal', whatsapp_number = '919999999999',
--          map_query = 'MIDC Darwha Road Yavatmal', website_hours = 'सोम ते शनि · सकाळी ९ ते सायं ६'
--    where mandi_name ilike '%cotton%';
-- See demo requests: Table Editor → website_lead
-- -----------------------------------------------------------------------------
