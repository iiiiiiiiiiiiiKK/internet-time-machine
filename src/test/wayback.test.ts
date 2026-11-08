import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  ApiError,
  fetchBounds,
  fetchYearDays,
  fetchYearDaysSafe,
  parseTimestampLines,
  rawSnapshotUrl,
  snapshotUrl,
} from '../lib/wayback'

function mockFetch(body: string, status = 200) {
  const fn = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
    new Response(body, { status, headers: { 'Content-Type': 'text/plain' } }),
  )
  vi.stubGlobal('fetch', fn)
  return fn
}

describe('parseTimestampLines', () => {
  it('keeps only valid 14-digit timestamps', () => {
    const text = '20050101000000\nnot-a-ts\n20050615000000\n  20051231000000  \n'
    expect(parseTimestampLines(text)).toEqual(['20050101000000', '20050615000000', '20051231000000'])
  })

  it('handles empty bodies', () => {
    expect(parseTimestampLines('')).toEqual([])
  })
})

describe('fetchYearDays', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('deduplicates and sorts days', async () => {
    const fetchMock = mockFetch('20050615000000\n20050101000000\n20050615000000\n')
    const days = await fetchYearDays('example.com', 2005)
    expect(days).toEqual(['20050101', '20050615'])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toContain('/cdx?')
    expect(url).toContain('collapse=timestamp%3A8')
    expect(url).toContain('from=2005')
  })

  it('surfaces a rate-limit response as an ApiError', async () => {
    mockFetch('slow down', 429)
    await expect(fetchYearDays('example.com', 2005)).rejects.toMatchObject({ kind: 'rate-limit' })
  })

  it('surfaces a server error as an ApiError', async () => {
    mockFetch('boom', 503)
    await expect(fetchYearDays('example.com', 2005)).rejects.toBeInstanceOf(ApiError)
  })
})

describe('fetchYearDaysSafe', () => {
  it('converts failure into an explicit failed probe instead of throwing', async () => {
    mockFetch('boom', 500)
    const probe = await fetchYearDaysSafe('example.com', 2010)
    expect(probe).toEqual({ year: 2010, days: [], failed: true })
  })

  it('reports success unchanged', async () => {
    mockFetch('20100101000000\n')
    const probe = await fetchYearDaysSafe('example.com', 2010)
    expect(probe.failed).toBe(false)
    expect(probe.days).toEqual(['20100101'])
  })
})

describe('fetchBounds', () => {
  it('reads the first and last timestamps', async () => {
    let call = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        call += 1
        const body = call === 1 ? '19981111184551\n' : '20200101000000\n20241231235959\n'
        return new Response(body, { status: 200 })
      }),
    )
    const bounds = await fetchBounds('google.com')
    expect(bounds.first).toBe('19981111184551')
    expect(bounds.last).toBe('20241231235959')
  })

  it('returns nulls when the archive is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })))
    const bounds = await fetchBounds('example.com')
    expect(bounds).toEqual({ first: null, last: null })
  })
})

describe('wayback url builders', () => {
  it('builds the canonical snapshot url', () => {
    expect(snapshotUrl('20050101000000', 'https://example.com/')).toBe(
      'https://web.archive.org/web/20050101000000/https://example.com/',
    )
  })

  it('builds the raw (toolbar-free) url', () => {
    expect(rawSnapshotUrl('20050101000000', 'https://example.com/')).toBe(
      'https://web.archive.org/web/20050101000000id_/https://example.com/',
    )
  })
})