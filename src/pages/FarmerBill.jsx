import { useRef, useState } from 'react'
import { inr, prettyDate } from '../data'
import { fetchBillToken, addToPending, makeFarmerBill } from '../trader/brokerHomeApi'
import { printFarmerBill } from '../trader/farmerBillPrint'
import './FarmerBill.css'

// =============================================================================
// Farmer bill (website) — same as the app's "Bill for Farmer":
//   pick date → add token numbers (same farmer only) → one deduction per token
//   (Utrai / Mapai / Hamali, ₹ per quintal) → Add to Pending  or  Generate Bill
//   (CASH / RTGS) → print the bill
// =============================================================================

const TEXT = {
  en: {
    title: 'Farmer bill',
    back: '← Dashboard',
    farmerFirst: 'Farmer is set by the first token',
    farmer: 'Farmer',
    date: 'Token date',
    addToken: 'Add token number',
    tokenNo: 'Token No.',
    add: 'Add',
    none: 'No tokens added yet',
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
    added: '✓ {n} tokens ({f}) added to Pending Bills',
    made: 'Bill made',
    billNo: 'Bill No.',
    print: 'Print bill',
    another: 'Make another bill',
    popup: 'Allow pop-ups for this website to print the bill',
    errors: {
      bad: 'Enter a valid token number',
      not_found: 'Token not found on this date',
      other_broker: 'This token belongs to another broker',
      already_added: 'Already added',
      already_billed: 'Bill already made for this token',
      in_pending: 'Already in Pending — make its bill from Pending Bills',
      no_auction: 'Auction pending for this token',
      no_weight: 'Weighing pending for this token',
      other_farmer: 'This token is for a different farmer',
      no_charge: 'Enter Utrai, Mapai or Hamali for every token',
      duplicate: 'A token was added twice',
      no_mode: 'Choose Cash or RTGS',
      server: 'Server error. Please try again',
    },
    tokenWord: 'Token',
  },
  hi: {
    title: 'किसान का बिल',
    back: '← डैशबोर्ड',
    farmerFirst: 'किसान पहले टोकन से तय होगा',
    farmer: 'किसान',
    date: 'टोकन की तारीख',
    addToken: 'टोकन नंबर जोड़ें',
    tokenNo: 'टोकन नं.',
    add: 'जोड़ें',
    none: 'कोई टोकन नहीं जोड़ा',
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
    added: '✓ {n} टोकन ({f}) पेंडिंग में जोड़े',
    made: 'बिल बन गया',
    billNo: 'बिल नं.',
    print: 'बिल प्रिंट करें',
    another: 'दूसरा बिल बनाएं',
    popup: 'बिल प्रिंट के लिए इस वेबसाइट के पॉप-अप चालू करें',
    errors: {
      bad: 'सही टोकन नंबर डालें',
      not_found: 'इस तारीख में टोकन नहीं मिला',
      other_broker: 'यह टोकन आपका नहीं है',
      already_added: 'यह टोकन पहले से जोड़ा गया है',
      already_billed: 'इस टोकन का बिल बन चुका है',
      in_pending: 'यह टोकन पहले से पेंडिंग में है, बिल पेंडिंग बिल से बनाएं',
      no_auction: 'लिलाव अभी बाकी है',
      no_weight: 'तोलाई अभी बाकी है',
      other_farmer: 'यह टोकन दूसरे किसान का है',
      no_charge: 'हर टोकन के लिए उतराई / मापाई / हमाली में से एक डालें',
      duplicate: 'एक टोकन दो बार जोड़ा गया',
      no_mode: 'नगद या RTGS चुनें',
      server: 'सर्वर त्रुटि। फिर से कोशिश करें',
    },
    tokenWord: 'टोकन',
  },
  mr: {
    title: 'शेतकरी बिल',
    back: '← डॅशबोर्ड',
    farmerFirst: 'शेतकरी पहिल्या टोकनवरून ठरेल',
    farmer: 'शेतकरी',
    date: 'टोकनची तारीख',
    addToken: 'टोकन नंबर जोडा',
    tokenNo: 'टोकन नं.',
    add: 'जोडा',
    none: 'अजून टोकन जोडले नाही',
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
    added: '✓ {n} टोकन ({f}) पेंडिंगमध्ये जोडले',
    made: 'बिल तयार झाले',
    billNo: 'बिल नं.',
    print: 'बिल प्रिंट करा',
    another: 'दुसरे बिल बनवा',
    popup: 'बिल प्रिंटसाठी या वेबसाइटचे पॉप-अप चालू करा',
    errors: {
      bad: 'योग्य टोकन नंबर टाका',
      not_found: 'या तारखेला टोकन सापडला नाही',
      other_broker: 'हा टोकन तुमचा नाही',
      already_added: 'हा टोकन आधीच जोडला आहे',
      already_billed: 'या टोकनचे बिल आधीच झाले आहे',
      in_pending: 'हा टोकन आधीच पेंडिंगमध्ये आहे, बिल पेंडिंग बिलमधून बनवा',
      no_auction: 'लिलाव अजून बाकी आहे',
      no_weight: 'तोलाई अजून बाकी आहे',
      other_farmer: 'हा टोकन दुसऱ्या शेतकऱ्याचा आहे',
      no_charge: 'प्रत्येक टोकनसाठी उतराई / मापाई / हमाली पैकी एक टाका',
      duplicate: 'एक टोकन दोनदा जोडला',
      no_mode: 'रोख किंवा RTGS निवडा',
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

/** one line = token from the server + chosen deduction */
const lineCharge = (l) => {
  const type = CHARGES.find((c) => String(l.rates[c] || '').trim() !== '') || null
  const rate = type ? num(l.rates[type]) : 0
  return { type, rate, amount: rate * num(l.total_weight_quintal) }
}
const lineGross = (l) => num(l.total_weight_quintal) * num(l.rate_per_quintal)

export default function FarmerBill({ lang, acc, onBack, onExpired }) {
  const T = TEXT[lang] || TEXT.en
  const [date, setDate] = useState(() => ymd(new Date()))
  const [no, setNo] = useState('')
  const [lines, setLines] = useState([])
  const [busy, setBusy] = useState('') // add | pending | bill
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [askMode, setAskMode] = useState(false)
  const [done, setDone] = useState(null) // print data of the bill just made
  const inputRef = useRef(null)

  const errText = (r) => {
    const base = T.errors[r?.error] || T.errors.server
    return r?.token_number ? `${T.tokenWord} #${r.token_number}: ${base}` : base
  }
  const fail = (e) => {
    if (e?.message === 'SESSION_EXPIRED') onExpired()
    else setErr(T.errors.server)
  }

  async function add(e) {
    e.preventDefault()
    setErr('')
    setOk('')
    const n = parseInt(no, 10)
    if (!n || n < 1) return setErr(T.errors.bad)
    setBusy('add')
    try {
      const r = await fetchBillToken(acc.token, n, date)
      if (!r?.ok) return setErr(errText(r))
      if (lines.some((l) => l.token_id === r.token_id)) return setErr(T.errors.already_added)
      if (lines.length && farmerKey(lines[0].farmer_name, lines[0].farmer_phone_number) !== farmerKey(r.farmer_name, r.farmer_phone_number)) {
        return setErr(`${T.errors.other_farmer} (${r.farmer_name}, ${r.farmer_phone_number || '-'})`)
      }
      setLines((ls) => [...ls, { ...r, rates: { utrai: '', mapai: '', hamali: '' } }])
      setNo('')
      inputRef.current?.focus()
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
      setOk(T.added.replace('{n}', r.count).replace('{f}', lines[0]?.farmer_name || ''))
      setLines([])
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
      const r = await makeFarmerBill(acc.token, items(), mode)
      if (!r?.ok) return setErr(errText(r))
      setDone(r)
      setLines([])
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
  const first = lines[0]
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

      <div className={'fb-farmer' + (first ? ' set' : '')}>
        <span>👨‍🌾</span>
        {first ? (
          <b>
            {T.farmer}: {first.farmer_name} · {first.farmer_phone_number || '-'}
          </b>
        ) : (
          <span>{T.farmerFirst}</span>
        )}
      </div>

      <form className="fb-add" onSubmit={add}>
        <label>
          <span>{T.date}</span>
          <input type="date" className="bp-input" value={date} max={ymd(new Date())} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </label>
        <label className="fb-add-no">
          <span>{T.addToken}</span>
          <div>
            <input
              ref={inputRef}
              className="bp-input"
              value={no}
              onChange={(e) => setNo(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              placeholder={T.tokenNo}
            />
            <button type="submit" className="bp-btn" disabled={busy === 'add'}>
              {busy === 'add' ? '…' : `+ ${T.add}`}
            </button>
          </div>
        </label>
      </form>

      {err && <div className="bp-error">{err}</div>}
      {ok && <div className="fb-ok">{ok}</div>}

      {lines.length === 0 ? (
        <div className="bp-empty">{T.none}</div>
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
                      {prettyDate(l.token_date, lang)} · {l.buyer_name} · {qtl(l.total_weight_quintal)} {T.qtl} × {inr(l.rate_per_quintal)}
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
