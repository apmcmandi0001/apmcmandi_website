import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLang } from '../i18n'
import { supabase } from '../data'
import './FarmerEntry.css'

// =============================================================================
// Farmer self-entry (opened by scanning the staff's QR code).
// The farmer fills the entry details → token number is made instantly.
// Printing is done by mandi staff / broker using the token number.
// =============================================================================

const TEXT = {
  en: {
    title: 'Entry Form',
    sub: 'Fill your details. You will get your token number at once.',
    vehicle: 'Vehicle number',
    name: 'Farmer name',
    phone: 'Mobile number',
    village: 'Village (optional)',
    commodity: 'Commodity',
    broker: 'Broker',
    chooseBroker: 'Select your broker',
    searchBroker: 'Search broker',
    qty: 'Estimated quantity (quintal)',
    submit: 'Get Token Number',
    wait: 'Please wait…',
    loading: 'Opening form…',
    tokenNo: 'Your Token Number',
    showStaff: 'Show this number to the mandi staff or your broker to print your token slip.',
    date: 'Date',
    newEntry: 'Fill another entry',
    sameAgain: 'You already got this token for this vehicle today.',
    expired: 'This QR code has expired. Please scan the new QR code at the mandi office.',
    errors: {
      name: 'Please enter your name',
      phone: 'Enter a correct 10-digit mobile number',
      vehicle: 'Enter the vehicle number',
      qty: 'Enter the estimated quantity',
      commodity: 'Please choose the commodity',
      broker: 'Please choose your broker',
      too_many: 'Too many entries from this mobile today. Please go to the mandi office.',
      offline: 'No internet. Please try again.',
      server: 'Something went wrong. Please try again.',
    },
  },
  hi: {
    title: 'एंट्री फॉर्म',
    sub: 'अपनी जानकारी भरें। टोकन नंबर तुरंत मिलेगा।',
    vehicle: 'गाड़ी नंबर',
    name: 'किसान का नाम',
    phone: 'मोबाइल नंबर',
    village: 'गांव (वैकल्पिक)',
    commodity: 'माल / फसल',
    broker: 'दलाल / अडत्या',
    chooseBroker: 'अपना दलाल चुनें',
    searchBroker: 'दलाल खोजें',
    qty: 'अंदाजे वजन (क्विंटल)',
    submit: 'टोकन नंबर लें',
    wait: 'कृपया रुकें…',
    loading: 'फॉर्म खुल रहा है…',
    tokenNo: 'आपका टोकन नंबर',
    showStaff: 'टोकन पर्ची प्रिंट करने के लिए यह नंबर मंडी स्टाफ या अपने दलाल को दिखाएं।',
    date: 'तारीख',
    newEntry: 'दूसरी एंट्री भरें',
    sameAgain: 'इस गाड़ी का टोकन आज पहले ही बन चुका है।',
    expired: 'यह QR कोड पुराना हो गया है। मंडी ऑफिस में नया QR कोड स्कैन करें।',
    errors: {
      name: 'अपना नाम लिखें',
      phone: 'सही 10 अंकों का मोबाइल नंबर लिखें',
      vehicle: 'गाड़ी नंबर लिखें',
      qty: 'अंदाजे वजन लिखें',
      commodity: 'माल चुनें',
      broker: 'अपना दलाल चुनें',
      too_many: 'इस मोबाइल से आज बहुत एंट्री हो गई। मंडी ऑफिस जाएं।',
      offline: 'इंटरनेट नहीं है। फिर से कोशिश करें।',
      server: 'कुछ गलत हुआ। फिर से कोशिश करें।',
    },
  },
  mr: {
    title: 'एंट्री फॉर्म',
    sub: 'तुमची माहिती भरा. टोकन नंबर लगेच मिळेल.',
    vehicle: 'गाडी नंबर',
    name: 'शेतकऱ्याचे नाव',
    phone: 'मोबाईल नंबर',
    village: 'गाव (ऐच्छिक)',
    commodity: 'माल',
    broker: 'अडत्या',
    chooseBroker: 'तुमचा अडत्या निवडा',
    searchBroker: 'अडत्या शोधा',
    qty: 'अंदाजे वजन (क्विंटल)',
    submit: 'टोकन नंबर घ्या',
    wait: 'कृपया थांबा…',
    loading: 'फॉर्म उघडत आहे…',
    tokenNo: 'तुमचा टोकन नंबर',
    showStaff: 'टोकन पावती प्रिंट करण्यासाठी हा नंबर मंडी स्टाफ किंवा तुमच्या अडत्याला दाखवा.',
    date: 'दिनांक',
    newEntry: 'दुसरी एंट्री भरा',
    sameAgain: 'या गाडीचा टोकन आज आधीच बनला आहे.',
    expired: 'हा QR कोड जुना झाला आहे. मंडी ऑफिसमध्ये नवीन QR कोड स्कॅन करा.',
    errors: {
      name: 'तुमचे नाव लिहा',
      phone: 'बरोबर १० अंकी मोबाईल नंबर लिहा',
      vehicle: 'गाडी नंबर लिहा',
      qty: 'अंदाजे वजन लिहा',
      commodity: 'माल निवडा',
      broker: 'तुमचा अडत्या निवडा',
      too_many: 'या मोबाईलवरून आज खूप एंट्री झाल्या. मंडी ऑफिसला जा.',
      offline: 'इंटरनेट नाही. पुन्हा प्रयत्न करा.',
      server: 'काहीतरी चुकले. पुन्हा प्रयत्न करा.',
    },
  },
}

