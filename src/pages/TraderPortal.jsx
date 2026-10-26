import { useEffect, useMemo, useRef, useState } from 'react'
import { useLang } from '../i18n'
import { fetchMandis, inr, prettyDate } from '../data'
import { firebaseReady } from '../firebase'
import {
  getTraderSession,
  checkTraderSession,
  clearTraderSession,
  sendOtp,
  verifyOtp,
  traderLogout,
  listAccounts,
  addAccount,
  removeAccount,
  openAccount,
  fetchBuyerBills,
  fetchBuyerUnbilled,
  fetchBuyerCess,
} from '../trader/traderApi'
import { BillsView, BROKER_TEXT } from './BrokerPortal'
import BrokerHome from './BrokerHome'
import BuyerHome from './BuyerHome'
import './BrokerPortal.css'
import './TraderPortal.css'

// =============================================================================
// Trader login (same system as the app)
//   Mobile + OTP → My Accounts (broker / buyer accounts of this phone)
//   → Broker: farmer / buyer / transfer bills + pending
//   → Buyer:  bills from brokers · not billed yet · CESS bills (paid / unpaid)
// =============================================================================

const TEXT = {
  en: {
    title: 'Trader Login',
    sub: 'Brokers and buyers — log in with your mobile number',
    mobile: 'Mobile number',
    sendOtp: 'Send OTP',
    otpSentTo: 'OTP sent to',
    otp: 'Enter the 6-digit OTP',
    verify: 'Verify & Login',
    change: 'Change number',
    resendIn: 'Resend OTP in {s}s',
    resend: 'Resend OTP',
    wait: 'Please wait…',
    myAccounts: 'My Accounts',
    accountsSub: 'Same accounts as in the app. Tap one to see its bills.',
    logout: 'Logout',
    brokers: 'Broker accounts',
    buyers: 'Buyer accounts',
    noAccounts: 'No accounts added yet. Add your broker or buyer account with its Login ID and password.',
    add: 'Add account',
    addTitle: 'Add an account',
    broker: 'Broker',
    buyer: 'Buyer',
    mandi: 'Mandi',
    chooseMandi: 'Select the mandi',
    searchMandi: 'Search city or mandi',
    loginId: 'Login ID',
    password: 'Password',
    save: 'Add',
    cancel: 'Cancel',
    remove: 'Remove',
    removeAsk: 'Remove {n} from this phone? (The account is not deleted.)',
    disabled: 'Disabled by mandi',
    open: 'Open',
    back: '← My Accounts',
    welcome: 'Welcome',
    bills: 'Bills from brokers',
    unbilled: 'Not billed yet',
    cess: 'CESS bills',
    from: 'From',
    to: 'To',
    show: 'Show',
    none: 'No bills in these dates',
    noUnbilled: 'Nothing waiting — all purchases are billed',
    noCess: 'No CESS bills yet',
    billNo: 'Bill No.',
    brokerName: 'Broker',
    lots: 'lots',
    quintal: 'qtl',
    bags: 'bags',
    token: 'Token',
    gross: 'Amount',
    brokerage: 'Brokerage',
    tds: 'TDS on brokerage',
    total: 'Total',
    print: 'Print',
    paid: 'Paid',
    unpaid: 'Unpaid',
    paidOn: 'Paid on',
    month: 'Month',
    marketFee: 'Market fee',
    supervision: 'Supervision fee',
    totalBills: 'Total of these bills',
    totalWaiting: 'Waiting to be billed',
    errors: {
      bad_phone: 'Enter a valid 10-digit mobile number',
      too_many: 'Too many tries. Please try again after some time',
      wrong_otp: 'Wrong OTP',
      otp_expired: 'OTP expired. Please send a new OTP',
      domain: 'This website is not allowed for OTP yet (Firebase settings)',
      network: 'No internet. Please try again',
      not_configured: 'OTP is not set up on this website yet',
      server: 'Server error. Please try again',
      bad_token: 'Login could not be verified. Please try again',
      old_login: 'Login took too long. Please send a new OTP',
      expired: 'Your login expired. Please login again',
      load: 'Could not load. Please try again',
      missing: 'Please fill mandi, Login ID and password',
      not_found: 'Login ID not found',
      other_mandi: 'This Login ID is not in the selected mandi',
      wrong_pin: 'Wrong password',
      locked: 'Too many wrong tries. Try again after {m} minutes',
      disabled: 'This account is disabled. Contact the mandi office',
      mandi_disabled: 'This mandi is disabled. Contact the mandi office',
      duplicate_login_id: 'Login ID problem. Contact the mandi office',
      already: 'This account is already added',
      not_linked: 'This account is not linked to your phone',
    },
    triesLeft: '{n} tries left',
  },
  hi: {
    title: 'व्यापारी लॉगिन',
    sub: 'दलाल और खरीदार — अपने मोबाइल नंबर से लॉगिन करें',
    mobile: 'मोबाइल नंबर',
    sendOtp: 'OTP भेजें',
    otpSentTo: 'OTP भेजा गया',
    otp: '6 अंकों का OTP डालें',
    verify: 'जाँचें और लॉगिन करें',
    change: 'नंबर बदलें',
    resendIn: '{s} सेकंड में फिर से भेजें',
    resend: 'OTP फिर से भेजें',
    wait: 'कृपया रुकें…',
    myAccounts: 'मेरे खाते',
    accountsSub: 'ऐप वाले ही खाते। बिल देखने के लिए खाते पर टैप करें।',
    logout: 'लॉगआउट',
    brokers: 'दलाल खाते',
    buyers: 'खरीदार खाते',
    noAccounts: 'अभी कोई खाता नहीं जुड़ा। अपना दलाल या खरीदार खाता लॉगिन आईडी और पासवर्ड से जोड़ें।',
    add: 'खाता जोड़ें',
    addTitle: 'खाता जोड़ें',
    broker: 'दलाल',
    buyer: 'खरीदार',
    mandi: 'मंडी',
    chooseMandi: 'मंडी चुनें',
    searchMandi: 'शहर या मंडी खोजें',
    loginId: 'लॉगिन आईडी',
    password: 'पासवर्ड',
    save: 'जोड़ें',
    cancel: 'रद्द करें',
    remove: 'हटाएं',
    removeAsk: '{n} को इस फ़ोन से हटाएं? (खाता डिलीट नहीं होगा।)',
    disabled: 'मंडी ने बंद किया',
    open: 'खोलें',
    back: '← मेरे खाते',
    welcome: 'स्वागत है',
    bills: 'दलालों के बिल',
    unbilled: 'बिल बाकी',
    cess: 'सेस बिल',
    from: 'से',
    to: 'तक',
    show: 'दिखाएँ',
    none: 'इन तारीखों में कोई बिल नहीं',
    noUnbilled: 'कुछ बाकी नहीं — सब खरीद का बिल बन गया',
    noCess: 'अभी कोई सेस बिल नहीं',
    billNo: 'बिल नं.',
    brokerName: 'दलाल',
    lots: 'लॉट',
    quintal: 'क्विंटल',
    bags: 'बोरी',
    token: 'टोकन',
    gross: 'रकम',
    brokerage: 'दलाली',
    tds: 'दलाली पर TDS',
    total: 'कुल',
    print: 'प्रिंट',
    paid: 'भुगतान हुआ',
    unpaid: 'बाकी',
    paidOn: 'भुगतान तारीख',
    month: 'महीना',
    marketFee: 'मार्केट फीस',
    supervision: 'सुपरविज़न फीस',
    totalBills: 'इन बिलों का कुल',
    totalWaiting: 'बिल बनना बाकी',
    errors: {
      bad_phone: 'सही 10 अंकों का मोबाइल नंबर डालें',
      too_many: 'बहुत बार कोशिश हुई। कुछ देर बाद कोशिश करें',
      wrong_otp: 'गलत OTP',
      otp_expired: 'OTP का समय खत्म। नया OTP भेजें',
      domain: 'इस वेबसाइट पर अभी OTP की अनुमति नहीं (Firebase सेटिंग)',
      network: 'इंटरनेट नहीं है। फिर से कोशिश करें',
      not_configured: 'इस वेबसाइट पर अभी OTP सेट नहीं है',
      server: 'सर्वर त्रुटि। फिर से कोशिश करें',
      bad_token: 'लॉगिन जाँच नहीं हो पाई। फिर से कोशिश करें',
      old_login: 'बहुत देर हो गई। नया OTP भेजें',
      expired: 'लॉगिन समय खत्म। फिर से लॉगिन करें',
      load: 'नहीं खुला। फिर से कोशिश करें',
      missing: 'मंडी, लॉगिन आईडी और पासवर्ड भरें',
      not_found: 'लॉगिन आईडी नहीं मिली',
      other_mandi: 'यह लॉगिन आईडी चुनी गई मंडी में नहीं है',
      wrong_pin: 'गलत पासवर्ड',
      locked: 'बहुत बार गलत पासवर्ड। {m} मिनट बाद कोशिश करें',
      disabled: 'यह खाता बंद है। मंडी ऑफिस से संपर्क करें',
      mandi_disabled: 'यह मंडी बंद है। मंडी ऑफिस से संपर्क करें',
      duplicate_login_id: 'लॉगिन आईडी में समस्या। मंडी ऑफिस से संपर्क करें',
      already: 'यह खाता पहले से जुड़ा है',
      not_linked: 'यह खाता आपके फ़ोन से नहीं जुड़ा',
    },
    triesLeft: '{n} कोशिश बाकी',
  },
  mr: {
    title: 'व्यापारी लॉगिन',
    sub: 'अडत्या आणि खरेदीदार — तुमच्या मोबाईल नंबरने लॉगिन करा',
    mobile: 'मोबाईल नंबर',
    sendOtp: 'OTP पाठवा',
    otpSentTo: 'OTP पाठवला',
    otp: '६ अंकी OTP टाका',
    verify: 'तपासा आणि लॉगिन करा',
    change: 'नंबर बदला',
    resendIn: '{s} सेकंदात पुन्हा पाठवा',
    resend: 'OTP पुन्हा पाठवा',
    wait: 'कृपया थांबा…',
    myAccounts: 'माझी खाती',
    accountsSub: 'ॲपमधीलच खाती. बिल पाहण्यासाठी खात्यावर टॅप करा.',
    logout: 'लॉगआउट',
    brokers: 'अडत्या खाती',
    buyers: 'खरेदीदार खाती',
    noAccounts: 'अजून कोणतेही खाते जोडले नाही. तुमचे अडत्या किंवा खरेदीदार खाते लॉगिन आयडी आणि पासवर्डने जोडा.',
    add: 'खाते जोडा',
    addTitle: 'खाते जोडा',
    broker: 'अडत्या',
    buyer: 'खरेदीदार',
    mandi: 'मंडी',
    chooseMandi: 'मंडी निवडा',
    searchMandi: 'शहर किंवा मंडी शोधा',
    loginId: 'लॉगिन आयडी',
    password: 'पासवर्ड',
    save: 'जोडा',
    cancel: 'रद्द करा',
    remove: 'काढा',
    removeAsk: '{n} या फोनवरून काढायचे? (खाते डिलीट होणार नाही.)',
    disabled: 'मंडीने बंद केले',
    open: 'उघडा',
    back: '← माझी खाती',
    welcome: 'स्वागत',
    bills: 'अडत्यांची बिले',
    unbilled: 'बिल बाकी',
    cess: 'सेस बिल',
    from: 'पासून',
    to: 'पर्यंत',
    show: 'दाखवा',
    none: 'या तारखांमध्ये बिल नाही',
    noUnbilled: 'काहीही बाकी नाही — सर्व खरेदीचे बिल झाले',
    noCess: 'अजून सेस बिल नाही',
    billNo: 'बिल नं.',
    brokerName: 'अडत्या',
    lots: 'लॉट',
    quintal: 'क्विंटल',
    bags: 'पोती',
    token: 'टोकन',
    gross: 'रक्कम',
    brokerage: 'अडत',
    tds: 'अडतीवर TDS',
    total: 'एकूण',
    print: 'प्रिंट',
    paid: 'भरले',
    unpaid: 'बाकी',
    paidOn: 'भरल्याची तारीख',
    month: 'महिना',
    marketFee: 'मार्केट फी',
    supervision: 'सुपरव्हिजन फी',
    totalBills: 'या बिलांचे एकूण',
    totalWaiting: 'बिल होणे बाकी',
    errors: {
      bad_phone: 'योग्य १० अंकी मोबाईल नंबर टाका',
      too_many: 'खूप वेळा प्रयत्न झाले. थोड्या वेळाने प्रयत्न करा',
      wrong_otp: 'चुकीचा OTP',
      otp_expired: 'OTP ची वेळ संपली. नवीन OTP पाठवा',
      domain: 'या वेबसाइटवर अजून OTP ची परवानगी नाही (Firebase सेटिंग)',
      network: 'इंटरनेट नाही. पुन्हा प्रयत्न करा',
      not_configured: 'या वेबसाइटवर अजून OTP सेट नाही',
      server: 'सर्व्हर त्रुटी. पुन्हा प्रयत्न करा',
      bad_token: 'लॉगिन तपासता आले नाही. पुन्हा प्रयत्न करा',
      old_login: 'खूप वेळ झाला. नवीन OTP पाठवा',
      expired: 'लॉगिनची वेळ संपली. पुन्हा लॉगिन करा',
      load: 'उघडले नाही. पुन्हा प्रयत्न करा',
      missing: 'मंडी, लॉगिन आयडी आणि पासवर्ड भरा',
      not_found: 'लॉगिन आयडी सापडला नाही',
      other_mandi: 'हा लॉगिन आयडी निवडलेल्या मंडीत नाही',
      wrong_pin: 'चुकीचा पासवर्ड',
      locked: 'खूप वेळा चुकीचा पासवर्ड. {m} मिनिटांनी पुन्हा प्रयत्न करा',
      disabled: 'हे खाते बंद आहे. मंडी ऑफिसशी संपर्क करा',
      mandi_disabled: 'ही मंडी बंद आहे. मंडी ऑफिसशी संपर्क करा',
      duplicate_login_id: 'लॉगिन आयडीमध्ये अडचण. मंडी ऑफिसशी संपर्क करा',
      already: 'हे खाते आधीच जोडले आहे',
      not_linked: 'हे खाते तुमच्या फोनशी जोडलेले नाही',
    },
    triesLeft: '{n} प्रयत्न बाकी',
  },
}

