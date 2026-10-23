import { useLang } from '../i18n'
import { brand } from '../config'
import PageHead from '../components/PageHead'
import usePageTitle from '../components/usePageTitle'

// DRAFT — have this checked by a lawyer / CA before going live.
const UPDATED = '13 October 2026'

export default function Privacy() {
  const { t, lang } = useLang()
  usePageTitle(t.footer.privacy)
  return (
    <>
      <PageHead title={t.footer.privacy} intro={`Last updated: ${UPDATED}`} />
      <section className="section tight">
        <div className="wrap legal">
          {lang !== 'en' && (
            <div className="banner">हे धोरण सध्या इंग्रजीत आहे. मराठी / हिंदी आवृत्ती लवकरच. · यह नीति अभी अंग्रेज़ी में है।</div>
          )}
          <p>
            This Privacy Policy explains how {brand.company} ("we", "us"), the provider of the {brand.name} software, and the
            mandis (market yards) that use it collect and use personal data through this website, the {brand.name} mobile app
            and the web panels (together, the "Services"). Each mandi is responsible for the records of its own market; we
            process that data on the mandi's behalf to run the Services.
          </p>

          <h2>1. Data we collect</h2>
          <ul>
            <li><b>Farmers:</b> mobile number, name, village, vehicle number, crop details, weights, auction rates, bills and payment mode (cash / RTGS).</li>
            <li><b>Brokers and buyers:</b> name, firm name, mobile number, Login ID, PAN / GST details where required, bills and sales records.</li>
            <li><b>Mandi staff:</b> name, Login ID and the slips they create.</li>
            <li><b>Technical data:</b> basic device and log information needed to keep the Services secure and working.</li>
          </ul>
          <p>
            On this public website we only collect the details you type into the demo-request form (name, mobile number,
            mandi / firm name, city and message) so that we can contact you. Market rates shown here are totals per crop and do
            not identify any farmer or trader.
          </p>

          <h2>2. Why we use it</h2>
          <ul>
            <li>To run the market: gate entry, auction, weighing, bills and payment.</li>
            <li>To let each user see their own slips, bills and payments in the app.</li>
            <li>To verify login by mobile OTP and keep accounts secure.</li>
            <li>To meet legal, tax and market-licence record-keeping requirements.</li>
          </ul>

          <h2>3. Who can see it</h2>
          <p>
            Your records are visible only to you and to the people involved in your transaction (for example your broker and
            the buyer of your lot) and to authorised mandi staff. We do not sell personal data. We may share data with
            government authorities when the law requires it.
          </p>

          <h2>4. Where it is stored</h2>
          <p>
            Data is stored with our service providers Supabase (database) and Google Firebase (OTP login), which use secure,
            encrypted connections.
          </p>

          <h2>5. How long we keep it</h2>
          <p>We keep transaction records for as long as required by market and tax laws, and other data only while your account is active.</p>

          <h2>6. Your rights</h2>
          <p>
            Under India's Digital Personal Data Protection Act, 2023, you can ask to see, correct or delete your personal data
            (except records we must keep by law), and you can raise a complaint with us.
          </p>

          <h2>7. Contact / Grievance Officer</h2>
          <p>
            {/* TODO: add the name of the person responsible */}
            Grievance Officer, {brand.company}
            <br />
            {brand.city}
            <br />
            Phone: {brand.phone} · Email: {brand.email}
            <br />
            For records of a particular mandi you can also contact that mandi's office (details on its page on this website).
          </p>

          <h2>8. Changes</h2>
          <p>We may update this policy. The latest version will always be on this page with the date at the top.</p>
        </div>
      </section>
    </>
  )
}
