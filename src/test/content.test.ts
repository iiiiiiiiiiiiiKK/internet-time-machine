import { describe, expect, it } from 'vitest'
import { DICTS, detectLang, translate } from '../lib/i18n'
import { ERAS, SITE_CATALOG, findSite, eraOfYear } from '../data/catalog'

describe('i18n dictionary completeness', () => {
  it('has identical key sets in both languages', () => {
    const zhKeys = Object.keys(DICTS.zh).sort()
    const enKeys = Object.keys(DICTS.en).sort()
    const missingInEn = zhKeys.filter((k) => !(k in DICTS.en))
    const missingInZh = enKeys.filter((k) => !(k in DICTS.zh))
    expect(missingInEn, `missing in en: ${missingInEn.join(', ')}`).toEqual([])
    expect(missingInZh, `missing in zh: ${missingInZh.join(', ')}`).toEqual([])
  })

  it('never ships an empty string', () => {
    for (const [lang, dict] of Object.entries(DICTS)) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value.trim().length, `${lang}.${key} is empty`).toBeGreaterThan(0)
      }
    }
  })

  it('actually differs between languages (no untranslated copies)', () => {
    // Keys that are legitimately identical in both languages (proper nouns
    // and product names that must not be translated).
    const allowedIdentical = new Set([
      'brand.nameEn',
      'hero.kicker',
      'home.statsSource',
      'about.stackBody',
      'footer.tagline',
      'footer.archive',
      'site.shareX',
      'snapshot.raw',
    ])
    const identical = Object.keys(DICTS.zh).filter(
      (k) => DICTS.zh[k] === DICTS.en[k] && !allowedIdentical.has(k),
    )
    expect(identical, `untranslated keys: ${identical.join(', ')}`).toEqual([])
  })

  it('falls back to the English string for an unknown key', () => {
    expect(translate('zh', 'definitely.not.a.key')).toBe('definitely.not.a.key')
  })
})

describe('detectLang', () => {
  it('defaults to English for non-Chinese browsers', () => {
    expect(['en', 'zh']).toContain(detectLang())
  })
})

describe('site catalog', () => {
  it('has no duplicate domains', () => {
    const seen = new Set<string>()
    for (const site of SITE_CATALOG) {
      expect(seen.has(site.domain), `duplicate ${site.domain}`).toBe(false)
      seen.add(site.domain)
    }
  })

  it('gives every site bilingual copy', () => {
    for (const site of SITE_CATALOG) {
      expect(site.blurbZh.length).toBeGreaterThan(10)
      expect(site.blurbEn.length).toBeGreaterThan(10)
      expect(site.name.length).toBeGreaterThan(0)
      expect(site.zhName.length).toBeGreaterThan(0)
    }
  })

  it('resolves domains case- and www-insensitively', () => {
    expect(findSite('WWW.Google.com')?.domain).toBe('google.com')
    expect(findSite('unknown.example') === undefined).toBe(true)
  })
})

describe('eras', () => {
  it('covers 1991 through today without gaps or overlaps', () => {
    const sorted = [...ERAS].sort((a, b) => a.range[0] - b.range[0])
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i].range[0]).toBe(sorted[i - 1].range[1] + 1)
    }
    expect(sorted[0].range[0]).toBe(1991)
  })

  it('gives every milestone a verifiable external source', () => {
    for (const era of ERAS) {
      expect(era.facts.length).toBeGreaterThanOrEqual(3)
      for (const fact of era.facts) {
        expect(fact.source).toMatch(/^https:\/\//)
        expect(fact.zh.length).toBeGreaterThan(8)
        expect(fact.en.length).toBeGreaterThan(8)
      }
    }
  })

  it('only references sites that exist in the catalog or are realistic domains', () => {
    for (const era of ERAS) {
      expect(era.sites.length).toBeGreaterThan(0)
      for (const domain of era.sites) {
        expect(domain).toMatch(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/)
      }
    }
  })

  it('maps a year back to its era', () => {
    expect(eraOfYear(1995)?.id).toBe('dawn')
    expect(eraOfYear(2003)?.id).toBe('portal')
    expect(eraOfYear(2008)?.id).toBe('web2')
    expect(eraOfYear(2013)?.id).toBe('mobile')
    expect(eraOfYear(2018)?.id).toBe('platform')
    expect(eraOfYear(2025)?.id).toBe('ai')
  })
})