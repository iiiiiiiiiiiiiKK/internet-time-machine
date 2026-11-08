import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Languages, Menu, X } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { AUTHOR_HANDLE, AUTHOR_X_URL, GITHUB_URL } from '../lib/constants'
import { GithubMark, XMark } from './BrandIcons'
import clsx from 'clsx'

/** Re-exported for the many components that reference the author mark. */
export { XMark } from './BrandIcons'

const NAV = [
  { to: '/', key: 'nav.home' },
  { to: '/explore', key: 'nav.explore' },
  { to: '/eras', key: 'nav.eras' },
  { to: '/compare', key: 'nav.compare' },
  { to: '/about', key: 'nav.about' },
] as const

export default function Header() {
  const { t, lang, setLang } = useI18n()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [lastPath, setLastPath] = useState(location.pathname)

  // Close the drawer when the route changes. Adjusting state during render is
  // the documented alternative to a state-syncing effect.
  const currentPath = location.pathname
  if (currentPath !== lastPath) {
    setLastPath(currentPath)
    setOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 border-b transition-colors duration-300',
        scrolled
          ? 'border-white/10 bg-ink-950/90 backdrop-blur-xl'
          : 'border-transparent bg-ink-950/60 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 pt-safe sm:h-16 sm:gap-5 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-signal"
          aria-label={t('brand.name')}
        >
          <span className="relative grid h-8 w-8 place-items-center rounded border border-signal/40 bg-signal/10">
            <span className="font-mono text-[11px] font-bold tracking-tighter text-signal">TM</span>
            <span className="absolute inset-0 rounded border border-signal/0 transition-colors group-hover:border-signal/40" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-mono text-[13px] font-semibold tracking-tight text-paper-100 sm:text-sm">
              {t('brand.name')}
            </span>
            <span className="mt-0.5 hidden font-mono text-[10px] uppercase tracking-[0.18em] text-paper-500 sm:block">
              {t('brand.nameEn')}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'rounded px-2.5 py-1.5 font-mono text-[12px] uppercase tracking-[0.12em] transition-colors',
                  isActive
                    ? 'bg-white/10 text-signal'
                    : 'text-paper-400 hover:bg-white/5 hover:text-paper-100',
                )
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Author X link — required top-level element */}
          <a
            href={AUTHOR_X_URL}
            target="_blank"
            rel="noopener noreferrer"
            title={`${t('author.follow')} ${AUTHOR_HANDLE}`}
            aria-label={`${t('author.label')} ${AUTHOR_HANDLE}`}
            className="group flex items-center gap-1.5 rounded border border-white/10 bg-white/[0.03] px-2 py-1.5 text-paper-300 transition-colors hover:border-signal/40 hover:bg-signal/10 hover:text-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
          >
            <XMark className="h-3.5 w-3.5" />
            <span className="hidden font-mono text-[11px] tracking-tight sm:inline">{AUTHOR_HANDLE}</span>
          </a>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hidden h-8 w-8 place-items-center rounded border border-white/10 text-paper-400 transition-colors hover:border-white/25 hover:text-paper-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal sm:grid"
          >
            <GithubMark className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            aria-label={t('nav.langToggle')}
            title={t('nav.langToggle')}
            className="flex h-8 items-center gap-1 rounded border border-white/10 px-2 font-mono text-[11px] uppercase tracking-wider text-paper-300 transition-colors hover:border-signal/40 hover:text-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{lang === 'zh' ? 'EN' : '中文'}</span>
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t('nav.close') : t('nav.menu')}
            aria-expanded={open}
            aria-controls="itm-mobile-drawer"
            className="grid h-8 w-8 place-items-center rounded border border-white/10 text-paper-300 transition-colors hover:text-paper-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="itm-mobile-drawer"
        className={clsx(
          'overflow-hidden border-t border-white/10 bg-ink-950/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 lg:hidden',
          open ? 'max-h-[70vh] opacity-100' : 'invisible max-h-0 opacity-0',
        )}
        aria-hidden={!open}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 pb-safe pt-4" aria-label="Mobile">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'rounded px-3 py-3 font-mono text-sm uppercase tracking-[0.14em] transition-colors',
                  isActive ? 'bg-signal/10 text-signal' : 'text-paper-300 hover:bg-white/5',
                )
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
          <a
            href={AUTHOR_X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 rounded border border-white/10 px-3 py-3 font-mono text-sm text-paper-300"
          >
            <XMark className="h-4 w-4" />
            {AUTHOR_HANDLE}
          </a>
        </nav>
      </div>
    </header>
  )
}
