# Mandi platform — public website

One website for the whole platform:

| Address | What it shows |
|---|---|
| `/` | The software: features, how a mandi day works, list of mandis, demo-request form |
| `/mandis` | All mandis using the platform (searchable) |
| `/m/<slug>` | One mandi's own page: today's rates, notices, how selling works, contact + map |
| `/m/<slug>/rates` | That mandi's rates for any date |
| `/contact` | Your company contact + demo form |
| `/privacy`, `/terms` | Privacy Policy and Terms (drafts) |

Languages: मराठी (default), हिंदी, English. Everything about a mandi comes from the
Supabase `mandi` table, so a new mandi appears on the website automatically.

## 1. Run on your computer

```bash
npm install
cp .env.example .env        # Windows PowerShell:  copy .env.example .env
# open .env and paste the Supabase anon (publishable) key
npm run dev                 # http://localhost:5190
```

Without `.env` the site shows a clearly marked **sample** mandi.

## 2. Database (run once)

Supabase → SQL Editor → paste `supabase/website_setup.sql` → **Run**.

Then give each mandi a web address and website details (Table Editor → `mandi`):

| Column | Example |
|---|---|
| `website_slug` | `yavatmal` → page is `/m/yavatmal` |
| `whatsapp_number` | `919876543210` |
| `website_hours` | `सोम ते शनि · सकाळी ९ ते सायं ६` |
| `map_query` | `MIDC Darwha Road Yavatmal` |
| `website_about` | a few lines about the mandi |
| `logo_url` | link to a logo image (optional) |
| `website_enabled` | untick to hide a mandi from the website |

Name, operator line, licence, address, phone and email are taken from the columns the
Super Admin already fills (`mandi_name`, `bill_header_line1/2`, `license_no`, `address`,
`contact_phone`, `contact_email`).

- **Notices:** Table Editor → `website_notice` → Insert row. Set `mandi_id` to show it on
  that mandi's page; leave it empty for the main site.
- **Demo requests:** Table Editor → `website_lead`.

## 3. Your brand & contact

Edit `src/config.js` (brand name, company, phone, WhatsApp, email).
All sentences are in `src/i18n.jsx`.

## 4. Put it online (Vercel, free)

1. Push this folder to a new GitHub repo.
2. vercel.com → Sign in with GitHub → **Add New → Project** → choose the repo.
3. Framework: **Vite**. Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. **Deploy**. Every `git push` updates the site.
5. Settings → Domains → add your domain and copy the DNS records to your domain provider.
6. Replace `YOUR-DOMAIN.in` in `public/robots.txt` and `public/sitemap.xml`.
