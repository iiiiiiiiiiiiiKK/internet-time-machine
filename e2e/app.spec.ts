import { expect, test } from '@playwright/test'

test.describe('static navigation (no archive calls)', () => {
  test('home page renders the hero, search and author link', async ({ page }) => {
    await page.goto('/')

    // Hero copy
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/never forgets/i)

    // Search field is reachable and labelled
    const input = page.getByLabel(/Enter a URL/i)
    await expect(input).toBeVisible()

    // The author 𝕏 link is present in the header with the exact href.
    const header = page.locator('header')
    const authorLink = header.getByRole('link', { name: /0xkillcoin/i }).first()
    await expect(authorLink).toHaveAttribute('href', 'https://x.com/0xkillcoin')
    await expect(authorLink).toHaveAttribute('target', '_blank')
  })

  test('every navigation target resolves without a 404 or console error', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    for (const [href, marker] of [
      ['/explore', /no target yet|search results/i],
      ['/eras', /eras|1990s/i],
      ['/compare', /compare eras|side by side/i],
      ['/about', /about/i],
    ] as const) {
      await page.goto(href)
      await expect(page.locator('main')).toContainText(marker)
    }

    // Unmatched route must render the in-app 404, not a server 404.
    await page.goto('/this/route/does/not/exist')
    await expect(page.locator('main')).toContainText(/404/i)

    expect(errors, `console/page errors: ${errors.join(' | ')}`).toEqual([])
  })

  test('deep links survive a hard reload (SPA fallback works)', async ({ page }) => {
    await page.goto('/eras#era-web2')
    await page.reload()
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('#era-web2')).toBeVisible()
  })

  test('language switch translates the whole shell', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /切换到中文/i }).click()

    // Header brand, nav and footer must all be translated, not just the hero.
    await expect(page.locator('header')).toContainText('互联网时光机')
    await expect(page.locator('footer')).toContainText('互联网时光机')
    await expect(page.locator('footer')).toContainText('导航')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('从未遗忘')

    // And the choice persists across a reload.
    await page.reload()
    await expect(page.locator('header')).toContainText('互联网时光机')
  })

  test('invalid and private input is rejected before any query', async ({ page }) => {
    await page.goto('/')
    const input = page.getByLabel(/Enter a URL/i)
    await input.fill('http://127.0.0.1:8080/secret')
    await page.getByRole('button', { name: /time travel/i }).click()

    await expect(page.getByRole('alert')).toContainText(/private/i)
    await expect(page).toHaveURL(/\/$/)
  })

  test('each era section carries externally verifiable sources', async ({ page }) => {
    await page.goto('/eras')
    const sources = page.locator('section[id^="era-"] a[href^="https://"]')
    expect(await sources.count()).toBeGreaterThan(10)
  })

  test('compare view requires two different years', async ({ page }) => {
    await page.goto('/compare')
    await page.getByPlaceholder('google.com').fill('apple.com')
    const yearSelects = page.getByLabel('year')
    await yearSelects.nth(0).selectOption('2020')
    await yearSelects.nth(1).selectOption('2020')
    await page.getByRole('button', { name: /^compare$/i }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  })
})

test.describe('archive-backed behaviour @network', () => {
  test('a real domain renders a timeline with real years', async ({ page }) => {
    test.slow()
    await page.goto('/site/example.com')

    // The timeline rail must appear with year buttons sourced from the API.
    const rail = page.getByRole('listbox', { name: /interactive timeline/i })
    await expect(rail).toBeVisible({ timeout: 40_000 })
    const years = rail.getByRole('option')
    await expect(years.first()).toBeVisible({ timeout: 40_000 })

    // At least one year must carry a non-zero archived-day count.
    const summary = page.locator('section[aria-labelledby="timeline-heading"]')
    await expect(summary).toContainText(/\d+\s*(days|天)/i, { timeout: 40_000 })
  })

  test('opening a snapshot exposes the real wayback url', async ({ page }) => {
    test.slow()
    await page.goto('/snapshot?url=example.com&ts=20100101000000&u=https%3A%2F%2Fexample.com%2F')

    const frame = page.locator('iframe[title*="example.com"]')
    await expect(frame).toBeVisible()
    const src = await frame.getAttribute('src')
    expect(src).toContain('web.archive.org/web/20100101000000/')

    // The external escape hatch must always exist.
    const external = page.getByRole('link', { name: /open on internet archive/i }).first()
    await expect(external).toHaveAttribute('href', /web\.archive\.org/)
  })
})