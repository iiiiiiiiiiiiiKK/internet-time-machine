import { useEffect } from 'react'
import { ExternalLink, ShieldCheck, TriangleAlert, Database, Code2 } from 'lucide-react'
import { Panel, SectionHeading } from '../components/ui'
import { useI18n } from '../lib/i18n'
import { ARCHIVE_TERMS, ARCHIVE_URL, AUTHOR_HANDLE, AUTHOR_X_URL, GITHUB_URL } from '../lib/constants'
import { GithubMark, XMark } from '../components/BrandIcons'

export default function AboutPage() {
  const { t, lang } = useI18n()

  useEffect(() => {
    document.title = `${t('about.title')} · Internet Time Machine`
  }, [t])

  const limits = [t('about.limits1'), t('about.limits2'), t('about.limits3'), t('about.limits4')]
  const stack = ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS', 'Cloudflare Pages Functions', 'Vitest', 'Playwright']

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <SectionHeading kicker="ABOUT" title={t('about.title')} lead={t('about.intro')} />

      <div className="mt-8 space-y-3">
        <Panel className="p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-paper-100">
            <Database className="h-4 w-4 text-signal/70" />
            {t('about.dataTitle')}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-paper-400">{t('about.dataBody')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={ARCHIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded border border-white/12 px-2.5 font-mono text-[10px] uppercase tracking-wider text-paper-300 hover:border-signal/40 hover:text-signal"
            >
              web.archive.org
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://web.archive.org/cdx/search/cdx?url=example.com&output=json&limit=5"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded border border-white/12 px-2.5 font-mono text-[10px] uppercase tracking-wider text-paper-300 hover:border-signal/40 hover:text-signal"
            >
              CDX Server
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href={ARCHIVE_TERMS}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded border border-white/12 px-2.5 font-mono text-[10px] uppercase tracking-wider text-paper-300 hover:border-signal/40 hover:text-signal"
            >
              {lang === 'zh' ? '使用条款' : 'Terms of use'}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </Panel>

        <Panel className="p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-paper-100">
            <TriangleAlert className="h-4 w-4 text-ember" />
            {t('about.limitsTitle')}
          </h2>
          <ul className="mt-3 space-y-2">
            {limits.map((line) => (
              <li key={line} className="flex gap-2 text-[13px] leading-relaxed text-paper-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ember/70" />
                {line}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-paper-100">
            <Code2 className="h-4 w-4 text-signal/70" />
            {t('about.stackTitle')}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-paper-400">{t('about.stackBody')}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stack.map((tech) => (
              <span
                key={tech}
                className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-paper-400"
              >
                {tech}
              </span>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-paper-100">
            <ShieldCheck className="h-4 w-4 text-signal/70" />
            {t('about.privacyTitle')}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-paper-400">{t('about.privacyBody')}</p>
        </Panel>

        <Panel className="p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-paper-100">
            <GithubMark className="h-4 w-4 text-signal/70" />
            {t('about.licenseTitle')}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-paper-400">{t('about.licenseBody')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded border border-white/12 px-2.5 font-mono text-[10px] uppercase tracking-wider text-paper-300 hover:border-signal/40 hover:text-signal"
            >
              <GithubMark className="h-3 w-3" />
              GitHub
            </a>
            <a
              href={`${GITHUB_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded border border-white/12 px-2.5 font-mono text-[10px] uppercase tracking-wider text-paper-300 hover:border-signal/40 hover:text-signal"
            >
              MIT License
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </Panel>

        <Panel className="p-5">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-500">{t('about.authorTitle')}</h2>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-white/12 text-paper-200">
                <XMark className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm text-paper-100">{AUTHOR_HANDLE}</p>
                <p className="font-mono text-[10px] text-paper-600">
                  {lang === 'zh' ? '项目作者' : 'Project author'}
                </p>
              </div>
            </div>
            <a
              href={AUTHOR_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded bg-signal px-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-950 hover:bg-signal/90"
            >
              <XMark className="h-3.5 w-3.5" />
              {t('author.follow')}
            </a>
          </div>
        </Panel>
      </div>

      <p className="mt-8 text-center font-mono text-[10px] leading-relaxed text-paper-600">{t('about.thanks')}</p>
    </div>
  )
}