import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, ArrowRight, Copy, ExternalLink, RefreshCw, Share2 } from 'lucide-react'
import Timeline from '../components/Timeline'
import { EmptyState, Panel, SkeletonRows } from '../components/ui'
import { useSiteHistory, type YearState } from '../hooks/useSiteHistory'
import { useI18n } from '../lib/i18n'
import { formatCompact, formatDateHuman, normalizeInput, tsToIsoDate } from '../lib/format'
import { archiveOpenUrl } from '../lib/wayback'
import { findSite } from '../data/catalog'
import { AUTHOR_HANDLE, AUTHOR_X_URL } from '../lib/constants'
import { XMark } from '../components/BrandIcons'
import clsx from 'clsx'

export default function SitePage() {
  const { domain: rawDomain } = useParams<{ domain: string }>()
  const { t, lang } = useI18n()
  const [params, setParams] = useSearchParams()

  const target = useMemo(() => normalizeInput(decodeURIComponent(rawDomain ?? '')), [rawDomain])
  const domain = target.ok ? target.display : null
  const { state, retry, retryYear } = useSiteHistory(domain)

  const requestedYear = Number(params.get('year') ?? '') || null
  const [selectedYear, setSelectedYear] = useState<number | null>(requestedYear)

  const site = domain ? findSite(domain) : undefined

  useEffect(() => {
    document.title = domain ? `${domain} · Internet Time Machine` : 'Internet Time Machine'
  }, [domain])

  // Adopt the requested year once the range is known, otherwise default to the
  // newest year that actually has archives. Derived during render so no
  // state-syncing effect is needed.
  const effectiveYear = selectedYear ?? pickInitialYear(requestedYear, state.years)

  const onSelectYear = (year: number) => {
    setSelectedYear(year)
    const next = new URLSearchParams(params)
    next.set('year', String(year))
    setParams(next, { replace: true })
  }

  const selected = state.years.find((y) => y.year === effectiveYear) ?? null
  const originalUrl = target.ok ? target.url : `https://${domain ?? ''}/`

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/explore?url=${encodeURIComponent(domain ?? '')}`}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-paper-500 transition-colors hover:text-signal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('explore.title')}
        </Link>
        <Link
          to={`/compare?url=${encodeURIComponent(domain ?? '')}`}
          className="inline-flex items-center gap-1.5 rounded border border-white/10 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-paper-400 transition-colors hover:border-signal/40 hover:text-signal"
        >
          {t('nav.compare')}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate font-mono text-2xl tracking-tight text-paper-50 sm:text-3xl">{domain ?? '—'}</h1>
          {site && (
            <p className="mt-1 text-sm text-paper-400">
              <span className="text-paper-200">{lang === 'zh' ? site.zhName : site.name}</span>
              <span className="mx-2 text-paper-700">·</span>
              <span className="text-[13px] leading-relaxed">{lang === 'zh' ? site.blurbZh : site.blurbEn}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={retry}
            className="inline-flex h-9 items-center gap-1.5 rounded border border-white/12 px-3 font-mono text-[11px] uppercase tracking-wider text-paper-300 transition-colors hover:border-signal/40 hover:text-signal"
          >
            <RefreshCw className={clsx('h-3.5 w-3.5', state.phase === 'years' && 'animate-spin')} />
            {t('common.retry')}
          </button>
        </div>
      </div>

      {!target.ok && (
        <div className="mt-8">
          <EmptyState
            icon={<AlertTriangle className="h-8 w-8 text-ember" />}
            title={t(`error.${target.reason}`)}
            action={
              <Link to="/" className="mt-2 font-mono text-[11px] uppercase tracking-wider text-signal">
                {t('nav.home')}
              </Link>
            }
          />
        </div>
      )}

      {target.ok && state.phase === 'empty' && (
        <div className="mt-8">
          <EmptyState icon={<AlertTriangle className="h-8 w-8" />} title={t('error.none')} body={t('error.noneHint')} />
        </div>
      )}

      {target.ok && state.phase === 'error' && (
        <div className="mt-8">
          <EmptyState
            icon={<AlertTriangle className="h-8 w-8 text-ember" />}
            title={t(`error.${state.error ?? 'unknown'}`)}
            action={
              <button
                type="button"
                onClick={retry}
                className="mt-2 inline-flex h-9 items-center gap-1.5 rounded bg-signal px-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-950"
              >
                {t('error.retry')}
              </button>
            }
          />
        </div>
      )}

      {target.ok && state.phase !== 'empty' && state.phase !== 'error' && (
        <>
          {/* Mini stats */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MiniStat label={t('explore.earliest')} value={state.first ? tsToIsoDate(state.first) : '—'} />
            <MiniStat label={t('explore.latest')} value={state.last ? tsToIsoDate(state.last) : '—'} />
            <MiniStat label={t('explore.totalDays')} value={state.total > 0 ? formatCompact(state.totalDays) : '—'} />
            <MiniStat
              label={t('explore.resolved')}
              value={state.total > 0 ? `${state.resolved}/${state.total}` : '—'}
            />
          </div>

          <div className="mt-8">
            {state.years.length === 0 ? (
              <SkeletonRows rows={2} />
            ) : (
              <Timeline
                years={state.years}
                selectedYear={effectiveYear}
                onSelectYear={onSelectYear}
                onRetryYear={retryYear}
                earliestYear={state.earliestYear}
                latestYear={state.latestYear}
                loading={state.phase === 'years' || state.phase === 'bounds'}
              />
            )}
          </div>

          {/* Day picker + share */}
          {selected && (
            <div className="mt-8 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
              <DayPicker
                year={selected.year}
                days={selected.days}
                status={selected.status}
                domain={domain ?? ''}
                originalUrl={originalUrl}
                onRetry={() => retryYear(selected.year)}
              />
              <ShareCard domain={domain ?? ''} timestamp={selected.days[0] ?? null} />
            </div>
          )}

          <p className="mt-8 flex items-center gap-2 font-mono text-[10px] text-paper-600">
            <span>{t('explore.source')}</span>
            <a
              href="https://web.archive.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-2 hover:text-signal"
            >
              web.archive.org
            </a>
          </p>
        </>
      )}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Panel className="px-3 py-2.5">
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper-600">{label}</p>
      <p className="mt-0.5 truncate font-mono text-[13px] tabular-nums text-paper-100">{value}</p>
    </Panel>
  )
}

function DayPicker({
  year,
  days,
  status,
  domain,
  originalUrl,
  onRetry,
}: {
  year: number
  days: string[]
  status: 'pending' | 'loading' | 'done' | 'failed'
  domain: string
  originalUrl: string
  onRetry: () => void
}) {
  const { t, lang } = useI18n()
  const [showAll, setShowAll] = useState(false)

  if (status === 'failed') {
    return (
      <Panel className="p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ember">{t('site.yearFailed')}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex h-8 items-center gap-1.5 rounded border border-white/12 px-2.5 font-mono text-[11px] uppercase tracking-wider text-paper-300 hover:border-signal/40 hover:text-signal"
        >
          <RefreshCw className="h-3 w-3" />
          {t('site.reload')}
        </button>
      </Panel>
    )
  }

  if (status !== 'done') {
    return (
      <Panel className="p-4">
        <SkeletonRows rows={2} />
      </Panel>
    )
  }

  if (days.length === 0) {
    return (
      <Panel className="p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper-600">{t('site.noYearData')}</p>
        <p className="mt-1.5 text-[13px] text-paper-500">
          {lang === 'zh' ? '试试相邻的年份，通常会有存档。' : 'Try an adjacent year — archives usually exist there.'}
        </p>
      </Panel>
    )
  }

  const visible = showAll ? days : days.slice(0, 24)

  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal/80">
          {t('site.pickDate')} · {year}
        </h3>
        <span className="font-mono text-[10px] text-paper-600">
          {days.length} {t('explore.days')}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {visible.map((day) => (
          <Link
            key={day}
            to={`/snapshot?url=${encodeURIComponent(domain)}&ts=${day}000000&u=${encodeURIComponent(originalUrl)}`}
            className="group flex items-center gap-1.5 rounded border border-white/10 px-2 py-1.5 font-mono text-[10px] tabular-nums text-paper-300 transition-colors hover:border-signal/50 hover:bg-signal/10 hover:text-signal sm:text-[11px]"
          >
            <span>{`${day.slice(4, 6)}-${day.slice(6, 8)}`}</span>
            <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>

      {days.length > 24 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 font-mono text-[10px] uppercase tracking-wider text-paper-500 underline decoration-dotted underline-offset-2 hover:text-signal"
        >
          {showAll
            ? lang === 'zh'
              ? '收起'
              : 'Show less'
            : lang === 'zh'
              ? `显示全部 ${days.length} 天`
              : `Show all ${days.length} days`}
        </button>
      )}

      {days.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
          <Link
            to={`/snapshot?url=${encodeURIComponent(domain)}&ts=${days[0]}000000&u=${encodeURIComponent(originalUrl)}`}
            className="inline-flex h-8 items-center gap-1.5 rounded bg-signal px-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-950 hover:bg-signal/90"
          >
            {t('site.openSnapshot')}
            <ArrowRight className="h-3 w-3" />
          </Link>
          <a
            href={archiveOpenUrl(`${days[days.length - 1]}000000`, originalUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded border border-white/12 px-2.5 font-mono text-[10px] uppercase tracking-wider text-paper-300 hover:border-signal/40 hover:text-signal"
          >
            {t('snapshot.openArchive')}
            <ExternalLink className="h-3 w-3" />
          </a>
          <span className="font-mono text-[10px] text-paper-600">
            {t('site.firstOfYear')}: {formatDateHuman(`${days[0]}000000`, lang)}
          </span>
        </div>
      )}
    </Panel>
  )
}

function ShareCard({ domain, timestamp }: { domain: string; timestamp: string | null }) {
  const { t, lang } = useI18n()
  const [copied, setCopied] = useState(false)

  const shareUrl = timestamp
    ? `${window.location.origin}/snapshot?url=${encodeURIComponent(domain)}&ts=${timestamp}000000`
    : `${window.location.origin}/site/${encodeURIComponent(domain)}`

  const shareText = timestamp
    ? `${domain} on ${formatDateHuman(`${timestamp}000000`, lang)} — via Internet Time Machine`
    : `${domain} — Internet Time Machine`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard can be blocked (insecure context / user denial). Present the
      // URL for manual copy rather than claiming success.
      window.prompt(t('site.copyLink'), shareUrl)
    }
  }

  return (
    <Panel className="flex flex-col justify-between gap-3 p-4">
      <div>
        <h3 className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-signal/80">
          <Share2 className="h-3.5 w-3.5" />
          {t('site.shareTitle')}
        </h3>
        <p className="mt-2 break-all font-mono text-[10px] leading-relaxed text-paper-500">{shareUrl}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-8 items-center gap-1.5 rounded border border-white/12 px-2.5 font-mono text-[10px] uppercase tracking-wider text-paper-300 transition-colors hover:border-signal/40 hover:text-signal"
        >
          <Copy className="h-3 w-3" />
          {copied ? t('site.copied') : t('site.copyLink')}
        </button>
        <a
          href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&via=${AUTHOR_HANDLE.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded border border-white/12 px-2.5 font-mono text-[10px] uppercase tracking-wider text-paper-300 transition-colors hover:border-signal/40 hover:text-signal"
        >
          <XMark className="h-3 w-3" />
          {t('site.shareX')}
        </a>
        <a
          href={AUTHOR_X_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1 rounded px-1.5 font-mono text-[10px] text-paper-600 hover:text-signal"
          title={`${t('author.follow')} ${AUTHOR_HANDLE}`}
        >
          {AUTHOR_HANDLE}
        </a>
      </div>
    </Panel>
  )
}

/**
 * Chooses which year the timeline should open on when the user has not picked
 * one yet: honour an explicit `?year=` (if in range), otherwise the newest year
 * that actually has archives, otherwise the last year in the span.
 */
function pickInitialYear(requested: number | null, years: YearState[]): number | null {
  if (years.length === 0) return null
  if (requested != null && years.some((y) => y.year === requested)) return requested
  for (let i = years.length - 1; i >= 0; i -= 1) {
    const y = years[i]
    if (y.status === 'done' && y.days.length > 0) return y.year
  }
  return years[years.length - 1].year
}
