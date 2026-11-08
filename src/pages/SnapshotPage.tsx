import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarDays, ExternalLink, History } from 'lucide-react'
import SnapshotFrame from '../components/SnapshotFrame'
import { EmptyState, Panel } from '../components/ui'
import { useI18n } from '../lib/i18n'
import { formatDateHuman, normalizeInput, tsToIsoDate } from '../lib/format'
import { fetchYearDaysSafe } from '../lib/wayback'
import { findSite } from '../data/catalog'
import clsx from 'clsx'

interface Neighbors {
  prev: string | null
  next: string | null
  loading: boolean
}

/**
 * Finds the neighbouring archived *days* for a snapshot.
 *
 * We deliberately reuse the same `collapse=timestamp:8` query the timeline
 * uses, so prev/next always agree with what the user saw on the timeline. At a
 * year boundary we probe the adjacent year — no synthetic neighbours, ever.
 */
function useNeighbors(domain: string, timestamp: string | null): Neighbors {
  const [state, setState] = useState<Neighbors>({ prev: null, next: null, loading: false })
  // A single primitive dependency keeps the effect honest: it only re-runs when
  // the actual (site, snapshot) pair changes.
  const key = domain && timestamp && timestamp.length >= 8 ? `${domain}|${timestamp}` : ''

  useEffect(() => {
    if (!key) return
    const [host, stamp] = key.split('|')
    const day = stamp.slice(0, 8)
    const year = Number(day.slice(0, 4))

    let cancelled = false
    const ctrl = new AbortController()
    // Entering the loading state is the whole point of this effect: it mirrors
    // an in-flight network probe for the (site, snapshot) pair in `key`.
    // oxlint-disable-next-line react/set-state-in-effect
    setState((s) => ({ ...s, loading: true }))

    ;(async () => {
      const probeYear = async (y: number) =>
        fetchYearDaysSafe(host, y, { signal: ctrl.signal }).catch(() => null)

      const [sameYear, prevYear, nextYear] = await Promise.all([
        probeYear(year),
        probeYear(year - 1),
        probeYear(year + 1),
      ])
      if (cancelled) return

      const days = sameYear?.days ?? []
      const idx = days.indexOf(day)

      let prev: string | null = null
      let next: string | null = null

      if (idx > 0) prev = days[idx - 1]
      else if (idx === 0 && prevYear?.days.length) prev = prevYear.days[prevYear.days.length - 1]
      else if (idx < 0 && days.length) {
        const before = days.filter((d) => d < day)
        const after = days.filter((d) => d > day)
        prev = before.length ? before[before.length - 1] : (prevYear?.days.at(-1) ?? null)
        next = after.length ? after[0] : (nextYear?.days[0] ?? null)
      }

      if (idx >= 0 && idx < days.length - 1) next = days[idx + 1]
      else if (idx === days.length - 1 && nextYear?.days.length) next = nextYear.days[0]

      setState({ prev, next, loading: false })
    })().catch(() => {
      if (!cancelled) setState({ prev: null, next: null, loading: false })
    })

    return () => {
      cancelled = true
      ctrl.abort()
    }
  }, [key])

  return state
}

