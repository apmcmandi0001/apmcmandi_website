import { useEffect, useMemo, useState } from 'react'
import { inr, prettyDate } from '../data'
import { fetchBuyerDashboard, fetchBuyerToken } from '../trader/traderApi'
import ExportBills from './ExportBills'
import './BrokerPortal.css'
import './BrokerHome.css'
import './FarmerBill.css'

// =============================================================================
// Buyer Dashboard on the website — same as the app's Buyer Dashboard:
//   period (today / 7 days / 30 days / custom) · token search · tiles
//   (bills from brokers, not billed yet, CESS, export) · KPIs · daily trend ·
//   commodity report (my rate vs mandi rate) · brokers (drill-down) ·
//   mandi market rates · recent purchases
// renderBills(tab, back) shows the bills screens (they live in TraderPortal).
// =============================================================================

const TEXT = {
  en: {
    title: 'Buyer Dashboard',
    back: '← My Accounts',
    backHome: '← Dashboard',
    today: 'Today',
    d7: '7 days',
    d30: '30 days',
    custom: 'Custom',
    from: 'From',
    to: 'To',
    search: 'Token No.',
    find: 'Find',
    badToken: 'Enter a valid token number',
    notFound: 'You did not buy this token on this date',
    bills: 'Bills from brokers',
    billsSub: 'See and print',
    unbilled: 'Not billed yet',
    unbilledSub: '{n} lots waiting',
    allBilled: 'All billed',
    cess: 'CESS bills',
    cessSub: 'Paid / unpaid',
    export: 'Export',
    exportSub: 'Excel / PDF',
    purchase: 'Purchase value',
    lots: 'lots',
    qty: 'Quantity weighed',
    est: 'Est.',
    avg: 'Average rate',
    avgSub: 'weighted by quantity',
    sources: 'Sources',
    brokers: 'brokers',
    farmers: 'farmers',
    billedIn: 'Bills received in this period',
    notBilled: 'Goods not billed yet (all time)',
    trend: 'Daily purchases',
    trendSub: 'tap a bar to see that day',
    mix: 'Commodity mix',
    report: 'Commodity report',
    commodity: 'Commodity',
    myRate: 'My avg',
    mandiRate: 'Mandi avg',
    diff: 'vs mandi',
    amount: 'Amount',
    pendingNote: '⏳ = auctioned but not weighed yet (not counted in quantity / amount)',
    brokerList: 'Brokers',
    market: 'Mandi market (all buyers)',
    min: 'Min',
    max: 'Max',
    noMarket: 'No auctions in this period',
    recent: 'Recent purchases',
    viewAll: 'View all',
    none: 'No purchases in this period',
    transferred: 'Transferred',
    notWeighed: 'Not weighed',
    qtl: 'qtl',
    bags: 'bags',
    rate: 'Rate',
    mark: 'Mark',
    farmer: 'Farmer',
    broker: 'Broker',
    vehicle: 'Vehicle',
    weight: 'Weight',
    billedYes: 'On a broker bill',
    billedNo: 'Not billed yet',
    purchases: 'Purchases',
    wait: 'Please wait…',
    expired: 'Your login expired. Please open the account again',
    load: 'Could not load. Please try again',
    token: 'Token',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  hi: {
    title: 'खरीदार डैशबोर्ड',
    back: '← मेरे खाते',
    backHome: '← डैशबोर्ड',
    today: 'आज',
    d7: '7 दिन',
    d30: '30 दिन',
    custom: 'अपनी तारीख',
    from: 'से',
    to: 'तक',
    search: 'टोकन नं.',
    find: 'खोजें',
    badToken: 'सही टोकन नंबर डालें',
    notFound: 'इस तारीख में आपने यह टोकन नहीं खरीदा',
    bills: 'दलालों के बिल',
    billsSub: 'देखें और प्रिंट करें',
    unbilled: 'बिल बाकी',
    unbilledSub: '{n} लॉट बाकी',
    allBilled: 'सब बिल बने',
    cess: 'सेस बिल',
    cessSub: 'भुगतान / बाकी',
    export: 'एक्सपोर्ट',
    exportSub: 'Excel / PDF',
    purchase: 'कुल खरीद',
    lots: 'लॉट',
    qty: 'तौला गया वजन',
    est: 'अनुमानित',
    avg: 'औसत भाव',
    avgSub: 'वजन के अनुसार',
    sources: 'स्रोत',
    brokers: 'दलाल',
    farmers: 'किसान',
    billedIn: 'इस अवधि में मिले बिल',
    notBilled: 'बिल बाकी माल (सब समय)',
    trend: 'रोज़ की खरीद',
    trendSub: 'उस दिन के लिए बार पर टैप करें',
    mix: 'फसल अनुसार हिस्सा',
    report: 'फसल रिपोर्ट',
    commodity: 'फसल',
    myRate: 'मेरा औसत',
    mandiRate: 'मंडी औसत',
    diff: 'मंडी से',
    amount: 'रकम',
    pendingNote: '⏳ = लिलाव हुआ पर तौल बाकी (वजन / रकम में नहीं गिना)',
    brokerList: 'दलाल',
    market: 'मंडी बाज़ार (सभी खरीदार)',
    min: 'कम',
    max: 'ज़्यादा',
    noMarket: 'इस अवधि में कोई लिलाव नहीं',
    recent: 'हाल की खरीद',
    viewAll: 'सब देखें',
    none: 'इस अवधि में कोई खरीद नहीं',
    transferred: 'ट्रांसफर',
    notWeighed: 'तौल बाकी',
    qtl: 'क्विंटल',
    bags: 'बोरी',
    rate: 'भाव',
    mark: 'मार्क',
    farmer: 'किसान',
    broker: 'दलाल',
    vehicle: 'गाड़ी',
    weight: 'वजन',
    billedYes: 'दलाल के बिल में है',
    billedNo: 'बिल अभी बाकी',
    purchases: 'खरीद',
    wait: 'कृपया रुकें…',
    expired: 'लॉगिन समय खत्म। खाता फिर से खोलें',
    load: 'नहीं खुला। फिर से कोशिश करें',
    token: 'टोकन',
    days: ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'],
  },
  mr: {
    title: 'खरेदीदार डॅशबोर्ड',
    back: '← माझी खाती',
    backHome: '← डॅशबोर्ड',
    today: 'आज',
    d7: '7 दिवस',
    d30: '30 दिवस',
    custom: 'स्वतःची तारीख',
    from: 'पासून',
    to: 'पर्यंत',
    search: 'टोकन नं.',
    find: 'शोधा',
    badToken: 'योग्य टोकन नंबर टाका',
    notFound: 'या तारखेला तुम्ही हा टोकन खरेदी केला नाही',
    bills: 'अडत्यांची बिले',
    billsSub: 'पहा आणि प्रिंट करा',
    unbilled: 'बिल बाकी',
    unbilledSub: '{n} लॉट बाकी',
    allBilled: 'सर्व बिल झाले',
    cess: 'सेस बिल',
    cessSub: 'भरले / बाकी',
    export: 'एक्सपोर्ट',
    exportSub: 'Excel / PDF',
    purchase: 'एकूण खरेदी',
    lots: 'लॉट',
    qty: 'तोललेले वजन',
    est: 'अंदाजे',
    avg: 'सरासरी भाव',
    avgSub: 'वजनानुसार',
    sources: 'स्रोत',
    brokers: 'अडत्या',
    farmers: 'शेतकरी',
    billedIn: 'या कालावधीत आलेली बिले',
    notBilled: 'बिल बाकी माल (सर्व काळ)',
    trend: 'दररोजची खरेदी',
    trendSub: 'त्या दिवसासाठी बारवर टॅप करा',
    mix: 'पिकानुसार वाटा',
    report: 'पीक अहवाल',
    commodity: 'पीक',
    myRate: 'माझी सरासरी',
    mandiRate: 'मंडी सरासरी',
    diff: 'मंडीपेक्षा',
    amount: 'रक्कम',
    pendingNote: '⏳ = लिलाव झाला पण तोल बाकी (वजन / रकमेत मोजले नाही)',
    brokerList: 'अडत्या',
    market: 'मंडी बाजार (सर्व खरेदीदार)',
    min: 'कमी',
    max: 'जास्त',
    noMarket: 'या कालावधीत लिलाव नाही',
    recent: 'अलीकडील खरेदी',
    viewAll: 'सर्व पहा',
    none: 'या कालावधीत खरेदी नाही',
    transferred: 'ट्रान्सफर',
    notWeighed: 'तोल बाकी',
    qtl: 'क्विंटल',
    bags: 'पोती',
    rate: 'भाव',
    mark: 'मार्क',
    farmer: 'शेतकरी',
    broker: 'अडत्या',
    vehicle: 'गाडी',
    weight: 'वजन',
    billedYes: 'अडत्याच्या बिलात आहे',
    billedNo: 'बिल अजून बाकी',
    purchases: 'खरेदी',
    wait: 'कृपया थांबा…',
    expired: 'लॉगिनची वेळ संपली. खाते पुन्हा उघडा',
    load: 'उघडले नाही. पुन्हा प्रयत्न करा',
    token: 'टोकन',
    days: ['सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'],
  },
}

// ------------------------------------------------------------------ helpers
const pad = (v) => String(v).padStart(2, '0')
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parse = (s) => {
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}
const addDays = (s, n) => {
  const d = parse(s)
  d.setDate(d.getDate() + n)
  return ymd(d)
}
const num = (v) => Number(v) || 0
const qtl = (v) => num(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })
const compact = (v) => {
  if (v >= 10000000) return '₹' + (v / 10000000).toFixed(1) + 'Cr'
  if (v >= 100000) return '₹' + (v / 100000).toFixed(1) + 'L'
  if (v >= 1000) return '₹' + Math.round(v / 1000) + 'K'
  if (v <= 0) return ''
  return '₹' + Math.round(v)
}
const PALETTE = ['#0e7490', '#c9852b', '#6a4c93', '#38bdf8', '#b5523b', '#4f6d7a']
const initial = (s) => (String(s || '?').trim().charAt(0) || '?').toUpperCase()

