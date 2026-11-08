/**
 * Cloudflare Pages Function — `GET /cdx`
 *
 * A deliberately thin, allow-listed proxy in front of the Internet Archive CDX
 * Server. It exists for exactly one reason: `web.archive.org/cdx/search/cdx`
 * returns no `Access-Control-Allow-Origin` header, so a browser cannot call it
 * directly.
 *
 * Security posture (see `./lib/cdx-core.ts` for the shared implementation):
 *  - only `http` / `https` targets;
 *  - hostname-level SSRF rejection of private / loopback / reserved space;
 *  - the upstream origin is hard-coded, so the proxy cannot be re-pointed;
 *  - only an explicit allow-list of CDX query parameters is forwarded;
 *  - edge caching plus a per-client token bucket for back-pressure.
 */

import { CACHE_TTL_SECONDS, buildUpstreamUrl, takeToken } from './lib/cdx-core'

interface Env {
  /** Optional override for self-hosting; defaults to public CDX. */
  CDX_UPSTREAM?: string
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

function jsonError(
  status: number,
  code: string,
  message: string,
  extra: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify({ error: code, message }), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...CORS_HEADERS,
      ...extra,
    },
  })
}

/** `caches.default` does not exist in every runtime; treat it as optional. */
function getCache(): Cache | null {
  try {
    const store = (globalThis as unknown as { caches?: { default?: Cache } }).caches
    return store?.default ?? null
  } catch {
    return null
  }
}

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { status: 204, headers: CORS_HEADERS })

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context
  const requestUrl = new URL(request.url)

  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  if (!takeToken(ip)) {
    return jsonError(429, 'rate_limited', 'Too many requests. Please slow down.', {
      'Retry-After': '5',
    })
  }

  const built = buildUpstreamUrl(requestUrl.searchParams, env?.CDX_UPSTREAM)
  if (!built.ok) {
    return jsonError(built.status, built.code, built.message)
  }

  // Edge cache is a nice-to-have: `caches.default` is absent in some local and
  // preview runtimes, and a cache failure must never break the proxy.
  const cache = getCache()
  const cacheKey = new Request(built.url, { method: 'GET' })

  if (cache) {
    try {
      const cached = await cache.match(cacheKey)
      if (cached) {
        const body = await cached.text()
        return new Response(body, {
          status: 200,
          headers: {
            'Content-Type': cached.headers.get('Content-Type') || 'text/plain; charset=utf-8',
            'Cache-Control': `public, max-age=300, s-maxage=${CACHE_TTL_SECONDS}`,
            'X-ITM-Cache': 'HIT',
            'X-ITM-Host': built.host,
            ...CORS_HEADERS,
          },
        })
      }
    } catch {
      /* cache miss on error — fall through to the upstream fetch */
    }
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 25000)
  let upstreamRes: Response
  try {
    upstreamRes = await fetch(built.url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent':
          'InternetTimeMachine/1.0 (+https://github.com/iiiiiiiiiiiiiKK/internet-time-machine)',
        Accept: 'application/json, text/plain, */*',
      },
    })
  } catch (err) {
    const aborted = (err as Error)?.name === 'AbortError'
    console.error('[cdx] upstream fetch failed', built.url, (err as Error)?.message)
    return jsonError(
      aborted ? 504 : 502,
      aborted ? 'upstream_timeout' : 'upstream_error',
      aborted
        ? 'The Internet Archive did not respond in time.'
        : 'The Internet Archive request failed.',
    )
  } finally {
    clearTimeout(timer)
  }

  if (upstreamRes.status === 429) {
    return jsonError(429, 'upstream_rate_limited', 'The Internet Archive is rate limiting requests.', {
      'Retry-After': '10',
    })
  }
  if (!upstreamRes.ok) {
    return jsonError(502, 'upstream_status', `The Internet Archive responded with ${upstreamRes.status}.`)
  }

  const body = await upstreamRes.text()
  const contentType = upstreamRes.headers.get('Content-Type') || 'text/plain; charset=utf-8'

  const response = new Response(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': `public, max-age=300, s-maxage=${CACHE_TTL_SECONDS}`,
      'X-ITM-Cache': 'MISS',
      'X-ITM-Host': built.host,
      ...CORS_HEADERS,
    },
  })

  if (cache && body.length < 512 * 1024) {
    context.waitUntil(cache.put(cacheKey, response.clone()))
  }
  return response
}