export default function SnapshotPage() {
  const { t, lang } = useI18n()
  const [params] = useSearchParams()

  const rawUrl = params.get('url') ?? ''
  const ts = params.get('ts') ?? ''
  const original = params.get('u') ?? ''

  const target = useMemo(() => normalizeInput(rawUrl), [rawUrl])
  const domain = target.ok ? target.display : rawUrl.replace(/^www\./, '')
  const originalUrl = useMemo(() => {
    if (original) {
      try {
        return new URL(original).toString()
      } catch {
        /* fall through to reconstruction below */
      }
    }
    return target.ok ? target.url : `https://${domain}/`
  }, [original, target, domain])

  const valid = Boolean(domain) && /^\d{8,14}$/.test(ts)
  const fullTs = ts.length === 8 ? `${ts}000000` : ts
  const year = fullTs.slice(0, 4)

  const neighbors = useNeighbors(valid ? domain : '', valid ? fullTs : null)
  const site = domain ? findSite(domain) : undefined

  useEffect(() => {
    document.title = valid
      ? `${domain} · ${tsToIsoDate(fullTs)} · Internet Time Machine`
      : `${t('snapshot.title')} · Internet Time Machine`
  }, [valid, domain, fullTs, t])

  const snapHref = (day: string) =>
    `/snapshot?url=${encodeURIComponent(domain)}&ts=${day}000000&u=${encodeURIComponent(originalUrl)}`

  if (!valid) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={<AlertTriangle className="h-8 w-8 text-ember" />}
          title={t('snapshot.missingParams')}
          body={
            lang === 'zh'
              ? '请从网站时间轴中选择一个具体的存档日期。'
              : 'Pick a specific archived date from a site timeline.'
          }
          action={
            <Link
              to="/explore"
              className="mt-2 inline-flex h-9 items-center gap-1.5 rounded bg-signal px-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-950"
            >
              {t('nav.explore')}
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/site/${encodeURIComponent(domain)}?year=${year}`}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-paper-500 transition-colors hover:text-signal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('snapshot.back')}
        </Link>

        <div className="flex items-center gap-1.5">
          <NavButton to={neighbors.prev ? snapHref(neighbors.prev) : null} label={t('snapshot.prev')} direction="prev" />
          <NavButton to={neighbors.next ? snapHref(neighbors.next) : null} label={t('snapshot.next')} direction="next" />
        </div>
      </div>

      {/* Identity strip */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate font-mono text-xl tracking-tight text-paper-50 sm:text-2xl">{domain}</h1>
          {site && <p className="mt-0.5 text-[13px] text-paper-400">{lang === 'zh' ? site.zhName : site.name}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper-600">{t('snapshot.date')}</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[13px] tabular-nums text-paper-100">
              <CalendarDays className="h-3.5 w-3.5 text-signal/70" />
              {formatDateHuman(fullTs, lang)}
            </p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper-600">{t('snapshot.year')}</p>
            <p className="mt-0.5 font-mono text-[13px] tabular-nums text-signal">{year}</p>
          </div>
        </div>
      </div>

      {/* The snapshot itself */}
      <div className="mt-5">
        <SnapshotFrame domain={domain} timestamp={fullTs} originalUrl={originalUrl} />
      </div>

      {/* Meta panel */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Panel className="p-3.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper-600">TIMESTAMP</p>
          <p className="mt-1 font-mono text-[12px] tabular-nums text-paper-200">{fullTs}</p>
        </Panel>
        <Panel className="p-3.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper-600">ORIGINAL URL</p>
          <p className="mt-1 break-all font-mono text-[11px] text-paper-400">{originalUrl}</p>
        </Panel>
        <Panel className="p-3.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper-600">
            {lang === 'zh' ? '相邻存档' : 'NEIGHBOURS'}
          </p>
          <p className="mt-1 font-mono text-[11px] text-paper-400">
            {neighbors.loading
              ? '……'
              : `${neighbors.prev ? neighbors.prev.slice(0, 8) : '—'} / ${neighbors.next ? neighbors.next.slice(0, 8) : '—'}`}
          </p>
        </Panel>
      </div>

      <p className="mt-4 flex items-start gap-2 font-mono text-[10px] leading-relaxed text-paper-600">
        <History className="mt-px h-3.5 w-3.5 shrink-0 text-signal/50" />
        {t('snapshot.toolbarTip')}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to={`/site/${encodeURIComponent(domain)}?year=${year}`}
          className="inline-flex h-9 items-center gap-1.5 rounded border border-white/12 px-3 font-mono text-[11px] uppercase tracking-wider text-paper-300 transition-colors hover:border-signal/40 hover:text-signal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('snapshot.back')}
        </Link>
        <Link
          to={`/compare?url=${encodeURIComponent(domain)}`}
          className="inline-flex h-9 items-center gap-1.5 rounded border border-white/12 px-3 font-mono text-[11px] uppercase tracking-wider text-paper-300 transition-colors hover:border-signal/40 hover:text-signal"
        >
          {t('compare.title')}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}

function NavButton({
  to,
  label,
  direction,
}: {
  to: string | null
  label: string
  direction: 'prev' | 'next'
}) {
  const Icon = direction === 'prev' ? ArrowLeft : ArrowRight
  const base =
    'inline-flex h-9 items-center gap-1.5 rounded border px-3 font-mono text-[11px] uppercase tracking-wider transition-colors'

  if (!to) {
    return (
      <span className={clsx(base, 'cursor-not-allowed border-white/[0.06] text-paper-700')} aria-disabled="true">
        {direction === 'prev' && <Icon className="h-3.5 w-3.5" />}
        {label}
        {direction === 'next' && <Icon className="h-3.5 w-3.5" />}
      </span>
    )
  }

  return (
    <Link to={to} className={clsx(base, 'border-white/12 text-paper-300 hover:border-signal/40 hover:text-signal')}>
      {direction === 'prev' && <Icon className="h-3.5 w-3.5" />}
      {label}
      {direction === 'next' && <Icon className="h-3.5 w-3.5" />}
    </Link>
  )
}
