import { useState } from 'react'
import { inr } from '../data'
import { fetchBrokerExport } from '../trader/brokerHomeApi'
import { fetchBuyerExport } from '../trader/traderApi'
import { brokerWorkbook, buyerWorkbook } from '../trader/brokerExcel'
import { downloadBlob } from '../trader/xlsxWriter'
import { printFarmerBills } from '../trader/farmerBillPrint'
import { printBuyerBills } from '../trader/buyerBillPrint'
import { printTransfers } from '../trader/transferPrint'
import './FarmerBill.css'

// =============================================================================
// Export bills (website) — same as the app's "Export Bills":
//   Period: By date (From → To) · By year (calendar / financial, month range) · Overall
//   Which bills: Farmer · Buyer · Transfer
//   Excel = every detail (bills, token-wise items, summaries)
//   PDF   = every bill of the period exactly as printed, in one print window
// =============================================================================

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const TEXT = {
  en: {
    title: 'Export bills',
    sub: 'Excel with every detail, or all bills as one PDF',
    back: '← Dashboard',
    byDate: 'By date',
    byYear: 'By year',
    overall: 'Overall',
    from: 'From',
    to: 'To',
    oneDay: 'Same From & To = one day',
    calendar: 'Calendar year (Jan–Dec)',
    financial: 'Financial year (Apr–Mar)',
    year: 'Year',
    fromMonth: 'From month',
    toMonth: 'To month',
    overallNote: 'Every bill from the start',
    which: 'Which bills',
    farmer: 'Farmer bills',
    buyer: 'Buyer bills',
    transfer: 'Transfer bills',
    pickOne: 'Select at least one bill type',
    load: 'Show bills',
    wait: 'Please wait…',
    found: 'Found',
    none: 'No bills in this period',
    excel: 'Download Excel',
    pdf: 'PDF',
    bills: 'bills',
    big: '{n} bills will open in one print window. This can take a minute. Continue?',
    popup: 'Allow pop-ups for this website to open the PDF',
    error: 'Could not load. Please try again',
  },
  hi: {
    title: 'बिल एक्सपोर्ट',
    sub: 'Excel में पूरी जानकारी, या सभी बिल एक PDF में',
    back: '← डैशबोर्ड',
    byDate: 'तारीख से',
    byYear: 'साल से',
    overall: 'सभी',
    from: 'से',
    to: 'तक',
    oneDay: 'एक दिन के लिए From और To एक ही रखें',
    calendar: 'कैलेंडर साल (जन–दिस)',
    financial: 'वित्त वर्ष (अप्रैल–मार्च)',
    year: 'साल',
    fromMonth: 'महीने से',
    toMonth: 'महीने तक',
    overallNote: 'शुरुआत से अब तक के सभी बिल',
    which: 'कौन से बिल',
    farmer: 'किसान बिल',
    buyer: 'खरीदार बिल',
    transfer: 'ट्रांसफर बिल',
    pickOne: 'कम से कम एक बिल चुनें',
    load: 'बिल दिखाएँ',
    wait: 'कृपया रुकें…',
    found: 'मिले',
    none: 'इस अवधि में कोई बिल नहीं',
    excel: 'Excel डाउनलोड',
    pdf: 'PDF',
    bills: 'बिल',
    big: '{n} बिल एक प्रिंट विंडो में खुलेंगे। इसमें एक मिनट लग सकता है। आगे बढ़ें?',
    popup: 'PDF खोलने के लिए इस वेबसाइट के पॉप-अप चालू करें',
    error: 'नहीं खुला। फिर से कोशिश करें',
  },
  mr: {
    title: 'बिल एक्सपोर्ट',
    sub: 'Excel मध्ये पूर्ण माहिती, किंवा सर्व बिले एका PDF मध्ये',
    back: '← डॅशबोर्ड',
    byDate: 'तारखेनुसार',
    byYear: 'वर्षानुसार',
    overall: 'सर्व',
    from: 'पासून',
    to: 'पर्यंत',
    oneDay: 'एका दिवसासाठी From आणि To एकच ठेवा',
    calendar: 'कॅलेंडर वर्ष (जाने–डिसें)',
    financial: 'आर्थिक वर्ष (एप्रिल–मार्च)',
    year: 'वर्ष',
    fromMonth: 'महिन्यापासून',
    toMonth: 'महिन्यापर्यंत',
    overallNote: 'सुरुवातीपासून आतापर्यंतची सर्व बिले',
    which: 'कोणती बिले',
    farmer: 'शेतकरी बिल',
    buyer: 'खरेदीदार बिल',
    transfer: 'ट्रान्सफर बिल',
    pickOne: 'किमान एक बिल प्रकार निवडा',
    load: 'बिले दाखवा',
    wait: 'कृपया थांबा…',
    found: 'सापडली',
    none: 'या कालावधीत बिल नाही',
    excel: 'Excel डाउनलोड',
    pdf: 'PDF',
    bills: 'बिले',
    big: '{n} बिले एका प्रिंट विंडोमध्ये उघडतील. याला एक मिनिट लागू शकतो. पुढे जायचे?',
    popup: 'PDF उघडण्यासाठी या वेबसाइटचे पॉप-अप चालू करा',
    error: 'उघडले नाही. पुन्हा प्रयत्न करा',
  },
}

