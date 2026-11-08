import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { ChevronsLeft, ChevronsRight, Loader2, AlertTriangle, CircleDot } from 'lucide-react'
import type { YearState } from '../hooks/useSiteHistory'
import { useI18n } from '../lib/i18n'
import { formatCompact } from '../lib/format'

interface Props {
  years: YearState[]
  selectedYear: number | null
  onSelectYear: (year: number) => void
  onRetryYear: (year: number) => void
  earliestYear: number | null
  latestYear: number | null
  loading: boolean
}

/**
 * Interactive year timeline.
 *
 * Interaction model
 * -----------------
 *  • Pointer drag on the rail scrubs through years (works with mouse + touch).
 *  • Arrow keys move one year; Home/End jump to the oldest/newest year.
 *  • The rail auto-scrolls so the active year stays centred on small screens.
 *  • Years that failed to load are hatched, never shown as "no archives".
 */
export default function Timeline({
  years,
  selectedYear,
  onSelectYear,
  onRetryYear,
  earliestYear,
  latestYear,
  loading,
}: Props) {
  const { t, lang } = useI18n()
  const railRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const maxDays = useMemo(() => years.reduce((m, y) => Math.max(m, y.days.length), 1), [years])

  const move = useCallback(
    (delta: number) => {
      if (years.length === 0) return
      const current = selectedYear ?? years[0].year
      const idx = years.findIndex((y) => y.year === current)
      const next = Math.min(years.length - 1, Math.max(0, (idx < 0 ? 0 : idx) + delta))
      onSelectYear(years[next].year)
    },
    [years, selectedYear, onSelectYear],
  )

  // Keep the active year visible, especially on narrow iPhone viewports.
  useEffect(() => {
    if (selectedYear == null) return
    const rail = railRef.current
    if (!rail) return
    const el = rail.querySelector<HTMLElement>(`[data-year="${selectedYear}"]`)
    if (!el) return
    const target = el.offsetLeft - rail.clientWidth / 2 + el.clientWidth / 2
    rail.scrollTo({ left: Math.max(0, target), behavior: dragging ? 'auto' : 'smooth' })
  }, [selectedYear, dragging])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      move(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      move(-1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      if (years.length) onSelectYear(years[0].year)
    } else if (e.key === 'End') {
      e.preventDefault()
      if (years.length) onSelectYear(years[years.length - 1].year)
    }
  }

  const yearFromPointer = (clientX: number): number | null => {
    const rail = railRef.current
    if (!rail) return null
    const el = document.elementFromPoint(clientX, rail.getBoundingClientRect().top + 10)
    const holder = el?.closest<HTMLElement>('[data-year]')
    if (!holder) return null
    const y = Number(holder.dataset.year)
    return Number.isFinite(y) ? y : null
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    setDragging(true)
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    const y = yearFromPointer(e.clientX)
    if (y != null) onSelectYear(y)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const y = yearFromPointer(e.clientX)
    if (y != null && y !== selectedYear) onSelectYear(y)
  }

  const handlePointerUp = () => setDragging(false)

  const firstYear = years[0]?.year ?? null
  const lastYear = years[years.length - 1]?.year ?? null
  const atStart = selectedYear != null && firstYear != null && selectedYear <= firstYear
  const atEnd = selectedYear != null && lastYear != null && selectedYear >= lastYear

  return (
    <section aria-labelledby="timeline-heading" className="w-full">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="timeline-heading" className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal/80">
            {t('site.timeline')}
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-paper-400">{t('site.timelineLead')}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => firstYear != null && onSelectYear(firstYear)}
            disabled={atStart || !years.length}
            title={t('site.jumpOldest')}
            aria-label={t('site.jumpOldest')}
            className="grid h-9 w-9 place-items-center rounded border border-white/10 text-paper-400 transition-colors hover:border-signal/40 hover:text-signal disabled:opacity-30"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={atStart || !years.length}
            aria-label={t('site.prevYear')}
            className="h-9 rounded border border-white/10 px-3 font-mono text-[11px] uppercase tracking-wider text-paper-300 transition-colors hover:border-signal/40 hover:text-signal disabled:opacity-30"
          >
            {t('site.prevYear')}
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={atEnd || !years.length}
            aria-label={t('site.nextYear')}
            className="h-9 rounded border border-white/10 px-3 font-mono text-[11px] uppercase tracking-wider text-paper-300 transition-colors hover:border-signal/40 hover:text-signal disabled:opacity-30"
          >
            {t('site.nextYear')}
          </button>
          <button
            type="button"
            onClick={() => lastYear != null && onSelectYear(lastYear)}
            disabled={atEnd || !years.length}
            title={t('site.jumpNewest')}
            aria-label={t('site.jumpNewest')}
            className="grid h-9 w-9 place-items-center rounded border border-white/10 text-paper-400 transition-colors hover:border-signal/40 hover:text-signal disabled:opacity-30"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* The rail */}
      <div
        ref={railRef}
        role="listbox"
        aria-label={t('site.timeline')}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={clsx(
          'no-scrollbar relative flex touch-pan-x select-none gap-1 overflow-x-auto rounded-lg border border-white/[0.08] bg-ink-900/60 p-2',
          dragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
      >
        {years.map((y) => {
          const active = y.year === selectedYear
          const density = Math.min(1, y.days.length / maxDays)
          const empty = y.status === 'done' && y.days.length === 0
          const failed = y.status === 'failed'
          const pending = y.status === 'pending' || y.status === 'loading'

          return (
            <button
              key={y.year}
              type="button"
              data-year={y.year}
              role="option"
              aria-selected={active}
              onClick={() => onSelectYear(y.year)}
              title={
                failed
                  ? `${y.year} · ${t('site.yearFailed')}`
                  : empty
                    ? `${y.year} · ${t('site.noYearData')}`
                    : `${y.year} · ${y.days.length} ${t('explore.days')}`
              }
              className={clsx(
                'relative flex h-16 w-11 shrink-0 flex-col items-center justify-end gap-1 rounded pb-1.5 pt-2 transition-colors sm:h-20 sm:w-14',
                active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.035]',
                failed && 'opacity-70',
              )}
            >
              {/* density bar */}
              <span className="relative flex w-full flex-1 items-end justify-center px-1">
                <span
                  className={clsx(
                    'w-full rounded-sm transition-all duration-500',
                    failed
                      ? 'bg-ember/50'
                      : empty
                        ? 'bg-white/[0.06]'
                        : active
                          ? 'bg-signal'
                          : 'bg-signal/45',
                  )}
                  style={{ height: `${Math.max(empty || failed ? 3 : 8, density * 100)}%` }}
                />
                {pending && (
                  <Loader2 className="absolute bottom-0 h-3 w-3 animate-spin text-paper-600" aria-hidden="true" />
                )}
                {failed && (
                  <AlertTriangle className="absolute bottom-0 h-3 w-3 text-ember" aria-hidden="true" />
                )}
              </span>

              <span
                className={clsx(
                  'font-mono text-[10px] tabular-nums transition-colors sm:text-[11px]',
                  active ? 'text-signal' : failed ? 'text-ember/90' : empty ? 'text-paper-600' : 'text-paper-400',
                )}
              >
                {y.year}
              </span>

              <span
                className={clsx(
                  'font-mono text-[8px] tabular-nums sm:text-[9px]',
                  active ? 'text-signal/70' : 'text-paper-600',
                )}
              >
                {y.status === 'done' ? formatCompact(y.days.length) : '·'}
              </span>

              {active && (
                <span
                  className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-signal transition-transform duration-300"
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}

        {loading && years.length === 0 && (
          <div className="flex h-16 w-full items-center justify-center gap-2 font-mono text-[11px] text-paper-500 sm:h-20">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('loading.detail')}
          </div>
        )}
      </div>

      {/* Selected-year summary */}
      {selectedYear != null && (
        <SelectedYear
          years={years}
          year={selectedYear}
          onRetryYear={onRetryYear}
          earliestYear={earliestYear}
          latestYear={latestYear}
          lang={lang}
        />
      )}
    </section>
  )
}

function SelectedYear({
  years,
  year,
  onRetryYear,
  earliestYear,
  latestYear,
  lang,
}: {
  years: YearState[]
  year: number
  onRetryYear: (year: number) => void
  earliestYear: number | null
  latestYear: number | null
  lang: string
}) {
  const { t } = useI18n()
  const state = years.find((y) => y.year === year)
  const isEdgeStart = earliestYear === year
  const isEdgeEnd = latestYear === year

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11px] text-paper-500">
      <span className="flex items-center gap-1.5 text-paper-300">
        <CircleDot className="h-3 w-3 text-signal" aria-hidden="true" />
        {year}
        {isEdgeStart && <span className="text-signal/70">· {t('site.oldest')}</span>}
        {isEdgeEnd && <span className="text-signal/70">· {t('site.newest')}</span>}
      </span>

      {state?.status === 'done' && (
        <span>
          {state.days.length} {t('explore.days')}
        </span>
      )}

      {state?.status === 'failed' && (
        <button
          type="button"
          onClick={() => onRetryYear(year)}
          className="flex items-center gap-1.5 text-ember underline decoration-dotted underline-offset-2 hover:text-ember/80"
        >
          <AlertTriangle className="h-3 w-3" />
          {t('site.yearFailed')} · {t('site.reload')}
        </button>
      )}

      {state?.status === 'done' && state.days.length === 0 && (
        <span className="text-paper-600">
          {lang === 'zh' ? '该年无存档' : 'no archive this year'}
        </span>
      )}
    </div>
  )
}