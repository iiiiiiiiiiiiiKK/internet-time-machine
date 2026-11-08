/**
 * Production smoke test against the LIVE deployment.
 *
 * Verifies the real thing end to end: routes serve the SPA, the edge function
 * answers CDX with real archive data, the timeline renders real years, the
 * snapshot iframe points at web.archive.org, and SSRF is rejected.
 *
 *   node scripts/verify-production.mjs [baseUrl]
 */
import { chromium, devices } from '@playwright/test'

const BASE = (process.argv[2] || 'https://internet-time-machine-7p5.pages.dev').replace(/\/$/, '')

let failures = 0
function check(name, condition, detail = '') {
  if (condition) {
    console.log(`PASS  ${name}${detail ? ' — ' + detail : ''}`)
  } else {
    failures += 1
    console.log(`FAIL  ${name}${detail ? ' — ' + detail : ''}`)
  }
}

async function main() {
  console.log(`Verifying ${BASE}\n`)

  // ---------- Edge function directly ----------
  const cdx = await fetch(
    `${BASE}/cdx?url=example.com&from=2016&to=2016&collapse=timestamp:8&fl=timestamp&filter=statuscode:200&output=text`,
  )
  const cdxBody = await cdx.text()
  const cdxDays = cdxBody.split('\n').filter((l) => /^\d{14}$/.test(l.trim()))
  check('edge function returns 200', cdx.status === 200, `status=${cdx.status}`)
  check('CDX returns real archive days', cdxDays.length > 0, `${cdxDays.length} days`)
  check('CORS header present', cdx.headers.get('access-control-allow-origin') === '*')

  const ssrf = await fetch(`${BASE}/cdx?url=http://169.254.169.254/latest/meta-data/`)
  check('SSRF target rejected', ssrf.status === 400, `status=${ssrf.status}`)

  const bogus = await fetch(`${BASE}/cdx?url=notadomain`)
  check('invalid hostname rejected', bogus.status === 400, `status=${bogus.status}`)

  // ---------- Browser: desktop ----------
  const browser = await chromium.launch()
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await desktop.newPage()
  const consoleErrors = []
  page.on('pageerror', (e) => consoleErrors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text())
  })

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  check('home hero renders', (await page.getByRole('heading', { level: 1 }).innerText()).includes('NEVER FORGETS'))

  const authorLink = page.locator('header a[href="https://x.com/0xkillcoin"]').first()
  check('header author X link correct', (await authorLink.count()) > 0)

  // Search → site timeline with REAL data
  await page.getByLabel(/Enter a URL/i).fill('example.com')
  await page.getByRole('button', { name: /time travel/i }).click()
  await page.waitForURL(/\/site\/example\.com/, { timeout: 20000 })
  const rail = page.getByRole('listbox', { name: /interactive timeline/i })
  await rail.waitFor({ timeout: 45000 })
  const yearCount = await rail.getByRole('option').count()
  check('timeline rail rendered from live API', yearCount > 10, `${yearCount} years`)

  // Wait for at least one year to have archived days
  await page.waitForFunction(
    () => /(\d+)\s*days/i.test(document.body.innerText),
    null,
    { timeout: 45000 },
  )
  check('real archived-day counts shown', true)

  // Snapshot iframe must point at the real archive
  await page.goto(`${BASE}/snapshot?url=example.com&ts=20160101000000&u=https%3A%2F%2Fexample.com%2F`, {
    waitUntil: 'domcontentloaded',
  })
  const frameSrc = await page.locator('iframe').first().getAttribute('src')
  check('snapshot iframe targets web.archive.org', Boolean(frameSrc?.includes('web.archive.org/web/20160101000000/')), frameSrc ?? 'none')

  check('no console errors on desktop', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))

  // ---------- Browser: iPhone 14 ----------
  const mobile = await browser.newContext({ ...devices['iPhone 14'] })
  const mpage = await mobile.newPage()
  await mpage.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  const overflow = await mpage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  check('iPhone: no horizontal overflow', overflow <= 1, `${overflow}px`)

  await mpage.getByRole('button', { name: /menu/i }).click()
  const drawer = mpage.getByRole('navigation', { name: /mobile/i })
  check('iPhone: drawer opens', await drawer.isVisible())
  check(
    'iPhone: author X link in drawer',
    (await drawer.locator('a[href="https://x.com/0xkillcoin"]').count()) > 0,
  )

  await browser.close()

  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error('verification crashed:', err)
  process.exit(1)
})
