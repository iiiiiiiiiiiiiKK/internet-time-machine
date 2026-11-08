import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, ExternalLink, Milestone } from 'lucide-react'
import { ERAS, findSite } from '../data/catalog'
import { SectionHeading } from '../components/ui'
import { useI18n } from '../lib/i18n'
import clsx from 'clsx'

const ERA_ACCENTS = [
  'from-white/[0.03] to-transparent',
  'from-amber-500/[0.045] to-transparent',
  'from-sky-500/[0.045] to-transparent',
  'from-emerald-500/[0.045] to-transparent',
  'from-violet-500/[0.045] to-transparent',
  'from-signal/[0.055] to-transparent',
]

export default function ErasPage() {
  const { t, lang } = useI18n()
  const location = useLocation()

  useEffect(() => {
    document.title = `${t('eras.title')} · Internet Time Machine`
  }, [t])

  // Honour deep links like /eras#era-web2
  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (!hash) return
    const el = document.getElementById(hash)
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }, [location.hash])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <SectionHeading kicker="CHRONOLOGY" title={t('eras.title')} lead={t('eras.lead')} />

      {/* Jump nav */}
      <div className="no-scrollbar mt-6 flex gap-1.5 overflow-x-auto pb-1">
        {ERAS.map((era) => (
          <a
            key={era.id}
            href={`#era-${era.id}`}
            className="shrink-0 rounded border border-white/10 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-paper-400 transition-colors hover:border-signal/40 hover:text-signal"
          >
            {lang === 'zh' ? era.rangeZh : era.rangeEn}
          </a>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {ERAS.map((era, i) => (
          <section
            key={era.id}
            id={`era-${era.id}`}
            className="scroll-mt-24 overflow-hidden rounded-lg border border-white/[0.08] bg-ink-900/50"
          >
            <div className={clsx('bg-gradient-to-br p-4 sm:p-6', ERA_ACCENTS[i])}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] text-paper-600">0{i + 1}</span>
                  <h2 className="text-xl font-semibold tracking-tight text-paper-50 sm:text-2xl">
                    {lang === 'zh' ? era.titleZh : era.titleEn}
                  </h2>
                </div>
                <span className="rounded border border-white/12 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-signal/80">
                  {lang === 'zh' ? era.rangeZh : era.rangeEn}
                </span>
              </div>

              <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-paper-400 sm:text-sm">
                {lang === 'zh' ? era.summaryZh : era.summaryEn}
              </p>

              <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
                {/* Milestones */}
                <div>
                  <h3 className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-paper-500">
                    <Milestone className="h-3 w-3" />
                    {t('eras.milestones')}
                  </h3>
                  <ul className="mt-2.5 space-y-2">
                    {era.facts.map((fact) => (
                      <li key={fact.year} className="flex gap-3">
                        <span className="w-11 shrink-0 font-mono text-[11px] tabular-nums text-signal/70">
                          {fact.year}
                        </span>
                        <span className="text-[13px] leading-relaxed text-paper-300">
                          {lang === 'zh' ? fact.zh : fact.en}
                          <a
                            href={fact.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={t('eras.source')}
                            aria-label={`${t('eras.source')}: ${fact.source}`}
                            className="ml-1.5 inline-flex translate-y-[1px] text-paper-600 transition-colors hover:text-signal"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Representative sites */}
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-500">
                    {t('eras.representative')}
                  </h3>
                  <ul className="mt-2.5 space-y-1">
                    {era.sites.map((d) => {
                      const site = findSite(d)
                      return (
                        <li key={d}>
                          <Link
                            to={`/site/${encodeURIComponent(d)}`}
                            className="group flex items-center justify-between rounded border border-transparent px-2 py-1.5 transition-colors hover:border-white/10 hover:bg-white/[0.03]"
                          >
                            <span className="flex min-w-0 items-baseline gap-2">
                              <span className="truncate text-[13px] text-paper-200">
                                {site ? (lang === 'zh' ? site.zhName : site.name) : d}
                              </span>
                              <span className="shrink-0 font-mono text-[10px] text-paper-600">{d}</span>
                            </span>
                            <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-paper-600 transition-colors group-hover:text-signal">
                              {t('eras.explore')}
                              <ArrowUpRight className="h-3 w-3" />
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 font-mono text-[10px] leading-relaxed text-paper-600">
        {lang === 'zh'
          ? '时间线事实均标注了可核查的原始来源；本站不编造网站上线年份或历史事件。'
          : 'Every milestone links to a verifiable primary source. This site does not invent launch years or historical events.'}
      </p>
    </div>
  )
}