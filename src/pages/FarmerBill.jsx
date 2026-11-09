import { useEffect, useMemo, useRef, useState } from 'react'
import { inr, prettyDate } from '../data'
import { fetchBillToken, fetchReadyTokens, addToPending, makeFarmerBill } from '../trader/brokerHomeApi'
import { printFarmerBill } from '../trader/farmerBillPrint'
import './FarmerBill.css'
import './BrokerExtra.css'

// =============================================================================
// Farmer bill (website) — same as the app's "Bill for Farmer":
//   pick date → list of that date's tokens ready for a bill (search, tick)
//   → one deduction per token (Utrai / Mapai / Hamali, ₹ per quintal)
//   → tokens of different farmers may go in one bill: pick whose name it is in
//   → Add to Pending  or  Generate Bill (CASH / RTGS) → print the bill
// =============================================================================

const TEXT = {
  en: {
    title: 'Farmer bill',
    back: '← Dashboard',
    date: 'Token date',
    search: 'Search token no. or farmer name',
    addNo: 'Add',
    ready: 'Ready for bill on this date',
    readyNone: 'No weighed tokens waiting for a bill on this date',
    readyNoneFound: 'No token found — type the token number and press Add',
    otherFarmer: 'different farmer — can still be added',
    selected: 'In this bill',
    none: 'Tick tokens above to add them to the bill',
    billFor: 'Bill in the name of',
    billForNote: 'This bill has tokens of different farmers',
    farmer: 'Farmer',
    qtl: 'qtl',
    gross: 'Gross',
    deduction: 'Deduction (only one)',
    perQtl: '₹/qtl',
    locked: 'locked',
    utrai: 'Utrai (Fodai)',
    mapai: 'Mapai (Tolai)',
    hamali: 'Hamali',
    net: 'Net payable',
    remove: 'Remove',
    grandGross: 'Grand gross',
    grandDed: 'Utrai + Mapai + Hamali',
    grandNet: 'Grand net payable',
    toPending: 'Add to Pending',
    generate: 'Generate Bill',
    pendingNote: 'Deduction is saved with Pending — not asked again',
    payTitle: 'Payment mode',
    payNote: 'This is printed on the bill',
    cash: 'Cash',
    rtgs: 'Bank transfer',
    cancel: 'Cancel',
    wait: 'Please wait…',
    added: '✓ {n} tokens added to Pending Bills',
    made: 'Bill made',
    billNo: 'Bill No.',
    print: 'Print bill',
    another: 'Make another bill',
    popup: 'Allow pop-ups for this website to print the bill',
    load: 'Could not load. Please try again',
    errors: {
      bad: 'Enter a valid token number',
      not_found: 'Token not found on this date',
      other_broker: 'This token belongs to another broker',
      already_added: 'Already added',
      already_billed: 'Bill already made for this token',
      in_pending: 'Already in Pending — make its bill from Pending Bills',
      no_auction: 'Auction pending for this token',
      no_weight: 'Weighing pending for this token',
      no_charge: 'Enter Utrai, Mapai or Hamali for every token',
      duplicate: 'A token was added twice',
      no_mode: 'Choose Cash or RTGS',
      bad_name: 'Choose whose name the bill is in',
      server: 'Server error. Please try again',
    },
    tokenWord: 'Token',
  },
  hi: {
    title: 'किसान का बिल',
    back: '← डैशबोर्ड',
    date: 'टोकन की तारीख',
    search: 'टोकन नंबर या किसान का नाम खोजें',
    addNo: 'जोड़ें',
    ready: 'इस दिन बिल के लिए तैयार',
    readyNone: 'इस दिन बिल के लिए कोई तौला हुआ टोकन नहीं',
    readyNoneFound: 'टोकन नहीं मिला — टोकन नंबर लिखकर जोड़ें दबाएं',
    otherFarmer: 'दूसरा किसान — फिर भी जोड़ सकते हैं',
    selected: 'इस बिल में',
    none: 'ऊपर टोकन पर टिक करके बिल में जोड़ें',
    billFor: 'बिल किसके नाम पर?',
    billForNote: 'इस बिल में अलग-अलग किसानों के टोकन हैं',
    farmer: 'किसान',
    qtl: 'क्विंटल',
    gross: 'कुल',
    deduction: 'कटौती चुनें (केवल एक)',
    perQtl: '₹/क्विंटल',
    locked: 'बंद',
    utrai: 'उतराई (फोडाई)',
    mapai: 'मापाई (तोलाई)',
    hamali: 'हमाली',
    net: 'देय रकम',
    remove: 'हटाएं',
    grandGross: 'कुल रकम',
    grandDed: 'उतराई + मापाई + हमाली',
    grandNet: 'कुल देय रकम',
    toPending: 'पेंडिंग में डालें',
    generate: 'बिल बनाएं',
    pendingNote: 'पेंडिंग में डालने पर कटौती सेव होगी, दोबारा नहीं पूछेगा',
    payTitle: 'भुगतान कैसे?',
    payNote: 'यह बिल पर छपेगा',
    cash: 'नगद',
    rtgs: 'बैंक ट्रांसफर',
    cancel: 'रद्द करें',
    wait: 'कृपया रुकें…',
    added: '✓ {n} टोकन पेंडिंग में जोड़े',
    made: 'बिल बन गया',
    billNo: 'बिल नं.',
    print: 'बिल प्रिंट करें',
    another: 'दूसरा बिल बनाएं',
    popup: 'बिल प्रिंट के लिए इस वेबसाइट के पॉप-अप चालू करें',
    load: 'नहीं खुला। फिर से कोशिश करें',
    errors: {
      bad: 'सही टोकन नंबर डालें',
      not_found: 'इस तारीख में टोकन नहीं मिला',
      other_broker: 'यह टोकन आपका नहीं है',
      already_added: 'यह टोकन पहले से जोड़ा गया है',
      already_billed: 'इस टोकन का बिल बन चुका है',
      in_pending: 'यह टोकन पहले से पेंडिंग में है, बिल पेंडिंग बिल से बनाएं',
      no_auction: 'लिलाव अभी बाकी है',
      no_weight: 'तोलाई अभी बाकी है',
      no_charge: 'हर टोकन के लिए उतराई / मापाई / हमाली में से एक डालें',
      duplicate: 'एक टोकन दो बार जोड़ा गया',
      no_mode: 'नगद या RTGS चुनें',
      bad_name: 'बिल किसके नाम पर है, चुनें',
      server: 'सर्वर त्रुटि। फिर से कोशिश करें',
    },
    tokenWord: 'टोकन',
  },
  mr: {
    title: 'शेतकरी बिल',
    back: '← डॅशबोर्ड',
    date: 'टोकनची तारीख',
    search: 'टोकन नंबर किंवा शेतकऱ्याचे नाव शोधा',
    addNo: 'जोडा',
    ready: 'या दिवशी बिलासाठी तयार',
    readyNone: 'या दिवशी बिलासाठी तोललेला टोकन नाही',
    readyNoneFound: 'टोकन सापडला नाही — टोकन नंबर लिहून जोडा दाबा',
    otherFarmer: 'दुसरा शेतकरी — तरीही जोडू शकता',
    selected: 'या बिलात',
    none: 'वरील टोकनवर टिक करून बिलात जोडा',
    billFor: 'बिल कोणाच्या नावावर?',
    billForNote: 'या बिलात वेगवेगळ्या शेतकऱ्यांचे टोकन आहेत',
    farmer: 'शेतकरी',
    qtl: 'क्विंटल',
    gross: 'एकूण',
    deduction: 'कपात निवडा (फक्त एक)',
    perQtl: '₹/क्विंटल',
    locked: 'बंद',
    utrai: 'उतराई (फोडाई)',
    mapai: 'मापाई (तोलाई)',
    hamali: 'हमाली',
    net: 'देय रक्कम',
    remove: 'काढा',
    grandGross: 'एकूण रक्कम',
    grandDed: 'उतराई + मापाई + हमाली',
    grandNet: 'एकूण देय रक्कम',
    toPending: 'पेंडिंगमध्ये टाका',
    generate: 'बिल बनवा',
    pendingNote: 'पेंडिंगमध्ये टाकल्यावर कपात सेव्ह होईल, पुन्हा विचारणार नाही',
    payTitle: 'पेमेंट कसे?',
    payNote: 'हे बिलावर छापले जाईल',
    cash: 'रोख',
    rtgs: 'बँक ट्रान्सफर',
    cancel: 'रद्द करा',
    wait: 'कृपया थांबा…',
    added: '✓ {n} टोकन पेंडिंगमध्ये जोडले',
    made: 'बिल तयार झाले',
    billNo: 'बिल नं.',
    print: 'बिल प्रिंट करा',
    another: 'दुसरे बिल बनवा',
    popup: 'बिल प्रिंटसाठी या वेबसाइटचे पॉप-अप चालू करा',
    load: 'उघडले नाही. पुन्हा प्रयत्न करा',
    errors: {
      bad: 'योग्य टोकन नंबर टाका',
      not_found: 'या तारखेला टोकन सापडला नाही',
      other_broker: 'हा टोकन तुमचा नाही',
      already_added: 'हा टोकन आधीच जोडला आहे',
      already_billed: 'या टोकनचे बिल आधीच झाले आहे',
      in_pending: 'हा टोकन आधीच पेंडिंगमध्ये आहे, बिल पेंडिंग बिलमधून बनवा',
      no_auction: 'लिलाव अजून बाकी आहे',
      no_weight: 'तोलाई अजून बाकी आहे',
      no_charge: 'प्रत्येक टोकनसाठी उतराई / मापाई / हमाली पैकी एक टाका',
      duplicate: 'एक टोकन दोनदा जोडला',
      no_mode: 'रोख किंवा RTGS निवडा',
      bad_name: 'बिल कोणाच्या नावावर आहे ते निवडा',
      server: 'सर्व्हर त्रुटी. पुन्हा प्रयत्न करा',
    },
    tokenWord: 'टोकन',
  },
}

