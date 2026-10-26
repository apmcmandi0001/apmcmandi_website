import { useEffect, useMemo, useState } from 'react'
import { inr, prettyDate } from '../data'
import { fetchPendingFarmers, removePending, makeFarmerBill } from '../trader/brokerHomeApi'
import { printFarmerBill } from '../trader/farmerBillPrint'
import './FarmerBill.css'

// =============================================================================
// Pending bills (website) — same as the app:
//   1. list of farmers with tokens waiting (date filter + name search)
//   2. one farmer: tick tokens, deduction (saved one is used, else enter it),
//      remove a token from Pending, Generate Bill (CASH / RTGS) → print
// =============================================================================

const TEXT = {
  en: {
    title: 'Pending bills',
    back: '← Dashboard',
    backList: '← Pending bills',
    allDates: 'All dates',
    search: 'Search farmer name',
    none: 'No pending bills',
    noneFound: 'No farmer found for this date / name',
    tokens: 'tokens',
    qtl: 'qtl',
    select: 'Tick the tokens for this bill',
    gross: 'Gross',
    saved: 'Saved deduction',
    deduction: 'Deduction (only one)',
    perQtl: '₹/qtl',
    locked: 'locked',
    utrai: 'Utrai (Fodai)',
    mapai: 'Mapai (Tolai)',
    hamali: 'Hamali',
    net: 'Net payable',
    remove: 'Remove from Pending',
    removeAsk: 'Remove token #{n} from Pending? (No bill is made.)',
    grandGross: 'Gross of ticked tokens',
    grandDed: 'Utrai + Mapai + Hamali',
    grandNet: 'Net payable',
    generate: 'Generate Bill',
    payTitle: 'Payment mode',
    payNote: 'This is printed on the bill',
    cash: 'Cash',
    rtgs: 'Bank transfer',
    cancel: 'Cancel',
    wait: 'Please wait…',
    made: 'Bill made',
    billNo: 'Bill No.',
    print: 'Print bill',
    popup: 'Allow pop-ups for this website to print the bill',
    pickOne: 'Tick at least one token',
    needCharge: 'Enter Utrai, Mapai or Hamali for every ticked token',
    load: 'Could not load. Please try again',
    tokenWord: 'Token',
    errors: {
      already_billed: 'Bill already made for this token',
      no_auction: 'Auction pending for this token',
      no_weight: 'Weighing pending for this token',
      other_farmer: 'This token is for a different farmer',
      no_charge: 'Enter Utrai, Mapai or Hamali for every ticked token',
      server: 'Server error. Please try again',
    },
  },
  hi: {
    title: 'पेंडिंग बिल',
    back: '← डैशबोर्ड',
    backList: '← पेंडिंग बिल',
    allDates: 'सभी दिनांक',
    search: 'किसान का नाम खोजें',
    none: 'कोई पेंडिंग बिल नहीं',
    noneFound: 'इस दिनांक / नाम का कोई किसान नहीं मिला',
    tokens: 'टोकन',
    qtl: 'क्विंटल',
    select: 'इस बिल के टोकन पर टिक करें',
    gross: 'कुल',
    saved: 'सेव की गई कटौती',
    deduction: 'कटौती चुनें (केवल एक)',
    perQtl: '₹/क्विंटल',
    locked: 'बंद',
    utrai: 'उतराई (फोडाई)',
    mapai: 'मापाई (तोलाई)',
    hamali: 'हमाली',
    net: 'देय रकम',
    remove: 'पेंडिंग से हटाएं',
    removeAsk: 'टोकन #{n} पेंडिंग से हटाएं? (बिल नहीं बनेगा।)',
    grandGross: 'टिक किए टोकन की कुल रकम',
    grandDed: 'उतराई + मापाई + हमाली',
    grandNet: 'देय रकम',
    generate: 'बिल बनाएं',
    payTitle: 'भुगतान कैसे?',
    payNote: 'यह बिल पर छपेगा',
    cash: 'नगद',
    rtgs: 'बैंक ट्रांसफर',
    cancel: 'रद्द करें',
    wait: 'कृपया रुकें…',
    made: 'बिल बन गया',
    billNo: 'बिल नं.',
    print: 'बिल प्रिंट करें',
    popup: 'बिल प्रिंट के लिए इस वेबसाइट के पॉप-अप चालू करें',
    pickOne: 'कम से कम एक टोकन चुनें',
    needCharge: 'चुने गए हर टोकन के लिए उतराई / मापाई / हमाली में से एक डालें',
    load: 'नहीं खुला। फिर से कोशिश करें',
    tokenWord: 'टोकन',
    errors: {
      already_billed: 'इस टोकन का बिल बन चुका है',
      no_auction: 'लिलाव अभी बाकी है',
      no_weight: 'तोलाई अभी बाकी है',
      other_farmer: 'यह टोकन दूसरे किसान का है',
      no_charge: 'चुने गए हर टोकन के लिए उतराई / मापाई / हमाली में से एक डालें',
      server: 'सर्वर त्रुटि। फिर से कोशिश करें',
    },
  },
  mr: {
    title: 'पेंडिंग बिल',
    back: '← डॅशबोर्ड',
    backList: '← पेंडिंग बिल',
    allDates: 'सर्व तारखा',
    search: 'शेतकऱ्याचे नाव शोधा',
    none: 'पेंडिंग बिल नाही',
    noneFound: 'या तारखेचा / नावाचा शेतकरी सापडला नाही',
    tokens: 'टोकन',
    qtl: 'क्विंटल',
    select: 'या बिलाच्या टोकनवर टिक करा',
    gross: 'एकूण',
    saved: 'सेव्ह केलेली कपात',
    deduction: 'कपात निवडा (फक्त एक)',
    perQtl: '₹/क्विंटल',
    locked: 'बंद',
    utrai: 'उतराई (फोडाई)',
    mapai: 'मापाई (तोलाई)',
    hamali: 'हमाली',
    net: 'देय रक्कम',
    remove: 'पेंडिंगमधून काढा',
    removeAsk: 'टोकन #{n} पेंडिंगमधून काढायचा? (बिल होणार नाही.)',
    grandGross: 'टिक केलेल्या टोकनची एकूण रक्कम',
    grandDed: 'उतराई + मापाई + हमाली',
    grandNet: 'देय रक्कम',
    generate: 'बिल बनवा',
    payTitle: 'पेमेंट कसे?',
    payNote: 'हे बिलावर छापले जाईल',
    cash: 'रोख',
    rtgs: 'बँक ट्रान्सफर',
    cancel: 'रद्द करा',
    wait: 'कृपया थांबा…',
    made: 'बिल तयार झाले',
    billNo: 'बिल नं.',
    print: 'बिल प्रिंट करा',
    popup: 'बिल प्रिंटसाठी या वेबसाइटचे पॉप-अप चालू करा',
    pickOne: 'किमान एक टोकन निवडा',
    needCharge: 'निवडलेल्या प्रत्येक टोकनसाठी उतराई / मापाई / हमाली पैकी एक टाका',
    load: 'उघडले नाही. पुन्हा प्रयत्न करा',
    tokenWord: 'टोकन',
    errors: {
      already_billed: 'या टोकनचे बिल आधीच झाले आहे',
      no_auction: 'लिलाव अजून बाकी आहे',
      no_weight: 'तोलाई अजून बाकी आहे',
      other_farmer: 'हा टोकन दुसऱ्या शेतकऱ्याचा आहे',
      no_charge: 'निवडलेल्या प्रत्येक टोकनसाठी उतराई / मापाई / हमाली पैकी एक टाका',
      server: 'सर्व्हर त्रुटी. पुन्हा प्रयत्न करा',
    },
  },
}

