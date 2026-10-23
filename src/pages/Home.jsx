import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { fetchMandis, fetchStats } from '../data'
import Icon from '../components/Icon'
import MandiCard from '../components/MandiCard'
import LeadForm from '../components/LeadForm'
import usePageTitle from '../components/usePageTitle'

const roleIcons = ['clipboard', 'phoneApp', 'cash', 'leaf']
const featureIcons = ['printer', 'doc', 'layers', 'lock', 'sheet', 'devices']

export default function Home() {
  const { t } = useLang()
  const h = t.home
  usePageTitle(null)

  const [mandis, setMandis] = useState({ loading: true, rows: [] })
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchMandis().then((r) => setMandis({ loading: false, ...r }))
    fetchStats().then(setStats)
  }, [])

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="kicker">{h.kicker}</span>
            <h1>{h.title}</h1>
            <p className="lead">{h.text}</p>
            <div className="btn-row">
              <Link className="btn btn-primary" to="/contact#demo">
                {h.ctaDemo} <Icon name="arrow" size={18} />
              </Link>
              <Link className="btn btn-ghost" to="/mandis">
                {h.ctaMandis}
              </Link>
            </div>
          </div>
          <HeroMock />
        </div>
      </section>

            {/* ---------- a day at the mandi (real sequence) ---------- */}
      <section className="section white" id="how-it-works">
        <div className="wrap">
          <div className="section-head">
            <h2>{h.flowTitle}</h2>
          </div>
          <ol className="steps steps-5">
            {h.flow.map(([title, text]) => (
              <li className="step" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

            {/* ---------- roles ---------- */}
      <section className="section" id="roles">
        <div className="wrap">
          <div className="section-head">
            <h2>{h.rolesTitle}</h2>
          </div>
          <div className="why">
            {h.roles.map(([title, text], i) => (
              <div className="why-item" key={title}>
                <span className="why-icon">
                  <Icon name={roleIcons[i]} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- features ---------- */}
      <section className="section white" id="features">
        <div className="wrap">
          <div className="section-head">
            <h2>{h.featuresTitle}</h2>
          </div>
          <div className="feature-grid">
            {h.features.map(([title, text], i) => (
              <div className="feature" key={title}>
                <Icon name={featureIcons[i]} size={26} className="feature-icon" />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- mandis on the platform ---------- */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2>{h.networkTitle}</h2>
            <p>{h.networkText}</p>
          </div>

          {stats && (
            <dl className="stats">
              <div>
                <dt>{h.stats[0]}</dt>
                <dd>{Number(stats.mandis).toLocaleString('en-IN')}</dd>
              </div>
              <div>
                <dt>{h.stats[1]}</dt>
                <dd>{Number(stats.lots_30d).toLocaleString('en-IN')}</dd>
              </div>
              <div>
                <dt>{h.stats[2]}</dt>
                <dd>{Number(stats.crops).toLocaleString('en-IN')}</dd>
              </div>
            </dl>
          )}

          {mandis.sample && <div className="banner">⚠ {t.common.sample}</div>}
          {mandis.loading ? (
            <p>{t.common.loading}</p>
          ) : (
            <div className="mandi-list">
              {mandis.rows.slice(0, 6).map((m) => (
                <MandiCard key={m.id} m={m} />
              ))}
            </div>
          )}
          {mandis.rows.length > 6 && (
            <p style={{ marginTop: 18 }}>
              <Link to="/mandis">{h.allMandis} →</Link>
            </p>
          )}
        </div>
      </section>

      {/* ---------- demo ---------- */}
      <section className="section white">
        <div className="wrap narrow">
          <div className="section-head">
            <h2>{h.demoTitle}</h2>
            <p>{h.demoText}</p>
          </div>
          <LeadForm />
        </div>
      </section>
    </>
  )
}

/** Thermal token slip + phone screen — shows what the product prints and shows */
function HeroMock() {
  return (
    <div className="hero-mock" aria-hidden="true">
      <div className="slip">
        <div className="slip-head">
          <b>कॉटनसिटी बाजार, यवतमाळ</b>
          <span>टोकन / एंट्री पावती</span>
        </div>
        <div className="slip-token">
          <span>टोकन क्र.</span>
          <b>214</b>
        </div>
        <dl>
          <div><dt>दिनांक</dt><dd>13/10/2026</dd></div>
          <div><dt>शेतकरी</dt><dd>रामराव पाटील</dd></div>
          <div><dt>गाव</dt><dd>आर्णी</dd></div>
          <div><dt>शेतमाल</dt><dd>कापूस</dd></div>
          <div><dt>गाडी</dt><dd>MH 29 AB 1234</dd></div>
          <div><dt>अडते</dt><dd>बालाजी ट्रेडर्स</dd></div>
        </dl>
        <div className="slip-foot">— धन्यवाद —</div>
      </div>
      <div className="phone-mock">
        <div className="phone-screen">
          <div className="ps-head">नमस्ते, रामराव</div>
          <div className="ps-card">
            <div className="muted">कुल प्राप्त राशि</div>
            <div className="ps-amount">₹1,84,250</div>
          </div>
          <div className="ps-card">
            <b>टोकन 214</b> · कापूस
            <div className="ps-steps">
              <i />
              <i />
              <i />
              <i className="off" />
            </div>
          </div>
          <div className="ps-card">
            <b>बिल 167</b> · ₹62,480
            <div className="muted">PDF ↓</div>
          </div>
        </div>
      </div>
    </div>
  )
}
