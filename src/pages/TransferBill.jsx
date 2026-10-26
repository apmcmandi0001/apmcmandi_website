import { useEffect, useMemo, useState } from 'react'
import { inr, prettyDate } from '../data'
import { fetchTransferSetup, fetchTransferItems, fetchTransferToken, makeTransfer } from '../trader/brokerHomeApi'
import { printTransfer } from '../trader/transferPrint'
import './FarmerBill.css'

// =============================================================================
// Transfer bill (website) — same as the app:
//   Mode 1: all my sold tokens in a date range (can narrow to one commodity)
//   Mode 2: add tokens one by one
//   → tick tokens → choose the broker → Transfer (cannot be undone) → print
// =============================================================================

const TEXT = {
  en: {
    title: 'Transfer bill',
    sub: 'Give sold goods to another broker — he will bill the buyers',
    back: '← Dashboard',
    byDate: 'By date',
    byToken: 'By token',
    from: 'From',
    to: 'To',
    allComm: 'All commodities',
    tokenDate: 'Token date',
    tokenNo: 'Token No.',
    add: 'Add',
    none: 'No tokens to transfer in these dates',
    noneAdded: 'No tokens added yet',
    skipped: 'Not shown',
    reasons: {
      already_transferred: 'already transferred',
      buyer_billed: 'buyer bill already made',
      no_auction: 'auction pending',
      no_weight: 'weighing pending',
    },
    farmerDone: 'Farmer bill done',
    qtl: 'qtl',
    bags: 'bags',
    toBroker: 'Transfer to broker',
    chooseBroker: 'Choose the broker',
    selected: 'Ticked',
    tokens: 'tokens',
    transfer: 'Transfer',
    confirmTitle: 'Transfer bill?',
    confirmText: 'After this, {to} owns these goods and will bill the buyers. This cannot be undone.',
    cancel: 'Cancel',
    wait: 'Please wait…',
    done: 'Transfer done',
    no: 'Transfer No.',
    print: 'Print transfer bill',
    another: 'Make another transfer',
    popup: 'Allow pop-ups for this website to print the bill',
    tokenWord: 'Token',
    errors: {
      bad: 'Enter a valid token number',
      not_found: 'Token not found on this date',
      other_broker: 'This token belongs to another broker',
      already_added: 'Already added',
      already_transferred: 'Already transferred',
      buyer_billed: 'Buyer bill already made',
      no_auction: 'Auction pending',
      no_weight: 'Weighing pending',
      pick: 'Tick at least one token',
      no_broker: 'Choose the broker to transfer to',
      bad_broker: 'This broker cannot receive goods',
      bad_dates: 'Check the dates (up to 1 year)',
      server: 'Server error. Please try again',
    },
  },
  hi: {
    title: 'बिल ट्रांसफर',
    sub: 'बेचा हुआ माल दूसरे दलाल को दें — खरीदार का बिल वही बनाएगा',
    back: '← डैशबोर्ड',
    byDate: 'तारीख से',
    byToken: 'टोकन से',
    from: 'से',
    to: 'तक',
    allComm: 'सभी फसलें',
    tokenDate: 'टोकन की तारीख',
    tokenNo: 'टोकन नं.',
    add: 'जोड़ें',
    none: 'इन तारीखों में ट्रांसफर के लिए कोई टोकन नहीं',
    noneAdded: 'कोई टोकन नहीं जोड़ा',
    skipped: 'नहीं दिखाए',
    reasons: {
      already_transferred: 'पहले से ट्रांसफर',
      buyer_billed: 'खरीदार बिल बन चुका',
      no_auction: 'लिलाव बाकी',
      no_weight: 'तोलाई बाकी',
    },
    farmerDone: 'किसान बिल बना',
    qtl: 'क्विंटल',
    bags: 'बोरी',
    toBroker: 'किस दलाल को',
    chooseBroker: 'दलाल चुनें',
    selected: 'चुने गए',
    tokens: 'टोकन',
    transfer: 'ट्रांसफर करें',
    confirmTitle: 'बिल ट्रांसफर करें?',
    confirmText: 'इसके बाद ये माल {to} के नाम होगा और खरीदार का बिल वही बनाएगा। यह वापस नहीं होगा।',
    cancel: 'रद्द करें',
    wait: 'कृपया रुकें…',
    done: 'ट्रांसफर हो गया',
    no: 'ट्रांसफर नं.',
    print: 'ट्रांसफर बिल प्रिंट करें',
    another: 'दूसरा ट्रांसफर',
    popup: 'बिल प्रिंट के लिए इस वेबसाइट के पॉप-अप चालू करें',
    tokenWord: 'टोकन',
    errors: {
      bad: 'सही टोकन नंबर डालें',
      not_found: 'इस तारीख में टोकन नहीं मिला',
      other_broker: 'यह टोकन आपका नहीं है',
      already_added: 'यह टोकन पहले से जोड़ा गया है',
      already_transferred: 'पहले से ट्रांसफर हो चुका',
      buyer_billed: 'खरीदार बिल बन चुका',
      no_auction: 'लिलाव बाकी',
      no_weight: 'तोलाई बाकी',
      pick: 'कम से कम एक टोकन चुनें',
      no_broker: 'किस दलाल को देना है चुनें',
      bad_broker: 'इस दलाल को माल नहीं दे सकते',
      bad_dates: 'तारीख जांचें (1 साल तक)',
      server: 'सर्वर त्रुटि। फिर से कोशिश करें',
    },
  },
  mr: {
    title: 'बिल ट्रान्सफर',
    sub: 'विकलेला माल दुसऱ्या अडत्याला द्या — खरेदीदाराचे बिल तोच बनवेल',
    back: '← डॅशबोर्ड',
    byDate: 'तारखेनुसार',
    byToken: 'टोकननुसार',
    from: 'पासून',
    to: 'पर्यंत',
    allComm: 'सर्व पिके',
    tokenDate: 'टोकनची तारीख',
    tokenNo: 'टोकन नं.',
    add: 'जोडा',
    none: 'या तारखांमध्ये ट्रान्सफरसाठी टोकन नाही',
    noneAdded: 'अजून टोकन जोडले नाही',
    skipped: 'दाखवले नाहीत',
    reasons: {
      already_transferred: 'आधीच ट्रान्सफर',
      buyer_billed: 'खरेदीदार बिल झाले',
      no_auction: 'लिलाव बाकी',
      no_weight: 'तोलाई बाकी',
    },
    farmerDone: 'शेतकरी बिल झाले',
    qtl: 'क्विंटल',
    bags: 'पोती',
    toBroker: 'कोणत्या अडत्याला',
    chooseBroker: 'अडत्या निवडा',
    selected: 'निवडलेले',
    tokens: 'टोकन',
    transfer: 'ट्रान्सफर करा',
    confirmTitle: 'बिल ट्रान्सफर करायचे?',
    confirmText: 'यानंतर हा माल {to} यांच्या नावावर होईल आणि खरेदीदाराचे बिल तेच बनवतील. हे परत होणार नाही.',
    cancel: 'रद्द करा',
    wait: 'कृपया थांबा…',
    done: 'ट्रान्सफर झाले',
    no: 'ट्रान्सफर नं.',
    print: 'ट्रान्सफर बिल प्रिंट करा',
    another: 'दुसरे ट्रान्सफर',
    popup: 'बिल प्रिंटसाठी या वेबसाइटचे पॉप-अप चालू करा',
    tokenWord: 'टोकन',
    errors: {
      bad: 'योग्य टोकन नंबर टाका',
      not_found: 'या तारखेला टोकन सापडला नाही',
      other_broker: 'हा टोकन तुमचा नाही',
      already_added: 'हा टोकन आधीच जोडला आहे',
      already_transferred: 'आधीच ट्रान्सफर झाला',
      buyer_billed: 'खरेदीदार बिल झाले आहे',
      no_auction: 'लिलाव बाकी',
      no_weight: 'तोलाई बाकी',
      pick: 'किमान एक टोकन निवडा',
      no_broker: 'कोणत्या अडत्याला द्यायचे ते निवडा',
      bad_broker: 'या अडत्याला माल देता येत नाही',
      bad_dates: 'तारखा तपासा (1 वर्षापर्यंत)',
      server: 'सर्व्हर त्रुटी. पुन्हा प्रयत्न करा',
    },
  },
}

