import { useEffect, useMemo, useState } from 'react'
import { inr, prettyDate } from '../data'
import { fetchBrokerHome, fetchBrokerToken } from '../trader/brokerHomeApi'
import { BillsView, BROKER_TEXT } from './BrokerPortal'
import FarmerBill from './FarmerBill'
import PendingBills from './PendingBills'
import BuyerBill from './BuyerBill'
import TransferBill from './TransferBill'
import ExportBills from './ExportBills'
import { reprintFarmerBill, reprintBuyerBill, reprintTransfer } from '../trader/reprintFarmerBill'
import './BrokerPortal.css'
import './BrokerHome.css'

// =============================================================================
// Broker Dashboard on the website — same as the app's Broker Dashboard:
//   date ‹ › · search token · 6 action tiles · sales (KPIs + 7-day graph +
//   sale by commodity) · commodity summary → token list → token details
// =============================================================================

const TEXT = {
  en: {
    title: 'Broker Dashboard',
    back: '← My Accounts',
    backHome: '← Dashboard',
    today: 'Today',
    search: 'Token No.',
    find: 'Find',
    badToken: 'Enter a valid token number',
    notFound: 'Token not found on this date',
    farmerBill: 'Farmer bill',
    farmerBillSub: 'Make a new bill',
    buyerBills: 'Buyer bills',
    buyersWaiting: '{n} buyers waiting',
    allBilled: 'All billed',
    pending: 'Pending bills',
    tokensWaiting: '{n} tokens waiting',
    allDone: 'All done',
    bills: 'Bills',
    billsSub: 'See old bills',
    transfer: 'Transfer bill',
    transferSub: 'To another broker',
    export: 'Export',
    exportSub: 'Excel / PDF',
    soon: 'Coming next',
    totalSale: 'Total sale',
    vsPrev: 'vs previous day',
    noPrev: 'No sale on previous day',
    noSale: 'No bills on this date',
    out: 'Transferred out',
    in: 'Received',
    qty: 'Quantity',
    tokens: 'Tokens',
    token: 'Token',
    farmers: 'Farmers',
    netPaid: 'Paid to farmers',
    last7: 'Last 7 days',
    last7Sub: 'tap a bar to see that day',
    byCommodity: 'Sale by commodity',
    noSaleDay: 'No sale on this date',
    summary: 'Commodity summary',
    commodity: 'Commodity',
    est: 'Estimated',
    real: 'Actual',
    noTokens: 'No tokens on this date',
    qtl: 'qtl',
    auctionPending: 'Auction pending',
    buyer: 'Buyer',
    rate: 'Rate',
    viewOnly: 'View only',
    entry: 'Entry',
    auction: 'Auction',
    weight: 'Weight',
    patti: 'Farmer bill (Patti)',
    farmer: 'Farmer',
    phone: 'Phone',
    vehicle: 'Vehicle',
    estQty: 'Est. qty',
    entryBy: 'Entry by',
    mark: 'Mark',
    mapari: 'Mapari',
    bags: 'Bags',
    bagWt: 'Bag weight',
    chungad: 'Chungad',
    totalWt: 'Total weight',
    labour: 'Labour',
    gross: 'Gross amount',
    utrai: 'Utrai (Fodai)',
    mapai: 'Mapai (Tolai)',
    hamali: 'Hamali',
    mandiCharge: 'Mandi charge',
    net: 'Net payable',
    weighPending: 'Weighing pending',
    pattiPending: 'Farmer bill not made yet',
    wait: 'Please wait…',
    expired: 'Your login expired. Please open the account again',
    load: 'Could not load. Please try again',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  hi: {
    title: 'दलाल डैशबोर्ड',
    back: '← मेरे खाते',
    backHome: '← डैशबोर्ड',
    today: 'आज',
    search: 'टोकन नं.',
    find: 'खोजें',
    badToken: 'सही टोकन नंबर डालें',
    notFound: 'इस तारीख में यह टोकन नहीं मिला',
    farmerBill: 'किसान का बिल',
    farmerBillSub: 'नया बिल बनाएं',
    buyerBills: 'खरीदार बिल',
    buyersWaiting: '{n} खरीदार बाकी',
    allBilled: 'सब बिल बने',
    pending: 'पेंडिंग बिल',
    tokensWaiting: '{n} टोकन बाकी',
    allDone: 'सब पूरा',
    bills: 'बिल',
    billsSub: 'पुराने बिल देखें',
    transfer: 'बिल ट्रांसफर',
    transferSub: 'दूसरे दलाल को',
    export: 'एक्सपोर्ट',
    exportSub: 'Excel / PDF',
    soon: 'जल्द आ रहा है',
    totalSale: 'कुल बिक्री',
    vsPrev: 'पिछले दिन से',
    noPrev: 'पिछले दिन कोई बिक्री नहीं',
    noSale: 'इस दिन कोई बिल नहीं',
    out: 'ट्रांसफर किया',
    in: 'मिला',
    qty: 'वजन',
    tokens: 'टोकन',
    token: 'टोकन',
    farmers: 'किसान',
    netPaid: 'किसान को दिया',
    last7: 'पिछले 7 दिन',
    last7Sub: 'उस दिन के लिए बार पर टैप करें',
    byCommodity: 'फसल अनुसार बिक्री',
    noSaleDay: 'इस दिन कोई बिक्री नहीं',
    summary: 'फसल अनुसार सारांश',
    commodity: 'फसल',
    est: 'अनुमानित',
    real: 'वास्तविक',
    noTokens: 'इस दिन कोई टोकन नहीं',
    qtl: 'क्विंटल',
    auctionPending: 'लिलाव बाकी',
    buyer: 'खरीदार',
    rate: 'भाव',
    viewOnly: 'केवल देखें',
    entry: 'एंट्री',
    auction: 'लिलाव',
    weight: 'तोलाई',
    patti: 'किसान बिल (पट्टी)',
    farmer: 'किसान',
    phone: 'फ़ोन',
    vehicle: 'गाड़ी',
    estQty: 'अनुमानित वजन',
    entryBy: 'एंट्री करने वाला',
    mark: 'मार्क',
    mapari: 'मापारी',
    bags: 'बोरी',
    bagWt: 'बोरी वजन',
    chungad: 'चुंगड',
    totalWt: 'कुल वजन',
    labour: 'हमाल',
    gross: 'कुल रकम',
    utrai: 'उतराई (फोडाई)',
    mapai: 'मापाई (तोलाई)',
    hamali: 'हमाली',
    mandiCharge: 'मंडी चार्ज',
    net: 'देय रकम',
    weighPending: 'तोलाई बाकी',
    pattiPending: 'किसान बिल अभी नहीं बना',
    wait: 'कृपया रुकें…',
    expired: 'लॉगिन समय खत्म। खाता फिर से खोलें',
    load: 'नहीं खुला। फिर से कोशिश करें',
    days: ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'],
  },
  mr: {
    title: 'अडत्या डॅशबोर्ड',
    back: '← माझी खाती',
    backHome: '← डॅशबोर्ड',
    today: 'आज',
    search: 'टोकन नं.',
    find: 'शोधा',
    badToken: 'योग्य टोकन नंबर टाका',
    notFound: 'या तारखेला हा टोकन सापडला नाही',
    farmerBill: 'शेतकरी बिल',
    farmerBillSub: 'नवीन बिल बनवा',
    buyerBills: 'खरेदीदार बिल',
    buyersWaiting: '{n} खरेदीदार बाकी',
    allBilled: 'सर्व बिल झाले',
    pending: 'पेंडिंग बिल',
    tokensWaiting: '{n} टोकन बाकी',
    allDone: 'सर्व पूर्ण',
    bills: 'बिले',
    billsSub: 'जुनी बिले पहा',
    transfer: 'बिल ट्रान्सफर',
    transferSub: 'दुसऱ्या अडत्याला',
    export: 'एक्सपोर्ट',
    exportSub: 'Excel / PDF',
    soon: 'लवकरच येत आहे',
    totalSale: 'एकूण विक्री',
    vsPrev: 'मागील दिवसापेक्षा',
    noPrev: 'मागील दिवशी विक्री नाही',
    noSale: 'या दिवशी बिल नाही',
    out: 'ट्रान्सफर केले',
    in: 'मिळाले',
    qty: 'वजन',
    tokens: 'टोकन',
    token: 'टोकन',
    farmers: 'शेतकरी',
    netPaid: 'शेतकऱ्याला दिले',
    last7: 'मागील 7 दिवस',
    last7Sub: 'त्या दिवसासाठी बारवर टॅप करा',
    byCommodity: 'पिकानुसार विक्री',
    noSaleDay: 'या दिवशी विक्री नाही',
    summary: 'पिकानुसार सारांश',
    commodity: 'पीक',
    est: 'अंदाजे',
    real: 'प्रत्यक्ष',
    noTokens: 'या दिवशी टोकन नाही',
    qtl: 'क्विंटल',
    auctionPending: 'लिलाव बाकी',
    buyer: 'खरेदीदार',
    rate: 'भाव',
    viewOnly: 'फक्त पहा',
    entry: 'एंट्री',
    auction: 'लिलाव',
    weight: 'तोलाई',
    patti: 'शेतकरी बिल (पट्टी)',
    farmer: 'शेतकरी',
    phone: 'फोन',
    vehicle: 'गाडी',
    estQty: 'अंदाजे वजन',
    entryBy: 'एंट्री करणारा',
    mark: 'मार्क',
    mapari: 'मापारी',
    bags: 'पोती',
    bagWt: 'पोते वजन',
    chungad: 'चुंगड',
    totalWt: 'एकूण वजन',
    labour: 'हमाल',
    gross: 'एकूण रक्कम',
    utrai: 'उतराई (फोडाई)',
    mapai: 'मापाई (तोलाई)',
    hamali: 'हमाली',
    mandiCharge: 'मंडी चार्ज',
    net: 'देय रक्कम',
    weighPending: 'तोलाई बाकी',
    pattiPending: 'शेतकरी बिल अजून झाले नाही',
    wait: 'कृपया थांबा…',
    expired: 'लॉगिनची वेळ संपली. खाते पुन्हा उघडा',
    load: 'उघडले नाही. पुन्हा प्रयत्न करा',
    days: ['सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'],
  },
}

// ------------------------------------------------------------------ helpers
const ymd = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}
const parseYmd = (s) => {
  const [y, m, d] = String(s).split('-').map(Number)
  return new Date(y, m - 1, d)
}
const addDays = (s, n) => {
  const d = parseYmd(s)
  d.setDate(d.getDate() + n)
  return ymd(d)
}
const num = (v) => Number(v) || 0
const qtl = (n) => num(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })
const compact = (v) => {
  if (v >= 10000000) return '₹' + (v / 10000000).toFixed(1) + 'Cr'
  if (v >= 100000) return '₹' + (v / 100000).toFixed(1) + 'L'
  if (v >= 1000) return '₹' + Math.round(v / 1000) + 'K'
  if (v <= 0) return ''
  return '₹' + Math.round(v)
}
const PALETTE = ['#1f7a45', '#0e7490', '#c9852b', '#6a4c93', '#b5523b', '#4f6d7a']

