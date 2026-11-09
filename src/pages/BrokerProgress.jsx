import { useEffect, useState } from 'react'
import { inr, prettyDate } from '../data'
import { fetchBrokerProgress } from '../trader/brokerHomeApi'
import './BrokerExtra.css'

// =============================================================================
// Token progress (website) — same as the app's "Token progress":
//   pick a date → every token of mine on that date with its stage
//   Entry → Auction → Weight → Farmer bill.  Weighed tokens get a
//   "Make farmer bill" button.  Banner shows how many tokens are in the Bin.
// =============================================================================

const TEXT = {
  en: {
    title: 'Token progress',
    back: '← Dashboard',
    today: 'Today',
    all: 'All',
    auction: 'Auction pending',
    weight: 'Weight pending',
    bill: 'Bill to make',
    pending: 'In pending bills',
    done: 'Bill done',
    steps: ['Entry', 'Auction', 'Weight', 'Bill'],
    none: 'No tokens on this date',
    noneHere: 'No tokens in this group',
    est: 'Est.',
    qtl: 'qtl',
    makeBill: 'Make farmer bill',
    openPending: 'Open pending bills',
    bin: '{n} tokens in the Bin (not auctioned in their week)',
    openBin: 'Open Bin',
    wait: 'Please wait…',
    load: 'Could not load. Please try again',
  },
  hi: {
    title: 'टोकन प्रगति',
    back: '← डैशबोर्ड',
    today: 'आज',
    all: 'सभी',
    auction: 'लिलाव बाकी',
    weight: 'तोलाई बाकी',
    bill: 'बिल बनाना है',
    pending: 'पेंडिंग बिल में',
    done: 'बिल बन गया',
    steps: ['एंट्री', 'लिलाव', 'तोलाई', 'बिल'],
    none: 'इस दिन कोई टोकन नहीं',
    noneHere: 'इस समूह में कोई टोकन नहीं',
    est: 'अनुमानित',
    qtl: 'क्विंटल',
    makeBill: 'किसान बिल बनाएं',
    openPending: 'पेंडिंग बिल खोलें',
    bin: '{n} टोकन बिन में हैं (हफ़्ते में लिलाव नहीं हुआ)',
    openBin: 'बिन खोलें',
    wait: 'कृपया रुकें…',
    load: 'नहीं खुला। फिर से कोशिश करें',
  },
  mr: {
    title: 'टोकन प्रगती',
    back: '← डॅशबोर्ड',
    today: 'आज',
    all: 'सर्व',
    auction: 'लिलाव बाकी',
    weight: 'तोलाई बाकी',
    bill: 'बिल करायचे',
    pending: 'पेंडिंग बिलमध्ये',
    done: 'बिल झाले',
    steps: ['एंट्री', 'लिलाव', 'तोलाई', 'बिल'],
    none: 'या दिवशी टोकन नाही',
    noneHere: 'या गटात टोकन नाही',
    est: 'अंदाजे',
    qtl: 'क्विंटल',
    makeBill: 'शेतकरी बिल बनवा',
    openPending: 'पेंडिंग बिल उघडा',
    bin: '{n} टोकन बिनमध्ये आहेत (आठवड्यात लिलाव झाला नाही)',
    openBin: 'बिन उघडा',
    wait: 'कृपया थांबा…',
    load: 'उघडले नाही. पुन्हा प्रयत्न करा',
  },
}

const STAGES = ['auction', 'weight', 'bill', 'pending', 'done']
const num = (v) => Number(v) || 0
const qtl = (v) => num(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })
const ymd = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}
const addDays = (s, n) => {
  const [y, m, d] = String(s).split('-').map(Number)
  const x = new Date(y, m - 1, d)
  x.setDate(x.getDate() + n)
  return ymd(x)
}

/** How far the token has gone */
function stageOf(t) {
  if (t.status === 'completed' || t.has_patti) return 'done'
  if (t.in_pending) return 'pending'
  if (t.total_weight_quintal != null || t.status === 'weighed') return 'bill'
  if (t.auctioned || t.status === 'auctioned') return 'weight'
  return 'auction'
}
const STEPS_DONE = { auction: 1, weight: 2, bill: 3, pending: 3, done: 4 }

