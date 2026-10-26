import { useEffect, useMemo, useState } from 'react'
import { useLang } from '../i18n'
import { fetchMandis, inr, prettyDate } from '../data'
import {
  getSession,
  getLastMandi,
  brokerLogin,
  brokerLogout,
  clearSession,
  fetchBrokerBills,
  fetchBrokerPending,
} from '../broker/brokerApi'
import './BrokerPortal.css'

// ---------------------------------------------------------------- text (3 languages)
export const BROKER_TEXT = {
  // (also used by the Trader page when a broker account is opened)

  en: {
    title: 'Broker Login',
    sub: 'Use the same Login ID and PIN as the mobile app',
    mandi: 'Mandi',
    chooseMandi: 'Select your mandi',
    searchMandi: 'Search city or mandi',
    loginId: 'Login ID',
    pin: '4-digit PIN',
    login: 'Login',
    wait: 'Please wait…',
    welcome: 'Welcome',
    logout: 'Logout',
    farmer: 'Farmer Bills',
    buyer: 'Buyer Bills',
    transfer: 'Transfer Bills',
    from: 'From',
    to: 'To',
    show: 'Show',
    none: 'No bills in these dates',
    billNo: 'Bill No.',
    date: 'Date',
    farmerName: 'Farmer',
    buyerName: 'Buyer',
    otherBroker: 'Broker',
    type: 'Type',
    sent: 'Sent',
    received: 'Received',
    quintal: 'Quintal',
    amount: 'Amount',
    net: 'Net payable',
    payment: 'Payment',
    lines: 'Lots',
    printSoon: 'Bill print opens in the next update',
    pending: 'Pending',
    pendFarmer: 'Pending Farmer Bills',
    pendBuyer: 'Pending Buyer Bills',
    searchName: 'Search name',
    noPending: 'Nothing pending',
    tokens: 'tokens',
    token: 'Token',
    bags: 'bags',
    gross: 'Gross',
    deduction: 'Deduction',
    noCharge: 'Charge not entered yet',
    transferred: 'Transferred',
    total: 'Total',
    generateSoon: 'Generate bill button comes in the next update',
    generate: 'Generate Bill',
    errors: {
      missing: 'Please fill mandi, Login ID and PIN',
      not_found: 'Login ID not found',
      other_mandi: 'This Login ID is not in the selected mandi',
      wrong_pin: 'Wrong PIN',
      locked: 'Too many wrong tries. Try again after {m} minutes',
      disabled: 'Your account is disabled. Contact the mandi office',
      mandi_disabled: 'This mandi is disabled. Contact the mandi office',
      duplicate_login_id: 'Login ID problem. Contact the mandi office',
      offline: 'Website is not connected to the server',
      server: 'Server error. Please try again',
      expired: 'Your login expired. Please login again',
      load: 'Could not load bills. Please try again',
    },
    triesLeft: '{n} tries left',
  },
  hi: {
    title: 'ब्रोकर लॉगिन',
    sub: 'ऐप वाला ही लॉगिन आईडी और पिन डालें',
    mandi: 'मंडी',
    chooseMandi: 'अपनी मंडी चुनें',
    searchMandi: 'शहर या मंडी खोजें',
    loginId: 'लॉगिन आईडी',
    pin: '4 अंकों का पिन',
    login: 'लॉगिन',
    wait: 'कृपया रुकें…',
    welcome: 'स्वागत है',
    logout: 'लॉगआउट',
    farmer: 'किसान बिल',
    buyer: 'खरीदार बिल',
    transfer: 'ट्रांसफर बिल',
    from: 'से',
    to: 'तक',
    show: 'दिखाएँ',
    none: 'इन तारीखों में कोई बिल नहीं',
    billNo: 'बिल नं.',
    date: 'तारीख',
    farmerName: 'किसान',
    buyerName: 'खरीदार',
    otherBroker: 'ब्रोकर',
    type: 'प्रकार',
    sent: 'भेजा',
    received: 'मिला',
    quintal: 'क्विंटल',
    amount: 'रकम',
    net: 'देय रकम',
    payment: 'भुगतान',
    lines: 'लॉट',
    printSoon: 'बिल प्रिंट अगले अपडेट में आएगा',
    pending: 'पेंडिंग',
    pendFarmer: 'पेंडिंग किसान बिल',
    pendBuyer: 'पेंडिंग खरीदार बिल',
    searchName: 'नाम खोजें',
    noPending: 'कुछ भी पेंडिंग नहीं',
    tokens: 'टोकन',
    token: 'टोकन',
    bags: 'बोरी',
    gross: 'कुल',
    deduction: 'कटौती',
    noCharge: 'चार्ज अभी नहीं डाला',
    transferred: 'ट्रांसफर',
    total: 'कुल',
    generateSoon: 'बिल बनाने का बटन अगले अपडेट में आएगा',
    generate: 'बिल बनाएं',
    errors: {
      missing: 'मंडी, लॉगिन आईडी और पिन भरें',
      not_found: 'लॉगिन आईडी नहीं मिली',
      other_mandi: 'यह लॉगिन आईडी चुनी गई मंडी में नहीं है',
      wrong_pin: 'गलत पिन',
      locked: 'बहुत बार गलत पिन। {m} मिनट बाद कोशिश करें',
      disabled: 'आपका खाता बंद है। मंडी ऑफिस से संपर्क करें',
      mandi_disabled: 'यह मंडी बंद है। मंडी ऑफिस से संपर्क करें',
      duplicate_login_id: 'लॉगिन आईडी में समस्या। मंडी ऑफिस से संपर्क करें',
      offline: 'वेबसाइट सर्वर से जुड़ी नहीं है',
      server: 'सर्वर त्रुटि। फिर से कोशिश करें',
      expired: 'लॉगिन समय खत्म। फिर से लॉगिन करें',
      load: 'बिल नहीं खुले। फिर से कोशिश करें',
    },
    triesLeft: '{n} कोशिश बाकी',
  },
  mr: {
    title: 'अडत्या लॉगिन',
    sub: 'ॲपमधीलच लॉगिन आयडी आणि पिन वापरा',
    mandi: 'मंडी',
    chooseMandi: 'तुमची मंडी निवडा',
    searchMandi: 'शहर किंवा मंडी शोधा',
    loginId: 'लॉगिन आयडी',
    pin: '४ अंकी पिन',
    login: 'लॉगिन',
    wait: 'कृपया थांबा…',
    welcome: 'स्वागत',
    logout: 'लॉगआउट',
    farmer: 'शेतकरी बिल',
    buyer: 'खरेदीदार बिल',
    transfer: 'ट्रान्सफर बिल',
    from: 'पासून',
    to: 'पर्यंत',
    show: 'दाखवा',
    none: 'या तारखांमध्ये बिल नाही',
    billNo: 'बिल नं.',
    date: 'तारीख',
    farmerName: 'शेतकरी',
    buyerName: 'खरेदीदार',
    otherBroker: 'अडत्या',
    type: 'प्रकार',
    sent: 'पाठवले',
    received: 'मिळाले',
    quintal: 'क्विंटल',
    amount: 'रक्कम',
    net: 'देय रक्कम',
    payment: 'पेमेंट',
    lines: 'लॉट',
    printSoon: 'बिल प्रिंट पुढील अपडेटमध्ये येईल',
    pending: 'पेंडिंग',
    pendFarmer: 'पेंडिंग शेतकरी बिल',
    pendBuyer: 'पेंडिंग खरेदीदार बिल',
    searchName: 'नाव शोधा',
    noPending: 'काहीही पेंडिंग नाही',
    tokens: 'टोकन',
    token: 'टोकन',
    bags: 'पोती',
    gross: 'एकूण',
    deduction: 'कपात',
    noCharge: 'चार्ज अजून टाकला नाही',
    transferred: 'ट्रान्सफर',
    total: 'एकूण',
    generateSoon: 'बिल बनवण्याचे बटण पुढील अपडेटमध्ये येईल',
    generate: 'बिल बनवा',
    errors: {
      missing: 'मंडी, लॉगिन आयडी आणि पिन भरा',
      not_found: 'लॉगिन आयडी सापडला नाही',
      other_mandi: 'हा लॉगिन आयडी निवडलेल्या मंडीत नाही',
      wrong_pin: 'चुकीचा पिन',
      locked: 'खूप वेळा चुकीचा पिन. {m} मिनिटांनी पुन्हा प्रयत्न करा',
      disabled: 'तुमचे खाते बंद आहे. मंडी ऑफिसशी संपर्क करा',
      mandi_disabled: 'ही मंडी बंद आहे. मंडी ऑफिसशी संपर्क करा',
      duplicate_login_id: 'लॉगिन आयडीमध्ये अडचण. मंडी ऑफिसशी संपर्क करा',
      offline: 'वेबसाइट सर्व्हरशी जोडलेली नाही',
      server: 'सर्व्हर त्रुटी. पुन्हा प्रयत्न करा',
      expired: 'लॉगिनची वेळ संपली. पुन्हा लॉगिन करा',
      load: 'बिल उघडले नाहीत. पुन्हा प्रयत्न करा',
    },
    triesLeft: '{n} प्रयत्न बाकी',
  },
}

