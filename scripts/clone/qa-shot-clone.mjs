import { chromium } from 'playwright'
const SHOTS = '/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/design-references/minhdathanh-com-b3d3a9eb/root-8a5edab2'
const b = await chromium.launch()
for (const [name, w, h] of [['desktop-1440', 1440, 900], ['tablet-768', 768, 1024], ['mobile-390', 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  await p.goto('http://localhost:3311/', { waitUntil: 'domcontentloaded', timeout: 120000 })
  await p.waitForTimeout(2000)
  await p.evaluate(async () => { await new Promise((r) => { let y = 0; const s = () => { y += innerHeight * 0.8; scrollTo(0, y); if (y < document.body.scrollHeight) setTimeout(s, 100); else { scrollTo(0, 0); setTimeout(r, 500) } }; s() }) })
  await p.waitForTimeout(1000)
  await p.screenshot({ path: `${SHOTS}/CLONE-${name}-full.png`, fullPage: true })
  console.log(name, 'ok')
  await p.close()
}
await b.close()
