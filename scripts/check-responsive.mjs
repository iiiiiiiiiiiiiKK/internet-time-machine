/**
 * Responsive matrix check against the LIVE deployment.
 *
 * Walks real device widths (iPhone SE → 4K) and asserts, for each:
 *  - no horizontal page overflow,
 *  - the author X link is present in the header,
 *  - navigation is either the desktop bar or the mobile drawer.
 */
import { chromium } from '@playwright/test'

const BASE = (process.argv[2] || 'https://internet-time-machine-7p5.pages.dev').replace(/\/$/, '')

const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667, dpr: 2, mobile: true },
  { name: 'iPhone 12', width: 390, height: 844, dpr: 3, mobile: true },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932, dpr: 3, mobile: true },
  { name: 'Galaxy S20', width: 360, height: 800, dpr: 3, mobile: true },
  { name: 'iPad Mini', width: 768, height: 1024, dpr: 2, mobile: true },
  { name: 'Laptop', width: 1280, height: 800, dpr: 1, mobile: false },
  { name: 'Desktop', width: 1440, height: 900, dpr: 1, mobile: false },
  { name: 'Wide', width: 1920, height: 1080, dpr: 1, mobile: false },
]

let failures = 0
const check = (ok, msg) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`)
  if (!ok) failures += 1
}

async function main() {
  console.log(`Responsive matrix — ${BASE}\n`)
  const browser = await chromium.launch()

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    check(overflow <= 1, `${vp.name} (${vp.width}px): no horizontal overflow (${overflow}px)`)

    const author = page.locator('header a[href="https://x.com/0xkillcoin"]').first()
    check((await author.count()) > 0, `${vp.name}: author X link in header`)

    const authorBox = await author.boundingBox()
    check(
      Boolean(authorBox) && authorBox.y >= 0 && authorBox.y < 90,
      `${vp.name}: author link sits in the top bar (y=${authorBox ? Math.round(authorBox.y) : 'n/a'})`,
    )

    // Desktop bar vs mobile drawer, decided by the lg breakpoint (1024px).
    const desktopNav = page.getByRole('navigation', { name: /main/i })
    const menuButton = page.getByRole('button', { name: /menu/i })
    if (vp.width >= 1024) {
      check(await desktopNav.isVisible(), `${vp.name}: desktop nav visible`)
    } else {
      check(await menuButton.isVisible(), `${vp.name}: hamburger visible`)
      check(!(await desktopNav.isVisible()), `${vp.name}: desktop nav hidden`)
    }

    // Tap targets on the smallest screens.
    if (vp.mobile) {
      const input = page.getByLabel(/Enter a URL/i)
      const fontSize = await input.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
      check(fontSize >= 16, `${vp.name}: search input is ${fontSize}px (no iOS zoom)`)
    }

    await ctx.close()
  }

  await browser.close()
  console.log(`\n${failures === 0 ? 'RESPONSIVE MATRIX PASSED' : failures + ' FAILURE(S)'}`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
