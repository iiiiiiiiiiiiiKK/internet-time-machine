import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import { I18nProvider } from './components/I18nProvider'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import SitePage from './pages/SitePage'
import SnapshotPage from './pages/SnapshotPage'
import ComparePage from './pages/ComparePage'
import ErasPage from './pages/ErasPage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'
import { useI18n } from './lib/i18n'

/** Scrolls to the top on navigation, except when a hash anchor is present. */
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash])
  return null
}

function Shell() {
  const { t } = useI18n()
  return (
    <div className="flex min-h-dvh flex-col bg-ink-950">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[80] focus:rounded focus:bg-signal focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:font-semibold focus:text-ink-950"
      >
        {t('nav.home')}
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/site/:domain" element={<SitePage />} />
          <Route path="/snapshot" element={<SnapshotPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/eras" element={<ErasPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Shell />
      </BrowserRouter>
    </I18nProvider>
  )
}