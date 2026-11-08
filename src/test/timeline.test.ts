import { describe, expect, it } from 'vitest'
import { exploreColumns, prioritiseYears } from '../lib/timeline'

describe('prioritiseYears', () => {
  it('returns every year exactly once', () => {
    const years = Array.from({ length: 31 }, (_, i) => 1996 + i)
    const ordered = prioritiseYears(years, 12)
    expect(ordered).toHaveLength(years.length)
    expect(new Set(ordered).size).toBe(years.length)
    expect([...ordered].sort((a, b) => a - b)).toEqual(years)
  })

  it('probes the oldest and newest years first', () => {
    const years = Array.from({ length: 30 }, (_, i) => 1995 + i)
    const ordered = prioritiseYears(years, 5)
    expect(ordered.slice(0, 2)).toEqual([1995, 2024])
  })

  it('never emits a year outside the range', () => {
    const years = [2000, 2001, 2002]
    const ordered = prioritiseYears(years, 10)
    expect(ordered.every((y) => y >= 2000 && y <= 2002)).toBe(true)
  })
})

describe('exploreColumns', () => {
  it('scales the number of columns with the year count', () => {
    expect(exploreColumns(3)).toBe(3)
    expect(exploreColumns(12)).toBeLessThanOrEqual(12)
    expect(exploreColumns(31)).toBeLessThanOrEqual(8)
  })
})