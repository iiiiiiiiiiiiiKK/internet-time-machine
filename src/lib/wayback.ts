/**
 * Wayback Machine API layer.
 *
 * ARCHITECTURE NOTE
 * -----------------
 * The Internet Archive CDX endpoint (`/cdx/search/cdx`) returns no
 * `Access-Control-Allow-Origin` header, so a browser cannot call it directly.
 * This module therefore talks to a thin, allow-listed proxy that is deployed
 * next to the static bundle as a Cloudflare Pages Function at `/cdx`
 * (see `functions/cdx.ts`).
 *
 * Everything returned here is real data from the Internet Archive — there is
 * no mock data anywhere in this file, and no fallback that invents snapshots.
 */

const ARCHIVE_HOST = 'https://web.archive.org'
const DIRECT_CDX = `${ARCHIVE_HOST}/cdx/search/cdx`

/**
 * Base for the CDX proxy. Empty string means "same origin", which is the normal
 * case. Set `VITE_API_BASE` only when the proxy is hosted elsewhere.
 */
const RAW_API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.trim() ?? ''
export const API_BASE = RAW_API_BASE.replace(/\/+$/, '')
export const CDX_ENDPOINT = `${API_BASE}/cdx`

export type ApiErrorKind =
  | 'offline'
  | 'timeout'
  | 'rate-limit'
  | 'server'
  | 'bad-response'
  | 'invalid-target'
  | 'aborted'

export class ApiError extends Error {
  kind: ApiErrorKind
  status?: number
  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

const RETRYABLE: ReadonlySet<ApiErrorKind> = new Set<ApiErrorKind>(['timeout', 'server', 'rate-limit'])

function buildCdxUrl(params: Record<string, string | number>): string {
  const search = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === '') continue
    search.set(k, String(v))
  }
  return `${CDX_ENDPOINT}?${search.toString()}`
}

export interface RequestOptions {
  signal?: AbortSignal
  timeoutMs?: number
  retries?: number
}

async function once(url: string, outer: AbortSignal | undefined, timeoutMs: number): Promise<string> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  const onAbort = () => ctrl.abort()
  outer?.addEventListener('abort', onAbort, { once: true })

  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json, text/plain, */*' },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    })

    if (res.status === 429) {
      throw new ApiError('rate-limit', 'The archive is rate limiting requests.', 429)
    }
    if (res.status === 400) {
      const detail = await res.text().catch(() => '')
      throw new ApiError('invalid-target', detail || 'The request was rejected by the proxy.', 400)
    }
    if (res.status >= 500) {
      throw new ApiError('server', `The archive proxy responded ${res.status}.`, res.status)
    }
    if (!res.ok) {
      throw new ApiError('bad-response', `The archive proxy responded ${res.status}.`, res.status)
    }
    return await res.text()
  } catch (err) {
    if (outer?.aborted) throw new ApiError('aborted', 'Request cancelled.')
    if (err instanceof ApiError) throw err
    const e = err as Error
    if (e.name === 'AbortError') throw new ApiError('timeout', 'The archive did not respond in time.')
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new ApiError('offline', 'You appear to be offline.')
    }
    throw new ApiError('server', e.message || 'Network error.')
  } finally {
    clearTimeout(timer)
    outer?.removeEventListener('abort', onAbort)
  }
}

async function requestCdx(
  params: Record<string, string | number>,
  opts: RequestOptions = {},
): Promise<string> {
  const { signal, timeoutMs = 20000, retries = 1 } = opts

  if (signal?.aborted) throw new ApiError('aborted', 'Request cancelled.')

  let lastErr: unknown
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await once(buildCdxUrl(params), signal, timeoutMs)
    } catch (err) {
      lastErr = err
      const kind = err instanceof ApiError ? err.kind : 'server'
      if (kind === 'aborted' || !RETRYABLE.has(kind) || attempt === retries) break
      await delay(350 * (attempt + 1), signal)
    }
  }
  throw lastErr instanceof ApiError ? lastErr : new ApiError('server', 'Unknown error.')
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new ApiError('aborted', 'Request cancelled.'))
      return
    }
    const id = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(id)
      reject(new ApiError('aborted', 'Request cancelled.'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export function parseTimestampLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\d{14}$/.test(line))
}

/* ------------------------------------------------------------------ */
/* Queries                                                            */
/* ------------------------------------------------------------------ */

