import { useEffect, useMemo, useState } from 'react'
import { inr, prettyDate } from '../data'
import { fetchUnbilledBuyerItems, makeBuyerBill } from '../trader/brokerHomeApi'
import { printBuyerBill } from '../trader/buyerBillPrint'
import './FarmerBill.css'

// =============================================================================
// Buyer bill (website) — same as the app's "Buyer Bills":
//   buyers with sold goods not billed yet → pick a buyer → everything of that
//   buyer is on ONE bill → brokerage % (TDS 2% of brokerage is cut) → Generate → print
// =============================================================================

const TEXT = {
  en: {
    title: 'Buyer bills',
    back: '← Dashboard',
    sub: 'Goods sold whose farmer bill is made, but not on a buyer bill yet',
    search: 'Search buyer',
    none: 'Nothing to bill — all buyers are billed',
    tokens: 'tokens',
    qtl: 'qtl',
    bags: 'bags',
    change: 'Change buyer',
    byCommodity: 'By commodity',
    items: 'Tokens on this bill',
    transferred: 'Transferred',
    brokerage: 'Brokerage %',
    hint: 'e.g. 1.25',
    amount: 'Amount',
    brokerageAmt: 'Brokerage',
    tds: 'TDS 2% on brokerage',
    total: 'Net payable by buyer',
    generate: 'Generate Bill',
    wait: 'Please wait…',
    made: 'Bill made',
    billNo: 'Bill No.',
    print: 'Print bill',
    another: 'Bill another buyer',
    popup: 'Allow pop-ups for this website to print the bill',
    load: 'Could not load. Please try again',
    errors: {
      no_brokerage: 'Enter brokerage %',
      nothing: 'Nothing left to bill for this buyer',
      changed: 'List updated with new tokens — please check and press Generate again',
      server: 'Server error. Please try again',
    },
  },
  hi: {
    title: 'खरीदार बिल',
    back: '← डैशबोर्ड',
    sub: 'जिस माल का किसान बिल बन गया, पर खरीदार बिल बाकी है',
    search: 'खरीदार खोजें',
    none: 'कुछ बाकी नहीं — सब खरीदारों का बिल बन गया',
    tokens: 'टोकन',
    qtl: 'क्विंटल',
    bags: 'बोरी',
    change: 'खरीदार बदलें',
    byCommodity: 'फसल अनुसार',
    items: 'इस बिल के टोकन',
    transferred: 'ट्रांसफर',
    brokerage: 'दलाली %',
    hint: 'जैसे 1.25',
    amount: 'रकम',
    brokerageAmt: 'दलाली',
    tds: 'दलाली पर TDS 2%',
    total: 'खरीदार की देय रकम',
    generate: 'बिल बनाएं',
    wait: 'कृपया रुकें…',
    made: 'बिल बन गया',
    billNo: 'बिल नं.',
    print: 'बिल प्रिंट करें',
    another: 'दूसरे खरीदार का बिल',
    popup: 'बिल प्रिंट के लिए इस वेबसाइट के पॉप-अप चालू करें',
    load: 'नहीं खुला। फिर से कोशिश करें',
    errors: {
      no_brokerage: 'दलाली % डालें',
      nothing: 'इस खरीदार का कोई बाकी माल नहीं',
      changed: 'सूची अपडेट हुई (नए टोकन जुड़े) — जांच कर फिर से दबाएं',
      server: 'सर्वर त्रुटि। फिर से कोशिश करें',
    },
  },
  mr: {
    title: 'खरेदीदार बिल',
    back: '← डॅशबोर्ड',
    sub: 'ज्या मालाचे शेतकरी बिल झाले, पण खरेदीदार बिल बाकी आहे',
    search: 'खरेदीदार शोधा',
    none: 'काहीही बाकी नाही — सर्व खरेदीदारांचे बिल झाले',
    tokens: 'टोकन',
    qtl: 'क्विंटल',
    bags: 'पोती',
    change: 'खरेदीदार बदला',
    byCommodity: 'पिकानुसार',
    items: 'या बिलाचे टोकन',
    transferred: 'ट्रान्सफर',
    brokerage: 'अडत %',
    hint: 'उदा. 1.25',
    amount: 'रक्कम',
    brokerageAmt: 'अडत',
    tds: 'अडतीवर TDS 2%',
    total: 'खरेदीदाराची देय रक्कम',
    generate: 'बिल बनवा',
    wait: 'कृपया थांबा…',
    made: 'बिल तयार झाले',
    billNo: 'बिल नं.',
    print: 'बिल प्रिंट करा',
    another: 'दुसऱ्या खरेदीदाराचे बिल',
    popup: 'बिल प्रिंटसाठी या वेबसाइटचे पॉप-अप चालू करा',
    load: 'उघडले नाही. पुन्हा प्रयत्न करा',
    errors: {
      no_brokerage: 'अडत % टाका',
      nothing: 'या खरेदीदाराचा कोणताही माल बाकी नाही',
      changed: 'यादी अपडेट झाली (नवीन टोकन आले) — तपासून पुन्हा दाबा',
      server: 'सर्व्हर त्रुटी. पुन्हा प्रयत्न करा',
    },
  },
}

