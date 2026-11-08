import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, CalendarClock, History, Layers, AlertTriangle, RefreshCw } from 'lucide-react'
import SearchBox from '../components/SearchBox'
import { EmptyState, Panel, SectionHeading, SkeletonRows } from '../components/ui'
import { useSiteHistory } from '../hooks/useSiteHistory'
import { useI18n } from '../lib/i18n'
import { formatCompact, normalizeInput, tsToIsoDate } from '../lib/format'
import clsx from 'clsx'

export default function ExplorePage() {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const raw = params.get('url') ?? ''

  const target = useMemo(() => normalizeInput(raw), [raw])
  const domain = target.ok ? target.display : null
  const { state, retry } = useSiteHistory(domain)

  // Keep the URL honest: if someone lands on /explore without a query, that is
  // a legitimate empty state, not an error page.
  useEffect(() => {
    document.title = domain
      ? `${domain} · ${t('explore.title')} · Internet Time Machine`
      : `${t('nav.explore')} · Internet Time Machine`
  }, [domain, t])

  const doneYears = state.years.filter((y) => y.status === 'done')
  const failedYears = state.years.filter((y) => y.status === 'failed')
  const span = state.earliestYear && state.latestYear ? state.latestYear - state.earliestYear + 1 : 0

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <SectionHeading
        kicker="ARCHIVE LOOKUP"
        title={t('explore.title')}
        lead={t('explore.source')}
      />

      <div className="mt-6 max-w-2xl">
        <SearchBox initialValue={domain ?? raw} size="compact" />
      </div>

      {!raw && (
        <div className="mt-8">
          <EmptyState
            icon={<History className="h-8 w-8" />}
            title={lang === 'zh' ? '还没有检索目标' : 'No target yet'}
            body={
              lang === 'zh'
                ? '在上面输入一个域名开始检索，或者从首页的精选站点挑一个。'
                : 'Enter a domain above to begin, or pick a curated site from the home page.'
            }
            action={
              <Link
                to="/"
                className="mt-2 inline-flex h-9 items-center gap-1.5 rounded border border-white/12 px-3 font-mono text-[11px] uppercase tracking-wider text-paper-300 transition-colors hover:border-signal/40 hover:text-signal"
              >
                {t('nav.home')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
        </div>
      )}

      {raw && !target.ok && (
        <div className="mt-8">
          <EmptyState
            icon={<AlertTriangle className="h-8 w-8 text-ember" />}
            title={t(`error.${target.reason}`)}
            body={lang === 'zh' ? '请检查输入后重试。' : 'Check the input and try again.'}
          />
        </div>
      )}

      {target.ok && (
        <>
          {/* Summary header */}
          <Panel className="mt-8 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-600">{t('explore.for')}</p>
                <h2 className="mt-1 truncate font-mono text-lg text-paper-50 sm:text-xl">{target.display}</h2>
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
                <Link
                  to={`/site/${encodeURIComponent(target.display)}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded bg-signal px-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-950 transition-colors hover:bg-signal/90"
                >
                  {t('explore.openSite')}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/[0.06] pt-4 sm:grid-cols-4">
              <Metric
                label={t('explore.earliest')}
                value={state.first ? tsToIsoDate(state.first) : '—'}
                loading={state.phase === 'bounds'}
              />
              <Metric
                label={t('explore.latest')}
                value={state.last ? tsToIsoDate(state.last) : '—'}
                loading={state.phase === 'bounds'}
              />
              <Metric
                label={t('explore.totalDays')}
                value={state.total > 0 ? formatCompact(state.totalDays) : '—'}
                loading={state.phase === 'years'}
                hint={state.total > 0 ? `${state.resolved}/${state.total} ${t('explore.resolved')}` : undefined}
              />
              <Metric
                label={t('explore.span')}
                value={span > 0 ? `${span}` : '—'}
                loading={state.phase === 'bounds'}
                hint={span > 0 ? (lang === 'zh' ? '年' : 'years') : undefined}
              />
            </div>
          </Panel>

          {state.phase === 'empty' && (
            <div className="mt-6">
              <EmptyState
                icon={<History className="h-8 w-8" />}
                title={t('error.none')}
                body={t('error.noneHint')}
              />
            </div>
          )}

          {state.phase === 'error' && (
            <div className="mt-6">
              <EmptyState
                icon={<AlertTriangle className="h-8 w-8 text-ember" />}
                title={t(`error.${state.error ?? 'unknown'}`)}
                body={lang === 'zh' ? '可以稍后重试，或换一个域名。' : 'Retry later, or try a different domain.'}
                action={
                  <button
                    type="button"
                    onClick={retry}
                    className="mt-2 inline-flex h-9 items-center gap-1.5 rounded bg-signal px-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-950"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t('error.retry')}
                  </button>
                }
              />
            </div>
          )}

          {/* Yearly coverage grid */}
          {state.years.length > 0 && (
            <section className="mt-8">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal/80">
                    {t('explore.coverage')}
                  </h3>
                  <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-paper-500">
                    {t('explore.coverageLead')}
                  </p>
                </div>
                {failedYears.length > 0 && (
                  <span className="shrink-0 font-mono text-[10px] text-ember">
                    {failedYears.length} × {t('site.yearFailed')}
                  </span>
                )}
              </div>

              <CoverageGrid
                years={state.years}
                onPick={(year) => navigate(`/site/${encodeURIComponent(target.display)}?year=${year}`)}
              />

              {failedYears.length > 0 && (
                <p className="mt-3 font-mono text-[10px] text-paper-600">{t('explore.partial')}</p>
              )}

              {state.phase === 'years' && doneYears.length === 0 && (
                <div className="mt-4">
                  <SkeletonRows rows={3} />
                </div>
              )}
            </section>
          )}

          {/* Fallback: while the index is still streaming, show a compact log */}
          {state.phase === 'years' && doneYears.length > 0 && (
            <div className="mt-6 flex items-center gap-2 font-mono text-[11px] text-paper-500">
              <CalendarClock className="h-3.5 w-3.5 animate-pulse text-signal/60" />
              {t('loading.archive')} · {state.resolved}/{state.total}
            </div>
          )}

          <div className="mt-10 grid gap-2 sm:grid-cols-2">
            <Link
              to={`/site/${encodeURIComponent(target.display)}`}
              className="group flex items-center justify-between rounded-lg border border-white/[0.08] bg-ink-900/50 p-4 transition-colors hover:border-signal/30"
            >
              <div className="flex items-center gap-3">
                <CalendarClock className="h-4 w-4 text-signal/70" />
                <div>
                  <p className="text-sm text-paper-100">{t('site.timeline')}</p>
                  <p className="font-mono text-[10px] text-paper-600">{t('explore.openSite')}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-paper-600 transition-colors group-hover:text-signal" />
            </Link>

            <Link
              to={`/compare?url=${encodeURIComponent(target.display)}`}
              className="group flex items-center justify-between rounded-lg border border-white/[0.08] bg-ink-900/50 p-4 transition-colors hover:border-signal/30"
            >
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-signal/70" />
                <div>
                  <p className="text-sm text-paper-100">{t('compare.title')}</p>
                  <p className="font-mono text-[10px] text-paper-600">{t('compare.lead')}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-paper-600 transition-colors group-hover:text-signal" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

function Metric({
  label,
  value,
  loading,
  hint,
}: {
  label: string
  value: string
  loading?: boolean
  hint?: string
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper-600">{label}</p>
      <p className={clsx('mt-1 font-mono text-sm tabular-nums sm:text-base', loading ? 'animate-pulse text-paper-600' : 'text-paper-100')}>
        {loading ? '……' : value}
      </p>
      {hint && <p className="mt-0.5 font-mono text-[10px] text-paper-600">{hint}</p>}
    </div>
  )
}

function CoverageGrid({
  years,
  onPick,
}: {
  years: { year: number; days: string[]; status: 'pending' | 'loading' | 'done' | 'failed' }[]
  onPick: (year: number) => void
}) {
  const max = years.reduce((m, y) => Math.max(m, y.days.length), 1)

  return (
    <div className="mt-3 grid grid-cols-6 gap-1 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16">
      {years.map((y) => {
        const ratio = y.days.length / max
        const failed = y.status === 'failed'
        const empty = y.status === 'done' && y.days.length === 0
        const pending = y.status === 'pending' || y.status === 'loading'
        return (
          <button
            key={y.year}
            type="button"
            onClick={() => onPick(y.year)}
            title={`${y.year} · ${failed ? 'failed' : pending ? '…' : `${y.days.length}`}`}
            className={clsx(
              'group relative flex aspect-square flex-col items-center justify-center rounded border transition-all',
              failed
                ? 'border-ember/40 bg-ember/10 hover:border-ember/70'
                : empty || pending
                  ? 'border-white/[0.06] bg-white/[0.02] hover:border-white/20'
                  : 'border-signal/25 hover:border-signal/70',
            )}
            style={
              !failed && !empty && !pending
                ? { backgroundColor: `rgba(215, 255, 58, ${0.08 + ratio * 0.42})` }
                : undefined
            }
          >
            <span
              className={clsx(
                'font-mono text-[9px] tabular-nums sm:text-[10px]',
                failed ? 'text-ember' : empty || pending ? 'text-paper-600' : 'text-ink-950/80',
              )}
            >
              {String(y.year).slice(2)}
            </span>
          </button>
        )
      })}
    </div>
  )
}