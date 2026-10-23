import { useLang } from '../i18n'
import { brand } from '../config'
import PageHead from '../components/PageHead'
import usePageTitle from '../components/usePageTitle'

// DRAFT — have this checked by a lawyer / CA before going live.
const UPDATED = '13 October 2026'

export default function Terms() {
  const { t, lang } = useLang()
  usePageTitle(t.footer.terms)
  return (
    <>
      <PageHead title={t.footer.terms} intro={`Last updated: ${UPDATED}`} />
      <section className="section tight">
        <div className="wrap legal">
          {lang !== 'en' && (
            <div className="banner">या अटी सध्या इंग्रजीत आहेत. मराठी / हिंदी आवृत्ती लवकरच. · ये शर्तें अभी अंग्रेज़ी में हैं।</div>
          )}
          <p>
            These terms apply to this website and to the {brand.name} app and web panels provided by {brand.company}. Each
            mandi listed here runs its own market under its own licence and rules; we provide the software. By using the
            Services you agree to these terms.
          </p>

          <h2>1. Market rates on this website</h2>
          <p>
            Rates are taken automatically from auctions held at the mandi and are shown for information only. Actual prices
            depend on the quality of the produce and the auction on the day. We are not responsible for decisions made only on
            the basis of rates shown here.
          </p>

          <h2>2. Accounts</h2>
          <ul>
            <li>Brokers, buyers and staff receive a Login ID and PIN from their mandi office. Keep them secret.</li>
            <li>You are responsible for entries made from your account.</li>
            <li>The mandi may disable an account that is misused or no longer licensed.</li>
          </ul>

          <h2>3. Transactions</h2>
          <ul>
            <li>Auction, weighing, charges and payment follow the rules of the market licence and applicable law.</li>
            <li>Bills and slips in the app are copies of the records kept by the mandi. If there is a difference, the mandi's official record applies, and you should report it to the office at once.</li>
          </ul>

          <h2>4. Acceptable use</h2>
          <p>Do not try to access other people's data, disturb the Services, or enter false information.</p>

          <h2>5. Availability</h2>
          <p>We try to keep the Services available but do not guarantee they will always be free of interruptions or errors.</p>

          <h2>6. Law and jurisdiction</h2>
          <p>These terms are governed by the laws of India. Courts at {brand.city} have jurisdiction.</p>

          <h2>7. Contact</h2>
          <p>
            {brand.company}, {brand.city} · Phone: {brand.phone} · Email: {brand.email}
          </p>
        </div>
      </section>
    </>
  )
}
