import { chromium } from 'playwright'
import fs from 'node:fs/promises'
const OUT = '/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/design-references/pages'
await fs.mkdir(OUT, { recursive: true })
const slug = process.argv[2]
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
await p.goto(`http://localhost:3311/${slug}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
await p.waitForTimeout(2500)
const total = await p.evaluate(() => document.body.scrollHeight)
const steps = Math.ceil(total / 800)
for (let i = 0; i < steps; i++) {
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), i * 800)
  await p.waitForTimeout(900)
  await p.screenshot({ path: `${OUT}/${slug}-scroll-${String(i).padStart(2, '0')}.png` })
}
console.log(slug, '→', steps, 'nấc, cao', total)
await b.close()
