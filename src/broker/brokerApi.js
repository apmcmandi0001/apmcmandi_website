import { supabase } from '../data'

// Saved login on this browser (token + broker name + mandi)
const KEY = 'apmc_broker_session'
const LAST_MANDI_KEY = 'apmc_broker_last_mandi'

export function getSession() {
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

function saveSession(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* private window: session lasts only until refresh */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export function getLastMandi() {
  try {
    return localStorage.getItem(LAST_MANDI_KEY) || ''
  } catch {
    return ''
  }
}

function saveLastMandi(id) {
  try {
    localStorage.setItem(LAST_MANDI_KEY, id)
  } catch {
    /* ignore */
  }
}

/**
 * Login with the same Login ID + PIN as the app.
 * Returns { ok: true, session } or { ok: false, error, tries_left, minutes }
 */
export async function brokerLogin(mandiId, loginId, pin) {
  if (!supabase) return { ok: false, error: 'offline' }
  const { data, error } = await supabase.rpc('broker_web_login', {
    p_mandi_id: mandiId,
    p_login_id: loginId.trim(),
    p_pin: pin.trim(),
  })
  if (error) {
    console.warn('Broker login failed:', error.message)
    return { ok: false, error: 'server' }
  }
  if (!data?.ok) return { ok: false, ...data }

  const session = {
    token: data.token,
    expires_at: data.expires_at,
    name: data.name,
    login_id: data.login_id,
    mandi_id: data.mandi_id,
    mandi_name: data.mandi_name,
  }
  saveSession(session)
  saveLastMandi(mandiId)
  return { ok: true, session }
}

export async function brokerLogout(token) {
  clearSession()
  if (!supabase || !token) return
  try {
    await supabase.rpc('broker_web_logout', { p_token: token })
  } catch {
    /* already logged out locally */
  }
}

/**
 * Bills of the logged-in broker.
 * kind = 'farmer' | 'buyer' | 'transfer', from/to = 'YYYY-MM-DD'
 * Throws Error('SESSION_EXPIRED') when the login is no longer valid.
 */
export async function fetchBrokerBills(token, kind, from, to) {
  const { data, error } = await supabase.rpc('broker_web_bills', {
    p_token: token,
    p_kind: kind,
    p_from: from,
    p_to: to,
  })
  if (error) {
    if (String(error.message).includes('SESSION_EXPIRED')) throw new Error('SESSION_EXPIRED')
    throw error
  }
  return data || []
}

/**
 * Pending items of the logged-in broker (no date filter, same as the app).
 * kind = 'farmer' → tokens added to Pending bills
 * kind = 'buyer'  → sold commodities not yet in a buyer bill
 */
export async function fetchBrokerPending(token, kind) {
  const { data, error } = await supabase.rpc('broker_web_pending', {
    p_token: token,
    p_kind: kind,
  })
  if (error) {
    if (String(error.message).includes('SESSION_EXPIRED')) throw new Error('SESSION_EXPIRED')
    throw error
  }
  return data || []
}