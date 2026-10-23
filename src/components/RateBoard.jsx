import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { fetchRates, inr, isToday, prettyDate } from '../data'

/** Chalk-board style rate card for one mandi */
export default function RateBoard({ mandiId, ratesLink }) {
  const { t, lang } = useLang()
  const [state, setState] = useState({ loading: true, rows: [], date: null, sample: false })

  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, loading: true }))
    fetchRates(mandiId, null).then((r) => {
      if (alive) setState({ loading: false, ...r })
    })
    return () => {
      alive = false
    }
  }, [mandiId])

  return (
    <section className="board" aria-labelledby="board-title">
      <div className="board-head">
        <h2 id="board-title" className="board-title">
          {t.mandi.rates}
        </h2>
        {state.date && (
          <span className="board-date">
            {isToday(state.date) ? '' : t.common.latest + ': '}
            {prettyDate(state.date, lang)}
          </span>
        )}
      </div>
      <div className="board-unit">{t.common.perQtl}</div>

      {state.loading ? (
        <div className="empty">{t.common.loading}</div>
      ) : state.rows.length === 0 ? (
        <div className="empty">{t.common.noRates}</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">{t.common.commodity}</th>
              <th scope="col">{t.common.min}</th>
              <th scope="col">{t.common.max}</th>
              <th scope="col">{t.common.avg}</th>
              <th scope="col" className="hide-sm">
                {t.common.lots}
              </th>
            </tr>
          </thead>
          <tbody>
            {state.rows.slice(0, 8).map((r) => (
              <tr key={r.commodity}>
                <td className="crop">{r.commodity}</td>
                <td>{inr(r.min_rate)}</td>
                <td>{inr(r.max_rate)}</td>
                <td className="avg">{inr(r.avg_rate)}</td>
                <td className="hide-sm">{r.lots}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="board-foot">
        <span className="board-note">{state.sample ? t.common.sample : ''}</span>
        {ratesLink && <Link to={ratesLink}>{t.mandi.ratesAll} →</Link>}
      </div>
    </section>
  )
}