const BACK_HOME = { en: '← Dashboard', hi: '← डैशबोर्ड', mr: '← डॅशबोर्ड' }

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
const initial = (s) => (String(s || '?').trim().charAt(0) || '?').toUpperCase()

function errText(T, res) {
  let text = T.errors[res?.error] || T.errors.server
  if (res?.error === 'locked') text = text.replace('{m}', res.minutes ?? 10)
  if (res?.error === 'wrong_pin' && res.tries_left != null) text += ' — ' + T.triesLeft.replace('{n}', res.tries_left)
  return text
}

// ================================================================ page
export default function TraderPortal() {
  const { lang } = useLang()
  const T = TEXT[lang] || TEXT.en
  const BT = BROKER_TEXT[lang] || BROKER_TEXT.en
  const [session, setSession] = useState(() => getTraderSession())
  const [opened, setOpened] = useState(null) // { type, token, name, mandi_name }

  // check the saved login once when the page opens
  useEffect(() => {
    let alive = true
    checkTraderSession().then((s) => {
      if (alive && !s) setSession(null)
    })
    return () => {
      alive = false
    }
  }, [])

  function expired() {
    clearTraderSession()
    alert(T.errors.expired)
    setOpened(null)
    setSession(null)
  }

  async function logout() {
    if (session) await traderLogout(session.token)
    setOpened(null)
    setSession(null)
  }

  let body
  if (!session) {
    body = <PhoneLogin T={T} lang={lang} onLogin={setSession} />
  } else if (opened?.type === 'broker') {
    body = (
      <BrokerHome lang={lang} acc={opened} onBack={() => setOpened(null)} backLabel={T.back} />
    )
  } else if (opened?.type === 'buyer') {
    body = (
      <BuyerHome
        lang={lang}
        acc={opened}
        onBack={() => setOpened(null)}
        backLabel={T.back}
        renderBills={(tab, back) => (
          <BuyerView T={T} lang={lang} acc={opened} onBack={back} initialTab={tab} backLabel={BACK_HOME[lang] || BACK_HOME.en} />
        )}
      />
    )
  } else {
    body = <AccountsView T={T} session={session} onOpen={setOpened} onLogout={logout} onExpired={expired} />
  }

  return (
    <section className="bp-wrap tp-wrap">
      <div className="wrap">{body}</div>
    </section>
  )
}

