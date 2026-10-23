import { Link } from 'react-router-dom'
import { useLang } from '../i18n'

export default function MandiCard({ m }) {
  const { t } = useLang()
  const place = [m.city, m.district, m.state].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')
  return (
    <Link className="mandi-card" to={`/m/${m.slug}`}>
      <span className="mandi-logo" aria-hidden="true">
        {m.logo_url ? <img src={m.logo_url} alt="" /> : (m.mandi_name || '?').trim().charAt(0)}
      </span>
      <span className="mandi-info">
        <span className="mandi-name">{m.mandi_name}</span>
        {m.operator_name && <span className="mandi-sub">{m.operator_name}</span>}
        <span className="mandi-sub">
          {place || m.address}
          {m.license_no ? ` · ${t.mandi.licence} ${m.license_no}` : ''}
        </span>
      </span>
      <span className="mandi-go">{t.mandis.open} →</span>
    </Link>
  )
}
