import { useEffect, useMemo, useState } from 'react'
import { useLang } from '../i18n'
import { fetchMandis } from '../data'
import PageHead from '../components/PageHead'
import MandiCard from '../components/MandiCard'
import usePageTitle from '../components/usePageTitle'

export default function Mandis() {
  const { t } = useLang()
  usePageTitle(t.mandis.title)
  const [state, setState] = useState({ loading: true, rows: [] })
  const [q, setQ] = useState('')

  useEffect(() => {
    fetchMandis().then((r) => setState({ loading: false, ...r }))
  }, [])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return state.rows
    return state.rows.filter((m) =>
      [m.mandi_name, m.operator_name, m.city, m.district, m.state, m.address].join(' ').toLowerCase().includes(s),
    )
  }, [q, state.rows])

  return (
    <>
      <PageHead title={t.mandis.title} intro={t.mandis.intro} />
      <section className="section tight">
        <div className="wrap">
          <div className="field" style={{ maxWidth: 420, marginBottom: 18 }}>
            <label htmlFor="mandi-search">{t.mandis.search}</label>
            <input id="mandi-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {state.sample && <div className="banner">⚠ {t.common.sample}</div>}
          {state.loading ? (
            <p>{t.common.loading}</p>
          ) : list.length === 0 ? (
            <p className="muted">{t.mandis.none}</p>
          ) : (
            <div className="mandi-list">
              {list.map((m) => (
                <MandiCard key={m.id} m={m} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
