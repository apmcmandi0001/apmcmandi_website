import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { fetchRates, inr, prettyDate } from '../data'
import PageHead from '../components/PageHead'
import usePageTitle from '../components/usePageTitle'
import useMandi from './useMandi'

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function MandiRates() {
  const { t, lang } = useLang()
  const { slug, loading, mandi } = useMandi()
  usePageTitle(mandi ? `${t.rates.title} · ${mandi.mandi_name}` : t.rates.title)
  const [date, setDate] = useState('')
  const [state, setState] = useState({ loading: true, rows: [], date: null, sample: false })

  useEffect(() => {
    if (!mandi?.id) return
    let alive = true
    setState((s) => ({ ...s, loading: true }))
    fetchRates(mandi.id, date || null).then((r) => {
      if (alive) setState({ loading: false, ...r })
    })
    return () => {
      alive = false
    }
  }, [mandi?.id, date])

  if (loading) {
    return (
      <section className="section">
        <div className="wrap">{t.common.loading}</div>
      </section>
    )
  }
  if (!mandi) {
    return (
      <section className="section">
        <div className="wrap">
          <p>{t.mandi.notFound}</p>
          <Link to="/mandis">{t.mandi.back}</Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <PageHead title={`${t.rates.title} · ${mandi.mandi_name}`} intro={t.common.perQtl} />
      <section className="section tight">
        <div className="wrap">
          <Link to={`/m/${slug}`} className="back-link">
            ← {mandi.mandi_name}
          </Link>
          <div className="rates-toolbar">
            <div className="field">
              <label htmlFor="rate-date">{t.rates.pickDate}</label>
              <input
                id="rate-date"
                type="date"
                max={todayStr()}
                value={date || state.date || ''}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => setDate('')}>
              {t.rates.latest}
            </button>
          </div>

          {state.sample && <div className="banner">⚠ {t.common.sample}</div>}
          <h2 style={{ fontSize: '1.4rem' }}>{state.date ? prettyDate(state.date, lang) : ''}</h2>

          <div className="table-wrap">
            {state.loading ? (
              <p style={{ padding: 20 }}>{t.common.loading}</p>
            ) : state.rows.length === 0 ? (
              <p style={{ padding: 20 }}>{t.common.noRates}</p>
            ) : (
              <table className="data">
                <thead>
                  <tr>
                    <th scope="col">{t.common.commodity}</th>
                    <th scope="col">{t.common.lots}</th>
                    <th scope="col">{t.common.min}</th>
                    <th scope="col">{t.common.max}</th>
                    <th scope="col">{t.common.avg}</th>
                  </tr>
                </thead>
                <tbody>
                  {state.rows.map((r) => (
                    <tr key={r.commodity}>
                      <td className="crop">{r.commodity}</td>
                      <td>{r.lots}</td>
                      <td>{inr(r.min_rate)}</td>
                      <td>{inr(r.max_rate)}</td>
                      <td className="avg">{inr(r.avg_rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p className="muted small" style={{ marginTop: 14 }}>
            {t.rates.note}
          </p>
        </div>
      </section>
    </>
  )
}