/** totals of a list of lots (only weighed lots count in qty / amount) */
function agg(list) {
  const a = { lots: 0, pending: 0, qty: 0, est: 0, amount: 0 }
  for (const l of list) {
    a.lots += 1
    a.est += num(l.estimated_quantity)
    if (num(l.actual_quintal) > 0) {
      a.qty += num(l.actual_quintal)
      a.amount += num(l.actual_quintal) * num(l.rate_per_quintal)
    } else a.pending += 1
  }
  a.avg = a.qty > 0 ? a.amount / a.qty : 0
  return a
}
function groupBy(list, key) {
  const m = new Map()
  for (const l of list) {
    const k = key(l)
    if (!m.has(k)) m.set(k, [])
    m.get(k).push(l)
  }
  return m
}

// ================================================================== page
export default function BuyerHome({ lang, acc, onBack, backLabel, renderBills }) {
  const T = TEXT[lang] || TEXT.en
  const today = ymd(new Date())
  const [period, setPeriod] = useState('today')
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [reload, setReload] = useState(0)
  const [view, setView] = useState({ name: 'home' })

  function expired() {
    alert(T.expired)
    onBack()
  }

  useEffect(() => {
    let alive = true
    setLoading(true)
    setMsg('')
    fetchBuyerDashboard(acc.token, from, to)
      .then((d) => {
        if (!alive) return
        if (d?.ok) setData(d)
        else setMsg(T.load)
      })
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
  }, [acc.token, from, to, reload])

  function choose(p) {
    setPeriod(p)
    if (p === 'custom') return
    setTo(today)
    setFrom(p === 'today' ? today : addDays(today, p === 'd7' ? -6 : -29))
  }
  const home = () => {
    setView({ name: 'home' })
    setReload((n) => n + 1)
  }

  // ---- sub screens
  if (['bills', 'unbilled', 'cess'].includes(view.name)) return renderBills(view.name, home)
  if (view.name === 'export') return <ExportBills buyer lang={lang} acc={acc} onBack={home} onExpired={expired} />
  if (view.name === 'token')
    return <LotDetail T={T} lang={lang} acc={acc} number={view.number} date={view.date} onBack={() => setView(view.from || { name: 'home' })} onExpired={expired} />
  if (view.name === 'lots')
    return (
      <LotList
        T={T}
        lang={lang}
        title={view.title}
        lots={view.lots}
        onBack={() => setView({ name: 'home' })}
        onOpen={(l) => setView({ name: 'token', number: l.token_number, date: l.token_date, from: view })}
      />
    )

  const allLots = data?.lots || []
  const lots = allLots.filter((l) => l.token_date >= from && l.token_date <= to)

  return (
    <div className="bh">
      <div className="bh-head by-head">
        <div className="bh-head-top">
          <div>
            <div className="bh-kicker">{T.title}</div>
            <h1>{data?.me || acc.name}</h1>
            <div className="bh-sub">{acc.mandi_name}</div>
          </div>
          <button type="button" className="bh-ghost" onClick={onBack}>
            {backLabel || T.back}
          </button>
        </div>
        <div className="by-periods">
          {['today', 'd7', 'd30', 'custom'].map((p) => (
            <button key={p} type="button" className={period === p ? 'on' : ''} onClick={() => choose(p)}>
              {T[p]}
            </button>
          ))}
        </div>
        {period === 'custom' && (
          <div className="bh-tools">
            <label className="by-date">
              <span>{T.from}</span>
              <input type="date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} />
            </label>
            <label className="by-date">
              <span>{T.to}</span>
              <input type="date" value={to} min={from} max={today} onChange={(e) => e.target.value && setTo(e.target.value)} />
            </label>
          </div>
        )}
        <TokenSearch T={T} defaultDate={to} onFind={(number, date) => setView({ name: 'token', number, date })} />
      </div>

      {msg && <div className="bp-error">{msg}</div>}

      <div className="bh-tiles by-tiles">
        {[
          { k: 'bills', icon: '🧾', title: T.bills, sub: T.billsSub },
          {
            k: 'unbilled',
            icon: '⏳',
            title: T.unbilled,
            sub: num(data?.unbilled?.count) > 0 ? T.unbilledSub.replace('{n}', data.unbilled.count) : T.allBilled,
            badge: num(data?.unbilled?.count),
          },
          { k: 'cess', icon: '🏛', title: T.cess, sub: T.cessSub },
          { k: 'export', icon: '⬇', title: T.export, sub: T.exportSub },
        ].map((t) => (
          <button key={t.k} type="button" className={'bh-tile by-tile-' + t.k} onClick={() => setView({ name: t.k })}>
            <span className="bh-tile-icon by-emoji">
              {t.icon}
              {t.badge > 0 && <b>{t.badge}</b>}
            </span>
            <span className="bh-tile-title">{t.title}</span>
            <span className="bh-tile-sub">{t.sub}</span>
          </button>
        ))}
      </div>

      {loading && !data ? (
        <div className="bp-card bp-empty">{T.wait}</div>
      ) : data ? (
        <Body T={T} lang={lang} data={data} lots={lots} allLots={allLots} from={from} to={to} setView={setView} pickDay={(d) => {
          setPeriod('custom')
          setFrom(d)
          setTo(d)
        }} />
      ) : null}
    </div>
  )
}