const ymd = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}
const todayYmd = () => ymd(new Date())
const monthStartYmd = () => {
  const d = new Date()
  return ymd(new Date(d.getFullYear(), d.getMonth(), 1))
}
const qtl = (n) => (Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })

// ================================================================ page
export default function BrokerPortal() {
  const { lang } = useLang()
  const T = BROKER_TEXT[lang] || BROKER_TEXT.en
  const [session, setSession] = useState(() => getSession())

  return (
    <section className="bp-wrap">
      <div className="wrap">
        {session ? (
          <BillsView T={T} lang={lang} session={session} onLogout={() => setSession(null)} />
        ) : (
          <LoginForm T={T} onLogin={setSession} />
        )}
      </div>
    </section>
  )
}

// ================================================================ login
function LoginForm({ T, onLogin }) {
  const [mandis, setMandis] = useState([])
  const [search, setSearch] = useState('')
  const [mandiId, setMandiId] = useState(() => getLastMandi())
  const [loginId, setLoginId] = useState('')
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let alive = true
    fetchMandis().then((res) => {
      if (!alive) return
      const rows = (res.rows || []).filter((m) => m.id && m.id !== 'sample')
      setMandis(rows)
      if (rows.length === 1) setMandiId(rows[0].id)
    })
    return () => {
      alive = false
    }
  }, [])

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return mandis
    return mandis.filter((m) =>
      [m.mandi_name, m.city, m.district].some((v) => String(v || '').toLowerCase().includes(q)),
    )
  }, [mandis, search])

  async function submit(e) {
    e.preventDefault()
    setMsg('')
    if (!mandiId || !loginId.trim() || pin.trim().length < 4) {
      setMsg(T.errors.missing)
      return
    }
    setBusy(true)
    const res = await brokerLogin(mandiId, loginId, pin)
    setBusy(false)
    if (res.ok) {
      onLogin(res.session)
      return
    }
    setPin('')
    let text = T.errors[res.error] || T.errors.server
    if (res.error === 'locked') text = text.replace('{m}', res.minutes ?? 10)
    if (res.error === 'wrong_pin' && res.tries_left != null) {
      text += ' — ' + T.triesLeft.replace('{n}', res.tries_left)
    }
    setMsg(text)
  }

  return (
    <form className="bp-card bp-login" onSubmit={submit}>
      <h1>{T.title}</h1>
      <p className="bp-muted">{T.sub}</p>

      <label className="bp-label">{T.mandi}</label>
      {mandis.length > 6 && (
        <input
          className="bp-input"
          placeholder={T.searchMandi}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}
      <select className="bp-input" value={mandiId} onChange={(e) => setMandiId(e.target.value)}>
        <option value="">{T.chooseMandi}</option>
        {shown.map((m) => (
          <option key={m.id} value={m.id}>
            {m.mandi_name}
            {m.city ? ` — ${m.city}` : ''}
          </option>
        ))}
      </select>

      <label className="bp-label">{T.loginId}</label>
      <input
        className="bp-input"
        value={loginId}
        onChange={(e) => setLoginId(e.target.value)}
        autoComplete="username"
        autoCapitalize="none"
      />

      <label className="bp-label">{T.pin}</label>
      <input
        className="bp-input bp-pin"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric"
        type="password"
        autoComplete="current-password"
      />

      {msg && <div className="bp-error">{msg}</div>}

      <button className="bp-btn" type="submit" disabled={busy}>
        {busy ? T.wait : T.login}
      </button>
    </form>
  )
}

