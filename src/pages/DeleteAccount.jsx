import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { brand } from '../config'
import PageHead from '../components/PageHead'
import usePageTitle from '../components/usePageTitle'

// "Delete your account" page — required by Google Play for apps where users
// have an account. Public link (used in Google Play):
// https://www.digimandiconnect.com/delete-account
const UPDATED = '29 October 2026'

const TITLE = {
  mr: 'खाते हटवा',
  hi: 'खाता हटाएँ',
  en: 'Delete your account',
}

const SUMMARY = {
  mr: 'तुमचे DigiMandi खाते हटवण्यासाठी खालील फोन / WhatsApp नंबरवर तुमचा नोंदणीकृत मोबाईल नंबर कळवा, किंवा तुमच्या मंडी कार्यालयात संपर्क करा. 30 दिवसांत खाते हटवले जाईल. कायद्यानुसार ठेवावी लागणारी बिले ठराविक काळापर्यंत ठेवली जातील.',
  hi: 'अपना DigiMandi खाता हटाने के लिए नीचे दिए फ़ोन / WhatsApp नंबर पर अपना पंजीकृत मोबाइल नंबर बताएँ, या अपने मंडी कार्यालय से संपर्क करें। 30 दिनों में खाता हटा दिया जाएगा। कानून के अनुसार रखे जाने वाले बिल तय समय तक रखे जाएँगे।',
}

export default function DeleteAccount() {
  const { lang } = useLang()
  const title = TITLE[lang] || TITLE.en
  usePageTitle(title)
  return (
    <>
      <PageHead title={title} intro={`${brand.name} · Last updated: ${UPDATED}`} />
      <section className="section tight">
        <div className="wrap legal">
          {lang !== 'en' && SUMMARY[lang] && <div className="banner">{SUMMARY[lang]}</div>}

          <p>
            This page explains how to delete your {brand.name} account (the {brand.name} app by {brand.company}) and
            what happens to your data.
          </p>

          <h2>1. How to ask for deletion</h2>
          <p>Use any one of these:</p>
          <ul>
            <li>
              <b>Phone / WhatsApp:</b> call or send a WhatsApp message to {brand.phone} saying "Delete my DigiMandi
              account". Tell us your registered mobile number, your role (farmer, trader or staff) and your mandi name.
            </li>
            {brand.email && (
              <li>
                <b>Email:</b> write to <a href={`mailto:${brand.email}?subject=Delete my DigiMandi account`}>{brand.email}</a>{' '}
                with the same details.
              </li>
            )}
            <li>
              <b>Mandi office:</b> traders and staff can also ask their mandi office, which will pass the request to us.
            </li>
          </ul>
          <p>
            To protect you, we will confirm the request with your registered mobile number (for example by calling you or
            asking for an OTP) before deleting anything.
          </p>

          <h2>2. What is deleted</h2>
          <ul>
            <li>Your login account (mobile number login, Login ID and PIN).</li>
            <li>Your profile details, such as name and village, where the law does not require us to keep them.</li>
            <li>Any demo requests you sent through this website.</li>
          </ul>

          <h2>3. What is kept, and for how long</h2>
          <p>
            Bills, slips and payment records of trades you took part in are records of the mandi. Tax, accounting and market
            laws require the mandi to keep them for a fixed period, so they are kept for that period (and linked only to the
            name and mobile number on the bill), then deleted.
          </p>

          <h2>4. How long it takes</h2>
          <p>We confirm your request within 7 days and complete the deletion within 30 days.</p>

          <h2>5. Questions</h2>
          <p>
            See our <Link to="/privacy">Privacy Policy</Link> or contact the Grievance Officer: {brand.grievanceOfficer},{' '}
            {brand.company} · Phone: {brand.grievancePhone}.
          </p>
        </div>
      </section>
    </>
  )
}