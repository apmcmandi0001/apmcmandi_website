// Firebase (only used for the SMS OTP on the Trader login page).
// Same Firebase project as the app ("apmc-mandi", web settings from
// lib/firebase_options.dart). These web keys are public by design — Firebase
// protects them with "Authorized domains", so they are safe in website code.
// A .env value (VITE_FIREBASE_...) overrides the built-in value if you set one.
// Loaded only when someone opens the Trader login, so other pages stay fast.

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAvHzI4nITmHx4GEDlQXFzZGsOLr2rom_Q',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'apmc-mandi.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'apmc-mandi',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:934829399750:web:359b1362cb6b841a1341c7',
  messagingSenderId: '934829399750',
  storageBucket: 'apmc-mandi.firebasestorage.app',
}

export const firebaseReady = Boolean(config.apiKey && config.projectId && config.appId)

let cached = null

/** Returns { auth, RecaptchaVerifier, signInWithPhoneNumber, signOut } */
export async function getFirebase() {
  if (!firebaseReady) throw new Error('firebase_not_configured')
  if (cached) return cached
  const [{ initializeApp, getApps }, authLib] = await Promise.all([import('firebase/app'), import('firebase/auth')])
  const app = getApps().length ? getApps()[0] : initializeApp(config)
  const auth = authLib.getAuth(app)
  cached = {
    auth,
    RecaptchaVerifier: authLib.RecaptchaVerifier,
    signInWithPhoneNumber: authLib.signInWithPhoneNumber,
    signOut: authLib.signOut,
  }
  return cached
}