// ================================================================ bills list
/**
 * Bills of one broker account.
 * From the Trader page: pass onBack + backLabel → the top button goes back to
 * My Accounts instead of logging out.
 */
export function BillsView({ T, lang, session, onLogout, onBack, backLabel, initialTab, onPrint }) {
  const [tab, setTab] = useState(initialTab || 'farmer')
  const [from, setFrom] = useState(monthStartYmd())
  const [to, setTo] = useState(todayYmd())
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (tab === 'pending') return undefined
    let alive = true
    async function load() {
      setLoading(true)
      setMsg('')
      try {
        const data = await fetchBrokerBills(session.token, tab, from, to)
        if (alive) setRows(data)
      } catch (e) {
        if (!alive) return
        if (e.message === 'SESSION_EXPIRED') {
          if (!onBack) clearSession()
          alert(T.errors.expired)
          ;(onBack || onLogout)()
          return
        }
        setRows([])
        setMsg(T.errors.load)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
    // reload changes when "Show" is pressed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, reload, session.token])

  async function logout() {
    if (onBack) {
      onBack()
      return
    }
    await brokerLogout(session.token)
    onLogout()
  }

  return (
    <div className="bp-card">
      <div className="bp-top">
        <div>
          <div className="bp-muted">{T.welcome}</div>
          <h1 className="bp-name">{session.name}</h1>
          {session.mandi_name && <div className="bp-mandi">{session.mandi_name}</div>}
        </div>
        <button type="button" className="bp-btn bp-btn-outline" onClick={logout}>
          {onBack ? backLabel : T.logout}
        </button>
      </div>

      <div className="bp-tabs" role="tablist">
        {['farmer', 'buyer', 'transfer', 'pending'].map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            className={tab === k ? 'active' : ''}
            onClick={() => setTab(k)}
          >
            {T[k]}
          </button>
        ))}
      </div>

      {tab === 'pending' ? (
        <PendingView T={T} lang={lang} session={session} onExpired={onBack || onLogout} />
      ) : (
        <>
      <div className="bp-filter">
        <label>
          {T.from}
          <input type="date" className="bp-input" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          {T.to}
          <input type="date" className="bp-input" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
        </label>
        <button type="button" className="bp-btn" onClick={() => setReload((n) => n + 1)}>
          {T.show}
        </button>
      </div>

      {msg && <div className="bp-error">{msg}</div>}
      {loading ? (
        <div className="bp-empty">{T.wait}</div>
      ) : rows.length === 0 ? (
        <div className="bp-empty">{T.none}</div>
      ) : (
        <div className="bp-list">
          {rows.map((r) => (
            <BillRow key={r.id} T={T} lang={lang} kind={tab} r={r} onPrint={onPrint} />
          ))}
        </div>
      )}
        </>
      )}
    </div>
  )
}

