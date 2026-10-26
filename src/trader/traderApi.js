import { supabase } from '../data'
import { getFirebase } from '../firebase'

// =============================================================================
// Trader website login — same system as the app
//   1. mobile number → SMS OTP (Firebase)
//   2. the server function "trader-web-login" checks the OTP proof and gives a
//      30-day login pass for that phone (saved in this browser)
//   3. My Accounts: broker / buyer accounts linked to the phone (same list as
//      the app), add / remove accounts, open one to see its bills
// =============================================================================

const KEY = 'apmc_trader_session_v1'

// ----------------------------------------------------------------- saved pass
export function getTraderSession() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!s || !s.token) return null
    if (s.expires_at && new Date(s.expires_at) < new Date()) {
      localStorage.removeItem(KEY)
      return null
    }
    return s
  } catch {
    return null
  }
}

function saveTraderSession(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* private window: login lasts until the page is closed */
  }
}

export function clearTraderSession() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

// ----------------------------------------------------------------- OTP
let verifier = null

function resetVerifier() {
  try {
    verifier?.clear()
  } catch {
    /* ignore */
  }
  verifier = null
}

/**
 * Sends the SMS. phone10 = 10-digit Indian mobile number.
 * containerId = id of an empty <div> on the page (invisible "I'm not a robot" check).
 * Returns { ok: true, confirmation } or { ok: false, error }
 */
export async function sendOtp(phone10, containerId, lang = 'hi') {
  try {
    const fb = await getFirebase()
    fb.auth.languageCode = lang === 'en' ? 'en' : lang === 'mr' ? 'mr' : 'hi'
    if (!verifier) {
      verifier = new fb.RecaptchaVerifier(fb.auth, containerId, { size: 'invisible' })
    }
    const confirmation = await fb.signInWithPhoneNumber(fb.auth, '+91' + phone10, verifier)
    return { ok: true, confirmation }
  } catch (e) {
    resetVerifier()
    console.warn('OTP send failed:', e?.code || e?.message)
    return { ok: false, error: friendlyFirebase(e) }
  }
}

/**
 * Checks the OTP, then asks our server for the website login pass.
 * Returns { ok: true, session } or { ok: false, error }
 */
export async function verifyOtp(confirmation, code) {
  let idToken = ''
  try {
    const cred = await confirmation.confirm(String(code).trim())
    idToken = await cred.user.getIdToken()
  } catch (e) {
    console.warn('OTP check failed:', e?.code || e?.message)
    return { ok: false, error: friendlyFirebase(e) }
  }

  try {
    const { data, error } = await supabase.functions.invoke('trader-web-login', { body: { idToken } })
    let res = data
    if (error) {
      try {
        res = await error.context?.json?.()
      } catch {
        res = null
      }
    }
    if (!res || !res.ok) return { ok: false, error: res?.error || 'server' }
    const session = { token: res.token, phone: res.phone_number, expires_at: res.expires_at }
    saveTraderSession(session)
    return { ok: true, session }
  } catch (e) {
    console.warn('Trader login failed:', e?.message)
    return { ok: false, error: 'server' }
  } finally {
    // the website keeps its own pass; Firebase is not needed any more
    try {
      const fb = await getFirebase()
      await fb.signOut(fb.auth)
    } catch {
      /* ignore */
    }
  }
}

function friendlyFirebase(e) {
  const c = String(e?.code || e?.message || '')
  if (c.includes('firebase_not_configured')) return 'not_configured'
  if (c.includes('invalid-phone-number')) return 'bad_phone'
  if (c.includes('too-many-requests') || c.includes('quota')) return 'too_many'
  if (c.includes('invalid-verification-code')) return 'wrong_otp'
  if (c.includes('code-expired') || c.includes('session-expired')) return 'otp_expired'
  if (c.includes('unauthorized-domain') || c.includes('captcha') || c.includes('app-not-authorized')) return 'domain'
  if (c.includes('network')) return 'network'
  return 'server'
}

// ----------------------------------------------------------------- server calls
async function call(fn, params) {
  if (!supabase) throw new Error('offline')
  const { data, error } = await supabase.rpc(fn, params)
  if (error) {
    if (String(error.message).includes('SESSION_EXPIRED')) throw new Error('SESSION_EXPIRED')
    throw error
  }
  return data
}

/** Is the saved pass still valid? Returns the session or null. */
export async function checkTraderSession() {
  const s = getTraderSession()
  if (!s || !supabase) return null
  try {
    const d = await call('trader_web_me', { p_token: s.token })
    if (!d?.ok) {
      clearTraderSession()
      return null
    }
    return s
  } catch {
    return s // network problem: keep the login, next call checks again
  }
}

export async function traderLogout(token) {
  clearTraderSession()
  try {
    await call('trader_web_logout', { p_token: token })
  } catch {
    /* already logged out here */
  }
}

export const listAccounts = (token) => call('trader_web_accounts', { p_token: token })

/** type = 'broker' | 'buyer'. Returns { ok, error?, tries_left?, minutes? } */
export const addAccount = (token, type, mandiId, loginId, pin) =>
  call('trader_web_add_account', {
    p_token: token,
    p_type: type,
    p_mandi_id: mandiId,
    p_login_id: String(loginId || '').trim(),
    p_pin: String(pin || '').trim(),
  })

export const removeAccount = (token, linkId) => call('trader_web_remove_account', { p_token: token, p_link_id: linkId })

/** Opens one account. Returns { ok, token, type, name, mandi_name, ... } */
export const openAccount = (token, type, profileId) =>
  call('trader_web_open', { p_token: token, p_type: type, p_profile_id: profileId })

// ----------------------------------------------------------------- buyer pages
export const fetchBuyerBills = (token, from, to) =>
  call('buyer_web_bills', { p_token: token, p_from: from || null, p_to: to || null }).then((d) => d || [])
export const fetchBuyerUnbilled = (token) => call('buyer_web_unbilled', { p_token: token }).then((d) => d || [])
export const fetchBuyerCess = (token) => call('buyer_web_cess', { p_token: token }).then((d) => d || [])

// ----------------------------------------------------------------- buyer dashboard
/** My purchases of a period (+ 7 days for the trend), mandi rates, billed / not billed money */
export const fetchBuyerDashboard = (token, from, to) => call('buyer_web_dashboard', { p_token: token, p_from: from, p_to: to })

/** One lot I bought: { ok, ... } or { ok:false, error:'not_found' } */
export const fetchBuyerToken = (token, number, date) =>
  call('buyer_web_token', { p_token: token, p_number: Number(number), p_date: date })

/** My buyer bills of a period (print data). from/to null = everything */
export const fetchBuyerExport = (token, from, to) => call('buyer_web_export', { p_token: token, p_from: from || null, p_to: to || null })