// ================================================================ 1. phone + OTP
function PhoneLogin({ T, lang, onLogin }) {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') // phone | otp
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [left, setLeft] = useState(0)
  const confirmation = useRef(null)
  const otpBox = useRef(null)

  useEffect(() => {
    if (left <= 0) return undefined
    const t = setTimeout(() => setLeft((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [left])

  async function send(e) {
    e?.preventDefault()
    setMsg('')
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setMsg(T.errors.bad_phone)
      return
    }
    setBusy(true)
    const res = await sendOtp(phone, 'tp-recaptcha', lang)
    setBusy(false)
    if (!res.ok) {
      setMsg(T.errors[res.error] || T.errors.server)
      return
    }
    confirmation.current = res.confirmation
    setStep('otp')
    setOtp('')
    setLeft(30)
    setTimeout(() => otpBox.current?.focus(), 50)
  }

  async function verify(e) {
    e.preventDefault()
    setMsg('')
    if (otp.length !== 6 || !confirmation.current) {
      setMsg(T.errors.wrong_otp)
      return
    }
    setBusy(true)
    const res = await verifyOtp(confirmation.current, otp)
    setBusy(false)
    if (res.ok) {
      onLogin(res.session)
      return
    }
    setMsg(T.errors[res.error] || T.errors.server)
  }

  return (
    <div className="bp-card bp-login tp-login">
      <div className="tp-badge" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l1.5-5h15L21 9M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zM5 13v8h14v-8" />
        </svg>
      </div>
      <h1>{T.title}</h1>
      <p className="bp-muted">{T.sub}</p>

      {!firebaseReady && <div className="bp-error">{T.errors.not_configured}</div>}

      {step === 'phone' ? (
        <form onSubmit={send} className="tp-form">
          <label className="bp-label" htmlFor="tp-phone">
            {T.mobile}
          </label>
          <div className="tp-phone">
            <span>+91</span>
            <input
              id="tp-phone"
              className="bp-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
            />
          </div>
          {msg && <div className="bp-error">{msg}</div>}
          <button className="bp-btn" type="submit" disabled={busy || !firebaseReady}>
            {busy ? T.wait : T.sendOtp}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="tp-form">
          <p className="tp-sent">
            {T.otpSentTo} <b>+91 {phone}</b>{' '}
            <button type="button" className="tp-link" onClick={() => setStep('phone')}>
              {T.change}
            </button>
          </p>
          <label className="bp-label" htmlFor="tp-otp">
            {T.otp}
          </label>
          <input
            id="tp-otp"
            ref={otpBox}
            className="bp-input tp-otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
          {msg && <div className="bp-error">{msg}</div>}
          <button className="bp-btn" type="submit" disabled={busy}>
            {busy ? T.wait : T.verify}
          </button>
          <div className="tp-resend">
            {left > 0 ? (
              <span className="bp-muted">{T.resendIn.replace('{s}', left)}</span>
            ) : (
              <button type="button" className="tp-link" onClick={send} disabled={busy}>
                {T.resend}
              </button>
            )}
          </div>
        </form>
      )}
      {/* invisible "I'm not a robot" check used by Firebase */}
      <div id="tp-recaptcha" />
    </div>
  )
}

// ================================================================ 2. my accounts
function AccountsView({ T, session, onOpen, onLogout, onExpired }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [adding, setAdding] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setMsg('')
    listAccounts(session.token)
      .then((d) => alive && setRows(d || []))
      .catch((e) => {
        if (!alive) return
        if (e.message === 'SESSION_EXPIRED') onExpired()
        else setMsg(T.errors.load)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token, reload])

  async function open(a) {
    if (a.status !== 'active' || a.mandi_status !== 'active') return
    setBusyId(a.link_id)
    setMsg('')
    try {
      const r = await openAccount(session.token, a.account_type, a.profile_id)
      if (!r?.ok) {
        setMsg(errText(T, r))
        return
      }
      onOpen(r)
    } catch (e) {
      if (e.message === 'SESSION_EXPIRED') onExpired()
      else setMsg(T.errors.load)
    } finally {
      setBusyId(null)
    }
  }

  async function remove(a) {
    if (!window.confirm(T.removeAsk.replace('{n}', a.name))) return
    setBusyId(a.link_id)
    try {
      await removeAccount(session.token, a.link_id)
      setReload((n) => n + 1)
    } catch (e) {
      if (e.message === 'SESSION_EXPIRED') onExpired()
      else setMsg(T.errors.load)
    } finally {
      setBusyId(null)
    }
  }

  const brokers = rows.filter((r) => r.account_type === 'broker')
  const buyers = rows.filter((r) => r.account_type === 'buyer')

  const list = (title, items) =>
    items.length > 0 && (
      <div className="tp-group">
        <div className="tp-group-title">
          {title} <span>{items.length}</span>
        </div>
        {items.map((a) => {
          const off = a.status !== 'active' || a.mandi_status !== 'active'
          return (
            <div key={a.link_id} className={'tp-acc' + (off ? ' off' : '')}>
              <button type="button" className="tp-acc-main" onClick={() => open(a)} disabled={off || busyId === a.link_id}>
                <span className={'tp-avatar ' + a.account_type}>{initial(a.name)}</span>
                <span className="tp-acc-text">
                  <span className="tp-acc-name">{a.name}</span>
                  <span className="bp-muted bp-small">
                    {a.firm && a.firm !== a.name ? `${a.firm} · ` : ''}
                    {a.mandi_name || '-'}
                    {a.mandi_city ? `, ${a.mandi_city}` : ''} · {a.login_id}
                  </span>
                  {off && <span className="tp-off">{T.disabled}</span>}
                </span>
                {!off && <span className="tp-open">{busyId === a.link_id ? T.wait : `${T.open} ›`}</span>}
              </button>
              <button
                type="button"
                className="tp-remove"
                onClick={() => remove(a)}
                disabled={busyId === a.link_id}
                title={T.remove}
                aria-label={`${T.remove} ${a.name}`}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    )

  return (
    <div className="bp-card tp-card">
      <div className="bp-top">
        <div>
          <div className="bp-muted">+91 {String(session.phone || '').replace(/^\+91/, '')}</div>
          <h1 className="bp-name">{T.myAccounts}</h1>
          <div className="bp-muted bp-small">{T.accountsSub}</div>
        </div>
        <button type="button" className="bp-btn bp-btn-outline" onClick={onLogout}>
          {T.logout}
        </button>
      </div>

      {msg && <div className="bp-error">{msg}</div>}

      {loading ? (
        <div className="bp-empty">{T.wait}</div>
      ) : rows.length === 0 && !adding ? (
        <div className="bp-empty">{T.noAccounts}</div>
      ) : (
        <>
          {list(T.brokers, brokers)}
          {list(T.buyers, buyers)}
        </>
      )}

      {adding ? (
        <AddAccount
          T={T}
          session={session}
          onDone={() => {
            setAdding(false)
            setReload((n) => n + 1)
          }}
          onCancel={() => setAdding(false)}
          onExpired={onExpired}
        />
      ) : (
        <button type="button" className="bp-btn tp-add" onClick={() => setAdding(true)}>
          + {T.add}
        </button>
      )}
    </div>
  )
}

function AddAccount({ T, session, onDone, onCancel, onExpired }) {
  const [type, setType] = useState('broker')
  const [mandis, setMandis] = useState([])
  const [search, setSearch] = useState('')
  const [mandiId, setMandiId] = useState('')
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
    return mandis.filter((m) => [m.mandi_name, m.city, m.district].some((v) => String(v || '').toLowerCase().includes(q)))
  }, [mandis, search])

  async function submit(e) {
    e.preventDefault()
    setMsg('')
    if (!mandiId || !loginId.trim() || !pin.trim()) {
      setMsg(T.errors.missing)
      return
    }
    setBusy(true)
    try {
      const r = await addAccount(session.token, type, mandiId, loginId, pin)
      if (r?.ok) {
        onDone()
        return
      }
      setPin('')
      setMsg(errText(T, r))
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') onExpired()
      else setMsg(T.errors.server)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="tp-addform" onSubmit={submit}>
      <h2>{T.addTitle}</h2>
      <div className="tp-types" role="radiogroup">
        {['broker', 'buyer'].map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={type === k}
            className={type === k ? 'active' : ''}
            onClick={() => setType(k)}
          >
            {T[k]}
          </button>
        ))}
      </div>

      <label className="bp-label">{T.mandi}</label>
      {mandis.length > 6 && (
        <input className="bp-input" placeholder={T.searchMandi} value={search} onChange={(e) => setSearch(e.target.value)} />
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
        autoComplete="off"
        autoCapitalize="none"
      />

      <label className="bp-label">{T.password}</label>
      <input
        className="bp-input"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        type="password"
        autoComplete="new-password"
      />

      {msg && <div className="bp-error">{msg}</div>}

      <div className="tp-addbtns">
        <button type="button" className="bp-btn bp-btn-outline" onClick={onCancel}>
          {T.cancel}
        </button>
        <button type="submit" className="bp-btn" disabled={busy}>
          {busy ? T.wait : T.save}
        </button>
      </div>
    </form>
  )
}

// ================================================================ 3. buyer account
function BuyerView({ T, lang, acc, onBack, initialTab, backLabel }) {
  const [tab, setTab] = useState(initialTab || 'bills')

  function expired() {
    alert(T.errors.expired)
    onBack()
  }

  return (
    <div className="bp-card">
      <div className="bp-top">
        <div>
          <div className="bp-muted">
            {T.welcome} · {T.buyer}
          </div>
          <h1 className="bp-name">{acc.name}</h1>
          {acc.mandi_name && <div className="bp-mandi">{acc.mandi_name}</div>}
        </div>
        <button type="button" className="bp-btn bp-btn-outline" onClick={onBack}>
          {backLabel || T.back}
        </button>
      </div>

      <div className="bp-tabs" role="tablist">
        {['bills', 'unbilled', 'cess'].map((k) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>
            {T[k]}
          </button>
        ))}
      </div>

      {tab === 'bills' && <BuyerBills T={T} lang={lang} acc={acc} onExpired={expired} />}
      {tab === 'unbilled' && <BuyerUnbilled T={T} lang={lang} acc={acc} onExpired={expired} />}
      {tab === 'cess' && <BuyerCess T={T} lang={lang} acc={acc} onExpired={expired} />}
    </div>
  )
}

function useLoad(fn, deps, onExpired, T) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  useEffect(() => {
    let alive = true
    setLoading(true)
    setMsg('')
    fn()
      .then((d) => alive && setRows(d || []))
      .catch((e) => {
        if (!alive) return
        if (e.message === 'SESSION_EXPIRED') onExpired()
        else {
          setRows([])
          setMsg(T.errors.load)
        }
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return { rows, loading, msg }
}

function BuyerBills({ T, lang, acc, onExpired }) {
  const [from, setFrom] = useState(monthStartYmd())
  const [to, setTo] = useState(todayYmd())
  const [reload, setReload] = useState(0)
  const [open, setOpen] = useState(null)
  const { rows, loading, msg } = useLoad(() => fetchBuyerBills(acc.token, from, to), [reload, acc.token], onExpired, T)
  const sum = rows.reduce((s, b) => s + Number(b.total_amount || 0), 0)

  return (
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
        <>
          <div className="tp-sum">
            {T.totalBills}: <b>{inr(sum)}</b> · {rows.length}
          </div>
          <div className="bp-list">
            {rows.map((b) => (
              <div key={b.id} className={'bp-group' + (open === b.id ? ' open' : '')}>
                <button type="button" className="bp-row bp-group-head" onClick={() => setOpen(open === b.id ? null : b.id)}>
                  <div className="bp-row-main">
                    <div className="bp-row-no">
                      {T.billNo} {b.bill_no}
                    </div>
                    <div className="bp-row-who">
                      {T.brokerName}: {b.broker_name}
                    </div>
                    <div className="bp-muted bp-small">
                      {prettyDate(b.bill_date, lang)} · {b.lines || 0} {T.lots} · {qtl(b.total_quintal)} {T.quintal}
                    </div>
                  </div>
                  <div className="bp-row-amt">{inr(b.total_amount)}</div>
                </button>
                {open === b.id && (
                  <div className="bp-group-body">
                    {(b.items || []).map((i, idx) => (
                      <div key={i.id || idx} className="bp-line">
                        <div>
                          <b>
                            {T.token} #{i.token_number} — {i.commodity_name || '-'}
                          </b>
                          <div className="bp-muted bp-small">
                            {i.farmer_name || '-'} · {i.number_of_bags || 0} {T.bags} · {qtl(i.weight_quintal)} {T.quintal} ×{' '}
                            {inr(i.rate_per_quintal)}
                          </div>
                        </div>
                        <div className="bp-line-amt">{inr(i.amount)}</div>
                      </div>
                    ))}
                    <div className="tp-breakup">
                      <div>
                        <span>{T.gross}</span>
                        <b>{inr(b.gross_amount)}</b>
                      </div>
                      <div>
                        <span>
                          {T.brokerage} ({Number(b.brokerage_percent || 0)}%)
                        </span>
                        <b>{inr(b.brokerage_amount)}</b>
                      </div>
                      {Number(b.tds_amount) > 0 && (
                        <div>
                          <span>{T.tds}</span>
                          <b>{inr(b.tds_amount)}</b>
                        </div>
                      )}
                      <div className="tp-breakup-total">
                        <span>{T.total}</span>
                        <b>{inr(b.total_amount)}</b>
                      </div>
                    </div>
                    <div className="bp-group-foot">
                      <span />
                      <button type="button" className="bp-btn" onClick={() => printBuyerBill(T, lang, acc, b)}>
                        {T.print}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

function BuyerUnbilled({ T, lang, acc, onExpired }) {
  const { rows, loading, msg } = useLoad(() => fetchBuyerUnbilled(acc.token), [acc.token], onExpired, T)
  const [open, setOpen] = useState(null)

  const groups = useMemo(() => {
    const map = new Map()
    for (const r of rows) {
      const key = r.broker_profile_id || r.broker_name
      if (!map.has(key)) map.set(key, { key, name: r.broker_name || '-', items: [], qty: 0, amount: 0 })
      const g = map.get(key)
      g.items.push(r)
      g.qty += Number(r.weight_quintal) || 0
      g.amount += Number(r.amount) || 0
    }
    return [...map.values()]
  }, [rows])
  const sum = groups.reduce((s, g) => s + g.amount, 0)

  if (msg) return <div className="bp-error">{msg}</div>
  if (loading) return <div className="bp-empty">{T.wait}</div>
  if (groups.length === 0) return <div className="bp-empty">{T.noUnbilled}</div>

  return (
    <>
      <div className="tp-sum">
        {T.totalWaiting}: <b>{inr(sum)}</b>
      </div>
      <div className="bp-list">
        {groups.map((g) => (
          <div key={g.key} className={'bp-group' + (open === g.key ? ' open' : '')}>
            <button type="button" className="bp-row bp-group-head" onClick={() => setOpen(open === g.key ? null : g.key)}>
              <div className="bp-row-main">
                <div className="bp-row-who">
                  {T.brokerName}: {g.name}
                </div>
                <div className="bp-muted bp-small">
                  {g.items.length} {T.lots} · {qtl(g.qty)} {T.quintal}
                </div>
              </div>
              <div className="bp-row-amt">{inr(g.amount)}</div>
            </button>
            {open === g.key && (
              <div className="bp-group-body">
                {g.items.map((r) => (
                  <div key={r.token_id} className="bp-line">
                    <div>
                      <b>
                        {T.token} #{r.token_number} — {r.commodity_name || '-'}
                      </b>
                      <div className="bp-muted bp-small">
                        {prettyDate(r.token_date, lang)} · {r.farmer_name || '-'} · {r.number_of_bags || 0} {T.bags} ·{' '}
                        {qtl(r.weight_quintal)} {T.quintal} × {inr(r.rate_per_quintal)}
                      </div>
                    </div>
                    <div className="bp-line-amt">{inr(r.amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

function BuyerCess({ T, lang, acc, onExpired }) {
  const { rows, loading, msg } = useLoad(() => fetchBuyerCess(acc.token), [acc.token], onExpired, T)
  const [open, setOpen] = useState(null)

  const monthName = (d) => {
    try {
      return new Date(String(d).slice(0, 10) + 'T00:00:00').toLocaleDateString(
        lang === 'en' ? 'en-IN' : lang === 'mr' ? 'mr-IN' : 'hi-IN',
        { month: 'long', year: 'numeric' },
      )
    } catch {
      return String(d || '-')
    }
  }

  if (msg) return <div className="bp-error">{msg}</div>
  if (loading) return <div className="bp-empty">{T.wait}</div>
  if (rows.length === 0) return <div className="bp-empty">{T.noCess}</div>

  return (
    <div className="bp-list">
      {rows.map((c) => {
        const paid = c.status === 'paid'
        return (
          <div key={c.id} className={'bp-group' + (open === c.id ? ' open' : '')}>
            <button type="button" className="bp-row bp-group-head" onClick={() => setOpen(open === c.id ? null : c.id)}>
              <div className="bp-row-main">
                <div className="bp-row-no">
                  {T.billNo} {c.bill_no ?? '-'}
                </div>
                <div className="bp-row-who">
                  {T.month}: {monthName(c.period_month)}
                </div>
                <div className="bp-muted bp-small">
                  <span className={'tp-status ' + (paid ? 'paid' : 'unpaid')}>{paid ? T.paid : T.unpaid}</span>
                  {paid && c.paid_on ? ` · ${T.paidOn} ${prettyDate(c.paid_on, lang)}` : ''}
                </div>
              </div>
              <div className="bp-row-amt">{inr(c.cess_amount)}</div>
            </button>
            {open === c.id && (
              <div className="bp-group-body">
                <div className="tp-breakup">
                  {c.market_fee != null && (
                    <div>
                      <span>{T.marketFee}</span>
                      <b>{inr(c.market_fee)}</b>
                    </div>
                  )}
                  {c.supervision_fee != null && (
                    <div>
                      <span>{T.supervision}</span>
                      <b>{inr(c.supervision_fee)}</b>
                    </div>
                  )}
                  <div className="tp-breakup-total">
                    <span>{T.total}</span>
                    <b>{inr(c.cess_amount)}</b>
                  </div>
                </div>
                <div className="bp-muted bp-small">
                  {(c.items || []).length} {T.lots}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ================================================================ print one buyer bill
function printBuyerBill(T, lang, acc, b) {
  const esc = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])
  const rows = (b.items || [])
    .map(
      (i) => `<tr>
        <td>${esc(i.token_number)}</td><td>${esc(i.farmer_name)}</td><td>${esc(i.commodity_name)}</td>
        <td class="n">${esc(i.number_of_bags ?? '')}</td><td class="n">${esc(qtl(i.weight_quintal))}</td>
        <td class="n">${esc(inr(i.rate_per_quintal))}</td><td class="n">${esc(inr(i.amount))}</td></tr>`,
    )
    .join('')
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(T.billNo)} ${esc(b.bill_no)}</title>
  <style>
    body{font-family:system-ui,'Noto Sans Devanagari',sans-serif;margin:24px;color:#111}
    h1{font-size:20px;margin:0 0 4px} .m{color:#555;font-size:13px}
    table{width:100%;border-collapse:collapse;margin:16px 0;font-size:13px}
    th,td{border:1px solid #ccc;padding:6px 8px;text-align:left} th{background:#f3f6f7} .n{text-align:right}
    .tot{width:320px;margin-left:auto;font-size:14px} .tot div{display:flex;justify-content:space-between;padding:3px 0}
    .tot .g{border-top:1px solid #333;font-weight:700;margin-top:4px;padding-top:6px}
  </style></head><body>
  <h1>${esc(acc.mandi_name || '')}</h1>
  <div class="m">${esc(T.billNo)} <b>${esc(b.bill_no)}</b> · ${esc(prettyDate(b.bill_date, lang))}</div>
  <div class="m">${esc(T.brokerName)}: <b>${esc(b.broker_name)}</b> · ${esc(T.buyer)}: <b>${esc(acc.name)}</b></div>
  <table><thead><tr><th>${esc(T.token)}</th><th>Farmer</th><th>Crop</th><th class="n">${esc(T.bags)}</th>
  <th class="n">${esc(T.quintal)}</th><th class="n">Rate</th><th class="n">${esc(T.gross)}</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="tot">
    <div><span>${esc(T.gross)}</span><span>${esc(inr(b.gross_amount))}</span></div>
    <div><span>${esc(T.brokerage)} (${esc(Number(b.brokerage_percent || 0))}%)</span><span>${esc(inr(b.brokerage_amount))}</span></div>
    ${Number(b.tds_amount) > 0 ? `<div><span>${esc(T.tds)}</span><span>${esc(inr(b.tds_amount))}</span></div>` : ''}
    <div class="g"><span>${esc(T.total)}</span><span>${esc(inr(b.total_amount))}</span></div>
  </div>
  <script>window.onload=function(){window.print()}</script>
  </body></html>`
  const w = window.open('', '_blank', 'width=900,height=900')
  if (!w) return
  w.document.open()
  w.document.write(html)
  w.document.close()
}
