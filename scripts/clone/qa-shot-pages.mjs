import { chromium } from 'playwright'
import fs from 'node:fs/promises'
const OUT = '/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/design-references/pages'
await fs.mkdir(OUT, { recursive: true })
const b = await chromium.launch()
for (const slug of ['gioi-thieu', 'cong-trinh-thi-cong', 'lien-he']) {
  for (const [name, w, h] of [['desktop-1440', 1440, 900], ['mobile-390', 390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
    await p.goto(`http://localhost:3311/${slug}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    await p.waitForTimeout(2000)
    await p.evaluate(async () => { await new Promise((r) => { let y = 0; const s = () => { y += innerHeight * 0.5; scrollTo(0, y); if (y < document.body.scrollHeight) setTimeout(s, 260); else { scrollTo(0, 0); setTimeout(r, 600) } }; s() }) })
    await p.waitForTimeout(2500)
    await p.screenshot({ path: `${OUT}/${slug}-${name}.png`, fullPage: true })
    await p.close()
  }
  console.log(slug, 'ok')
}
await b.close()
