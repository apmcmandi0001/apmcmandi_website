import { supabase } from '../data'

// =============================================================================
// Broker dashboard (website) — server calls for the opened broker account
// (from Trader Login → My Accounts). Every call needs that account's pass.
// Throws Error('SESSION_EXPIRED') when the pass is no longer valid.
// =============================================================================

async function call(fn, params) {
  if (!supabase) throw new Error('offline')
  const { data, error } = await supabase.rpc(fn, params)
  if (error) {
    if (String(error.message).includes('SESSION_EXPIRED')) throw new Error('SESSION_EXPIRED')
    throw error
  }
  return data
}

// ----------------------------------------------------------------- home
/** Tokens of the date + pending counts + last 7 days sales. date = 'YYYY-MM-DD' */
export const fetchBrokerHome = (token, date) => call('broker_web_home', { p_token: token, p_date: date })

/** One token: entry, auction, weight, patti. Returns { ok, token, auction, weight, patti } */
export const fetchBrokerToken = (token, number, date) =>
  call('broker_web_token', { p_token: token, p_number: Number(number), p_date: date })

// ----------------------------------------------------------------- farmer bill
/** Check one token for the farmer bill. Returns { ok, ...line } or { ok:false, error } */
export const fetchBillToken = (token, number, date) =>
  call('broker_web_bill_token', { p_token: token, p_number: Number(number), p_date: date })

/** items = [{ token_id, charge_type: 'utrai'|'mapai'|'hamali', charge_rate }] */
export const addToPending = (token, items) => call('broker_web_add_pending', { p_token: token, p_items: items })

/** Makes the bill. mode = 'CASH' | 'RTGS'. Returns { ok, bill, broker, mandi, lines } */
export const makeFarmerBill = (token, items, mode) =>
  call('broker_web_make_farmer_bill', { p_token: token, p_items: items, p_payment_mode: mode })

/** Print data of a saved farmer bill */
export const fetchFarmerBillPrint = (token, billId) =>
  call('broker_web_farmer_bill_print', { p_token: token, p_bill: billId })

// ----------------------------------------------------------------- pending bills
/** All tokens in Pending Bills, with saved deduction (if any), rate and weight */
export const fetchPendingFarmers = (token) => call('broker_web_pending_farmers', { p_token: token }).then((d) => d || [])

/** Take one token out of Pending (no bill is made) */
export const removePending = (token, pendingId) =>
  call('broker_web_remove_pending', { p_token: token, p_pending_id: pendingId })

// ----------------------------------------------------------------- buyer bill
/** Everything sold to buyers that is not on a buyer bill yet (with buyer_name) */
export const fetchUnbilledBuyerItems = (token) =>
  call('broker_web_pending', { p_token: token, p_kind: 'buyer' }).then((d) => d || [])

/** Makes ONE bill for all unbilled items of a buyer. tokenIds = the items shown on screen.
 *  Returns print data, or { ok:false, error:'changed' } when new items came in. */
export const makeBuyerBill = (token, buyerId, brokeragePercent, tokenIds) =>
  call('broker_web_make_buyer_bill', {
    p_token: token,
    p_buyer: buyerId,
    p_brokerage_percent: brokeragePercent,
    p_token_ids: tokenIds,
  })

/** Print data of a saved buyer bill */
export const fetchBuyerBillPrint = (token, billId) => call('broker_web_buyer_bill_print', { p_token: token, p_bill: billId })

// ----------------------------------------------------------------- transfer bill
/** { me, brokers: [{ id, name, firm }] } — other active brokers of my mandi */
export const fetchTransferSetup = (token) => call('broker_web_transfer_setup', { p_token: token })

/** My tokens in a date range that can be transferred: { ok, items, skipped: { reason: count } } */
export const fetchTransferItems = (token, from, to) => call('broker_web_transfer_items', { p_token: token, p_from: from, p_to: to })

/** One token (by number + date): { ok, ...line } or { ok:false, error } */
export const fetchTransferToken = (token, number, date) =>
  call('broker_web_transfer_token', { p_token: token, p_number: Number(number), p_date: date })

/** Saves the transfer. Returns print data { ok, transfer, from, to, mandi, lines } */
export const makeTransfer = (token, toBrokerId, tokenIds) =>
  call('broker_web_make_transfer', { p_token: token, p_to_broker: toBrokerId, p_token_ids: tokenIds })

/** Print data of a saved transfer */
export const fetchTransferPrint = (token, transferId) => call('broker_web_transfer_print', { p_token: token, p_transfer: transferId })

// ----------------------------------------------------------------- export
/** All bills of a period. from/to = 'YYYY-MM-DD' or null (= everything).
 *  kinds = { farmer, buyer, transfer } booleans */
export const fetchBrokerExport = (token, from, to, kinds) =>
  call('broker_web_export', {
    p_token: token,
    p_from: from || null,
    p_to: to || null,
    p_farmer: !!kinds.farmer,
    p_buyer: !!kinds.buyer,
    p_transfer: !!kinds.transfer,
  })