const pad = (v) => String(v).padStart(2, '0')
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const lastDay = (y, m) => new Date(y, m + 1, 0).getDate() // m = 0..11
const num = (v) => Number(v) || 0

/** buyer = true → a buyer account: only buyer bills (bills received from brokers) */
export default function ExportBills({ lang, acc, onBack, onExpired, buyer = false }) {
  const T = TEXT[lang] || TEXT.en
  const now = new Date()
  const today = ymd(now)
  const fyNow = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1

  const [mode, setMode] = useState('date')
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const [yearType, setYearType] = useState('financial')
  const [year, setYear] = useState(fyNow)
  const [m1, setM1] = useState(0) // index inside the year (0 = first month)
  const [m2, setM2] = useState(11)
  const [kinds, setKinds] = useState({ farmer: true, buyer: true, transfer: true })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [data, setData] = useState(null)

  // months of the chosen year in order (financial year starts in April)
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = yearType === 'financial' ? (i + 3) % 12 : i
    const y = yearType === 'financial' && i >= 9 ? year + 1 : year
    return { m, y, label: `${MONTHS[m]} ${y}` }
  })
  const years = Array.from({ length: 8 }, (_, i) => (yearType === 'financial' ? fyNow : now.getFullYear()) - i)

  function period() {
    if (mode === 'overall') return { from: null, to: null, text: T.overall, file: 'Overall' }
    if (mode === 'date') {
      const text = from === to ? from : `${from} to ${to}`
      return { from, to, text, file: from === to ? from : `${from}_to_${to}` }
    }
    const a = months[Math.min(m1, m2)]
    const b = months[Math.max(m1, m2)]
    const f = `${a.y}-${pad(a.m + 1)}-01`
    const t = `${b.y}-${pad(b.m + 1)}-${pad(lastDay(b.y, b.m))}`
    const yl = yearType === 'financial' ? `FY ${year}-${String(year + 1).slice(2)}` : `${year}`
    return { from: f, to: t, text: `${yl}: ${a.label} – ${b.label} (${f} to ${t})`, file: `${yl.replace(/\s/g, '')}_${a.label.replace(' ', '')}_to_${b.label.replace(' ', '')}` }
  }

  async function load() {
    setErr('')
    setData(null)
    if (!buyer && !kinds.farmer && !kinds.buyer && !kinds.transfer) return setErr(T.pickOne)
    const p = period()
    setBusy(true)
    try {
      const d = buyer ? await fetchBuyerExport(acc.token, p.from, p.to) : await fetchBrokerExport(acc.token, p.from, p.to, kinds)
      if (!d?.ok) return setErr(T.error)
      setData({ ...d, period: p })
    } catch (e) {
      if (e?.message === 'SESSION_EXPIRED') onExpired()
      else setErr(T.error)
    } finally {
      setBusy(false)
    }
  }

  const reset = (fn) => (...a) => {
    setData(null)
    fn(...a)
  }

  function excel() {
    const blob = buyer ? buyerWorkbook(data, data.period.text) : brokerWorkbook(data, data.period.text)
    const safe = String((buyer ? data.buyer : data.broker) || 'Account').replace(/[^\w]+/g, '_')
    downloadBlob(blob, `${buyer ? 'Buyer' : 'Broker'}_${safe}_${data.period.file}.xlsx`)
  }

  function pdf(list, printer, name) {
    if (list.length > 150 && !window.confirm(T.big.replace('{n}', list.length))) return
    const ok = printer(list, null, `${name}_${data.period.file}`)
    if (!ok) alert(T.popup)
  }

  const fb = data?.farmer_bills || []
  const bb = data?.buyer_bills || []
  const tr = data?.transfers || []
  const total = fb.length + bb.length + tr.length
  const fbNet = fb.reduce((s, b) => s + (b.lines || []).reduce((a, l) => a + num(l.net_payable_amount), 0), 0)
  const bbNet = bb.reduce((s, b) => s + num(b.bill?.total_amount), 0)
  const trAmt = tr.reduce((s, t) => s + (t.lines || []).reduce((a, l) => a + num(l.amount), 0), 0)

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
        {[
          ['date', T.byDate],
          ['year', T.byYear],
          ['overall', T.overall],
        ].map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={mode === k} className={mode === k ? 'active' : ''} onClick={reset(() => setMode(k))}>
            {label}
          </button>
        ))}
      </div>

      {mode === 'date' && (
        <>
          <div className="tb-dates ex-two">
            <label>
              <span>{T.from}</span>
              <input type="date" className="bp-input" value={from} max={to} onChange={reset((e) => e.target.value && setFrom(e.target.value))} />
            </label>
            <label>
              <span>{T.to}</span>
              <input type="date" className="bp-input" value={to} min={from} max={today} onChange={reset((e) => e.target.value && setTo(e.target.value))} />
            </label>
          </div>
          <div className="bp-muted bp-small">{T.oneDay}</div>
        </>
      )}

      {mode === 'year' && (
        <div className="tb-dates ex-year">
          <label>
            <span>&nbsp;</span>
            <select
              className="bp-input"
              value={yearType}
              onChange={reset((e) => {
                setYearType(e.target.value)
                setYear(e.target.value === 'financial' ? fyNow : now.getFullYear())
                setM1(0)
                setM2(11)
              })}
            >
              <option value="financial">{T.financial}</option>
              <option value="calendar">{T.calendar}</option>
            </select>
          </label>
          <label>
            <span>{T.year}</span>
            <select className="bp-input" value={year} onChange={reset((e) => setYear(Number(e.target.value)))}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {yearType === 'financial' ? `${y}-${String(y + 1).slice(2)}` : y}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{T.fromMonth}</span>
            <select className="bp-input" value={m1} onChange={reset((e) => setM1(Number(e.target.value)))}>
              {months.map((m, i) => (
                <option key={i} value={i}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{T.toMonth}</span>
            <select className="bp-input" value={m2} onChange={reset((e) => setM2(Number(e.target.value)))}>
              {months.map((m, i) => (
                <option key={i} value={i}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {mode === 'overall' && <div className="fb-farmer">{T.overallNote}</div>}

      {!buyer && <div className="fb-ded-title">{T.which}</div>}
      <div className="ex-kinds" hidden={buyer}>
        {['farmer', 'buyer', 'transfer'].map((k) => (
          <label key={k} className={kinds[k] ? 'on' : ''}>
            <input type="checkbox" checked={kinds[k]} onChange={reset((e) => setKinds((x) => ({ ...x, [k]: e.target.checked })))} />
            {T[k]}
          </label>
        ))}
      </div>

      {err && <div className="bp-error">{err}</div>}

      <div className="fb-actions pb-one">
        <button type="button" className="bp-btn" disabled={busy} onClick={load}>
          {busy ? T.wait : `🔍 ${T.load}`}
        </button>
      </div>

      {data &&
        (total === 0 ? (
          <div className="bp-empty">{T.none}</div>
        ) : (
          <div className="ex-result">
            <div className="bp-muted bp-small">{data.period.text}</div>
            <div className="ex-counts">
              {!buyer && kinds.farmer && (
                <div>
                  <b>{fb.length}</b>
                  <span>{T.farmer}</span>
                  <small>{inr(fbNet)}</small>
                </div>
              )}
              {(buyer || kinds.buyer) && (
                <div>
                  <b>{bb.length}</b>
                  <span>{T.buyer}</span>
                  <small>{inr(bbNet)}</small>
                </div>
              )}
              {!buyer && kinds.transfer && (
                <div>
                  <b>{tr.length}</b>
                  <span>{T.transfer}</span>
                  <small>{inr(trAmt)}</small>
                </div>
              )}
            </div>
            <button type="button" className="bp-btn ex-excel" onClick={excel}>
              ⬇ {T.excel}
            </button>
            <div className="ex-pdfs">
              {fb.length > 0 && (
                <button type="button" className="bp-btn bp-btn-outline" onClick={() => pdf(fb, printFarmerBills, 'Farmer_Bills')}>
                  📄 {T.farmer} {T.pdf} ({fb.length})
                </button>
              )}
              {bb.length > 0 && (
                <button type="button" className="bp-btn bp-btn-outline" onClick={() => pdf(bb, printBuyerBills, 'Buyer_Bills')}>
                  📄 {T.buyer} {T.pdf} ({bb.length})
                </button>
              )}
              {tr.length > 0 && (
                <button type="button" className="bp-btn bp-btn-outline" onClick={() => pdf(tr, printTransfers, 'Transfer_Bills')}>
                  📄 {T.transfer} {T.pdf} ({tr.length})
                </button>
              )}
            </div>
          </div>
        ))}
    </div>
  )
}
