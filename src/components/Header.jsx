import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useLang, languages } from '../i18n'
import { brand } from '../config'
import Icon, { BrandMark } from './Icon'
import Wordmark from './Wordmark'

export const navItems = [
  ['/', 'home'],
  ['/#features', 'features'],
  ['/mandis', 'mandis'],
  ['/contact', 'contact'],
]

// Trader Login button text in all 3 languages (brokers + buyers)
const traderLoginLabel = {
  en: 'Trader Login',
  hi: 'व्यापारी लॉगिन',
  mr: 'व्यापारी लॉगिन',
}

export default function Header() {
  const { t, lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  const loginText = traderLoginLabel[lang] || traderLoginLabel.en

  const link = ([to, key]) =>
    to.includes('#') ? (
      <Link key={to} to={to}>
        {t.nav[key]}
      </Link>
    ) : (
      <NavLink key={to} to={to} end={to === '/'}>
        {t.nav[key]}
      </NavLink>
    )

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link to="/" className="brand" aria-label={brand.name}>
          <BrandMark />
          <span className="brand-text">
            <span className="brand-name dm-brand-name">
              <Wordmark />
            </span>
            <span className="brand-sub">{brand.tagline[lang]}</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Main">
          {navItems.map(link)}
          <Link className="nav-cta" to="/contact#demo">
            {t.nav.demo}
          </Link>
          <Link className="nav-cta" to="/trader">
            {loginText}
          </Link>
        </nav>

        <div className="lang-switch" role="group" aria-label="Language">
          {languages.map((l) => (
            <button key={l.code} type="button" aria-pressed={lang === l.code} onClick={() => setLang(l.code)}>
              {l.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'close' : 'menu'} />
          <span className="sr-only">{t.common.menu}</span>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile">
          {navItems.map(link)}
          <Link to="/contact#demo">{t.nav.demo}</Link>
          <Link to="/trader">{loginText}</Link>
        </nav>
      )}
    </header>
  )
}
