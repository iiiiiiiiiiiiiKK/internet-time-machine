import { describe, expect, it } from 'vitest'
import { buildUpstreamUrl, isForbiddenHost, takeToken, validateTarget } from '../lib/cdx-core'

describe('validateTarget', () => {
  it('accepts ordinary public hostnames', () => {
    expect(validateTarget('google.com')).toEqual({ ok: true, host: 'google.com' })
    expect(validateTarget('https://www.apple.com/mac')).toEqual({ ok: true, host: 'www.apple.com' })
    expect(validateTarget('http://example.com:8080/path?q=1')).toEqual({ ok: true, host: 'example.com' })
  })

  it('rejects a missing url parameter', () => {
    const r = validateTarget('')
    expect(r.ok).toBe(false)
  })

  it('rejects loopback, private and link-local targets (SSRF defence)', () => {
    const blocked = [
      'localhost',
      'http://localhost:3000/',
      '127.0.0.1',
      'http://127.0.0.1/admin',
      '10.0.0.5',
      '192.168.0.1',
      '172.16.5.4',
      '172.31.255.1',
      '169.254.169.254',
      'http://169.254.169.254/latest/meta-data/',
      '0.0.0.0',
      'foo.local',
      'thing.internal',
      'printer.home.arpa',
      '100.64.1.2',
      '198.18.0.1',
      '[::1]',
      '::1',
    ]
    for (const target of blocked) {
      const r = validateTarget(target)
      expect(r.ok, `expected ${target} to be rejected`).toBe(false)
    }
  })

  it('rejects non-http schemes and scheme smuggling', () => {
    expect(validateTarget('file:///etc/passwd').ok).toBe(false)
    expect(validateTarget('gopher://example.com/').ok).toBe(false)
    expect(validateTarget('javascript://example.com/%0aalert(1)').ok).toBe(false)
  })

  it('rejects userinfo tricks that hide the real host', () => {
    const r = validateTarget('http://evil.com@127.0.0.1/')
    expect(r.ok).toBe(false)
  })

  it('rejects single-label hosts and bad TLDs', () => {
    expect(validateTarget('intranet').ok).toBe(false)
    expect(validateTarget('a.b').ok).toBe(false)
  })

  it('rejects oversized urls', () => {
    expect(validateTarget('https://example.com/' + 'a'.repeat(3000)).ok).toBe(false)
  })
})

describe('isForbiddenHost', () => {
  it('flags reserved ranges', () => {
    expect(isForbiddenHost('10.1.1.1')).toBe(true)
    expect(isForbiddenHost('fe80::1')).toBe(true)
    expect(isForbiddenHost('example.com')).toBe(false)
  })
})

describe('buildUpstreamUrl', () => {
  it('forwards only allow-listed parameters', () => {
    const search = new URLSearchParams({
      url: 'google.com',
      from: '2005',
      to: '2005',
      collapse: 'timestamp:8',
      evil: 'DROP TABLE',
      output: 'text',
    })
    const built = buildUpstreamUrl(search)
    expect(built.ok).toBe(true)
    if (built.ok) {
      const parsed = new URL(built.url)
      expect(parsed.searchParams.get('url')).toBe('google.com')
      expect(parsed.searchParams.get('collapse')).toBe('timestamp:8')
      expect(parsed.searchParams.get('evil')).toBeNull()
      expect(parsed.origin + parsed.pathname).toBe('https://web.archive.org/cdx/search/cdx')
    }
  })

  it('collapses the target to a bare hostname so paths cannot redirect the query', () => {
    const built = buildUpstreamUrl(new URLSearchParams({ url: 'https://example.com/deep/path?x=1' }))
    expect(built.ok).toBe(true)
    if (built.ok) expect(new URL(built.url).searchParams.get('url')).toBe('example.com')
  })

  it('rejects an oversized year range', () => {
    const built = buildUpstreamUrl(new URLSearchParams({ url: 'google.com', from: '1990', to: '2050' }))
    expect(built.ok).toBe(false)
    if (!built.ok) expect(built.code).toBe('range_too_large')
  })

  it('rejects a private target before building anything', () => {
    const built = buildUpstreamUrl(new URLSearchParams({ url: '127.0.0.1' }))
    expect(built.ok).toBe(false)
    if (!built.ok) {
      expect(built.status).toBe(400)
      expect(built.code).toBe('invalid_target')
    }
  })
})

describe('takeToken', () => {
  it('allows a burst then throttles', () => {
    const ip = `test-${Math.random()}`
    const results = Array.from({ length: 45 }, () => takeToken(ip))
    expect(results.filter(Boolean).length).toBeGreaterThan(30)
    expect(results[results.length - 1]).toBe(false)
  })
})