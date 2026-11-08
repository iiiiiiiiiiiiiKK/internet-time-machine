/**
 * Year-ordering and layout helpers for the timeline / coverage grid.
 * Pure functions so they can be unit-tested without a DOM.
 */

/**
 * Orders years so the most informative ones resolve first:
 * oldest, newest, then every 5th year, then the rest newest-first.
 *
 * Every input year appears exactly once in the output.
 */
export function prioritiseYears(years: number[], bootstrap: number): number[] {
  if (years.length === 0) return []
  if (years.length <= bootstrap) return [...years]

  const min = Math.min(...years)
  const max = Math.max(...years)
  const seen = new Set<number>()
  const out: number[] = []

  const push = (y: number) => {
    if (y < min || y > max || seen.has(y)) return
    seen.add(y)
    out.push(y)
  }

  push(min)
  push(max)
  for (let y = min; y <= max; y += 5) push(y)
  for (let i = years.length - 1; i >= 0; i -= 1) push(years[i])
  for (const y of years) push(y)
  return out
}

/**
 * Chooses a coverage-grid column count for a given number of years, so that
 * short histories do not render as a sparse 2-row sliver on desktop.
 */
export function exploreColumns(yearCount: number): number {
  if (yearCount <= 4) return Math.max(1, yearCount)
  if (yearCount <= 8) return 4
  if (yearCount <= 16) return 6
  if (yearCount <= 24) return 8
  return 8
}
