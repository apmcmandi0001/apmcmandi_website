import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { brand } from '../config'
import PageHead from '../components/PageHead'
import usePageTitle from '../components/usePageTitle'

// Terms & Conditions of DigiMandi (website + app + web panels).
// Public link: https://www.digimandiconnect.com/terms
// Have this read once by a lawyer / CA before onboarding mandis.
const UPDATED = '29 October 2026'

export default function Terms() {
  const { t, lang } = useLang()
  usePageTitle(t.footer.terms)
  return (
    <>
      <PageHead title={t.footer.terms} intro={`Last updated: ${UPDATED}`} />
      <section className="section tight">
        <div className="wrap legal">
          {lang !== 'en' && (
            <div className="banner">
              या अटी सध्या इंग्रजीत आहेत. मराठी / हिंदी आवृत्ती लवकरच. · ये शर्तें अभी अंग्रेज़ी में हैं। मराठी / हिंदी संस्करण जल्द।
            </div>
          )}

          <p>
            These Terms & Conditions ("Terms") apply to the {brand.name} mobile app, this website
            (www.digimandiconnect.com) and the {brand.name} web panels (together, the "Services"), provided by{' '}
            {brand.company} ("we", "us", "our"). By using the Services you agree to these Terms and to our{' '}
            <Link to="/privacy">Privacy Policy</Link>. If you do not agree, please do not use the Services.
          </p>

          <h2>1. What DigiMandi is</h2>
          <p>
            {brand.name} is software that helps mandis (agricultural market yards) run gate entry, auctions, weighing,
            slips and billing. Each mandi runs its own market under its own licence, rules and laws. We provide the
            software only — we are not a party to any sale, purchase, auction or payment between farmers, brokers, buyers
            and the mandi.
          </p>

          <h2>2. Who can use it</h2>
          <p>
            You must be 18 years or older and take part in mandi trade (as a farmer, trader, mandi staff member or mandi
            admin) to use the Services.
          </p>

          <h2>3. Accounts and login</h2>
          <ul>
            <li>Farmers log in with their mobile number and an OTP.</li>
            <li>
              Traders and mandi staff log in with their mobile number and OTP, and a Login ID and PIN given by their mandi
              office.
            </li>
            <li>Keep your OTP, Login ID and PIN secret. Do not share your account.</li>
            <li>You are responsible for all entries made from your account. Tell your mandi office at once if you think someone else has used it.</li>
            <li>The mandi or we may disable an account that is misused, no longer licensed, or breaks these Terms.</li>
          </ul>

          <h2>4. Transactions, slips and bills</h2>
          <ul>
            <li>Auctions, weighing, charges, commissions and payments follow the rules of the mandi's licence and the law.</li>
            <li>
              Slips and bills in the Services are copies of the records kept by the mandi. If there is a difference, the
              mandi's official record applies. Report any mistake to the mandi office at once.
            </li>
            <li>
              Payments between farmers, brokers and buyers happen outside the Services (cash, RTGS, etc.). {brand.name} only
              records the payment mode and status; it does not hold or transfer money.
            </li>
          </ul>

          <h2>5. Market rates on this website</h2>
          <p>
            Rates are taken automatically from auctions held at the mandi and are shown for information only. Actual prices
            depend on the quality of the produce and the auction on the day. We are not responsible for decisions made only
            on the basis of rates shown here.
          </p>

          <h2>6. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>enter false or misleading information;</li>
            <li>try to see, change or delete other people's data without permission;</li>
            <li>disturb, overload, copy, reverse-engineer or attack the Services; or</li>
            <li>use the Services for anything unlawful.</li>
          </ul>

          <h2>7. Fees</h2>
          <p>
            The app is free to download for farmers and traders. Any fees for mandis are agreed separately in writing
            between the mandi and {brand.company}.
          </p>

          <h2>8. Our rights</h2>
          <p>
            The {brand.name} software, name, logo and design belong to {brand.company}. You get a limited, personal,
            non-transferable right to use the Services for mandi work. Data entered by a mandi and its users remains the
            mandi's and the users' data, handled as described in our <Link to="/privacy">Privacy Policy</Link>.
          </p>

          <h2>9. Availability and changes</h2>
          <p>
            We work to keep the Services available, secure and backed up, but we do not guarantee they will always be free
            of interruptions or errors, for example during maintenance or internet outages. We may improve, change or stop
            features from time to time.
          </p>

          <h2>10. Limitation of liability</h2>
          <p>
            The Services are provided "as is". To the extent allowed by law, {brand.company} is not liable for indirect or
            consequential losses, or for losses caused by wrong entries, disputes between users, decisions made using the
            Services, or events outside our reasonable control.
          </p>

          <h2>11. Ending your use</h2>
          <p>
            You can stop using the Services at any time and ask us to delete your account — see{' '}
            <Link to="/delete-account">Delete your account</Link>. Records that the law requires the mandi to keep will be
            kept for the legal period.
          </p>

          <h2>12. Changes to these Terms</h2>
          <p>
            We may update these Terms. The latest version will always be on this page with the date at the top. If you keep
            using the Services after a change, you accept the updated Terms.
          </p>

          <h2>13. Law and disputes</h2>
          <p>These Terms are governed by the laws of India. Courts at {brand.city} have jurisdiction.</p>

          <h2>14. Contact</h2>
          <p>
            {brand.company}
            <br />
            {brand.address}
            <br />
            Phone / WhatsApp: {brand.phone}
            {brand.email && <> · Email: {brand.email}</>}
          </p>
        </div>
      </section>
    </>
  )
}