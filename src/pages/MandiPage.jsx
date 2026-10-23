import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { fetchNotices, mapsEmbed, mapsHref, prettyDate, telHref, waHref } from '../data'
import RateBoard from '../components/RateBoard'
import Icon, { WhatsAppIcon } from '../components/Icon'
import usePageTitle from '../components/usePageTitle'
import useMandi from './useMandi'

export default function MandiPage() {
  const { t, lang } = useLang()
  const { slug, loading, mandi, sample } = useMandi()
  usePageTitle(mandi?.mandi_name || null)

  const [notices, setNotices] = useState([])
  useEffect(() => {
    if (mandi?.id) fetchNotices(mandi.id, 5).then((r) => setNotices(r.rows))
  }, [mandi?.id])

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
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h1>404</h1>
          <p>{t.mandi.notFound}</p>
          <Link className="btn btn-primary" to="/mandis">
            {t.mandi.back}
          </Link>
        </div>
      </section>
    )
  }

  const m = mandi
  const place = [m.city, m.district, m.state].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')
  const mapQ = m.map_query || [m.mandi_name, m.address, place].filter(Boolean).join(', ')
  const wa = m.whatsapp_number

  return (
    <>
      {/* ---------- mandi banner + rate board ---------- */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <Link to="/mandis" className="back-link">
              ← {t.mandi.back}
            </Link>
            {sample && <div className="banner">⚠ {t.common.sample}</div>}
            {m.operator_name && <span className="kicker">{m.operator_name}</span>}
            <h1>{m.mandi_name}</h1>
            <p className="lead">
              {m.header_line2 || (m.license_no ? `${t.mandi.licence}: ${m.license_no}` : '')}
              {(m.header_line2 || m.license_no) && <br />}
              {m.address || place}
            </p>
            {m.website_about && <p>{m.website_about}</p>}
            <div className="btn-row">
              {m.contact_phone && (
                <a className="btn btn-primary" href={telHref(m.contact_phone)}>
                  <Icon name="phone" size={18} /> {t.common.call}
                </a>
              )}
              {wa && (
                <a className="btn btn-wa" href={waHref(wa, t.mandi.waText)} target="_blank" rel="noreferrer">
                  <WhatsAppIcon size={18} /> {t.common.whatsapp}
                </a>
              )}
              <a className="btn btn-ghost" href={mapsHref(mapQ)} target="_blank" rel="noreferrer">
                <Icon name="pin" size={18} /> {t.common.directions}
              </a>
            </div>
          </div>
          <RateBoard mandiId={m.id} ratesLink={`/m/${slug}/rates`} />
        </div>
      </section>

      {/* ---------- notices ---------- */}
      {notices.length > 0 && (
        <section className="section tight white">
          <div className="wrap">
            <h2>{t.mandi.notices}</h2>
            <ul className="notice-list">
              {notices.map((n) => (
                <li className="notice" key={n.id}>
                  <time dateTime={n.notice_date}>{prettyDate(n.notice_date, lang)}</time>
                  <div>
                    <h3>{n.title}</h3>
                    {n.body && <p>{n.body}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------- how selling works ---------- */}
      <section className="section white">
        <div className="wrap">
          <div className="section-head">
            <h2>{t.mandi.howTitle}</h2>
          </div>
          <ol className="steps">
            {t.mandi.steps.map(([title, text]) => (
              <li className="step" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- farmers / traders / crops ---------- */}
      <section className="section">
        <div className="wrap grid-2">
          <div className="panel">
            <h3>{t.mandi.bringTitle}</h3>
            <ul className="check-list">
              {t.mandi.bring.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div className="panel">
            <h3>{t.mandi.tradersTitle}</h3>
            <p style={{ marginBottom: 0 }}>{t.mandi.traders}</p>
          </div>
        </div>
        {m.crops?.length > 0 && (
          <div className="wrap" style={{ marginTop: 28 }}>
            <h3>{t.mandi.cropsTitle}</h3>
            <div className="crops">
              {m.crops.map((c) => (
                <span className="crop-chip" key={c}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ---------- contact + map ---------- */}
      <section className="section white">
        <div className="wrap">
          <div className="section-head">
            <h2>{t.mandi.contact}</h2>
          </div>
          <div className="contact-grid">
            <ul className="info-list">
              <li>
                <Icon name="pin" />
                <span>
                  <span className="label">{t.mandi.address}</span>
                  <span className="value">
                    {m.mandi_name}
                    <br />
                    {m.address || place}
                    {m.pincode ? ` – ${m.pincode}` : ''}
                  </span>
                </span>
              </li>
              {m.contact_phone && (
                <li>
                  <Icon name="phone" />
                  <span>
                    <span className="label">{t.mandi.phone}</span>
                    <a className="value" href={telHref(m.contact_phone)}>
                      {m.contact_phone}
                    </a>
                  </span>
                </li>
              )}
              {m.contact_email && (
                <li>
                  <Icon name="mail" />
                  <span>
                    <span className="label">{t.mandi.email}</span>
                    <a className="value" href={`mailto:${m.contact_email}`}>
                      {m.contact_email}
                    </a>
                  </span>
                </li>
              )}
              {m.website_hours && (
                <li>
                  <Icon name="clock" />
                  <span>
                    <span className="label">{t.mandi.hours}</span>
                    <span className="value">{m.website_hours}</span>
                  </span>
                </li>
              )}
            </ul>
            <iframe className="map" title="Map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapsEmbed(mapQ)} />
          </div>
        </div>
      </section>

      {wa && (
        <a className="wa-float" href={waHref(wa, t.mandi.waText)} target="_blank" rel="noreferrer" aria-label="WhatsApp">
          <WhatsAppIcon size={28} />
        </a>
      )}
    </>
  )
}
