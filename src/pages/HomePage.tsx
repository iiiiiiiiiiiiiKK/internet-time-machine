import { useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Dice5, ExternalLink, ShieldCheck } from 'lucide-react'
import SearchBox from '../components/SearchBox'
import { SectionHeading } from '../components/ui'
import { CURATED_DOMAINS, ERAS, SITE_CATALOG } from '../data/catalog'
import { useI18n } from '../lib/i18n'
import { AUTHOR_HANDLE, AUTHOR_X_URL } from '../lib/constants'
import { XMark } from '../components/BrandIcons'
import clsx from 'clsx'

const DECADES = ['1996', '2000', '2005', '2010', '2015', '2020', '2025']

export default function HomePage() {
  const { t, lang } = useI18n()
  const navigate = useNavigate()

  const featured = useMemo(() => SITE_CATALOG.slice(0, 8), [])
  const randomSite = useCallback(() => {
    const pick = CURATED_DOMAINS[Math.floor(Math.random() * CURATED_DOMAINS.length)]
    navigate(`/site/${encodeURIComponent(pick)}`)
  }, [navigate])

  return (
    <div className="flex flex-col">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.55]" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -left-40 top-[-18rem] h-[36rem] w-[36rem] rounded-full bg-signal/[0.05] blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-32 bottom-[-22rem] h-[34rem] w-[34rem] rounded-full bg-ember/[0.05] blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-signal/80 sm:text-[11px]">
            {t('hero.kicker')}
          </p>

          <h1 className="mt-5 max-w-4xl text-[2.6rem] font-semibold leading-[0.95] tracking-[-0.03em] text-paper-50 sm:text-6xl lg:text-7xl">
            <span className="block">{t('hero.title1')}</span>
            <span className="mt-1 block text-signal">
              {t('hero.title2')}
              <span className="ml-1 inline-block align-super text-[0.32em] text-signal/60">™</span>
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-paper-300 sm:text-base">
            {t('hero.lead')}
          </p>

          <div className="mt-8 max-w-2xl sm:mt-10">
            <SearchBox size="hero" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-600">
              {lang === 'zh' ? '快速时代' : 'Quick eras'}
            </span>
            {DECADES.map((d) => (
              <Link
                key={d}
                to={`/eras#era-${eraIdForDecade(d)}`}
                className="rounded border border-white/10 px-2 py-1 font-mono text-[10px] tabular-nums text-paper-400 transition-colors hover:border-signal/40 hover:text-signal"
              >
                {d}
              </Link>
            ))}
          </div>

          <p className="mt-5 flex items-start gap-2 font-mono text-[10px] leading-relaxed text-paper-600">
            <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-signal/50" aria-hidden="true" />
            {t('hero.accentNote')}
          </p>
        </div>

        <div className="relative overflow-hidden border-t border-white/[0.06] bg-ink-900/40 py-2.5" aria-hidden="true">
          <div className="marquee-track flex w-max gap-8 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.3em] text-paper-600">
            {Array.from({ length: 2 }).map((_, dup) => (
              <div key={dup} className="flex gap-8">
                {YEARR_STRIP.map((y, i) => (
                  <span key={`${dup}-${i}`} className={i % 7 === 0 ? 'text-signal/50' : undefined}>
                    {y}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Stats strip ---------------- */}
      <section className="border-b border-white/[0.06] bg-ink-950">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-white/[0.06] px-4 sm:px-6 lg:px-8">
          <StatCell value={String(SITE_CATALOG.length)} label={t('home.statsSites')} />
          <StatCell value="1996–2026" label={t('home.statsYears')} />
          <StatCell value="Internet Archive" label={t('home.statsSource')} small />
        </div>
      </section>

      {/* ---------------- Featured ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionHeading
          kicker="COLLECTION"
          title={t('home.featured')}
          lead={t('home.featuredLead')}
          action={
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-signal/80 transition-colors hover:text-signal"
            >
              {t('home.featuredAll')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />

        <div className="mt-7 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((site) => (
            <Link
              key={site.domain}
              to={`/site/${encodeURIComponent(site.domain)}`}
              className="group relative flex flex-col justify-between gap-6 overflow-hidden rounded-lg border border-white/[0.08] bg-ink-900/60 p-4 transition-all hover:-translate-y-0.5 hover:border-signal/35 hover:bg-ink-850"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/0 to-transparent transition-colors group-hover:via-signal/60" />
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-paper-100">{site.name}</h3>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-paper-700 transition-colors group-hover:text-signal/70" />
                </div>
                <p className="mt-0.5 font-mono text-[10px] text-paper-600">{site.domain}</p>
                <p className="mt-3 text-[13px] leading-relaxed text-paper-400">
                  {lang === 'zh' ? site.blurbZh : site.blurbEn}
                </p>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-paper-600">
                {eraLabel(site.era, lang)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Random ---------------- */}
      <section className="border-y border-white/[0.06] bg-gradient-to-b from-ink-900/60 to-ink-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-xl">
            <SectionHeading kicker="RANDOM TIME TRAVEL" title={t('home.randomTitle')} lead={t('home.randomLead')} />
          </div>
          <button
            type="button"
            onClick={randomSite}
            className="group inline-flex h-12 shrink-0 items-center justify-center gap-2.5 rounded-lg bg-signal px-6 font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-950 transition-all hover:bg-signal/90 active:scale-[0.985]"
          >
            <Dice5 className="h-4 w-4 transition-transform group-hover:rotate-12" />
            {t('home.randomCta')}
          </button>
        </div>
      </section>

      {/* ---------------- Eras ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionHeading kicker="CHRONOLOGY" title={t('home.erasTitle')} lead={t('home.erasLead')} />
        <div className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ERAS.map((era, i) => (
            <Link
              key={era.id}
              to={`/eras#era-${era.id}`}
              className="group flex flex-col gap-3 rounded-lg border border-white/[0.08] bg-ink-900/50 p-4 transition-colors hover:border-signal/30 hover:bg-ink-850"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] text-paper-600">0{i + 1}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-signal/60">
                  {lang === 'zh' ? era.rangeZh : era.rangeEn}
                </span>
              </div>
              <h3 className="text-[15px] font-semibold leading-snug text-paper-100">
                {lang === 'zh' ? era.titleZh : era.titleEn}
              </h3>
              <p className="line-clamp-3 text-[13px] leading-relaxed text-paper-500">
                {lang === 'zh' ? era.summaryZh : era.summaryEn}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- How it works + author ---------------- */}
      <section className="border-t border-white/[0.06] bg-ink-900/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <SectionHeading kicker="PIPELINE" title={t('home.howTitle')} />
          <div className="mt-7 grid gap-2.5 sm:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-lg border border-white/[0.08] bg-ink-950/60 p-4">
                <span className="font-mono text-[10px] text-signal/70">STEP {n}</span>
                <h3 className="mt-2 text-sm font-semibold text-paper-100">{t(`home.how${n}Title`)}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-paper-500">{t(`home.how${n}Body`)}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-lg border border-white/[0.08] bg-ink-950/60 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-paper-300">
                <XMark className="h-4 w-4" />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-600">{t('author.label')}</p>
                <p className="text-sm text-paper-200">
                  {lang === 'zh' ? '互联网时光机由' : 'Internet Time Machine is built by'}{' '}
                  <a
                    href={AUTHOR_X_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-signal underline decoration-dotted underline-offset-2 hover:text-signal/80"
                  >
                    {AUTHOR_HANDLE}
                  </a>
                </p>
              </div>
            </div>
            <a
              href={AUTHOR_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded border border-white/12 px-3 font-mono text-[11px] uppercase tracking-wider text-paper-300 transition-colors hover:border-signal/40 hover:text-signal"
            >
              <XMark className="h-3.5 w-3.5" />
              {t('author.follow')}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCell({ value, label, small }: { value: string; label: string; small?: boolean }) {
  return (
    <div className="px-1 py-5 text-center sm:px-4 sm:py-6">
      <p
        className={clsx(
          'font-mono tabular-nums text-paper-100',
          small ? 'text-[11px] sm:text-sm' : 'text-lg sm:text-2xl',
        )}
      >
        {value}
      </p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-paper-600 sm:text-[10px]">{label}</p>
    </div>
  )
}

function eraLabel(id: string, lang: string) {
  const era = ERAS.find((e) => e.id === id)
  if (!era) return ''
  return `${lang === 'zh' ? era.titleZh : era.titleEn} · ${lang === 'zh' ? era.rangeZh : era.rangeEn}`
}

function eraIdForDecade(decade: string) {
  const year = Number(decade)
  if (year < 2000) return 'dawn'
  if (year <= 2005) return 'portal'
  if (year <= 2010) return 'web2'
  if (year <= 2015) return 'mobile'
  if (year <= 2020) return 'platform'
  return 'ai'
}

const YEARR_STRIP = [
  '1996', '1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005',
  '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015',
  '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026',
]