const CHARGES = ['utrai', 'mapai', 'hamali']
const num = (v) => Number(v) || 0
const qtl = (v) => num(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })
const ymd = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}
const farmerKey = (name, phone) =>
  `${String(name || '').trim().toLowerCase().replace(/\s+/g, ' ')}|${String(phone || '').replace(/\s+/g, '')}`
const lineKey = (l) => farmerKey(l.farmer_name, l.farmer_phone_number)

/** one line = token from the server + chosen deduction */
const lineCharge = (l) => {
  const type = CHARGES.find((c) => String(l.rates[c] || '').trim() !== '') || null
  const rate = type ? num(l.rates[type]) : 0
  return { type, rate, amount: rate * num(l.total_weight_quintal) }
}
const lineGross = (l) => num(l.total_weight_quintal) * num(l.rate_per_quintal)
const newLine = (r) => ({ ...r, rates: { utrai: '', mapai: '', hamali: '' } })

export default function FarmerBill({ lang, acc, onBack, onExpired, initialDate, preselectTokenId }) {
  const T = TEXT[lang] || TEXT.en
  const [date, setDate] = useState(() => initialDate || ymd(new Date()))
  const [ready, setReady] = useState([])
  const [readyLoading, setReadyLoading] = useState(true)
  const [readyReload, setReadyReload] = useState(0)
  const [search, setSearch] = useState('')
  const [lines, setLines] = useState([])
  const [billKey, setBillKey] = useState(null) // farmer the bill is in the name of
  const [busy, setBusy] = useState('') // add | pending | bill
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [askMode, setAskMode] = useState(false)
  const [done, setDone] = useState(null) // print data of the bill just made
  const preselected = useRef(false)

  const errText = (r) => {
    const base = T.errors[r?.error] || T.errors.server
    return r?.token_number ? `${T.tokenWord} #${r.token_number}: ${base}` : base
  }
  const fail = (e) => {
    if (e?.message === 'SESSION_EXPIRED') onExpired()
    else setErr(T.errors.server)
  }

  // ready tokens of the selected date
  useEffect(() => {
    let alive = true
    setReadyLoading(true)
    fetchReadyTokens(acc.token, date)
      .then((d) => {
        if (!alive) return
        setReady(d)
        // opened from Token progress → tick that token
        if (preselectTokenId && !preselected.current) {
          preselected.current = true
          const t = d.find((x) => x.token_id === preselectTokenId)
          if (t) setLines((ls) => (ls.some((l) => l.token_id === t.token_id) ? ls : [...ls, newLine(t)]))
        }
      })
      .catch((e) => alive && fail(e))
      .finally(() => alive && setReadyLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acc.token, date, readyReload])

  // farmers in this bill
  const farmers = useMemo(() => {
    const map = new Map()
    for (const l of lines) {
      const k = lineKey(l)
      if (!map.has(k)) map.set(k, { key: k, name: l.farmer_name, phone: l.farmer_phone_number, tokenId: l.token_id })
    }
    return [...map.values()]
  }, [lines])
  const chosen = farmers.find((f) => f.key === billKey) || farmers[0] || null

  const picked = new Set(lines.map((l) => l.token_id))
  const q = search.trim().toLowerCase()
  const readyShown = ready.filter(
    (t) => !q || String(t.token_number).startsWith(q) || String(t.farmer_name || '').toLowerCase().includes(q),
  )

  function toggle(t) {
    setErr('')
    setOk('')
    if (picked.has(t.token_id)) setLines((ls) => ls.filter((l) => l.token_id !== t.token_id))
    else setLines((ls) => [...ls, newLine(t)])
  }

  /** Token number typed that is not in the list (e.g. checks why it is not ready) */
  async function addByNumber(e) {
    e.preventDefault()
    setErr('')
    setOk('')
    const n = parseInt(search, 10)
    if (!n || n < 1 || String(n) !== search.trim()) return setErr(T.errors.bad)
    const inList = ready.find((t) => t.token_number === n)
    if (inList) {
      if (!picked.has(inList.token_id)) toggle(inList)
      setSearch('')
      return
    }
    setBusy('add')
    try {
      const r = await fetchBillToken(acc.token, n, date)
      if (!r?.ok) return setErr(errText(r))
      if (picked.has(r.token_id)) return setErr(T.errors.already_added)
      setLines((ls) => [...ls, newLine(r)])
      setSearch('')
    } catch (ex) {
      fail(ex)
    } finally {
      setBusy('')
    }
  }

  function setRate(id, type, value) {
    const v = value.replace(/[^\d.]/g, '').replace(/^(\d*\.?\d{0,2}).*$/, '$1')
    setLines((ls) => ls.map((l) => (l.token_id === id ? { ...l, rates: { ...l.rates, [type]: v } } : l)))
  }

  const items = () =>
    lines.map((l) => {
      const c = lineCharge(l)
      return { token_id: l.token_id, charge_type: c.type, charge_rate: c.rate }
    })
  const allCharged = () => lines.every((l) => lineCharge(l).rate > 0)

  async function toPending() {
    setErr('')
    setOk('')
    if (!allCharged()) return setErr(T.errors.no_charge)
    setBusy('pending')
    try {
      const r = await addToPending(acc.token, items())
      if (!r?.ok) return setErr(errText(r))
      setOk(T.added.replace('{n}', r.count))
      setLines([])
      setBillKey(null)
      setReadyReload((n) => n + 1)
    } catch (ex) {
      fail(ex)
    } finally {
      setBusy('')
    }
  }

  function startBill() {
    setErr('')
    setOk('')
    if (!allCharged()) return setErr(T.errors.no_charge)
    setAskMode(true)
  }

  async function makeBill(mode) {
    setAskMode(false)
    setBusy('bill')
    try {
      const r = await makeFarmerBill(acc.token, items(), mode, chosen?.tokenId || null)
      if (!r?.ok) return setErr(errText(r))
      setDone(r)
      setLines([])
      setBillKey(null)
      setReadyReload((n) => n + 1)
    } catch (ex) {
      fail(ex)
    } finally {
      setBusy('')
    }
  }

  const gGross = lines.reduce((s, l) => s + lineGross(l), 0)
  const gDed = lines.reduce((s, l) => s + lineCharge(l).amount, 0)
  const gNet = gGross - gDed

  // ---------------------------------------------------------------- bill made
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
          <button type="button" className="bp-btn bp-btn-outline" onClick={() => setDone(null)}>
            {T.another}
          </button>
        </div>
        <button type="button" className="fb-link" onClick={onBack}>
          {T.back}
        </button>
      </div>
    )
  }

  // ---------------------------------------------------------------- form
  return (
    <div className="bp-card fb">
      <div className="bp-top">
        <div>
          <div className="bp-muted">{acc.name}</div>
          <h1 className="bp-name">{T.title}</h1>
        </div>
        <button type="button" className="bp-btn bp-btn-outline" onClick={onBack}>
          {T.back}
        </button>
      </div>

      {/* date + search */}
      <form className="fb-add" onSubmit={addByNumber}>
        <label>
          <span>{T.date}</span>
          <input type="date" className="bp-input" value={date} max={ymd(new Date())} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </label>
        <label className="fb-add-no">
          <span>{T.search}</span>
          <div>
            <input className="bp-input" value={search} onChange={(e) => setSearch(e.target.value.slice(0, 40))} placeholder="#" />
            <button type="submit" className="bp-btn" disabled={busy === 'add'}>
              {busy === 'add' ? '…' : `+ ${T.addNo}`}
            </button>
          </div>
        </label>
      </form>

      {/* ready list */}
      <div className="bx-section">
        {T.ready} <b>{ready.length}</b>
      </div>
      {readyLoading ? (
        <div className="bp-empty">{T.wait}</div>
      ) : ready.length === 0 ? (
        <div className="bx-empty-sm">{T.readyNone}</div>
      ) : readyShown.length === 0 ? (
        <div className="bx-empty-sm">{T.readyNoneFound}</div>
      ) : (
        <div className="bx-ready">
          {readyShown.map((t) => {
            const on = picked.has(t.token_id)
            const other = !on && chosen && lineKey(t) !== chosen.key
            return (
              <label key={t.token_id} className={'bx-ready-row' + (on ? ' on' : '') + (other ? ' other' : '')}>
                <input type="checkbox" checked={on} onChange={() => toggle(t)} />
                <span className="bx-no">#{t.token_number}</span>
                <span className="bx-who">
                  <b>{t.farmer_name}</b>
                  <small>
                    {t.farmer_phone_number || '-'} · {t.commodity_name} · {qtl(t.total_weight_quintal)} {T.qtl} × {inr(t.rate_per_quintal)}
                  </small>
                  {other && <em>⚠ {T.otherFarmer}</em>}
                </span>
                <span className="bx-amt">{inr(lineGross(t))}</span>
              </label>
            )
          })}
        </div>
      )}

      {err && <div className="bp-error">{err}</div>}
      {ok && <div className="fb-ok">{ok}</div>}

      {/* bill in the name of */}
      {farmers.length > 1 && (
        <div className="bx-namebox">
          <div className="bx-namebox-title">👨‍🌾 {T.billFor}</div>
          <div className="bx-namebox-note">{T.billForNote}</div>
          {farmers.map((f) => (
            <label key={f.key} className={'bx-name' + (chosen?.key === f.key ? ' on' : '')}>
              <input type="radio" name="billfor" checked={chosen?.key === f.key} onChange={() => setBillKey(f.key)} />
              <span>
                <b>{f.name}</b>
                <small>{f.phone || '-'}</small>
              </span>
            </label>
          ))}
        </div>
      )}
      {farmers.length === 1 && (
        <div className="fb-farmer set">
          <span>👨‍🌾</span>
          <b>
            {T.farmer}: {chosen.name} · {chosen.phone || '-'}
          </b>
        </div>
      )}

      <div className="bx-section">
        {T.selected} <b>{lines.length}</b>
      </div>
      {lines.length === 0 ? (
        <div className="bx-empty-sm">{T.none}</div>
      ) : (
        <div className="fb-lines">
          {lines.map((l) => {
            const c = lineCharge(l)
            const gross = lineGross(l)
            return (
              <div key={l.token_id} className="fb-line">
                <div className="fb-line-top">
                  <div>
                    <b>
                      #{l.token_number} — {l.commodity_name}
                    </b>
                    <div className="bp-muted bp-small">
                      {l.farmer_name} · {prettyDate(l.token_date, lang)} · {l.buyer_name} · {qtl(l.total_weight_quintal)} {T.qtl} × {inr(l.rate_per_quintal)}
                    </div>
                  </div>
                  <button type="button" className="fb-x" title={T.remove} onClick={() => setLines((ls) => ls.filter((x) => x.token_id !== l.token_id))}>
                    ✕
                  </button>
                </div>
                <div className="fb-gross">
                  {T.gross}: <b>{inr(gross)}</b>
                </div>
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
                          <input
                            value={l.rates[k]}
                            disabled={!!lockedBox}
                            onChange={(e) => setRate(l.token_id, k, e.target.value)}
                            inputMode="decimal"
                            placeholder="0"
                          />
                          <em>{T.perQtl}</em>
                        </div>
                        <small>{lockedBox ? `₹0 (${T.locked})` : amt > 0 ? `= ${inr(amt)}` : ' '}</small>
                      </label>
                    )
                  })}
                </div>
                <div className="fb-net">
                  {T.net}: <b>{inr(gross - c.amount)}</b>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {lines.length > 0 && (
        <>
          <div className="fb-total">
            <div>
              <span>{T.grandGross}</span>
              <b>{inr(gGross)}</b>
            </div>
            <div>
              <span>{T.grandDed}</span>
              <b>{inr(gDed)}</b>
            </div>
            <div className="big">
              <span>{T.grandNet}</span>
              <b>{inr(gNet)}</b>
            </div>
          </div>
          <div className="fb-actions">
            <button type="button" className="bp-btn bp-btn-outline" disabled={!!busy} onClick={toPending}>
              ⏳ {busy === 'pending' ? T.wait : T.toPending}
            </button>
            <button type="button" className="bp-btn" disabled={!!busy} onClick={startBill}>
              🧾 {busy === 'bill' ? T.wait : T.generate}
            </button>
          </div>
          <p className="fb-note">{T.pendingNote}</p>
        </>
      )}

      {askMode && (
        <div className="fb-modal" role="dialog" aria-modal="true" onClick={() => setAskMode(false)}>
          <div className="fb-modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>{T.payTitle}</h2>
            <p>
              {T.grandNet}: <b>{inr(gNet)}</b>
            </p>
            {chosen && (
              <p className="bp-muted">
                {T.billFor}: <b>{chosen.name}</b>
              </p>
            )}
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