export default function BrokerProgress({ lang, acc, initialDate, onBack, onExpired, onMakeBill, onOpenPending, onOpenBin, onOpenToken }) {
  const T = TEXT[lang] || TEXT.en
  const today = ymd(new Date())
  const [date, setDate] = useState(initialDate || today)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setMsg('')
    fetchBrokerProgress(acc.token, date)
      .then((d) => alive && setData(d))
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
  }, [acc.token, date])

  const rows = (data?.tokens || []).map((t) => ({ ...t, stage: stageOf(t) }))
  const count = (s) => rows.filter((r) => r.stage === s).length
  const shown = filter === 'all' ? rows : rows.filter((r) => r.stage === filter)
  const binCount = data?.bin_count || 0

  return (
    <div className="bp-card">
      <div className="bp-top">
        <div>
          <div className="bp-muted">{acc.name}</div>
          <h1 className="bp-name">{T.title}</h1>
        </div>
        <button type="button" className="bp-btn bp-btn-outline" onClick={onBack}>
          {T.back}
        </button>
      </div>

      {/* date ‹ › */}
      <div className="bx-date">
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

      {binCount > 0 && (
        <button type="button" className="bx-binbar" onClick={onOpenBin}>
          <span>🗑 {T.bin.replace('{n}', binCount)}</span>
          <b>{T.openBin} ›</b>
        </button>
      )}

      {/* stage chips */}
      <div className="bx-chips">
        <button type="button" className={'bx-chip' + (filter === 'all' ? ' on' : '')} onClick={() => setFilter('all')}>
          {T.all} <b>{rows.length}</b>
        </button>
        {STAGES.map((s) => (
          <button key={s} type="button" className={`bx-chip st-${s}` + (filter === s ? ' on' : '')} onClick={() => setFilter(s)}>
            {T[s]} <b>{count(s)}</b>
          </button>
        ))}
      </div>

      {msg && <div className="bp-error">{msg}</div>}

      {loading && !data ? (
        <div className="bp-empty">{T.wait}</div>
      ) : rows.length === 0 ? (
        <div className="bp-empty">{T.none}</div>
      ) : shown.length === 0 ? (
        <div className="bp-empty">{T.noneHere}</div>
      ) : (
        <div className="bp-list">
          {shown.map((t) => (
            <div key={t.id} className={`bx-tok st-${t.stage}`}>
              <button type="button" className="bx-tok-main" onClick={() => onOpenToken(t.token_number, t.token_date)}>
                <span className="bx-no">#{t.token_number}</span>
                <span className="bx-who">
                  <b>{t.farmer_name}</b>
                  <small>
                    {t.commodity_name} · {t.vehicle_number || '-'}
                  </small>
                </span>
                <span className={`bx-badge st-${t.stage}`}>{T[t.stage]}</span>
              </button>

              <Steps T={T} stage={t.stage} />

              <div className="bx-facts">
                {t.auctioned && (
                  <span>
                    {t.buyer_name || '-'} · {inr(t.rate_per_quintal)}
                  </span>
                )}
                <span>
                  {t.total_weight_quintal != null
                    ? `${qtl(t.total_weight_quintal)} ${T.qtl}`
                    : `${T.est} ${qtl(t.estimated_quantity)} ${T.qtl}`}
                </span>
              </div>

              {t.stage === 'bill' && (
                <button type="button" className="bp-btn bx-act" onClick={() => onMakeBill(t.token_date, t.id)}>
                  🧾 {T.makeBill}
                </button>
              )}
              {t.stage === 'pending' && (
                <button type="button" className="bp-btn bp-btn-outline bx-act" onClick={onOpenPending}>
                  ⏳ {T.openPending}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Entry → Auction → Weight → Bill */
function Steps({ T, stage }) {
  const n = STEPS_DONE[stage] || 1
  return (
    <div className="bx-steps">
      {T.steps.map((label, i) => (
        <div key={label} className={'bx-step' + (i < n ? ' on' : '') + (i === n ? ' next' : '')}>
          <i>{i < n ? '✓' : i + 1}</i>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
