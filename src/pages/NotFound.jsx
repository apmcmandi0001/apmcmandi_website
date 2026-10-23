import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import usePageTitle from '../components/usePageTitle'

export default function NotFound() {
  const { t } = useLang()
  usePageTitle(t.notFound.title)
  return (
    <section className="section">
      <div className="wrap" style={{ textAlign: 'center' }}>
        <h1>404</h1>
        <p>{t.notFound.title}</p>
        <Link className="btn btn-primary" to="/">
          {t.notFound.back}
        </Link>
      </div>
    </section>
  )
}
