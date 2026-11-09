import { useEffect, useMemo, useState } from 'react'
import { prettyDate } from '../data'
import { fetchBrokerBin } from '../trader/brokerHomeApi'
import './BrokerExtra.css'

// =============================================================================
// Bin (website) — same as the app's Bin: my tokens that were not auctioned by
// Sunday 11:59 PM of their week. Grouped by week, with search. View only —
// the mandi office can bring one back.
// =============================================================================

const TEXT = {
  en: {
    title: 'Bin',
    back: '← Dashboard',
    note: 'Tokens not auctioned by Sunday 11:59 PM come here. Contact the mandi office to bring one back.',
    search: 'Token no. or farmer name',
    week: 'Week',
    empty: 'The Bin is empty',
    noneFound: 'No token found',
    noAuction: 'No auction',
    est: 'Est.',
    qtl: 'qtl',
    wait: 'Please wait…',
    load: 'Could not load. Please try again',
  },
  hi: {
    title: 'बिन',
    back: '← डैशबोर्ड',
    note: 'रविवार रात 11:59 तक जिनका लिलाव नहीं हुआ, वे टोकन यहाँ आते हैं। वापस लाने के लिए मंडी ऑफिस से संपर्क करें।',
    search: 'टोकन नंबर या किसान का नाम',
    week: 'हफ़्ता',
    empty: 'बिन खाली है',
    noneFound: 'कोई टोकन नहीं मिला',
    noAuction: 'लिलाव नहीं हुआ',
    est: 'अनुमानित',
    qtl: 'क्विंटल',
    wait: 'कृपया रुकें…',
    load: 'नहीं खुला। फिर से कोशिश करें',
  },
  mr: {
    title: 'बिन',
    back: '← डॅशबोर्ड',
    note: 'रविवारी रात्री 11:59 पर्यंत ज्यांचा लिलाव झाला नाही, ते टोकन इथे येतात. परत आणण्यासाठी मंडी ऑफिसशी संपर्क करा.',
    search: 'टोकन नंबर किंवा शेतकऱ्याचे नाव',
    week: 'आठवडा',
    empty: 'बिन रिकामा आहे',
    noneFound: 'टोकन सापडला नाही',
    noAuction: 'लिलाव झाला नाही',
    est: 'अंदाजे',
    qtl: 'क्विंटल',
    wait: 'कृपया थांबा…',
    load: 'उघडले नाही. पुन्हा प्रयत्न करा',
  },
}

const num = (v) => Number(v) || 0
const qtl = (v) => num(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })
const ymd = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}
/** Monday of the week of a 'YYYY-MM-DD' date */
const weekStart = (s) => {
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number)
  const x = new Date(y, m - 1, d)
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
  return ymd(x)
}
const plus6 = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return ymd(new Date(y, m - 1, d + 6))
}

export default function BrokerBin({ lang, acc, onBack, onExpired }) {
  const T = TEXT[lang] || TEXT.en
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let alive = true
    fetchBrokerBin(acc.token)
      .then((d) => alive && setRows(d))
      .catch((e) => {
        if (!alive) return
        if (e.message === 'SESSION_EXPIRED') onExpired()
        else setMsg(T.load)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acc.token])

  const weeks = useMemo(() => {
    const q = search.trim().toLowerCase()
    const map = new Map()
    for (const t of rows) {
      if (q && !String(t.token_number).startsWith(q) && !String(t.farmer_name || '').toLowerCase().includes(q)) continue
      const w = weekStart(t.token_date)
      if (!map.has(w)) map.set(w, [])
      map.get(w).push(t)
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
  }, [rows, search])

  return (
    <div className="bp-card">
      <div className="bp-top">
        <div>
          <div className="bp-muted">{acc.name}</div>
          <h1 className="bp-name">🗑 {T.title}</h1>
        </div>
        <button type="button" className="bp-btn bp-btn-outline" onClick={onBack}>
          {T.back}
        </button>
      </div>

      <div className="bx-note">{T.note}</div>
      <input className="bp-input" placeholder={T.search} value={search} onChange={(e) => setSearch(e.target.value)} />

      {msg && <div className="bp-error">{msg}</div>}
      {loading ? (
        <div className="bp-empty">{T.wait}</div>
      ) : weeks.length === 0 ? (
        <div className="bp-empty">{rows.length === 0 ? `✓ ${T.empty}` : T.noneFound}</div>
      ) : (
        weeks.map(([w, list]) => (
          <div key={w} className="bx-week">
            <div className="bx-week-head">
              <span>
                {T.week}: {prettyDate(w, lang)} – {prettyDate(plus6(w), lang)}
              </span>
              <b>{list.length}</b>
            </div>
            <div className="bp-list">
              {list.map((t) => (
                <div key={t.id} className="bx-bin-row">
                  <span className="bx-no bin">#{t.token_number}</span>
                  <span className="bx-who">
                    <b>{t.farmer_name}</b>
                    <small>
                      {t.commodity_name} · {t.vehicle_number || '-'} · {prettyDate(t.token_date, lang)} · {T.est} {qtl(t.estimated_quantity)} {T.qtl}
                    </small>
                  </span>
                  <span className="bx-badge st-bin">{T.noAuction}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