function BillRow({ T, lang, kind, r, onPrint }) {
  const no = kind === 'transfer' ? r.transfer_no : r.bill_no
  const date = kind === 'transfer' ? r.transfer_date : r.bill_date

  let who = ''
  let amount = 0
  let extra = ''
  if (kind === 'farmer') {
    who = r.farmer_name
    amount = r.net_amount
    extra = r.payment_mode ? `${T.payment}: ${r.payment_mode}` : ''
  } else if (kind === 'buyer') {
    who = r.buyer_name
    amount = r.total_amount
  } else {
    who = `${r.direction === 'sent' ? T.sent : T.received} · ${r.other_broker || '-'}`
    amount = r.total_amount
  }
  const qty = kind === 'transfer' ? r.total_weight_quintal : r.total_quintal

  return (
    <button type="button" className="bp-row" onClick={() => (onPrint ? onPrint(r, kind) : alert(T.printSoon))}>
      <div className="bp-row-main">
        <div className="bp-row-no">
          {T.billNo} {no}
          {r.fy ? <span className="bp-fy"> / {r.fy}</span> : null}
        </div>
        <div className="bp-row-who">{who || '-'}</div>
        <div className="bp-muted bp-small">
          {prettyDate(date, lang)} · {r.lines || 0} {T.lines} · {qtl(qty)} {T.quintal}
          {extra ? ` · ${extra}` : ''}
        </div>
      </div>
      <div className="bp-row-amt">{inr(amount)}</div>
    </button>
  )
}

// ================================================================ pending
const nameKey = (name, phone) =>
  `${String(name || '').trim().toLowerCase().replace(/\s+/g, ' ')}|${String(phone || '').replace(/\s+/g, '')}`

