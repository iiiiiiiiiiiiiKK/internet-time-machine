import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { ARCHIVE_TERMS, ARCHIVE_URL, AUTHOR_HANDLE, AUTHOR_X_URL, GITHUB_URL } from '../lib/constants'
import { XMark } from './BrandIcons'

/** Copyright year is derived once at module load; it is not render state. */
const BUILD_YEAR = new Date().getFullYear()

export default function Footer() {
  const { t, lang } = useI18n()
  const year = BUILD_YEAR

  return (
    <footer className="mt-auto border-t border-white/[0.07] bg-ink-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal/70">
              {t('footer.tagline')}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-paper-400">
              {lang === 'zh'
                ? '互联网时光机是一个开源的网页历史探索工具。它不存储网页、不生成截图，只把 Internet Archive 已经保存下来的东西原样呈现。'
                : 'Internet Time Machine is an open-source tool for exploring web history. It stores no pages and generates no screenshots — it surfaces exactly what the Internet Archive already saved.'}
            </p>
            <p className="mt-4 font-mono text-[11px] text-paper-600">{t('footer.builtWith')}</p>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper-500">
              {lang === 'zh' ? '导航' : 'Navigate'}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/explore" className="text-paper-300 transition-colors hover:text-signal">{t('nav.explore')}</Link></li>
              <li><Link to="/eras" className="text-paper-300 transition-colors hover:text-signal">{t('nav.eras')}</Link></li>
              <li><Link to="/compare" className="text-paper-300 transition-colors hover:text-signal">{t('nav.compare')}</Link></li>
              <li><Link to="/about" className="text-paper-300 transition-colors hover:text-signal">{t('nav.about')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper-500">
              {lang === 'zh' ? '链接' : 'Links'}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href={AUTHOR_X_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-paper-300 transition-colors hover:text-signal">
                  <XMark className="h-3.5 w-3.5" />
                  {AUTHOR_HANDLE}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-paper-300 transition-colors hover:text-signal">
                  {t('footer.source')}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href={ARCHIVE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-paper-300 transition-colors hover:text-signal">
                  {t('footer.archive')}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href={ARCHIVE_TERMS} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-paper-300 transition-colors hover:text-signal">
                  {t('footer.terms')}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.07] pt-6 font-mono text-[11px] text-paper-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Internet Time Machine · MIT License</p>
          <p className="text-paper-600">
            {lang === 'zh' ? '由' : 'Built by'}{' '}
            <a href={AUTHOR_X_URL} target="_blank" rel="noopener noreferrer" className="text-paper-400 underline decoration-dotted underline-offset-2 hover:text-signal">
              {AUTHOR_HANDLE}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}