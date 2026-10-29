// =============================================================================
// ✏️  EDIT THIS FILE for the software brand and YOUR company's contact details.
// These details appear on the website, the Privacy Policy, the Terms and the
// Delete Account page. Each mandi's own details (name, address, phone, hours…)
// come from the DigiMandi database ("mandi" table) — edit them in the admin
// panel, not here.
// =============================================================================

export const brand = {
  name: 'DigiMandi', // brand name shown on the website (header, footer, titles, terms)
  tagline: {
    mr: 'खाजगी बाजार समित्यांसाठी संपूर्ण डिजिटल प्रणाली',
    hi: 'निजी मंडियों के लिए पूरी डिजिटल प्रणाली',
    en: 'The complete digital system for private market yards',
  },

  // Your company (the software provider)
  company: 'Cubicle Ventures Private Limited', // parent company of DigiMandi
  phone: '+91 97027 28298', // support phone shown to the public
  phoneDial: '+919702728298', // same number, no spaces
  whatsapp: '919702728298', // country code + number, no "+" or spaces
  email: '', // support email — leave '' to hide it everywhere on the website
  city: 'Yavatmal, Maharashtra', // used for "courts at …" in the Terms
  address: 'C/o Rajesh Devichand Bora, House No. 183, Gandhi Nagar, Yavatmal Town, Yavatmal – 445001, Maharashtra',
  grievanceOfficer: 'Rushabh Bora', // Grievance Officer (IT Act 2000, SPDI Rules 2011, DPDP Act 2023)
  grievancePhone: '+91 98901 78904',

  // Play Store link of the app, when published
  playStoreUrl: '',

  // Social links — leave '' to hide an icon
  social: {
    youtube: '',
    facebook: '',
    instagram: '',
    linkedin: '',
  },
}

// Connection to the DigiMandi API (api.digimandiconnect.com, hosted on AWS).
// The names say "supabase" only because the app uses the supabase-js library.
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
}