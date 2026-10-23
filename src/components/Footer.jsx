import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { brand } from '../config'
import { fetchMandis, telHref, waHref } from '../data'
import Icon, { BrandMark, SocialIcon, WhatsAppIcon } from './Icon'

export default function Footer() {
  const { t, lang } = useLang()
  const f = t.footer
  const year = new Date().getFullYear()
  const [mandis, setMandis] = useState([])

  useEffect(() => {
    let alive = true
    fetchMandis().then((r) => {
      if (alive) setMandis(r.rows || [])
    })
    return () => {
      alive = false
    }
  }, [])

  const socials = Object.entries(brand.social || {}).filter(([, url]) => url)

  return (
    <footer className="site-footer">
      {/* ---------- call to action band ---------- */}
      <div className="wrap">
        <div className="footer-cta">
          <div>
            <h2>{f.ctaTitle}</h2>
            <p>{f.ctaText}</p>
          </div>
          <div className="btn-row">
            <Link className="btn btn-light" to="/contact#demo">
              {t.nav.demo} <Icon name="arrow" size={18} />
            </Link>
            <a className="btn btn-outline-light" href={waHref(brand.whatsapp, t.contact.waText)} target="_blank" rel="noreferrer">
              <WhatsAppIcon size={18} /> {t.common.whatsapp}
            </a>
            <a className="btn btn-outline-light" href={telHref(brand.phoneDial)}>
              <Icon name="phone" size={18} /> {t.common.call}
            </a>
          </div>
        </div>
      </div>

      {/* ---------- columns ---------- */}
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <BrandMark />
            <span>{brand.name}</span>
          </Link>
          <p>{brand.tagline[lang]}</p>
          {socials.length > 0 && (
            <>
              <div className="footer-title small-title">{f.follow}</div>
              <div className="social-row">
                {socials.map(([name, url]) => (
                  <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={name}>
                    <SocialIcon name={name} />
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        <nav aria-label={f.product}>
          <div className="footer-title">{f.product}</div>
          <ul className="footer-links">
            <li>
              <Link to="/#how-it-works">{f.howItWorks}</Link>
            </li>
            <li>
              <Link to="/#features">{t.nav.features}</Link>
            </li>
            <li>
              <Link to="/#roles">{f.farmerApp}</Link>
            </li>
            <li>
              <Link to="/contact#demo">{t.nav.demo}</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label={f.mandisTitle}>
          <div className="footer-title">{f.mandisTitle}</div>
          <ul className="footer-links">
            {mandis.slice(0, 5).map((m) => (
              <li key={m.id}>
                <Link to={`/m/${m.slug}`}>{m.mandi_name}</Link>
              </li>
            ))}
            <li>
              <Link to="/mandis" className="more">
                {f.allMandis}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <div className="footer-title">{t.nav.contact}</div>
          <ul className="footer-contact">
            <li>
              <Icon name="pin" size={18} />
              <span>
                {brand.company}
                <br />
                <span className="dim">{brand.city}</span>
              </span>
            </li>
            <li>
              <Icon name="phone" size={18} />
              <a href={telHref(brand.phoneDial)}>{brand.phone}</a>
            </li>
            <li>
              <WhatsAppIcon size={18} />
              <a href={waHref(brand.whatsapp)} target="_blank" rel="noreferrer">
                {t.common.whatsapp}
              </a>
            </li>
            <li>
              <Icon name="mail" size={18} />
              <a href={`mailto:${brand.email}`}>{brand.email}</a>
            </li>
          </ul>
        </div>
      </div>

      {/* ---------- bottom line ---------- */}
      <div className="wrap">
        <div className="footer-bottom">
          <span>
            © {year} {brand.company}. {f.rights}
          </span>
          <span className="footer-legal">
            <Link to="/privacy">{f.privacy}</Link>
            <Link to="/terms">{f.terms}</Link>
            <span className="dim">{f.madeIn}</span>
          </span>
          <button type="button" className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            ↑ {f.top}
          </button>
        </div>
      </div>
    </footer>
  )
}