/** Same sale maths as the app (farmer bills made that day, minus goods
 *  transferred to other brokers, plus goods received from other brokers). */
function buildSales(data, selDate) {
  const days = Array.from({ length: 7 }, (_, i) => ({ date: addDays(selDate, i - 6), amount: 0 }))
  const byKey = Object.fromEntries(days.map((d) => [d.date, d]))
  const comm = new Map()
  const farmers = new Set()
  let sale = 0
  let qty = 0
  let net = 0
  let tokens = 0
  let outAmt = 0
  let inAmt = 0

  const addComm = (name, amount, q) => {
    const c = comm.get(name) || { name, amount: 0, qty: 0, tokens: 0 }
    c.amount += amount
    c.qty += q
    c.tokens += 1
    comm.set(name, c)
  }

  for (const r of data.pattis || []) {
    const amount = num(r.gross_amount)
    if (r.day === selDate) net += num(r.net_payable_amount)
    if (r.transferred_out) {
      if (r.day === selDate) outAmt += amount
      continue
    }
    if (byKey[r.day]) byKey[r.day].amount += amount
    if (r.day !== selDate) continue
    const q = num(r.total_weight_quintal)
    sale += amount
    qty += q
    tokens += 1
    farmers.add(String(r.farmer_name || '').trim().toLowerCase() + '|' + (r.farmer_phone_number || ''))
    addComm(r.commodity_name || '-', amount, q)
  }
  for (const x of data.received || []) {
    const amount = num(x.amount)
    if (byKey[x.day]) byKey[x.day].amount += amount
    if (x.day !== selDate) continue
    const q = num(x.weight_quintal)
    sale += amount
    qty += q
    inAmt += amount
    tokens += 1
    farmers.add(String(x.farmer_name || '').trim().toLowerCase() + '|in')
    addComm(x.commodity_name || '-', amount, q)
  }
  const prev = days[5].amount
  return {
    days,
    sale,
    qty,
    net,
    tokens,
    farmers: farmers.size,
    outAmt,
    inAmt,
    change: prev > 0 ? ((sale - prev) / prev) * 100 : null,
    commodities: [...comm.values()].sort((a, b) => b.amount - a.amount),
  }
}