const num = (v) => Number(v) || 0
const qtl = (v) => num(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })
const ymd = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}

export default function TransferBill({ lang, acc, onBack, onExpired }) {
  const T = TEXT[lang] || TEXT.en
  const today = ymd(new Date())
  const [mode, setMode] = useState('date')
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const [tokDate, setTokDate] = useState(today)
  const [no, setNo] = useState('')
  const [items, setItems] = useState([]) // each: line + selected
  const [skipped, setSkipped] = useState({})
  const [comm, setComm] = useState('')
  const [brokers, setBrokers] = useState([])
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [done, setDone] = useState(null)
  const [reload, setReload] = useState(0)

  const fail = (e) => {
    if (e?.message === 'SESSION_EXPIRED') onExpired()
    else setErr(T.errors.server)
  }

  useEffect(() => {
    fetchTransferSetup(acc.token)
      .then((d) => setBrokers(d?.brokers || []))
      .catch(fail)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acc.token])

  // mode 1: load by dates
  useEffect(() => {
    if (mode !== 'date') return undefined
    let alive = true
    setLoading(true)
    setErr('')
    fetchTransferItems(acc.token, from, to)
      .then((d) => {
        if (!alive) return
        if (!d?.ok) {
          setErr(T.errors[d?.error] || T.errors.server)
          setItems([])
          return
        }
        setItems((d.items || []).map((l) => ({ ...l, selected: true })))
        setSkipped(d.skipped || {})
      })
      .catch((e) => alive && fail(e))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acc.token, mode, from, to, reload])

  function switchMode(m) {
    if (m === mode) return
    setMode(m)
    setItems([])
    setSkipped({})
    setComm('')
    setErr('')
  }

  async function addToken(e) {
    e.preventDefault()
    setErr('')
    const n = parseInt(no, 10)
    if (!n || n < 1) return setErr(T.errors.bad)
    setBusy(true)
    try {
      const r = await fetchTransferToken(acc.token, n, tokDate)
      if (!r?.ok) return setErr(`${T.tokenWord} #${n}: ${T.errors[r?.error] || T.errors.server}`)
      if (items.some((i) => i.token_id === r.token_id)) return setErr(T.errors.already_added)
      setItems((x) => [...x, { ...r, selected: true }])
      setNo('')
    } catch (ex) {
      fail(ex)
    } finally {
      setBusy(false)
    }
  }

  const commodities = useMemo(() => [...new Set(items.map((i) => i.commodity_name))], [items])
  const shown = mode === 'token' || !comm ? items : items.filter((i) => i.commodity_name === comm)
  const chosen = shown.filter((i) => i.selected)
  const tQty = chosen.reduce((s, i) => s + num(i.weight_quintal), 0)
  const tAmt = chosen.reduce((s, i) => s + num(i.amount), 0)
  const tBags = chosen.reduce((s, i) => s + num(i.number_of_bags), 0)
  const targetName = brokers.find((b) => b.id === target)?.name || '-'
  const toggle = (id, v) => setItems((x) => x.map((i) => (i.token_id === id ? { ...i, selected: v } : i)))

  function start() {
    setErr('')
    if (chosen.length === 0) return setErr(T.errors.pick)
    if (!target) return setErr(T.errors.no_broker)
    setConfirm(true)
  }

  async function doTransfer() {
    setConfirm(false)
    setBusy(true)
    try {
      const r = await makeTransfer(
        acc.token,
        target,
        chosen.map((i) => i.token_id),
      )
      if (!r?.ok) {
        setErr(r?.token_number ? `${T.tokenWord} #${r.token_number}: ${T.errors[r.error] || T.errors.server}` : T.errors[r?.error] || T.errors.server)
        return
      }
      setDone(r)
    } catch (ex) {
      fail(ex)
    } finally {
      setBusy(false)
    }
  }

  // ---------------------------------------------------------------- done
  if (done) {
    const amt = (done.lines || []).reduce((s, l) => s + num(l.amount), 0)
    return (
      <div className="bp-card fb-done">
        <div className="fb-done-tick tb-tick">⇄</div>
        <h1 className="bp-name">{T.done}</h1>
        <p className="bp-muted">
          {T.no} <b>{done.transfer?.transfer_no}</b> · {done.from} → {done.to}
        </p>
        <div className="fb-done-amt">{inr(amt)}</div>
        <div className="fb-actions">
          <button type="button" className="bp-btn" onClick={() => printTransfer(done) || alert(T.popup)}>
            🖨 {T.print}
          </button>
          <button
            type="button"
            className="bp-btn bp-btn-outline"
            onClick={() => {
              setDone(null)
              setItems([])
              setReload((n) => n + 1)
            }}
          >
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
  const skippedText = Object.entries(skipped)
    .map(([k, v]) => `${v} ${T.reasons[k] || k}`)
    .join(' · ')

  return (
    <div className="bp-card fb">
      <div className="bp-top">
        <div>
          <div className="bp-muted">{acc.name}</div>
          <h1 className="bp-name">{T.title}</h1>
          <div className="bp-muted bp-small">{T.sub}</div>
        </div>
        <button type="button" className="bp-btn bp-btn-outline" onClick={onBack}>
          {T.back}
        </button>
      </div>

      <div className="bp-tabs" role="tablist">
        {['date', 'token'].map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} className={mode === m ? 'active' : ''} onClick={() => switchMode(m)}>
            {m === 'date' ? T.byDate : T.byToken}
          </button>
        ))}
      </div>

      {mode === 'date' ? (
        <div className="tb-dates">
          <label>
            <span>{T.from}</span>
            <input type="date" className="bp-input" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} />
          </label>
          <label>
            <span>{T.to}</span>
            <input type="date" className="bp-input" value={to} min={from} max={today} onChange={(e) => e.target.value && setTo(e.target.value)} />
          </label>
          {commodities.length > 1 && (
            <label>
              <span>&nbsp;</span>
              <select className="bp-input" value={comm} onChange={(e) => setComm(e.target.value)}>
                <option value="">{T.allComm}</option>
                {commodities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      ) : (
        <form className="fb-add" onSubmit={addToken}>
          <label>
            <span>{T.tokenDate}</span>
            <input type="date" className="bp-input" value={tokDate} max={today} onChange={(e) => e.target.value && setTokDate(e.target.value)} />
          </label>
          <label className="fb-add-no">
            <span>{T.tokenNo}</span>
            <div>
              <input className="bp-input" value={no} onChange={(e) => setNo(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder={T.tokenNo} />
              <button type="submit" className="bp-btn" disabled={busy}>
                + {T.add}
              </button>
            </div>
          </label>
        </form>
      )}

      {err && <div className="bp-error">{err}</div>}
      {mode === 'date' && skippedText && (
        <div className="bp-muted bp-small tb-skip">
          {T.skipped}: {skippedText}
        </div>
      )}

      {loading ? (
        <div className="bp-empty">{T.wait}</div>
      ) : shown.length === 0 ? (
        <div className="bp-empty">{mode === 'date' ? T.none : T.noneAdded}</div>
      ) : (
        <div className="bb-items tb-items">
          {shown.map((i) => (
            <label key={i.token_id} className={'bp-line tb-line' + (i.selected ? '' : ' pb-off')}>
              <input type="checkbox" checked={i.selected} onChange={(e) => toggle(i.token_id, e.target.checked)} />
              <div>
                <b>
                  #{i.token_number} — {i.commodity_name}
                </b>
                {i.farmer_bill_done && <span className="bp-tag tb-tag">{T.farmerDone}</span>}
                <div className="bp-muted bp-small">
                  {prettyDate(i.token_date, lang)} · {i.farmer_name || '-'} → {i.buyer_name} · {i.number_of_bags || 0} {T.bags} · {qtl(i.weight_quintal)}{' '}
                  {T.qtl} × {inr(i.rate_per_quintal)}
                </div>
              </div>
              <div className="bp-line-amt">{inr(i.amount)}</div>
            </label>
          ))}
        </div>
      )}

      <label className="bb-pct tb-broker">
        <span>{T.toBroker}</span>
        <select className="bp-input" value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">{T.chooseBroker}</option>
          {brokers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
              {b.firm && b.firm !== b.name ? ` — ${b.firm}` : ''}
            </option>
          ))}
        </select>
      </label>

      <div className="fb-total">
        <div>
          <span>{T.selected}</span>
          <b>
            {chosen.length} {T.tokens} · {tBags} {T.bags} · {qtl(tQty)} {T.qtl}
          </b>
        </div>
        <div className="big">
          <span>{acc.name} → {targetName}</span>
          <b>{inr(tAmt)}</b>
        </div>
      </div>
      <div className="fb-actions pb-one">
        <button type="button" className="bp-btn tb-btn" disabled={busy || chosen.length === 0} onClick={start}>
          ⇄ {busy ? T.wait : T.transfer}
        </button>
      </div>

      {confirm && (
        <div className="fb-modal" role="dialog" aria-modal="true" onClick={() => setConfirm(false)}>
          <div className="fb-modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>{T.confirmTitle}</h2>
            <p>
              <b>
                {chosen.length} {T.tokens} · {qtl(tQty)} {T.qtl} · {inr(tAmt)}
              </b>
            </p>
            <p>
              {acc.name} → <b>{targetName}</b>
              {comm ? ` · ${comm}` : ''}
            </p>
            <p className="bp-muted">{T.confirmText.replace('{to}', targetName)}</p>
            <div className="fb-actions">
              <button type="button" className="bp-btn bp-btn-outline" onClick={() => setConfirm(false)}>
                {T.cancel}
              </button>
              <button type="button" className="bp-btn tb-btn" onClick={doTransfer}>
                ⇄ {T.transfer}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
