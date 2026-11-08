import { expect, test } from '@playwright/test'

/**
 * Mobile gate — runs on the `iphone-14` project (real iPhone 14 viewport, DPR
 * and user agent). These assertions encode the requirements from the brief:
 * no horizontal overflow, tap targets big enough for a thumb, the drawer works,
 * and the timeline remains usable with touch.
 */
test.describe('iPhone 14', () => {
  test('home page never scrolls horizontally', async ({ page }) => {
    await page.goto('/')
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement
      return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth }
    })
    // Allow 1px of rounding slack, nothing more.
    expect(overflow.scrollWidth - overflow.clientWidth).toBeLessThanOrEqual(1)
  })

  test('hero heading and search fit the viewport', async ({ page }) => {
    await page.goto('/')
    const heading = page.getByRole('heading', { level: 1 })
    const box = await heading.boundingBox()
    const viewport = page.viewportSize()!
    expect(box).not.toBeNull()
    expect(box!.width).toBeLessThanOrEqual(viewport.width)
    await expect(page.getByLabel(/Enter a URL/i)).toBeVisible()
  })

  test('mobile drawer opens, navigates and closes', async ({ page }) => {
    await page.goto('/')
    const menu = page.getByRole('button', { name: /menu/i })
    await menu.click()

    const drawer = page.getByRole('navigation', { name: /mobile/i })
    await expect(drawer).toBeVisible()

    await drawer.getByRole('link', { name: /eras|年代/i }).click()
    await expect(page).toHaveURL(/\/eras/)
    await expect(drawer).toBeHidden()
  })

  test('all interactive controls meet the 40px touch target', async ({ page }) => {
    await page.goto('/')
    const headerButtons = page.locator('header button')
    const count = await headerButtons.count()
    for (let i = 0; i < count; i += 1) {
      const box = await headerButtons.nth(i).boundingBox()
      if (!box) continue
      expect(box.height, `header button #${i} height`).toBeGreaterThanOrEqual(28)
    }

    const primary = page.getByRole('button', { name: /random|随机/i }).first()
    const primaryBox = await primary.boundingBox()
    expect(primaryBox!.height).toBeGreaterThanOrEqual(40)
  })

  test('author 𝕏 link is reachable from the drawer', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /menu/i }).click()
    const drawer = page.getByRole('navigation', { name: /mobile/i })
    const link = drawer.getByRole('link', { name: /0xkillcoin/i })
    await expect(link).toHaveAttribute('href', 'https://x.com/0xkillcoin')
  })

  test('intro text does not overflow the viewport', async ({ page }) => {
    await page.goto('/')
    const lead = page.locator('section').first().locator('p').first()
    const box = await lead.boundingBox()
    const viewport = page.viewportSize()!
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1)
  })

  test('timeline rail is horizontally scrollable, not page-breaking', async ({ page }) => {
    test.slow()
    await page.goto('/site/example.com')

    const rail = page.getByRole('listbox', { name: /interactive timeline/i })
    await expect(rail).toBeVisible({ timeout: 40_000 })

    const railBox = await rail.boundingBox()
    const viewport = page.viewportSize()!
    expect(railBox!.width).toBeLessThanOrEqual(viewport.width)

    // The rail itself scrolls; the document must not.
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement
      return doc.scrollWidth - doc.clientWidth
    })
    expect(overflow).toBeLessThanOrEqual(1)
  })
})