const CHARGES = ['utrai', 'mapai', 'hamali']
const num = (v) => Number(v) || 0
const qtl = (v) => num(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })
const farmerKey = (name, phone) =>
  `${String(name || '').trim().toLowerCase().replace(/\s+/g, ' ')}|${String(phone || '').replace(/\s+/g, '')}`

/** saved deduction from Pending, or the one typed on this screen */
const lineCharge = (l) => {
  if (CHARGES.includes(l.charge_type) && num(l.charge_rate) > 0) {
    return { type: l.charge_type, rate: num(l.charge_rate), saved: true, amount: num(l.charge_rate) * num(l.total_weight_quintal) }
  }
  const type = CHARGES.find((c) => String(l.rates?.[c] || '').trim() !== '') || null
  const rate = type ? num(l.rates[type]) : 0
  return { type, rate, saved: false, amount: rate * num(l.total_weight_quintal) }
}
const lineGross = (l) => num(l.total_weight_quintal) * num(l.rate_per_quintal)

export default function PendingBills({ lang, acc, onBack, onExpired }) {
  const T = TEXT[lang] || TEXT.en
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [reload, setReload] = useState(0)
  const [date, setDate] = useState('')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(null) // farmer key

  useEffect(() => {
    let alive = true
    setLoading(true)
    setMsg('')
    fetchPendingFarmers(acc.token)
      .then((d) => alive && setRows(d))
      .catch((e) => {
        if (!alive) return
        if (e.message === 'SESSION_EXPIRED') onExpired()
        else setMsg(T.load)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acc.token, reload])

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase()
    const map = new Map()
    for (const r of rows) {
      if (q && !String(r.farmer_name || '').toLowerCase().includes(q)) continue
      if (date && String(r.token_date).slice(0, 10) !== date) continue
      const key = farmerKey(r.farmer_name, r.farmer_phone_number)
      if (!map.has(key)) map.set(key, { key, name: r.farmer_name || '-', phone: r.farmer_phone_number || '-', items: [], commodities: new Set() })
      const g = map.get(key)
      g.items.push(r)
      g.commodities.add(r.commodity_name || '-')
    }
    return [...map.values()]
  }, [rows, search, date])

  if (open) {
    const items = rows.filter((r) => farmerKey(r.farmer_name, r.farmer_phone_number) === open)
    return (
      <FarmerPending
        T={T}
        lang={lang}
        acc={acc}
        items={items}
        onBack={() => {
          setOpen(null)
          setReload((n) => n + 1)
        }}
        onChanged={() => setReload((n) => n + 1)}
        onExpired={onExpired}
      />
    )
  }

  return (
    <div className="bp-card">
      <div className="bp-top">
        <div>
          <div className="bp-muted">{acc.name}</div>
          <h1 className="bp-name">{T.title}</h1>
        </div>
        <button type="button" className="bp-btn bp-btn-outline" onClick={onBack}>
          {T.back}
        </button>
      </div>

      <div className="pb-filters">
        <div className="pb-date">
          <input type="date" className="bp-input" value={date} onChange={(e) => setDate(e.target.value)} />
          {date ? (
            <button type="button" className="fb-x" onClick={() => setDate('')} title={T.allDates}>
              ✕
            </button>
          ) : (
            <span className="bp-muted bp-small">{T.allDates}</span>
          )}
        </div>
        <input className="bp-input" placeholder={T.search} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {msg && <div className="bp-error">{msg}</div>}
      {loading ? (
        <div className="bp-empty">{T.wait}</div>
      ) : groups.length === 0 ? (
        <div className="bp-empty">{rows.length === 0 ? T.none : T.noneFound}</div>
      ) : (
        <div className="bp-list">
          {groups.map((g) => {
            const net = g.items.reduce((s, l) => s + lineGross(l) - lineCharge(l).amount, 0)
            return (
              <button key={g.key} type="button" className="bp-row pb-farmer" onClick={() => setOpen(g.key)}>
                <span className="pb-ico">👨‍🌾</span>
                <div className="bp-row-main">
                  <div className="bp-row-who">{g.name}</div>
                  <div className="bp-muted bp-small">{g.phone}</div>
                  <div className="bp-muted bp-small">
                    {g.items.length} {T.tokens} · {[...g.commodities].join(', ')}
                  </div>
                </div>
                <div className="bp-row-amt">{inr(net)} ›</div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ------------------------------------------------------------------ one farmer
function FarmerPending({ T, lang, acc, items, onBack, onChanged, onExpired }) {
  const [lines, setLines] = useState(() => items.map((r) => ({ ...r, selected: true, rates: { utrai: '', mapai: '', hamali: '' } })))
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const [askMode, setAskMode] = useState(false)
  const [done, setDone] = useState(null)

  const first = items[0] || {}
  const chosen = lines.filter((l) => l.selected)
  const gGross = chosen.reduce((s, l) => s + lineGross(l), 0)
  const gDed = chosen.reduce((s, l) => s + lineCharge(l).amount, 0)

  const fail = (e) => {
    if (e?.message === 'SESSION_EXPIRED') onExpired()
    else setErr(T.errors.server)
  }
  const update = (id, patch) => setLines((ls) => ls.map((l) => (l.pending_id === id ? { ...l, ...patch } : l)))
  const setRate = (l, type, value) => {
    const v = value.replace(/[^\d.]/g, '').replace(/^(\d*\.?\d{0,2}).*$/, '$1')
    update(l.pending_id, { rates: { ...l.rates, [type]: v } })
  }

  async function remove(l) {
    if (!window.confirm(T.removeAsk.replace('{n}', l.token_number))) return
    setBusy('remove')
    setErr('')
    try {
      await removePending(acc.token, l.pending_id)
      const left = lines.filter((x) => x.pending_id !== l.pending_id)
      setLines(left)
      onChanged()
      if (left.length === 0) onBack()
    } catch (ex) {
      fail(ex)
    } finally {
      setBusy('')
    }
  }

  function startBill() {
    setErr('')
    if (chosen.length === 0) return setErr(T.pickOne)
    if (chosen.some((l) => lineCharge(l).rate <= 0)) return setErr(T.needCharge)
    setAskMode(true)
  }

  async function makeBill(mode) {
    setAskMode(false)
    setBusy('bill')
    setErr('')
    try {
      const payload = chosen.map((l) => {
        const c = lineCharge(l)
        return { token_id: l.token_id, charge_type: c.type, charge_rate: c.rate }
      })
      const r = await makeFarmerBill(acc.token, payload, mode)
      if (!r?.ok) {
        const base = T.errors[r?.error] || T.errors.server
        return setErr(r?.token_number ? `${T.tokenWord} #${r.token_number}: ${base}` : base)
      }
      setDone(r)
      onChanged()
    } catch (ex) {
      fail(ex)
    } finally {
      setBusy('')
    }
  }

  if (done) {
    const net = (done.lines || []).reduce((s, l) => s + num(l.net_payable_amount), 0)
    return (
      <div className="bp-card fb-done">
        <div className="fb-done-tick">✓</div>
        <h1 className="bp-name">{T.made}</h1>
        <p className="bp-muted">
          {T.billNo} <b>{done.bill?.bill_no}</b> · {done.bill?.farmer_name} · {done.bill?.payment_mode}
        </p>
        <div className="fb-done-amt">{inr(net)}</div>
        <div className="fb-actions">
          <button type="button" className="bp-btn" onClick={() => printFarmerBill(done) || alert(T.popup)}>
            🖨 {T.print}
          </button>
          <button type="button" className="bp-btn bp-btn-outline" onClick={onBack}>
            {T.backList}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bp-card fb">
      <div className="bp-top">
        <div>
          <div className="bp-muted">{T.title}</div>
          <h1 className="bp-name">{first.farmer_name}</h1>
          <div className="bp-muted bp-small">{first.farmer_phone_number}</div>
        </div>
        <button type="button" className="bp-btn bp-btn-outline" onClick={onBack}>
          {T.backList}
        </button>
      </div>

      <div className="bp-muted bp-small pb-hint">{T.select}</div>
      {err && <div className="bp-error">{err}</div>}

      <div className="fb-lines">
        {lines.map((l) => {
          const c = lineCharge(l)
          const gross = lineGross(l)
          return (
            <div key={l.pending_id} className={'fb-line' + (l.selected ? '' : ' pb-off')}>
              <div className="fb-line-top">
                <label className="pb-check">
                  <input type="checkbox" checked={l.selected} onChange={(e) => update(l.pending_id, { selected: e.target.checked })} />
                  <div>
                    <b>
                      #{l.token_number} — {l.commodity_name}
                    </b>
                    <div className="bp-muted bp-small">
                      {prettyDate(l.token_date, lang)} · {l.buyer_name} · {qtl(l.total_weight_quintal)} {T.qtl} × {inr(l.rate_per_quintal)}
                    </div>
                  </div>
                </label>
                <button type="button" className="fb-x" title={T.remove} disabled={!!busy} onClick={() => remove(l)}>
                  🗑
                </button>
              </div>
              <div className="fb-gross">
                {T.gross}: <b>{inr(gross)}</b>
              </div>

              {c.saved ? (
                <div className="pb-saved">
                  <span>✓ {T.saved}</span>
                  <b>
                    {T[c.type]} · ₹{c.rate}/{T.qtl} = {inr(c.amount)}
                  </b>
                </div>
              ) : (
                <>
                  <div className="fb-ded-title">{T.deduction}</div>
                  <div className="fb-ded">
                    {CHARGES.map((k) => {
                      const lockedBox = c.type && c.type !== k
                      const amt = num(l.rates[k]) * num(l.total_weight_quintal)
                      return (
                        <label key={k} className={lockedBox ? 'locked' : c.type === k ? 'on' : ''}>
                          <span>
                            {lockedBox ? '🔒 ' : ''}
                            {T[k]}
                          </span>
                          <div>
                            <input value={l.rates[k]} disabled={!!lockedBox} onChange={(e) => setRate(l, k, e.target.value)} inputMode="decimal" placeholder="0" />
                            <em>{T.perQtl}</em>
                          </div>
                          <small>{lockedBox ? `₹0 (${T.locked})` : amt > 0 ? `= ${inr(amt)}` : ' '}</small>
                        </label>
                      )
                    })}
                  </div>
                </>
              )}
              <div className="fb-net">
                {T.net}: <b>{inr(gross - c.amount)}</b>
              </div>
            </div>
          )
        })}
      </div>

      <div className="fb-total">
        <div>
          <span>
            {T.grandGross} ({chosen.length})
          </span>
          <b>{inr(gGross)}</b>
        </div>
        <div>
          <span>{T.grandDed}</span>
          <b>{inr(gDed)}</b>
        </div>
        <div className="big">
          <span>{T.grandNet}</span>
          <b>{inr(gGross - gDed)}</b>
        </div>
      </div>
      <div className="fb-actions pb-one">
        <button type="button" className="bp-btn" disabled={!!busy || chosen.length === 0} onClick={startBill}>
          🧾 {busy === 'bill' ? T.wait : T.generate}
        </button>
      </div>

      {askMode && (
        <div className="fb-modal" role="dialog" aria-modal="true" onClick={() => setAskMode(false)}>
          <div className="fb-modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>{T.payTitle}</h2>
            <p>
              {T.grandNet}: <b>{inr(gGross - gDed)}</b>
            </p>
            <div className="fb-modes">
              <button type="button" className="cash" onClick={() => makeBill('CASH')}>
                <span>💵</span>
                <b>CASH</b>
                <small>{T.cash}</small>
              </button>
              <button type="button" className="rtgs" onClick={() => makeBill('RTGS')}>
                <span>🏦</span>
                <b>RTGS</b>
                <small>{T.rtgs}</small>
              </button>
            </div>
            <p className="fb-note">{T.payNote}</p>
            <button type="button" className="bp-btn bp-btn-outline" onClick={() => setAskMode(false)}>
              {T.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
