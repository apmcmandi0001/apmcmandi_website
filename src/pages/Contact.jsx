import { useLang } from '../i18n'
import { brand } from '../config'
import { telHref, waHref } from '../data'
import PageHead from '../components/PageHead'
import LeadForm from '../components/LeadForm'
import Icon, { WhatsAppIcon } from '../components/Icon'
import usePageTitle from '../components/usePageTitle'

export default function Contact() {
  const { t } = useLang()
  usePageTitle(t.contact.title)
  return (
    <>
      <PageHead title={t.contact.title} intro={t.contact.intro} />
      <section className="section tight">
        <div className="wrap contact-grid">
          <div>
            <ul className="info-list">
              <li>
                <Icon name="pin" />
                <span>
                  <span className="value">{brand.company}</span>
                  <span className="label">{brand.city}</span>
                </span>
              </li>
              <li>
                <Icon name="phone" />
                <a className="value" href={telHref(brand.phoneDial)}>
                  {brand.phone}
                </a>
              </li>
              <li>
                <Icon name="mail" />
                <a className="value" href={`mailto:${brand.email}`}>
                  {brand.email}
                </a>
              </li>
            </ul>
            <div className="btn-row">
              <a className="btn btn-primary" href={telHref(brand.phoneDial)}>
                <Icon name="phone" size={18} /> {t.common.call}
              </a>
              <a className="btn btn-wa" href={waHref(brand.whatsapp, t.contact.waText)} target="_blank" rel="noreferrer">
                <WhatsAppIcon size={18} /> {t.common.whatsapp}
              </a>
            </div>
          </div>
          <div className="panel" id="demo">
            <h2 style={{ fontSize: '1.5rem' }}>{t.home.demoTitle}</h2>
            <p className="muted">{t.home.demoText}</p>
            <LeadForm />
          </div>
        </div>
      </section>
    </>
  )
}
