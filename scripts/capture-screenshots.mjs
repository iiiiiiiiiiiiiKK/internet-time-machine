/**
 * Screenshot capture script.
 *
 * Produces the README/social assets from a REAL running build — no mockups.
 * Run against `vite preview` (which mounts the same CDX proxy as production).
 *
 *   node scripts/capture-screenshots.mjs [baseUrl]
 */
import { chromium, devices } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.argv[2] || 'http://127.0.0.1:4173'
const OUT = path.resolve('docs/screenshots')

const SHOTS = [
  { name: 'home-desktop', path: '/', viewport: { width: 1440, height: 960 }, wait: 1200 },
  { name: 'explore-desktop', path: '/explore?url=google.com', viewport: { width: 1440, height: 1000 }, wait: 14000 },
  { name: 'site-desktop', path: '/site/google.com?year=2005', viewport: { width: 1440, height: 1050 }, wait: 18000 },
  { name: 'snapshot-desktop', path: '/snapshot?url=google.com&ts=20050101000000&u=https%3A%2F%2Fwww.google.com%2F', viewport: { width: 1440, height: 1000 }, wait: 9000 },
  { name: 'eras-desktop', path: '/eras', viewport: { width: 1440, height: 1100 }, wait: 900 },
  { name: 'compare-desktop', path: '/compare?url=apple.com&left=2005&right=2025', viewport: { width: 1440, height: 1000 }, wait: 12000 },
  { name: 'about-desktop', path: '/about', viewport: { width: 1440, height: 1000 }, wait: 800 },
]

async function main() {
  await mkdir(OUT, { recursive: true })

  // ---------- Desktop ----------
  const browser = await chromium.launch()
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2 })

  for (const shot of SHOTS) {
    const page = await desktop.newPage()
    await page.setViewportSize(shot.viewport)
    console.log(`→ ${shot.name}`)
    await page.goto(`${BASE}${shot.path}`, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {})
    await page.waitForTimeout(shot.wait)
    await page.screenshot({ path: path.join(OUT, `${shot.name}.png`), fullPage: false })
    await page.close()
  }

  // ---------- iPhone 14 ----------
  const mobile = await browser.newContext({ ...devices['iPhone 14'], deviceScaleFactor: 3 })
  for (const shot of [
    { name: 'home-iphone', path: '/', wait: 1400 },
    { name: 'site-iphone', path: '/site/google.com', wait: 20000 },
    { name: 'eras-iphone', path: '/eras', wait: 900 },
  ]) {
    const page = await mobile.newPage()
    console.log(`→ ${shot.name}`)
    await page.goto(`${BASE}${shot.path}`, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {})
    await page.waitForTimeout(shot.wait)
    await page.screenshot({ path: path.join(OUT, `${shot.name}.png`) })
    await page.close()
  }

  // ---------- Social card (1200x630, from the real hero) ----------
  const social = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 })
  const socialPage = await social.newPage()
  await socialPage.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {})
  await socialPage.waitForTimeout(1500)
  await socialPage.screenshot({ path: path.resolve('public/og.png') })

  await browser.close()
  console.log('done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
