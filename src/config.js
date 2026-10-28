// =============================================================================
// ✏️  EDIT THIS FILE for the software brand and YOUR company's contact details.
// Each mandi's own details (name, address, phone, hours…) come from the
// Supabase "mandi" table — edit them there, not here.
// =============================================================================

export const brand = {
  name: 'DigiMandi', // brand name shown on the website (header, footer, titles, terms)
  tagline: {
    mr: 'खाजगी बाजार समित्यांसाठी संपूर्ण डिजिटल प्रणाली',
    hi: 'निजी मंडियों के लिए पूरी डिजिटल प्रणाली',
    en: 'The complete digital system for private market yards',
  },

  // Your company (the software provider) — TODO: replace placeholders
  company: 'Cubicle Ventures Private Limited', // parent company of DigiMandi
  phone: '+91 00000 00000',
  phoneDial: '+910000000000',
  whatsapp: '910000000000', // country code + number, no "+" or spaces
  email: 'hello@example.com',
  city: 'Yavatmal, Maharashtra',

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

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
}