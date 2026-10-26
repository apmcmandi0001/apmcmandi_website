import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Mandis from './pages/Mandis'
import MandiPage from './pages/MandiPage'
import MandiRates from './pages/MandiRates'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import TraderPortal from './pages/TraderPortal'
import FarmerEntry from './pages/FarmerEntry'
import NotFound from './pages/NotFound'

/** Go to the top on every new page, or to #section when the link has one */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const timer = setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 60)
      return () => clearTimeout(timer)
    }
    window.scrollTo(0, 0)
    return undefined
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mandis" element={<Mandis />} />
          <Route path="/m/:slug" element={<MandiPage />} />
          <Route path="/m/:slug/rates" element={<MandiRates />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/trader" element={<TraderPortal />} />
          {/* old link: Broker Login now lives inside Trader Login */}
          <Route path="/broker" element={<Navigate to="/trader" replace />} />
          <Route path="/entry/:code" element={<FarmerEntry />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