const num = (v) => Number(v) || 0
const qtl = (v) => num(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })

export default function BuyerBill({ lang, acc, onBack, onExpired }) {
  const T = TEXT[lang] || TEXT.en
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [reload, setReload] = useState(0)
  const [search, setSearch] = useState('')
  const [buyerId, setBuyerId] = useState(null)
  const [pct, setPct] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const [done, setDone] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetchUnbilledBuyerItems(acc.token)
      .then((d) => alive && setRows(d))
      .catch((e) => {
        if (!alive) return
        if (e.message === 'SESSION_EXPIRED') onExpired()
        else setErr(T.load)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acc.token, reload])

  const buyers = useMemo(() => {
    const map = new Map()
    for (const r of rows) {
      if (!map.has(r.buyer_profile_id)) map.set(r.buyer_profile_id, { id: r.buyer_profile_id, name: r.buyer_name || '-', tokens: 0, qty: 0, amount: 0 })
      const b = map.get(r.buyer_profile_id)
      b.tokens += 1
      b.qty += num(r.weight_quintal)
      b.amount += num(r.amount)
    }
    return [...map.values()].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  }, [rows])

  const shown = buyers.filter((b) => b.name.toLowerCase().includes(search.trim().toLowerCase()))
  const buyer = buyers.find((b) => b.id === buyerId)
  const items = useMemo(
    () =>
      rows
        .filter((r) => r.buyer_profile_id === buyerId)
        .sort((a, b) => String(a.token_date).localeCompare(String(b.token_date)) || num(a.token_number) - num(b.token_number)),
    [rows, buyerId],
  )
  const byCommodity = useMemo(() => {
    const m = new Map()
    for (const i of items) {
      const c = m.get(i.commodity_name) || { name: i.commodity_name || '-', tokens: 0, bags: 0, qty: 0, amount: 0 }
      c.tokens += 1
      c.bags += num(i.number_of_bags)
      c.qty += num(i.weight_quintal)
      c.amount += num(i.amount)
      m.set(c.name, c)
    }
    return [...m.values()]
  }, [items])

  const gross = items.reduce((s, i) => s + num(i.amount), 0)
  const brokerage = (gross * num(pct)) / 100
  const tds = (brokerage * 2) / 100
  const total = gross + brokerage - tds

  async function generate() {
    setErr('')
    setInfo('')
    if (pct.trim() === '') return setErr(T.errors.no_brokerage)
    setBusy(true)
    try {
      const r = await makeBuyerBill(
        acc.token,
        buyerId,
        num(pct),
        items.map((i) => i.token_id),
      )
      if (!r?.ok) {
        if (r?.error === 'changed') {
          setInfo(T.errors.changed)
          setReload((n) => n + 1)
        } else {
          setErr(T.errors[r?.error] || T.errors.server)
          if (r?.error === 'nothing') setReload((n) => n + 1)
        }
        return
      }
      setDone(r)
    } catch (e) {
      if (e?.message === 'SESSION_EXPIRED') onExpired()
      else setErr(T.errors.server)
    } finally {
      setBusy(false)
    }
  }

  // ---------------------------------------------------------------- bill made
  if (done) {
    return (
      <div className="bp-card fb-done">
        <div className="fb-done-tick">✓</div>
        <h1 className="bp-name">{T.made}</h1>
        <p className="bp-muted">
          {T.billNo} <b>{done.bill?.bill_no}</b> · {done.buyer?.name}
        </p>
        <div className="fb-done-amt">{inr(done.bill?.total_amount)}</div>
        <div className="fb-actions">
          <button type="button" className="bp-btn" onClick={() => printBuyerBill(done) || alert(T.popup)}>
            🖨 {T.print}
          </button>
          <button
            type="button"
            className="bp-btn bp-btn-outline"
            onClick={() => {
              setDone(null)
              setBuyerId(null)
              setPct('')
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

  const header = (
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
  )

  // ---------------------------------------------------------------- pick buyer
  if (!buyer) {
    return (
      <div className="bp-card">
        {header}
        {info && <div className="fb-ok">{info}</div>}
        {err && <div className="bp-error">{err}</div>}
        {buyers.length > 5 && <input className="bp-input bb-search" placeholder={T.search} value={search} onChange={(e) => setSearch(e.target.value)} />}
        {loading ? (
          <div className="bp-empty">{T.wait}</div>
        ) : buyers.length === 0 ? (
          <div className="bp-empty">{T.none}</div>
        ) : (
          <div className="bp-list">
            {shown.map((b) => (
              <button
                key={b.id}
                type="button"
                className="bp-row pb-farmer"
                onClick={() => {
                  setBuyerId(b.id)
                  setErr('')
                  setInfo('')
                }}
              >
                <span className="pb-ico bb-ico">🏪</span>
                <div className="bp-row-main">
                  <div className="bp-row-who">{b.name}</div>
                  <div className="bp-muted bp-small">
                    {b.tokens} {T.tokens} · {qtl(b.qty)} {T.qtl}
                  </div>
                </div>
                <div className="bp-row-amt">{inr(b.amount)} ›</div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------- one buyer
  return (
    <div className="bp-card fb">
      {header}

      <div className="fb-farmer set bb-buyer">
        <span>🏪</span>
        <b>{buyer.name}</b>
        <button type="button" className="fb-link" onClick={() => setBuyerId(null)}>
          {T.change}
        </button>
      </div>

      {info && <div className="fb-ok">{info}</div>}
      {err && <div className="bp-error">{err}</div>}

      <div className="fb-ded-title">{T.byCommodity}</div>
      <div className="bb-comm">
        {byCommodity.map((c) => (
          <div key={c.name}>
            <b>{c.name}</b>
            <span>
              {c.tokens} {T.tokens} · {c.bags} {T.bags} · {qtl(c.qty)} {T.qtl}
            </span>
            <b>{inr(c.amount)}</b>
          </div>
        ))}
      </div>

      <div className="fb-ded-title">
        {T.items} ({items.length})
      </div>
      <div className="bb-items">
        {items.map((i) => (
          <div key={i.token_id} className="bp-line">
            <div>
              <b>
                #{i.token_number} — {i.commodity_name}
              </b>
              {i.is_transferred && <span className="bp-tag">{T.transferred}</span>}
              <div className="bp-muted bp-small">
                {prettyDate(i.token_date, lang)} · {i.farmer_name || '-'} · {i.number_of_bags || 0} {T.bags} · {qtl(i.weight_quintal)} {T.qtl} ×{' '}
                {inr(i.rate_per_quintal)}
              </div>
            </div>
            <div className="bp-line-amt">{inr(i.amount)}</div>
          </div>
        ))}
      </div>

      <label className="bb-pct">
        <span>{T.brokerage}</span>
        <input
          className="bp-input"
          value={pct}
          onChange={(e) => setPct(e.target.value.replace(/[^\d.]/g, '').replace(/^(\d*\.?\d{0,3}).*$/, '$1'))}
          inputMode="decimal"
          placeholder={T.hint}
        />
      </label>

      <div className="fb-total">
        <div>
          <span>{T.amount}</span>
          <b>{inr(gross)}</b>
        </div>
        <div>
          <span>
            {T.brokerageAmt} ({num(pct)}%)
          </span>
          <b>+ {inr(brokerage)}</b>
        </div>
        <div>
          <span>{T.tds}</span>
          <b>− {inr(tds)}</b>
        </div>
        <div className="big">
          <span>{T.total}</span>
          <b>{inr(total)}</b>
        </div>
      </div>
      <div className="fb-actions pb-one">
        <button type="button" className="bp-btn" disabled={busy || items.length === 0} onClick={generate}>
          🧾 {busy ? T.wait : T.generate}
        </button>
      </div>
    </div>
  )
}