// ------------------------------------------------------------------ token search
function TokenSearch({ T, defaultDate, onFind }) {
  const [q, setQ] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [err, setErr] = useState('')
  useEffect(() => setDate(defaultDate), [defaultDate])
  return (
    <>
      <form
        className="bh-tools by-search"
        onSubmit={(e) => {
          e.preventDefault()
          const n = parseInt(q, 10)
          if (!n || n < 1) return setErr(T.badToken)
          setErr('')
          onFind(n, date)
        }}
      >
        <div className="by-date-box">
          <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </div>
        <div className="bh-search">
          <span>#</span>
          <input value={q} onChange={(e) => setQ(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder={T.search} />
          <button type="submit">{T.find}</button>
        </div>
      </form>
      {err && <div className="bh-err">{err}</div>}
    </>
  )
}

// ------------------------------------------------------------------ dashboard body
function Body({ T, lang, data, lots, allLots, from, to, setView, pickDay }) {
  const total = useMemo(() => agg(lots), [lots])
  const brokerCount = new Set(lots.map((l) => l.broker_id)).size
  const farmerCount = new Set(lots.map((l) => String(l.farmer_name || '').trim().toLowerCase())).size

  // daily trend (data window, max 31 bars)
  const days = useMemo(() => {
    const start = data.data_from > addDays(to, -30) ? data.data_from : addDays(to, -30)
    const out = []
    for (let d = start; d <= to; d = addDays(d, 1)) out.push({ date: d, amount: 0 })
    const by = Object.fromEntries(out.map((x) => [x.date, x]))
    for (const l of allLots) if (by[l.token_date]) by[l.token_date].amount += num(l.actual_quintal) * num(l.rate_per_quintal)
    return out
  }, [allLots, data.data_from, to])
  const max = Math.max(0, ...days.map((d) => d.amount))

  const byComm = useMemo(() => [...groupBy(lots, (l) => l.commodity_name)].map(([k, v]) => ({ name: k, a: agg(v), lots: v })).sort((x, y) => y.a.amount - x.a.amount), [lots])
  const byBroker = useMemo(
    () => [...groupBy(lots, (l) => l.broker_id)].map(([k, v]) => ({ id: k, name: v[0].broker_name, a: agg(v), lots: v, comms: [...new Set(v.map((l) => l.commodity_name))] })).sort((x, y) => y.a.amount - x.a.amount),
    [lots],
  )
  const market = Object.fromEntries((data.market || []).map((m) => [m.commodity_name, m]))
  const recent = lots.slice(0, 8)

  if (lots.length === 0) {
    return (
      <>
        <Money T={T} data={data} />
        <div className="bp-card bp-empty">{T.none}</div>
        <Market T={T} data={data} />
      </>
    )
  }

  return (
    <>
      <div className="bp-card bh-sales">
        <div className="bh-hero">
          <div className="bh-hero-top">
            <span>{T.purchase}</span>
            <span className="bh-pill">{from === to ? prettyDate(from, lang) : `${prettyDate(from, lang)} – ${prettyDate(to, lang)}`}</span>
          </div>
          <div className="bh-hero-amt">{inr(total.amount)}</div>
          <div className="bh-hero-change">
            {total.lots} {T.lots}
            {total.pending > 0 ? ` · ⏳ ${total.pending}` : ''}
          </div>
        </div>
        <div className="bh-kpis">
          <div className="bh-kpi">
            <b>
              {qtl(total.qty)} {T.qtl}
            </b>
            <span>
              {T.qty} · {T.est} {qtl(total.est)}
            </span>
          </div>
          <div className="bh-kpi">
            <b>{inr(total.avg)}/q</b>
            <span>
              {T.avg} · {T.avgSub}
            </span>
          </div>
          <div className="bh-kpi">
            <b>{brokerCount}</b>
            <span>{T.brokers}</span>
          </div>
          <div className="bh-kpi">
            <b>{farmerCount}</b>
            <span>{T.farmers}</span>
          </div>
        </div>

        <div className="bh-section">
          {T.trend} <span>· {T.trendSub}</span>
        </div>
        <div className="bh-chart">
          {days.map((d) => {
            const sel = d.date >= from && d.date <= to
            const h = d.amount > 0 && max > 0 ? Math.max(4, (d.amount / max) * 120) : 3
            const wd = (parse(d.date).getDay() + 6) % 7
            return (
              <button key={d.date} type="button" className={'bh-bar' + (sel ? ' sel' : '')} onClick={() => pickDay(d.date)}>
                <span className="bh-bar-val">{days.length <= 10 ? compact(d.amount) : ''}</span>
                <span className="bh-bar-fill" style={{ height: h }} />
                {days.length <= 10 && <span className="bh-bar-day">{T.days[wd]}</span>}
                <span className="bh-bar-num">{parse(d.date).getDate()}</span>
              </button>
            )
          })}
        </div>

        <div className="bh-section">{T.mix}</div>
        <div className="bh-share">
          {byComm.map((c, i) => (
            <span key={c.name} style={{ flex: Math.max(1, Math.round((c.a.amount / (total.amount || 1)) * 1000)), background: PALETTE[i % PALETTE.length] }} />
          ))}
        </div>
        {byComm.map((c, i) => (
          <div key={c.name} className="bh-comm">
            <i style={{ background: PALETTE[i % PALETTE.length] }} />
            <div className="bh-comm-main">
              <b>{c.name}</b>
              <span>
                {qtl(c.a.qty)} {T.qtl} · {c.a.lots} {T.lots}
              </span>
            </div>
            <div className="bh-comm-amt">
              <b>{inr(c.a.amount)}</b>
              <span style={{ color: PALETTE[i % PALETTE.length] }}>{total.amount > 0 ? ((c.a.amount / total.amount) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>
        ))}
      </div>

      <Money T={T} data={data} />

      {/* commodity report: my rate vs mandi rate */}
      <div className="bp-card bh-summary">
        <div className="bh-section">{T.report}</div>
        <div className="bh-table">
          <div className="bh-tr bh-th by-tr">
            <span>{T.commodity}</span>
            <span>{T.amount}</span>
            <span>{T.myRate}</span>
            <span>{T.mandiRate}</span>
            <span>{T.diff}</span>
          </div>
          {byComm.map((c) => {
            const m = market[c.name]
            const diff = m && num(m.avg_rate) > 0 && c.a.avg > 0 ? ((c.a.avg - num(m.avg_rate)) / num(m.avg_rate)) * 100 : null
            return (
              <button key={c.name} type="button" className="bh-tr by-tr" onClick={() => setView({ name: 'lots', title: c.name, lots: c.lots })}>
                <span>
                  <b>{c.name}</b>
                  <small>
                    {c.a.lots} {T.lots}
                    {c.a.pending ? ` · ⏳ ${c.a.pending}` : ''} · {qtl(c.a.qty)} {T.qtl}
                  </small>
                </span>
                <span>{inr(c.a.amount)}</span>
                <span>{c.a.avg > 0 ? inr(c.a.avg) : '-'}</span>
                <span>{m ? inr(num(m.avg_rate)) : '-'}</span>
                <span className={diff == null ? '' : diff <= 0 ? 'by-good' : 'by-bad'}>{diff == null ? '-' : `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`}</span>
              </button>
            )
          })}
        </div>
        <div className="bp-muted bp-small by-note">{T.pendingNote}</div>
      </div>

      {/* brokers */}
      <div className="bp-card bh-summary">
        <div className="bh-section">{T.brokerList}</div>
        <div className="bp-list">
          {byBroker.map((b) => (
            <button key={b.id} type="button" className="bp-row pb-farmer" onClick={() => setView({ name: 'lots', title: b.name, lots: b.lots })}>
              <span className="tp-avatar by-av">{initial(b.name)}</span>
              <div className="bp-row-main">
                <div className="bp-row-who">{b.name}</div>
                <div className="bp-muted bp-small">
                  {b.a.lots} {T.lots} · {qtl(b.a.qty)} {T.qtl} · {b.comms.join(', ')}
                </div>
              </div>
              <div className="bp-row-amt">
                {inr(b.a.amount)}
                <div className="bp-muted bp-small">{total.amount > 0 ? ((b.a.amount / total.amount) * 100).toFixed(1) : 0}%</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Market T={T} data={data} />

      {/* recent purchases */}
      <div className="bp-card bh-summary">
        <div className="bh-section by-sec-row">
          {T.recent}
          {lots.length > recent.length && (
            <button type="button" className="tp-link" onClick={() => setView({ name: 'lots', title: T.purchases, lots })}>
              {T.viewAll} ({lots.length})
            </button>
          )}
        </div>
        <LotRows T={T} lang={lang} lots={recent} onOpen={(l) => setView({ name: 'token', number: l.token_number, date: l.token_date })} />
      </div>
    </>
  )
}

function Money({ T, data }) {
  return (
    <div className="by-money">
      <div>
        <span>{T.billedIn}</span>
        <b>{inr(data.billed?.amount)}</b>
        <small>{num(data.billed?.count)} 🧾</small>
      </div>
      <div className={num(data.unbilled?.count) > 0 ? 'warn' : ''}>
        <span>{T.notBilled}</span>
        <b>{inr(data.unbilled?.amount)}</b>
        <small>
          {num(data.unbilled?.count)} {T.lots}
        </small>
      </div>
    </div>
  )
}

function Market({ T, data }) {
  const rows = data.market || []
  return (
    <div className="bp-card bh-summary">
      <div className="bh-section">{T.market}</div>
      {rows.length === 0 ? (
        <div className="bp-empty">{T.noMarket}</div>
      ) : (
        <div className="bh-table">
          <div className="bh-tr bh-th by-tr">
            <span>{T.commodity}</span>
            <span>{T.lots}</span>
            <span>{T.min}</span>
            <span>{T.mandiRate}</span>
            <span>{T.max}</span>
          </div>
          {rows.map((m) => (
            <div key={m.commodity_name} className="bh-tr by-tr by-static">
              <span>
                <b>{m.commodity_name}</b>
                <small>
                  {T.est} {qtl(m.est)} {T.qtl}
                </small>
              </span>
              <span>{m.lots}</span>
              <span>{inr(m.min_rate)}</span>
              <span>
                <b>{inr(Math.round(num(m.avg_rate)))}</b>
              </span>
              <span>{inr(m.max_rate)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LotRows({ T, lang, lots, onOpen }) {
  return (
    <div className="bp-list">
      {lots.map((l) => {
        const weighed = num(l.actual_quintal) > 0
        return (
          <button key={l.token_id} type="button" className="bp-row" onClick={() => onOpen(l)}>
            <div className="bp-row-main">
              <div className="bp-row-no">
                #{l.token_number} — {l.commodity_name}
                {l.transferred && <span className="bp-tag">{T.transferred}</span>}
              </div>
              <div className="bp-muted bp-small">
                {prettyDate(l.token_date, lang)} · {l.farmer_name || '-'} · {T.broker}: {l.broker_name}
              </div>
              <div className="bp-muted bp-small">
                {weighed ? `${qtl(l.actual_quintal)} ${T.qtl}` : `⏳ ${T.notWeighed} (${T.est} ${qtl(l.estimated_quantity)})`} × {inr(l.rate_per_quintal)}
                {l.quality_mark ? ` · ${T.mark} ${l.quality_mark}` : ''}
              </div>
            </div>
            <div className="bp-row-amt">{weighed ? inr(num(l.actual_quintal) * num(l.rate_per_quintal)) : '⏳'}</div>
          </button>
        )
      })}
    </div>
  )
}

function LotList({ T, lang, title, lots, onBack, onOpen }) {
  const a = agg(lots)
  return (
    <div className="bp-card">
      <div className="bp-top">
        <div>
          <div className="bp-muted">{T.purchases}</div>
          <h1 className="bp-name">{title}</h1>
          <div className="bp-muted bp-small">
            {a.lots} {T.lots} · {qtl(a.qty)} {T.qtl} · {inr(a.amount)} · {T.avg} {inr(a.avg)}
          </div>
        </div>
        <button type="button" className="bp-btn bp-btn-outline" onClick={onBack}>
          {T.backHome}
        </button>
      </div>
      <LotRows T={T} lang={lang} lots={lots} onOpen={onOpen} />
    </div>
  )
}

function LotDetail({ T, lang, acc, number, date, onBack, onExpired }) {
  const [d, setD] = useState(null)
  const [msg, setMsg] = useState('')
  useEffect(() => {
    let alive = true
    fetchBuyerToken(acc.token, number, date)
      .then((r) => alive && (r?.ok ? setD(r) : setMsg(T.notFound)))
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
      {msg ? (
        <div className="bp-error">{msg}</div>
      ) : !d ? (
        <div className="bp-empty">{T.wait}</div>
      ) : (
        <>
          <span className={'tp-status ' + (d.billed ? 'paid' : 'unpaid')}>{d.billed ? T.billedYes : T.billedNo}</span>
          <div className="bh-block entry" style={{ marginTop: 12 }}>
            {row(T.commodity, d.commodity_name)}
            {row(T.farmer, d.farmer_name)}
            {row(T.broker, d.broker_name)}
            {row(T.vehicle, d.vehicle_number)}
            {row(T.est, `${qtl(d.estimated_quantity)} ${T.qtl}`)}
          </div>
          <div className="bh-block auction">
            {row(T.rate, inr(d.rate_per_quintal))}
            {row(T.mark, d.quality_mark)}
          </div>
          {d.total_weight_quintal != null ? (
            <div className="bh-block weight">
              {row(T.bags, d.number_of_bags)}
              {row(T.weight, `${qtl(d.total_weight_quintal)} ${T.qtl}`)}
              <div className="bh-info total">
                <span>{T.amount}</span>
                <b>{inr(d.amount)}</b>
              </div>
            </div>
          ) : (
            <div className="bh-note">⏳ {T.notWeighed}</div>
          )}
        </>
      )}
    </div>
  )
}