/** Distinct archived days (YYYYMMDD) for one calendar year. */
export async function fetchYearDays(
  domain: string,
  year: number,
  opts: RequestOptions = {},
): Promise<string[]> {
  const text = await requestCdx(
    {
      url: domain,
      from: year,
      to: year,
      collapse: 'timestamp:8',
      fl: 'timestamp',
      filter: 'statuscode:200',
      output: 'text',
    },
    { signal: opts.signal, timeoutMs: 25000 },
  )
  const unique = new Set(parseTimestampLines(text).map((ts) => ts.slice(0, 8)))
  return Array.from(unique).sort()
}

export interface YearProbe {
  year: number
  days: string[]
  failed: boolean
}

/** Like `fetchYearDays`, but converts failures into an explicit `failed` flag. */
export async function fetchYearDaysSafe(
  domain: string,
  year: number,
  opts: RequestOptions = {},
): Promise<YearProbe> {
  try {
    const days = await fetchYearDays(domain, year, opts)
    return { year, days, failed: false }
  } catch (err) {
    if (err instanceof ApiError && err.kind === 'aborted') throw err
    return { year, days: [], failed: true }
  }
}

/** Earliest and latest snapshot timestamps for a host. */
export async function fetchBounds(
  domain: string,
  opts: RequestOptions = {},
): Promise<{ first: string | null; last: string | null }> {
  const [firstText, lastText] = await Promise.all([
    requestCdx(
      { url: domain, fl: 'timestamp', filter: 'statuscode:200', limit: 1, output: 'text' },
      { signal: opts.signal, timeoutMs: 20000 },
    ).catch(() => ''),
    requestCdx(
      { url: domain, fl: 'timestamp', filter: 'statuscode:200', limit: -1, output: 'text' },
      { signal: opts.signal, timeoutMs: 20000 },
    ).catch(() => ''),
  ])
  const first = parseTimestampLines(firstText)[0] ?? null
  const lastLines = parseTimestampLines(lastText)
  return { first, last: lastLines.length ? lastLines[lastLines.length - 1] : null }
}

/** Nearest archived snapshot at or before `timestamp`. */
export async function fetchClosest(
  domain: string,
  timestamp: string,
  opts: RequestOptions = {},
): Promise<string | null> {
  const text = await requestCdx(
    {
      url: domain,
      timestamp,
      fl: 'timestamp',
      filter: 'statuscode:200',
      limit: 1,
      output: 'text',
    },
    { signal: opts.signal, timeoutMs: 20000 },
  )
  return parseTimestampLines(text)[0] ?? null
}

/* ------------------------------------------------------------------ */
/* URL builders                                                       */
/* ------------------------------------------------------------------ */

export function snapshotUrl(timestamp: string, originalUrl: string): string {
  return `${ARCHIVE_HOST}/web/${timestamp}/${originalUrl}`
}

/** `id_` returns the raw archived document without the Wayback toolbar. */
export function rawSnapshotUrl(timestamp: string, originalUrl: string): string {
  return `${ARCHIVE_HOST}/web/${timestamp}id_/${originalUrl}`
}

export function cdxBrowseUrl(domain: string): string {
  return `${ARCHIVE_HOST}/web/*/${domain}/*`
}

/** URL used for the primary "open on Internet Archive" call to action. */
export function archiveOpenUrl(timestamp: string, originalUrl: string): string {
  return `${ARCHIVE_HOST}/web/${timestamp}/${originalUrl}`
}

export const UNCACHED_CDX = DIRECT_CDX