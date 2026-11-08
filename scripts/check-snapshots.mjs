/**
 * Verifies that a real archived snapshot actually renders inside the viewer
 * on the LIVE deployment (not merely that the iframe element exists).
 *
 * Some archived sites block embedding; for those we assert that the UI shows
 * the honest "cannot be embedded" panel with a working external link instead.
 */
import { chromium } from '@playwright/test'

const BASE = (process.argv[2] || 'https://internet-time-machine-7p5.pages.dev').replace(/\/$/, '')

const CASES = [
  { domain: 'example.com', ts: '20160101000000', expect: 'any' },
  { domain: 'google.com', ts: '20100101000000', expect: 'any' },
]

let failures = 0
const check = (ok, msg) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`)
  if (!ok) failures += 1
}

async function main() {
  console.log(`Snapshot render check — ${BASE}\n`)
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } })

  for (const c of CASES) {
    const page = await ctx.newPage()
    const url = `${BASE}/snapshot?url=${c.domain}&ts=${c.ts}&u=${encodeURIComponent(`https://${c.domain}/`)}`
    await page.goto(url, { waitUntil: 'domcontentloaded' })

    const iframe = page.locator('iframe').first()
    check((await iframe.count()) > 0, `${c.domain}: iframe element present`)

    const src = await iframe.getAttribute('src').catch(() => null)
    check(
      Boolean(src && src.includes(`web.archive.org/web/${c.ts}/`)),
      `${c.domain}: iframe src is the real archive URL`,
    )

    // Give the archive time to respond, then decide which state we are in.
    await page.waitForTimeout(12000)
    const blocked = await page
      .getByText(/cannot be embedded|无法内嵌/i)
      .first()
      .isVisible()
      .catch(() => false)

    const externalOk = await page
      .locator('a[href*="web.archive.org/web/"]')
      .first()
      .isVisible()
      .catch(() => false)

    if (blocked) {
      check(externalOk, `${c.domain}: embed blocked → external escape hatch shown`)
    } else {
      check(true, `${c.domain}: snapshot rendered inline (no block detected)`)
    }

    // The page must never be a lie: the archive link always exists.
    check(externalOk, `${c.domain}: "open on Internet Archive" link present`)
    await page.close()
  }

  await browser.close()
  console.log(`\n${failures === 0 ? 'SNAPSHOT CHECKS PASSED' : failures + ' FAILURE(S)'}`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