const SAVE_KEY = (code) => `apmc_entry_${code}`

function readSaved(code) {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY(code)) || 'null')
  } catch {
    return null
  }
}
function writeSaved(code, v) {
  try {
    if (v) localStorage.setItem(SAVE_KEY(code), JSON.stringify(v))
    else localStorage.removeItem(SAVE_KEY(code))
  } catch {
    /* private window */
  }
}

export default function FarmerEntry() {
  const { code = '' } = useParams()
  const { lang } = useLang()
  const T = TEXT[lang] || TEXT.mr

  const [form, setForm] = useState(null) // { mandi_name, commodities, brokers }
  const [state, setState] = useState('loading') // loading | ready | expired | error
  const [done, setDone] = useState(() => readSaved(code))

  const [vehicle, setVehicle] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [village, setVillage] = useState('')
  const [commodityId, setCommodityId] = useState('')
  const [brokerId, setBrokerId] = useState('')
  const [brokerSearch, setBrokerSearch] = useState('')
  const [qty, setQty] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let alive = true
    async function load() {
      if (!supabase) {
        setState('error')
        return
      }
      const { data, error } = await supabase.rpc('public_entry_form', { p_code: code })
      if (!alive) return
      if (error) setState('error')
      else if (!data?.ok) setState('expired')
      else {
        setForm(data)
        if (data.commodities?.length === 1) setCommodityId(data.commodities[0].id)
        setState('ready')
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [code])

  const brokers = useMemo(() => {
    const q = brokerSearch.trim().toLowerCase()
    const list = form?.brokers || []
    return q ? list.filter((b) => b.name.toLowerCase().includes(q)) : list
  }, [form, brokerSearch])

  async function submit(e) {
    e.preventDefault()
    setMsg('')
    if (vehicle.trim().length < 4) return setMsg(T.errors.vehicle)
    if (name.trim().length < 2) return setMsg(T.errors.name)
    if (!/^[6-9]\d{9}$/.test(phone)) return setMsg(T.errors.phone)
    if (!commodityId) return setMsg(T.errors.commodity)
    if (!brokerId) return setMsg(T.errors.broker)
    if (!(Number(qty) > 0)) return setMsg(T.errors.qty)

    setBusy(true)
    const { data, error } = await supabase.rpc('public_entry_submit', {
      p_code: code,
      p_farmer_name: name,
      p_phone: phone,
      p_village: village,
      p_vehicle: vehicle,
      p_commodity_id: commodityId,
      p_broker_id: brokerId,
      p_est_qty: Number(qty),
    })
    setBusy(false)
    if (error) return setMsg(navigator.onLine === false ? T.errors.offline : T.errors.server)
    if (!data?.ok) {
      if (data?.error === 'expired') return setState('expired')
      return setMsg(T.errors[data?.error] || T.errors.server)
    }
    const result = {
      token_number: data.token_number,
      token_date: data.token_date,
      repeat: !!data.repeat,
      vehicle: vehicle.toUpperCase().replace(/\s+/g, ''),
      name: name.trim(),
      commodity: form.commodities.find((c) => c.id === commodityId)?.name || '-',
      broker: form.brokers.find((b) => b.id === brokerId)?.name || '-',
      qty,
      mandi_name: form.mandi_name,
    }
    writeSaved(code, result)
    setDone(result)
    window.scrollTo(0, 0)
  }

  function newEntry() {
    writeSaved(code, null)
    setDone(null)
    setVehicle('')
    setQty('')
    setMsg('')
  }

  // ---------------------------------------------------------------- token shown
  if (done) {
    return (
      <section className="fe-wrap">
        <div className="fe-card fe-done">
          <div className="fe-mandi">{done.mandi_name}</div>
          <div className="fe-label">{T.tokenNo}</div>
          <div className="fe-token">{done.token_number}</div>
          <div className="fe-date">
            {T.date}: {done.token_date}
          </div>
          {done.repeat && <div className="fe-note">{T.sameAgain}</div>}
          <div className="fe-show">🖨 {T.showStaff}</div>
          <table className="fe-summary">
            <tbody>
              <tr>
                <td>{T.vehicle}</td>
                <td>{done.vehicle}</td>
              </tr>
              <tr>
                <td>{T.name}</td>
                <td>{done.name}</td>
              </tr>
              <tr>
                <td>{T.commodity}</td>
                <td>{done.commodity}</td>
              </tr>
              <tr>
                <td>{T.broker}</td>
                <td>{done.broker}</td>
              </tr>
              <tr>
                <td>{T.qty}</td>
                <td>{done.qty}</td>
              </tr>
            </tbody>
          </table>
          <button type="button" className="fe-btn fe-btn-outline" onClick={newEntry}>
            {T.newEntry}
          </button>
        </div>
      </section>
    )
  }

  // ---------------------------------------------------------------- form
  return (
    <section className="fe-wrap">
      <div className="fe-card">
        {state === 'loading' && <div className="fe-empty">{T.loading}</div>}
        {state === 'expired' && <div className="fe-expired">⏰ {T.expired}</div>}
        {state === 'error' && <div className="fe-expired">{T.errors.server}</div>}

        {state === 'ready' && (
          <form onSubmit={submit} noValidate>
            <div className="fe-mandi">{form.mandi_name}</div>
            <h1>{T.title}</h1>
            <p className="fe-sub">{T.sub}</p>

            <label className="fe-field">
              <span>{T.vehicle} *</span>
              <input
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value.toUpperCase())}
                placeholder="MH29AB1234"
                autoCapitalize="characters"
                autoComplete="off"
              />
            </label>

            <label className="fe-field">
              <span>{T.name} *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>

            <label className="fe-field">
              <span>{T.phone} *</span>
              <div className="fe-phone">
                <b>+91</b>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="9876543210"
                />
              </div>
            </label>

            <label className="fe-field">
              <span>{T.village}</span>
              <input value={village} onChange={(e) => setVillage(e.target.value)} />
            </label>

            <div className="fe-field">
              <span>{T.commodity} *</span>
              <div className="fe-chips">
                {form.commodities.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    className={commodityId === c.id ? 'on' : ''}
                    onClick={() => setCommodityId(c.id)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <label className="fe-field">
              <span>{T.broker} *</span>
              {form.brokers.length > 8 && (
                <input
                  className="fe-search"
                  placeholder={`🔍 ${T.searchBroker}`}
                  value={brokerSearch}
                  onChange={(e) => setBrokerSearch(e.target.value)}
                />
              )}
              <select value={brokerId} onChange={(e) => setBrokerId(e.target.value)}>
                <option value="">{T.chooseBroker}</option>
                {brokers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="fe-field">
              <span>{T.qty} *</span>
              <input
                value={qty}
                onChange={(e) => setQty(e.target.value.replace(/[^\d.]/g, ''))}
                inputMode="decimal"
                placeholder="25"
              />
            </label>

            {msg && <div className="fe-error">{msg}</div>}

            <button className="fe-btn" type="submit" disabled={busy}>
              {busy ? T.wait : T.submit}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}