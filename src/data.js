import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from './config'

export const supabase =
  supabaseConfig.url && supabaseConfig.anonKey ? createClient(supabaseConfig.url, supabaseConfig.anonKey) : null

const today = () => new Date().toISOString().slice(0, 10)

// ----------------------------------------------------------------- sample data
// Shown only when Supabase is not connected yet (pages say "sample")
const SAMPLE_MANDI = {
  id: 'sample',
  slug: 'sample',
  mandi_name: 'कॉटनसिटी खाजगी बाजार (नमुना)',
  operator_name: 'कॉटनसिटी ॲग्रो फुड्स प्रा.लि. द्वारा संचालित',
  header_line2: 'खाजगी कृषि उत्पन्न बाज़ार ला.नं. ७०/२०१९',
  city: 'Yavatmal',
  district: 'Yavatmal',
  state: 'Maharashtra',
  license_no: '70/2019',
  address: 'एम.आय.डी.सी. दारव्हा रोड, यवतमाळ',
  contact_phone: '',
  contact_email: '',
  whatsapp_number: '',
  website_about: '',
  website_hours: '',
  map_query: 'MIDC Darwha Road Yavatmal',
  logo_url: '',
  crops: ['कापूस', 'सोयाबीन', 'तूर', 'हरभरा'],
}
const SAMPLE_RATES = [
  { commodity: 'कापूस', lots: 42, min_rate: 7150, max_rate: 7620, avg_rate: 7480 },
  { commodity: 'सोयाबीन', lots: 35, min_rate: 4250, max_rate: 4610, avg_rate: 4520 },
  { commodity: 'तूर', lots: 18, min_rate: 7000, max_rate: 7450, avg_rate: 7300 },
  { commodity: 'हरभरा', lots: 11, min_rate: 5400, max_rate: 5800, avg_rate: 5650 },
]

function warn(what, e) {
  console.warn(`${what} not available:`, e?.message || e)
}

// ----------------------------------------------------------------- mandis
export async function fetchMandis() {
  if (!supabase) return { rows: [SAMPLE_MANDI], sample: true }
  try {
    const { data, error } = await supabase.rpc('public_mandis')
    if (error) throw error
    return { rows: data || [], sample: false }
  } catch (e) {
    warn('Mandi list', e)
    return { rows: [SAMPLE_MANDI], sample: true, error: true }
  }
}

export async function fetchMandi(slug) {
  if (!supabase || slug === 'sample') return { mandi: SAMPLE_MANDI, sample: true }
  try {
    const { data, error } = await supabase.rpc('public_mandi', { p_slug: slug })
    if (error) throw error
    return { mandi: data?.[0] || null, sample: false }
  } catch (e) {
    warn('Mandi', e)
    return { mandi: null, sample: false, error: true }
  }
}

export async function fetchStats() {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.rpc('public_platform_stats')
    if (error) throw error
    return data?.[0] || null
  } catch (e) {
    warn('Stats', e)
    return null
  }
}

// ----------------------------------------------------------------- rates
/** Rates of one mandi for a date ('' / null = latest auction day). */
export async function fetchRates(mandiId, date) {
  if (!supabase || mandiId === 'sample') return { date: date || today(), rows: SAMPLE_RATES, sample: true }
  try {
    const { data, error } = await supabase.rpc('public_rates', { p_date: date || null, p_mandi_id: mandiId || null })
    if (error) throw error
    const rows = (data || []).map((r) => ({
      commodity: r.commodity || '-',
      lots: Number(r.lots) || 0,
      min_rate: Number(r.min_rate) || 0,
      max_rate: Number(r.max_rate) || 0,
      avg_rate: Number(r.avg_rate) || 0,
    }))
    return { date: data?.[0]?.rate_date || date || null, rows, sample: false }
  } catch (e) {
    warn('Rates', e)
    return { date: date || null, rows: [], sample: false, error: true }
  }
}

// ----------------------------------------------------------------- notices
/** mandiId = null → main-site notices; otherwise that mandi's notices */
export async function fetchNotices(mandiId, limit = 20) {
  if (!supabase || mandiId === 'sample') return { rows: [] }
  try {
    let q = supabase
      .from('website_notice')
      .select('id, title, body, notice_date')
      .eq('is_published', true)
      .order('notice_date', { ascending: false })
      .limit(limit)
    q = mandiId ? q.eq('mandi_id', mandiId) : q.is('mandi_id', null)
    const { data, error } = await q
    if (error) throw error
    return { rows: data || [] }
  } catch (e) {
    warn('Notices', e)
    return { rows: [] }
  }
}

// ----------------------------------------------------------------- demo request
export async function submitLead(lead) {
  if (!supabase) throw new Error('offline')
  const { error } = await supabase.from('website_lead').insert(lead)
  if (error) throw error
}

// ----------------------------------------------------------------- helpers
export const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN')

export function prettyDate(ymd, lang) {
  if (!ymd) return '-'
  const d = new Date(ymd + 'T00:00:00')
  if (isNaN(d)) return ymd
  const locale = lang === 'en' ? 'en-IN' : lang === 'hi' ? 'hi-IN' : 'mr-IN'
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
}

export const isToday = (ymd) => ymd === today()

export const telHref = (phone) => 'tel:' + String(phone || '').replace(/[^\d+]/g, '')
export const waHref = (number, text) =>
  `https://wa.me/${String(number || '').replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`
export const mapsHref = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
export const mapsEmbed = (q) => `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`
