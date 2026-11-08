/**
 * Shared CDX proxy core.
 *
 * This module is imported by BOTH the Cloudflare Pages Function
 * (`functions/cdx.ts`) and the Vite dev-server middleware, so local `npm run
 * dev` behaves exactly like production — including validation and SSRF
 * rejection. Keeping one implementation means the two can never drift.
 */

export const DEFAULT_UPSTREAM = 'https://web.archive.org/cdx/search/cdx'

/** Query parameters we are willing to forward upstream. */
export const ALLOWED_PARAMS: ReadonlySet<string> = new Set([
  'url',
  'from',
  'to',
  'collapse',
  'fl',
  'filter',
  'limit',
  'output',
  'page',
  'pageSize',
  'showNumPages',
  'matchType',
  'timestamp',
  'fastLatest',
  'resolveRevisits',
])

export const MAX_URL_LENGTH = 2048
export const MAX_YEAR_RANGE = 40
export const CACHE_TTL_SECONDS = 900

const PRIVATE_HOST_PATTERNS: RegExp[] = [
  /^localhost$/i,
  /^localhost\./i,
  /\.localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /\.home\.arpa$/i,
  /^127\./,
  /^0\./,
  /^10\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^198\.1[89]\./,
  /^::1$/,
  /^\[?::1\]?$/,
  /^\[?f[cd][0-9a-f]{2}:/i,
  /^\[?fe80:/i,
]

const HOSTNAME_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i

export function isForbiddenHost(host: string): boolean {
  if (!host) return true
  if (host.length > 253) return true
  const h = host.toLowerCase()
  if (h.includes('..')) return true
  if (/[:@/\\?#]/.test(h)) return true
  if (PRIVATE_HOST_PATTERNS.some((re) => re.test(h))) return true
  if (h.split('.').length < 2) return true
  const tld = h.split('.').pop() || ''
  if (tld.length < 2) return true
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) {
    const first = Number(h.split('.')[0])
    if (first === 10 || first === 127 || first === 0 || first >= 224) return true
  }
  return false
}

export type TargetCheck = { ok: true; host: string } | { ok: false; reason: string }

/** Extracts and validates the hostname portion of a CDX `url` parameter. */
export function validateTarget(rawUrl: string): TargetCheck {
  const raw = (rawUrl || '').trim()
  if (!raw) return { ok: false, reason: 'missing url parameter' }
  if (raw.length > MAX_URL_LENGTH) return { ok: false, reason: 'url too long' }

  let host = ''
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) {
    let parsed: URL
    try {
      parsed = new URL(raw)
    } catch {
      return { ok: false, reason: 'malformed url' }
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false, reason: 'only http and https are supported' }
    }
    host = parsed.hostname
  } else {
    const cut = raw.split(/[/?#]/)[0]
    host = cut.split(':')[0]
  }

  host = host.replace(/^\[|\]$/g, '').toLowerCase()
  if (!HOSTNAME_RE.test(host)) return { ok: false, reason: 'invalid hostname' }
  if (isForbiddenHost(host)) {
    return { ok: false, reason: 'private or reserved address space is not allowed' }
  }
  return { ok: true, host }
}

export interface UpstreamBuild {
  ok: true
  url: string
  host: string
}

export type UpstreamError = { ok: false; status: number; code: string; message: string }

/**
 * Validates a full `/cdx` query string and produces the upstream URL.
 * Unknown parameters are dropped rather than forwarded.
 */
export function buildUpstreamUrl(search: URLSearchParams, upstreamBase = DEFAULT_UPSTREAM): UpstreamBuild | UpstreamError {
  const check = validateTarget(search.get('url') || '')
  if (!check.ok) {
    return { ok: false, status: 400, code: 'invalid_target', message: check.reason }
  }

  const from = Number(search.get('from') || '0')
  const to = Number(search.get('to') || '0')
  if (from && to && Math.abs(to - from) > MAX_YEAR_RANGE) {
    return {
      ok: false,
      status: 400,
      code: 'range_too_large',
      message: `Year range must not exceed ${MAX_YEAR_RANGE} years.`,
    }
  }

  const upstream = new URL(upstreamBase)
  upstream.searchParams.set('url', check.host)
  for (const [key, value] of search.entries()) {
    if (key === 'url') continue
    if (!ALLOWED_PARAMS.has(key)) continue
    if (value.length > 512) continue
    upstream.searchParams.set(key, value)
  }
  return { ok: true, url: upstream.toString(), host: check.host }
}

/* ---------------------------------------------------------------- */
/* Token bucket (best effort, per process / isolate)                 */
/* ---------------------------------------------------------------- */

const BUCKET_CAPACITY = 40
const BUCKET_REFILL_PER_SEC = 0.7
const buckets = new Map<string, { tokens: number; updated: number }>()

export function takeToken(ip: string): boolean {
  const now = Date.now() / 1000
  const b = buckets.get(ip)
  if (!b) {
    buckets.set(ip, { tokens: BUCKET_CAPACITY - 1, updated: now })
    return true
  }
  const refill = (now - b.updated) * BUCKET_REFILL_PER_SEC
  b.tokens = Math.min(BUCKET_CAPACITY, b.tokens + refill)
  b.updated = now
  if (b.tokens < 1) return false
  b.tokens -= 1
  return true
}