// ================================================================== page
export default function BrokerHome({ lang, acc, onBack, backLabel }) {
  const T = TEXT[lang] || TEXT.en
  const BT = BROKER_TEXT[lang] || BROKER_TEXT.en
  const [date, setDate] = useState(() => ymd(new Date()))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [reload, setReload] = useState(0)
  // home | bills | pending | commodity | token
  const [view, setView] = useState({ name: 'home' })

  function expired() {
    alert(T.expired)
    onBack()
  }

  useEffect(() => {
    let alive = true
    setLoading(true)
    setMsg('')
    fetchBrokerHome(acc.token, date)
      .then((d) => alive && setData(d))
      .catch((e) => {
        if (!alive) return
        if (e.message === 'SESSION_EXPIRED') expired()
        else setMsg(T.load)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acc.token, date, reload])

  const home = () => {
    setView({ name: 'home' })
    setReload((n) => n + 1)
  }

  // ---- sub screens
  if (view.name === 'export') {
    return <ExportBills lang={lang} acc={acc} onBack={home} onExpired={expired} />
  }
  if (view.name === 'transfer') {
    return <TransferBill lang={lang} acc={acc} onBack={home} onExpired={expired} />
  }
  if (view.name === 'buyer') {
    return <BuyerBill lang={lang} acc={acc} onBack={home} onExpired={expired} />
  }
  if (view.name === 'pending') {
    return <PendingBills lang={lang} acc={acc} onBack={home} onExpired={expired} />
  }
  if (view.name === 'bills' || view.name === 'pending') {
    return (
      <BillsView
        T={BT}
        lang={lang}
        session={acc}
        initialTab={view.name === 'pending' ? 'pending' : 'farmer'}
        onLogout={home}
        onBack={home}
        backLabel={T.backHome}
        onPrint={(r, kind) =>
          (kind === 'buyer' ? reprintBuyerBill : kind === 'transfer' ? reprintTransfer : reprintFarmerBill)(acc.token, r.id).then((s) => (s === 'expired' ? expired() : s !== 'ok' && alert(T.load)))
        }
      />
    )
  }
  if (view.name === 'farmer') {
    return <FarmerBill lang={lang} acc={acc} onBack={home} onExpired={expired} />
  }
  if (view.name === 'token') {
    return <TokenDetail T={T} lang={lang} acc={acc} number={view.number} date={view.date} onBack={() => setView(view.from || { name: 'home' })} onExpired={expired} />
  }
  if (view.name === 'commodity') {
    return (
      <CommodityTokens
        T={T}
        name={view.commodity}
        tokens={(data?.tokens || []).filter((t) => t.commodity_name === view.commodity)}
        onBack={() => setView({ name: 'home' })}
        onOpen={(t) => setView({ name: 'token', number: t.token_number, date: t.token_date, from: view })}
      />
    )
  }

  const me = data?.me || {}
  return (
    <div className="bh">
      <Header T={T} lang={lang} acc={acc} me={me} date={date} setDate={setDate} onBack={onBack} backLabel={backLabel || T.back} onFind={(n) => setView({ name: 'token', number: n, date })} />

      {msg && <div className="bp-error">{msg}</div>}

      <Tiles T={T} data={data} onOpen={(name) => setView({ name })} />

      {loading && !data ? (
        <div className="bp-card bp-empty">{T.wait}</div>
      ) : data ? (
        <>
          <Sales T={T} lang={lang} data={data} date={date} setDate={setDate} />
          <Summary T={T} tokens={data.tokens || []} onOpen={(c) => setView({ name: 'commodity', commodity: c })} />
        </>
      ) : null}
    </div>
  )
}

// ------------------------------------------------------------------ header
function Header({ T, lang, acc, me, date, setDate, onBack, backLabel, onFind }) {
  const [q, setQ] = useState('')
  const [err, setErr] = useState('')
  const today = ymd(new Date())

  function find(e) {
    e.preventDefault()
    const n = parseInt(q, 10)
    if (!n || n < 1) {
      setErr(T.badToken)
      return
    }
    setErr('')
    onFind(n)
  }

  return (
    <div className="bh-head">
      <div className="bh-head-top">
        <div>
          <div className="bh-kicker">{T.title}</div>
          <h1>{me.name || acc.name}</h1>
          <div className="bh-sub">
            {me.mandi_name || acc.mandi_name}
            {me.login_id ? ` · ${me.login_id}` : ''}
          </div>
        </div>
        <button type="button" className="bh-ghost" onClick={onBack}>
          {backLabel}
        </button>
      </div>

      <div className="bh-tools">
        <div className="bh-date">
          <button type="button" aria-label="Previous day" onClick={() => setDate(addDays(date, -1))}>
            ‹
          </button>
          <label>
            <span>{date === today ? T.today : prettyDate(date, lang)}</span>
            <input type="date" value={date} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} />
          </label>
          <button type="button" aria-label="Next day" disabled={date >= today} onClick={() => setDate(addDays(date, 1))}>
            ›
          </button>
        </div>
        <form className="bh-search" onSubmit={find}>
          <span>#</span>
          <input value={q} onChange={(e) => setQ(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder={T.search} />
          <button type="submit">{T.find}</button>
        </form>
      </div>
      {err && <div className="bh-err">{err}</div>}
    </div>
  )
}

// ------------------------------------------------------------------ tiles
const ICONS = {
  farmer: 'M4 20h16M6 20V10l6-5 6 5v10M10 20v-5h4v5',
  buyer: 'M3 9l1.5-5h15L21 9M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zM5 13v8h14v-8',
  pending: 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  bills: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  transfer: 'M4 8h13l-3-3M20 16H7l3 3',
  export: 'M12 4v11m0 0l-4-4m4 4l4-4M5 20h14',
}

function Tiles({ T, data, onOpen }) {
  const pend = data?.pending_count || 0
  const unb = data?.unbilled_buyers || 0
  const tiles = [
    { k: 'farmer', title: T.farmerBill, sub: T.farmerBillSub, go: 'farmer' },
    { k: 'buyer', title: T.buyerBills, sub: unb > 0 ? T.buyersWaiting.replace('{n}', unb) : T.allBilled, badge: unb, go: 'buyer' },
    { k: 'pending', title: T.pending, sub: pend > 0 ? T.tokensWaiting.replace('{n}', pend) : T.allDone, badge: pend, go: 'pending' },
    { k: 'bills', title: T.bills, sub: T.billsSub, go: 'bills' },
    { k: 'transfer', title: T.transfer, sub: T.transferSub, go: 'transfer' },
    { k: 'export', title: T.export, sub: T.exportSub, go: 'export' },
  ]
  return (
    <div className="bh-tiles">
      {tiles.map((t) => (
        <button
          key={t.k}
          type="button"
          className={'bh-tile bh-tile-' + t.k + (t.soon ? ' soon' : '')}
          disabled={t.soon}
          onClick={() => t.go && onOpen(t.go)}
        >
          <span className="bh-tile-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={ICONS[t.k]} />
            </svg>
            {t.badge > 0 && <b>{t.badge}</b>}
          </span>
          <span className="bh-tile-title">{t.title}</span>
          <span className="bh-tile-sub">{t.soon ? T.soon : t.sub}</span>
        </button>
      ))}
    </div>
  )
}

// ------------------------------------------------------------------ sales
function Sales({ T, lang, data, date, setDate }) {
  const s = useMemo(() => buildSales(data, date), [data, date])
  const max = Math.max(0, ...s.days.map((d) => d.amount))
  const up = (s.change ?? 0) >= 0

  return (
    <div className="bp-card bh-sales">
      <div className="bh-hero">
        <div className="bh-hero-top">
          <span>{T.totalSale}</span>
          <span className="bh-pill">{prettyDate(date, lang)}</span>
        </div>
        <div className="bh-hero-amt">{inr(s.sale)}</div>
        <div className={'bh-hero-change ' + (s.change == null ? '' : up ? 'up' : 'down')}>
          {s.change != null ? `${up ? '▲ +' : '▼ '}${s.change.toFixed(1)}% ${T.vsPrev}` : s.sale > 0 ? T.noPrev : T.noSale}
        </div>
        {(s.outAmt > 0 || s.inAmt > 0) && (
          <div className="bh-chips">
            {s.outAmt > 0 && <span>↗ {T.out} −{compact(s.outAmt)}</span>}
            {s.inAmt > 0 && <span>↙ {T.in} +{compact(s.inAmt)}</span>}
          </div>
        )}
      </div>

      <div className="bh-kpis">
        <Kpi label={T.qty} value={`${qtl(s.qty)} ${T.qtl}`} />
        <Kpi label={T.tokens} value={s.tokens} />
        <Kpi label={T.farmers} value={s.farmers} />
        <Kpi label={T.netPaid} value={compact(s.net) || '₹0'} />
      </div>

      <div className="bh-section">
        {T.last7} <span>· {T.last7Sub}</span>
      </div>
      <div className="bh-chart">
        {s.days.map((d) => {
          const sel = d.date === date
          const h = d.amount > 0 && max > 0 ? Math.max(4, (d.amount / max) * 120) : 3
          const wd = (parseYmd(d.date).getDay() + 6) % 7
          return (
            <button key={d.date} type="button" className={'bh-bar' + (sel ? ' sel' : '')} onClick={() => !sel && setDate(d.date)}>
              <span className="bh-bar-val">{compact(d.amount)}</span>
              <span className="bh-bar-fill" style={{ height: h }} />
              <span className="bh-bar-day">{T.days[wd]}</span>
              <span className="bh-bar-num">{parseYmd(d.date).getDate()}</span>
            </button>
          )
        })}
      </div>

      <div className="bh-section">{T.byCommodity}</div>
      {s.commodities.length === 0 ? (
        <div className="bp-empty">{T.noSaleDay}</div>
      ) : (
        <>
          <div className="bh-share">
            {s.commodities.map((c, i) => (
              <span key={c.name} style={{ flex: Math.max(1, Math.round((c.amount / s.sale) * 1000)), background: PALETTE[i % PALETTE.length] }} />
            ))}
          </div>
          {s.commodities.map((c, i) => (
            <div key={c.name} className="bh-comm">
              <i style={{ background: PALETTE[i % PALETTE.length] }} />
              <div className="bh-comm-main">
                <b>{c.name}</b>
                <span>
                  {qtl(c.qty)} {T.qtl} · {c.tokens} {T.tokens}
                </span>
              </div>
              <div className="bh-comm-amt">
                <b>{inr(c.amount)}</b>
                <span style={{ color: PALETTE[i % PALETTE.length] }}>{s.sale > 0 ? ((c.amount / s.sale) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

function Kpi({ label, value }) {
  return (
    <div className="bh-kpi">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  )
}

// ------------------------------------------------------------------ commodity summary
function Summary({ T, tokens, onOpen }) {
  const rows = useMemo(() => {
    const map = new Map()
    for (const t of tokens) {
      const r = map.get(t.commodity_name) || { name: t.commodity_name, count: 0, est: 0, real: 0 }
      r.count += 1
      r.est += num(t.estimated_quantity)
      r.real += num(t.real_quintal)
      map.set(t.commodity_name, r)
    }
    return [...map.values()]
  }, [tokens])

  return (
    <div className="bp-card bh-summary">
      <div className="bh-section">{T.summary}</div>
      {rows.length === 0 ? (
        <div className="bp-empty">{T.noTokens}</div>
      ) : (
        <div className="bh-table">
          <div className="bh-tr bh-th">
            <span>{T.commodity}</span>
            <span>{T.est}</span>
            <span>{T.real}</span>
          </div>
          {rows.map((r) => (
            <button key={r.name} type="button" className="bh-tr" onClick={() => onOpen(r.name)}>
              <span>
                <b>{r.name}</b>
                <small>
                  {r.count} {T.tokens}
                </small>
              </span>
              <span>{r.est.toFixed(1)}</span>
              <span className="bh-real">{r.real.toFixed(1)} ›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function CommodityTokens({ T, name, tokens, onBack, onOpen }) {
  return (
    <div className="bp-card">
      <div className="bp-top">
        <div>
          <div className="bp-muted">{T.commodity}</div>
          <h1 className="bp-name">{name}</h1>
        </div>
        <button type="button" className="bp-btn bp-btn-outline" onClick={onBack}>
          {T.backHome}
        </button>
      </div>
      <div className="bp-list">
        {tokens.map((t) => (
          <button key={t.id} type="button" className="bp-row" onClick={() => onOpen(t)}>
            <div className="bp-row-main">
              <div className="bp-row-no">
                #{t.token_number} — {t.farmer_name}
              </div>
              <div className="bp-muted bp-small">
                {t.buyer_name ? `${T.buyer}: ${t.buyer_name} · ${T.rate}: ${inr(t.rate_per_quintal)}` : T.auctionPending}
              </div>
              <div className="bp-muted bp-small">
                {T.est}: {qtl(t.estimated_quantity)} {T.qtl} · {T.real}: {t.real_quintal != null ? `${qtl(t.real_quintal)} ${T.qtl}` : '-'}
              </div>
            </div>
            <div className="bp-row-amt">›</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ token details
function TokenDetail({ T, lang, acc, number, date, onBack, onExpired }) {
  const [d, setD] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let alive = true
    fetchBrokerToken(acc.token, number, date)
      .then((r) => {
        if (!alive) return
        if (!r?.ok) setMsg(T.notFound)
        else setD(r)
      })
      .catch((e) => {
        if (!alive) return
        if (e.message === 'SESSION_EXPIRED') onExpired()
        else setMsg(T.load)
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acc.token, number, date])

  const row = (label, value) => (
    <div className="bh-info" key={label}>
      <span>{label}</span>
      <b>{value ?? '-'}</b>
    </div>
  )

  let body = <div className="bp-empty">{T.wait}</div>
  if (msg) body = <div className="bp-error">{msg}</div>
  else if (d) {
    const t = d.token
    const a = d.auction
    const w = d.weight
    const p = d.patti
    const split = p && num(p.utrai_amount) + num(p.mapai_amount) + num(p.hamali_amount)
    body = (
      <>
        <span className="bh-viewonly">🔒 {T.viewOnly}</span>
        <div className="bh-block entry">
          <h3>{T.entry}</h3>
          {row(T.farmer, t.farmer_name)}
          {row(T.phone, t.farmer_phone_number)}
          {row(T.commodity, t.commodity_name)}
          {row(T.estQty, `${qtl(t.estimated_quantity)} ${T.qtl}`)}
          {row(T.vehicle, t.vehicle_number)}
          {row(T.entryBy, t.created_by_name)}
        </div>
        {a ? (
          <div className="bh-block auction">
            <h3>{T.auction}</h3>
            {row(T.buyer, a.buyer_name)}
            {row(T.rate, inr(a.rate_per_quintal))}
            {row(T.mark, a.quality_mark)}
          </div>
        ) : (
          <div className="bh-note">{T.auctionPending}</div>
        )}
        {w ? (
          <div className="bh-block weight">
            <h3>{T.weight}</h3>
            {row(T.mapari, w.mapari_name)}
            {row(T.bags, w.number_of_bags)}
            {row(T.bagWt, w.bag_weight_kg != null ? `${w.bag_weight_kg} kg` : '-')}
            {row(T.chungad, w.chungad_weight_kg != null ? `${w.chungad_weight_kg} kg` : '-')}
            {row(T.totalWt, `${w.total_weight_kg ?? '-'} kg (${qtl(w.total_weight_quintal)} ${T.qtl})`)}
            {row(T.labour, w.labour_name)}
          </div>
        ) : (
          <div className="bh-note">{T.weighPending}</div>
        )}
        {p ? (
          <div className="bh-block patti">
            <h3>{T.patti}</h3>
            {row(T.gross, inr(p.gross_amount))}
            {!p.charge_type && num(p.mandi_charge_amount) > 0 && !split
              ? row(T.mandiCharge, inr(p.mandi_charge_amount))
              : [row(T.utrai, inr(p.utrai_amount)), row(T.mapai, inr(p.mapai_amount)), row(T.hamali, inr(p.hamali_amount))]}
            <div className="bh-info total">
              <span>{T.net}</span>
              <b>{inr(p.net_payable_amount)}</b>
            </div>
          </div>
        ) : (
          w && <div className="bh-note">{T.pattiPending}</div>
        )}
      </>
    )
  }

  return (
    <div className="bp-card">
      <div className="bp-top">
        <div>
          <div className="bp-muted">{prettyDate(date, lang)}</div>
          <h1 className="bp-name">
            {T.token} #{number}
          </h1>
        </div>
        <button type="button" className="bp-btn bp-btn-outline" onClick={onBack}>
          ←
        </button>
      </div>
      {body}
    </div>
  )
}
