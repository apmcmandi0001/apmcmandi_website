import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { brand } from '../config'
import PageHead from '../components/PageHead'
import usePageTitle from '../components/usePageTitle'

// Privacy Policy of DigiMandi (website + app + web panels).
// Public link (used in Google Play): https://www.digimandiconnect.com/privacy
// Have this read once by a lawyer / CA before onboarding mandis.
const UPDATED = '29 October 2026'

export default function Privacy() {
  const { t, lang } = useLang()
  usePageTitle(t.footer.privacy)
  return (
    <>
      <PageHead title={t.footer.privacy} intro={`Last updated: ${UPDATED}`} />
      <section className="section tight">
        <div className="wrap legal">
          {lang !== 'en' && (
            <div className="banner">
              हे धोरण सध्या इंग्रजीत आहे. मराठी / हिंदी आवृत्ती लवकरच. · यह नीति अभी अंग्रेज़ी में है। मराठी / हिंदी संस्करण जल्द।
            </div>
          )}

          <p>
            This Privacy Policy explains how {brand.company} ("we", "us", "our"), the company that makes and runs{' '}
            {brand.name}, collects, uses, stores and protects personal data when you use the {brand.name} mobile app, this
            website (www.digimandiconnect.com) and the {brand.name} web panels for mandis (together, the "Services").
          </p>
          <p>
            {brand.name} is software used by mandis (agricultural market yards) to run gate entry, auctions, weighing and
            billing. Each mandi decides what records it keeps for its own market, and we process those records on the
            mandi's behalf. For your {brand.name} login account itself, we are responsible. By using the Services you agree
            to this policy.
          </p>

          <h2>1. Data we collect</h2>
          <ul>
            <li>
              <b>Farmers:</b> mobile number, name, village, vehicle number, crop / commodity, estimated and actual weights,
              auction rates, quality marks, bills, and payment mode (cash / RTGS).
            </li>
            <li>
              <b>Traders (brokers and buyers):</b> name, firm name, mobile number, Login ID and PIN (stored in protected
              form), PAN / GST details where the mandi records them, purchases, sales, bills, transfers and payment status.
            </li>
            <li>
              <b>Mandi staff and weight team:</b> name, mobile number, Login ID and PIN (stored in protected form), and the
              slips and records they create.
            </li>
            <li>
              <b>Mandi admins:</b> name, email address and password (stored in protected form), and an activity log of the
              changes they make (old value, new value, who and when).
            </li>
            <li>
              <b>Website visitors:</b> only what you type into the demo-request form (name, mobile number, mandi / firm
              name, city and message). Market rates shown on the website are totals per crop and do not identify any farmer
              or trader.
            </li>
            <li>
              <b>Technical data:</b> basic information needed to keep the Services working and secure, such as IP address,
              device type, app version, and error and access logs.
            </li>
          </ul>
          <p>
            <b>On your phone:</b> the app uses the internet, and Bluetooth / nearby devices only to connect to a slip
            printer when you choose to print. Your language choice, login session and printer settings are saved only on
            your own device. We do not collect your location, contacts, photos, call logs or messages.
          </p>

          <h2>2. Why we use it</h2>
          <ul>
            <li>To run the market: gate entry tokens, auctions, weighing, slips, bills, transfers and payments.</li>
            <li>To let each user see their own slips, bills, purchases and payments in the app and on the website.</li>
            <li>To verify your identity by mobile OTP, Login ID and PIN, and keep accounts secure.</li>
            <li>To show market rates (as totals per crop) on the public website.</li>
            <li>To answer your support requests and demo requests.</li>
            <li>To find and fix errors, prevent misuse, and keep records of changes for audit.</li>
            <li>To meet legal, tax and market-licence record-keeping requirements.</li>
          </ul>
          <p>We do not use your data for advertising, and we do not sell personal data to anyone.</p>

          <h2>3. Legal basis</h2>
          <p>
            We process personal data with your consent, which you give when you register or log in and use the Services,
            and for legitimate uses allowed under India's Digital Personal Data Protection Act, 2023 (DPDP Act), such as
            completing the market transactions you take part in and meeting legal obligations.
          </p>

          <h2>4. Who can see your data</h2>
          <ul>
            <li>
              <b>You</b>, and the people involved in your transaction — for example your broker and the buyer of your lot.
            </li>
            <li>
              <b>Authorised staff and admins of the mandi</b> where the transaction took place. Each mandi sees only its
              own records.
            </li>
            <li>
              <b>Our service providers</b>, only to run the Services:
              <ul>
                <li>Amazon Web Services (AWS) — servers and database, in the Mumbai (India) region.</li>
                <li>Google Firebase — sending and checking the login OTP (your mobile number is processed by Google).</li>
              </ul>
            </li>
            <li>
              <b>Government authorities</b>, only when the law requires it (for example tax or market authorities, or a
              court order).
            </li>
          </ul>

          <h2>5. Where and how it is stored</h2>
          <p>
            Your data is stored on servers in India (AWS, Mumbai region). All connections between the app, the website and
            our servers are encrypted (HTTPS). Access to data is limited by role, PINs and passwords are stored in
            protected (hashed) form, every change by an admin is logged, and the database is backed up daily. No system is
            perfectly secure, but we take reasonable security measures as required by law. If a personal data breach
            happens, we will inform affected users and the authorities as the law requires.
          </p>

          <h2>6. How long we keep it</h2>
          <ul>
            <li>
              <b>Transaction records</b> (slips, bills, payments) are kept for as long as tax, accounting and market laws
              require the mandi to keep them, even after an account is deleted.
            </li>
            <li>
              <b>Account and profile data</b> is kept while your account is active, and deleted or anonymised within 30 days
              after you ask us to delete your account (except what the law requires us to keep).
            </li>
            <li>
              <b>Demo requests</b> from the website are kept for up to 2 years, then deleted.
            </li>
            <li>
              <b>Backups</b> are kept for a short period and then overwritten.
            </li>
          </ul>

          <h2>7. Deleting your account</h2>
          <p>
            You can ask us to delete your {brand.name} account and personal data at any time. See{' '}
            <Link to="/delete-account">Delete your account</Link> for the steps. We will confirm and complete the request
            within 30 days. Records that the law requires the mandi to keep (such as bills) are kept for the legal period
            and then deleted.
          </p>

          <h2>8. Your rights</h2>
          <p>Under the DPDP Act, you have the right to:</p>
          <ul>
            <li>get a summary of your personal data that we process and who it is shared with;</li>
            <li>have your personal data corrected, completed or updated;</li>
            <li>have your personal data erased, except what we must keep by law;</li>
            <li>withdraw your consent (this may mean you can no longer use the Services);</li>
            <li>nominate another person to use these rights if you die or become unable to do so; and</li>
            <li>
              raise a complaint with our Grievance Officer, and, if you are not satisfied, with the Data Protection Board of
              India.
            </li>
          </ul>
          <p>To use any of these rights, contact the Grievance Officer below or your mandi office.</p>

          <h2>9. Children</h2>
          <p>
            The Services are meant for people aged 18 and above who take part in mandi trade. We do not knowingly collect
            personal data of children. If you believe a child's data has been added, contact us and we will delete it.
          </p>

          <h2>10. Website storage</h2>
          <p>
            This website saves your language choice and, if you use Trader Login, your login session in your browser's
            storage. We do not use advertising or tracking cookies.
          </p>

          <h2>11. Grievance Officer</h2>
          <p>
            In accordance with the Information Technology Act, 2000, the Information Technology (Reasonable Security
            Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data
            Protection Act, 2023, the Grievance Officer for {brand.name} is:
          </p>
          <p>
            <b>{brand.grievanceOfficer}</b>, Grievance Officer
            <br />
            {brand.company}
            <br />
            {brand.address}
            <br />
            Phone: {brand.grievancePhone}
            {brand.email && <> · Email: {brand.email}</>}
          </p>
          <p>
            Any complaints or concerns regarding the processing of your personal data may be addressed to the Grievance
            Officer, who will acknowledge receipt within 24 hours and aim to resolve the grievance within 15 days. For the
            records of a particular mandi you can also contact that mandi's office (details are on its page on this
            website).
          </p>

          <h2>12. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. The latest version will always be on this page with the date at
            the top. If a change is important, we will also tell you in the app.
          </p>
        </div>
      </section>
    </>
  )
}