function PendingView({ T, lang, session, onExpired }) {
  const [kind, setKind] = useState('farmer')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(null)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      setMsg('')
      setOpen(null)
      try {
        const data = await fetchBrokerPending(session.token, kind)
        if (alive) setRows(data)
      } catch (e) {
        if (!alive) return
        if (e.message === 'SESSION_EXPIRED') {
          clearSession()
          alert(T.errors.expired)
          onExpired()
          return
        }
        setRows([])
        setMsg(T.errors.load)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, session.token])

  // Group: farmer → same name + phone (like the app); buyer → same buyer
  const groups = useMemo(() => {
    const q = search.trim().toLowerCase()
    const map = new Map()
    for (const r of rows) {
      const name = kind === 'farmer' ? r.farmer_name : r.buyer_name
      if (q && !String(name || '').toLowerCase().includes(q)) continue
      const key = kind === 'farmer' ? nameKey(r.farmer_name, r.farmer_phone_number) : r.buyer_profile_id
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: name || '-',
          phone: kind === 'farmer' ? r.farmer_phone_number : '',
          items: [],
          qty: 0,
          amount: 0,
          commodities: new Set(),
        })
      }
      const g = map.get(key)
      g.items.push(r)
      g.qty += Number(kind === 'farmer' ? r.qty : r.weight_quintal) || 0
      g.amount += Number(kind === 'farmer' ? r.net : r.amount) || 0
      g.commodities.add(r.commodity_name || '-')
    }
    return [...map.values()]
  }, [rows, kind, search])

  return (
    <div>
      <div className="bp-subtabs">
        {['farmer', 'buyer'].map((k) => (
          <button key={k} type="button" className={kind === k ? 'active' : ''} onClick={() => setKind(k)}>
            {k === 'farmer' ? T.pendFarmer : T.pendBuyer}
          </button>
        ))}
      </div>

      <input
        className="bp-input"
        placeholder={T.searchName}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {msg && <div className="bp-error">{msg}</div>}
      {loading ? (
        <div className="bp-empty">{T.wait}</div>
      ) : groups.length === 0 ? (
        <div className="bp-empty">{T.noPending}</div>
      ) : (
        <div className="bp-list">
          {groups.map((g) => (
            <div key={g.key} className={'bp-group' + (open === g.key ? ' open' : '')}>
              <button type="button" className="bp-row bp-group-head" onClick={() => setOpen(open === g.key ? null : g.key)}>
                <div className="bp-row-main">
                  <div className="bp-row-who">{g.name}</div>
                  <div className="bp-muted bp-small">
                    {g.phone ? `${g.phone} · ` : ''}
                    {g.items.length} {T.tokens} · {qtl(g.qty)} {T.quintal} · {[...g.commodities].join(', ')}
                  </div>
                </div>
                <div className="bp-row-amt">{inr(g.amount)}</div>
              </button>

              {open === g.key && (
                <div className="bp-group-body">
                  {g.items.map((r) =>
                    kind === 'farmer' ? (
                      <div key={r.pending_id} className="bp-line">
                        <div>
                          <b>
                            {T.token} #{r.token_number} — {r.commodity_name || '-'}
                          </b>
                          <div className="bp-muted bp-small">
                            {prettyDate(r.token_date, lang)} · {r.number_of_bags || 0} {T.bags} · {qtl(r.qty)} {T.quintal} × {inr(r.rate)}
                          </div>
                          <div className="bp-muted bp-small">
                            {T.gross} {inr(r.gross)} ·{' '}
                            {Number(r.charge_rate) > 0
                              ? `${T.deduction} (${r.charge_type || '-'} ₹${r.charge_rate}/qtl) ${inr(r.charge)}`
                              : T.noCharge}
                          </div>
                        </div>
                        <div className="bp-line-amt">{inr(r.net)}</div>
                      </div>
                    ) : (
                      <div key={r.token_id} className="bp-line">
                        <div>
                          <b>
                            {T.token} #{r.token_number} — {r.commodity_name || '-'}
                          </b>
                          {r.is_transferred && <span className="bp-tag">{T.transferred}</span>}
                          <div className="bp-muted bp-small">
                            {prettyDate(r.token_date, lang)} · {r.farmer_name || '-'} · {r.number_of_bags || 0} {T.bags} ·{' '}
                            {qtl(r.weight_quintal)} {T.quintal} × {inr(r.rate_per_quintal)}
                          </div>
                        </div>
                        <div className="bp-line-amt">{inr(r.amount)}</div>
                      </div>
                    ),
                  )}
                  <div className="bp-group-foot">
                    <span>
                      {T.total}: <b>{inr(g.amount)}</b>
                    </span>
                    <button type="button" className="bp-btn" onClick={() => alert(T.generateSoon)}>
                      {T.generate}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
