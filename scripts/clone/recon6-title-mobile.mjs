import { chromium } from 'playwright'
const b = await chromium.launch()
for (const [name, w] of [['mobile-390', 390], ['tile-549', 549], ['tile-551', 551], ['desktop-1440', 1440]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } })
  await p.goto('https://minhdathanh.com/', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await p.waitForTimeout(2000)
  const r = await p.evaluate(() => {
    const cs = (e) => e && getComputedStyle(e)
    const wrap = document.querySelector('.section-title-container')
    const h2 = wrap?.querySelector('h2')
    const span = wrap?.querySelector('.section-title-main')
    const link = wrap?.querySelector('a')
    const icon = link?.querySelector('svg, i, span')
    const pick = (e) => e ? { fs: cs(e).fontSize, lh: cs(e).lineHeight, fw: cs(e).fontWeight, m: cs(e).margin, p: cs(e).padding } : null
    return { wrap: wrap && { m: cs(wrap).margin, h: +wrap.getBoundingClientRect().height.toFixed(2) },
             h2: pick(h2), span: pick(span), link: pick(link), icon: icon && { w: +icon.getBoundingClientRect().width.toFixed(1) } }
  })
  console.log(name.padEnd(13), JSON.stringify(r))
  await p.close()
}
await b.close()
