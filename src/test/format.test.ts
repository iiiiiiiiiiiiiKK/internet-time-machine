import { describe, expect, it } from 'vitest'
import {
  formatCompact,
  normalizeInput,
  parseTs,
  tsToEpoch,
  tsToIsoDate,
  toDay,
  yearRange,
} from '../lib/format'

describe('normalizeInput', () => {
  it('accepts a bare domain', () => {
    const r = normalizeInput('google.com')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.display).toBe('google.com')
      expect(r.host).toBe('google.com')
      expect(r.url).toBe('https://google.com/')
    }
  })

  it('strips the www prefix from the display domain', () => {
    const r = normalizeInput('https://www.apple.com/mac/')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.display).toBe('apple.com')
  })

  it('drops tracking params and hashes', () => {
    const r = normalizeInput('https://example.com/page?utm_source=x#top')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.url).not.toContain('#top')
  })

  it('rejects empty input', () => {
    const r = normalizeInput('   ')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('empty')
  })

  it('rejects private hosts', () => {
    for (const host of ['localhost', '127.0.0.1', '192.168.1.1', '10.1.2.3', 'foo.local']) {
      const r = normalizeInput(host)
      expect(r.ok, host).toBe(false)
      if (!r.ok) expect(['private', 'bad-host']).toContain(r.reason)
    }
  })

  it('rejects non-http schemes', () => {
    const r = normalizeInput('ftp://example.com/file')
    expect(r.ok).toBe(false)
  })

  it('rejects malformed input', () => {
    expect(normalizeInput('not a domain').ok).toBe(false)
    expect(normalizeInput('http://').ok).toBe(false)
    expect(normalizeInput('javascript:alert(1)').ok).toBe(false)
  })
})

describe('timestamp helpers', () => {
  it('parses valid wayback timestamps', () => {
    expect(parseTs('20050101091102')).toEqual({ y: 2005, mo: 1, d: 1, hh: 9, mi: 11, ss: 2 })
  })

  it('rejects impossible calendars', () => {
    expect(parseTs('20051332000000')).toBeNull()
    expect(parseTs('abc')).toBeNull()
  })

  it('formats ISO dates', () => {
    expect(tsToIsoDate('20051231235959')).toBe('2005-12-31')
  })

  it('creates a UTC epoch, not a local one', () => {
    expect(tsToEpoch('20000101000000')).toBe(Date.UTC(2000, 0, 1, 0, 0, 0))
  })

  it('collapses to the day boundary', () => {
    const day = toDay('20050615091700')
    expect(day.timestamp).toBe('20050615000000')
    expect(day.date).toBe('2005-06-15')
  })
})

describe('formatCompact', () => {
  it('formats small numbers verbatim', () => {
    expect(formatCompact(42)).toBe('42')
  })
  it('adds K and M suffixes', () => {
    expect(formatCompact(1200)).toBe('1.2K')
    expect(formatCompact(15000)).toBe('15K')
    expect(formatCompact(2_400_000)).toBe('2.4M')
  })
})

describe('yearRange', () => {
  it('is inclusive on both ends', () => {
    expect(yearRange(1996, 1999)).toEqual([1996, 1997, 1998, 1999])
  })
  it('returns a single year when start equals end', () => {
    expect(yearRange(2020, 2020)).toEqual([2020])
  })
})