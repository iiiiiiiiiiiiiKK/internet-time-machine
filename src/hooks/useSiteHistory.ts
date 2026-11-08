import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, fetchBounds, fetchYearDaysSafe, type YearProbe } from '../lib/wayback'
import type { ApiErrorKind } from '../lib/wayback'
import { prioritiseYears } from '../lib/timeline'

export interface YearState {
  year: number
  days: string[]
  status: 'pending' | 'loading' | 'done' | 'failed'
}

export interface HistoryState {
  domain: string
  first: string | null
  last: string | null
  years: YearState[]
  earliestYear: number | null
  latestYear: number | null
  phase: 'idle' | 'bounds' | 'years' | 'done' | 'error' | 'empty'
  error: ApiErrorKind | null
  /** number of years that finished loading (success or failure) */
  resolved: number
  total: number
  totalDays: number
}

const CONCURRENCY = 5
const BOOTSTRAP_YEARS = 22

function emptyState(domain: string): HistoryState {
  return {
    domain,
    first: null,
    last: null,
    years: [],
    earliestYear: null,
    latestYear: null,
    phase: 'idle',
    error: null,
    resolved: 0,
    total: 0,
    totalDays: 0,
  }
}

/**
 * Loads a site's complete archive index.
 *
 * Strategy:
 *  1. Ask for the global first/last snapshot so the year slider always has a
 *     truthful range, even while the per-year pass is still streaming in.
 *  2. Probe every year in the range with bounded concurrency. Years resolve
 *     independently, so the timeline becomes interactive almost immediately.
 *
 * Nothing here fabricates a year: a year that errors keeps status `'failed'`
 * and is rendered as unverified rather than as "no archives".
 */
export function useSiteHistory(domain: string | null) {
  const [state, setState] = useState<HistoryState>(() => emptyState(domain ?? ''))
  const [trackedDomain, setTrackedDomain] = useState(domain ?? '')
  const abortRef = useRef<AbortController | null>(null)

  // When the target disappears (invalid route param), drop any stale index.
  // Adjusting state during render is the documented alternative to an effect.
  if ((domain ?? '') !== trackedDomain) {
    setTrackedDomain(domain ?? '')
    if (!domain) setState(emptyState(''))
  }

  const run = useCallback((target: string) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    let cancelled = false
    const alive = () => !cancelled && !ctrl.signal.aborted

    setState({ ...emptyState(target), phase: 'bounds' })

    ;(async () => {
      let bounds: { first: string | null; last: string | null }
      try {
        bounds = await fetchBounds(target, { signal: ctrl.signal })
      } catch (err) {
        if (!alive()) return
        const kind = err instanceof ApiError ? err.kind : 'server'
        if (kind === 'aborted') return
        setState((prev) => ({ ...prev, phase: 'error', error: kind }))
        return
      }
      if (!alive()) return

      if (!bounds.first && !bounds.last) {
        setState((prev) => ({ ...prev, phase: 'empty', error: null }))
        return
      }

      const firstYear = bounds.first ? Number(bounds.first.slice(0, 4)) : null
      const lastYear = bounds.last ? Number(bounds.last.slice(0, 4)) : null

      let startYear = firstYear ?? 1996
      let endYear = lastYear ?? new Date().getUTCFullYear()
      if (endYear < startYear) [startYear, endYear] = [endYear, startYear]

      // Very old sites can span 30+ years; probe the most informative subset
      // first (recent + earliest) so the UI is useful before every year lands.
      const allYears: number[] = []
      for (let y = startYear; y <= endYear; y += 1) allYears.push(y)
      const prio = prioritiseYears(allYears, BOOTSTRAP_YEARS)

      const years: YearState[] = allYears.map((year) => ({ year, days: [], status: 'pending' }))
      const indexOfYear = new Map<number, number>()
      years.forEach((y, i) => indexOfYear.set(y.year, i))

      setState({
        domain: target,
        first: bounds.first,
        last: bounds.last,
        years,
        earliestYear: startYear,
        latestYear: endYear,
        phase: 'years',
        error: null,
        resolved: 0,
        total: allYears.length,
        totalDays: 0,
      })

      let resolved = 0
      let totalDays = 0
      let failures = 0
      let cursor = 0

      const applyProbe = (probe: YearProbe) => {
        const idx = indexOfYear.get(probe.year)
        if (idx === undefined) return
        years[idx] = {
          year: probe.year,
          days: probe.days,
          status: probe.failed ? 'failed' : 'done',
        }
        resolved += 1
        if (probe.failed) failures += 1
        else totalDays += probe.days.length
      }

      const workers = Array.from({ length: Math.min(CONCURRENCY, prio.length) }, async () => {
        for (;;) {
          const i = cursor
          cursor += 1
          if (i >= prio.length) return
          if (!alive()) return
          const year = prio[i]
          const idx = indexOfYear.get(year)
          if (idx !== undefined) years[idx] = { ...years[idx], status: 'loading' }
          const probe = await fetchYearDaysSafe(target, year, { signal: ctrl.signal })
          if (!alive()) return
          applyProbe(probe)
          setState((prev) => ({
            ...prev,
            years: [...years],
            resolved,
            totalDays,
            phase: resolved >= allYears.length ? (failures === allYears.length ? 'error' : 'done') : 'years',
            error: failures === allYears.length ? 'server' : null,
          }))
        }
      })

      await Promise.all(workers)
      if (!alive()) return
      setState((prev) => ({
        ...prev,
        years: [...years],
        resolved,
        totalDays,
        phase: failures === allYears.length ? 'error' : 'done',
      }))
    })()
  }, [])

  useEffect(() => {
    if (!domain) return
    // `run` immediately transitions to the loading phase and then only touches
    // state from async callbacks, which is exactly the external-sync case this
    // effect exists for.
    // oxlint-disable-next-line react/set-state-in-effect
    run(domain)
    return () => {
      abortRef.current?.abort()
    }
  }, [domain, run])

  const retry = useCallback(() => {
    if (domain) run(domain)
  }, [domain, run])

  /** Re-probe a single failed year without discarding the rest. */
  const retryYear = useCallback(
    async (year: number) => {
      if (!domain) return
      setState((prev) => ({
        ...prev,
        years: prev.years.map((y) => (y.year === year ? { ...y, status: 'loading' } : y)),
      }))
      const probe = await fetchYearDaysSafe(domain, year)
      setState((prev) => {
        const years = prev.years.map((y) =>
          y.year === year
            ? { year, days: probe.days, status: probe.failed ? ('failed' as const) : ('done' as const) }
            : y,
        )
        const totalDays = years.reduce((sum, y) => sum + (y.status === 'done' ? y.days.length : 0), 0)
        return { ...prev, years, totalDays }
      })
    },
    [domain],
  )

  return { state, retry, retryYear }
}
