import { chromium } from 'playwright'
import fs from 'node:fs/promises'
const RESEARCH = '/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/research/minhdathanh-com-b3d3a9eb/root-8a5edab2'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('https://minhdathanh.com/', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForTimeout(2500)
await page.evaluate(async () => { await new Promise(r => { let y = 0; const s = () => { y += innerHeight * 0.8; scrollTo(0, y); if (y < document.body.scrollHeight) setTimeout(s, 110); else { scrollTo(0, 0); setTimeout(r, 500) } }; s() }) })
await page.waitForTimeout(1000)

const out = await page.evaluate(() => {
  const cs = el => getComputedStyle(el)
  const box = el => { const r = el.getBoundingClientRect(); return { w: +r.width.toFixed(2), h: +r.height.toFixed(2), top: Math.round(r.top + scrollY) } }
  const P = ['fontSize','lineHeight','fontWeight','color','textAlign','textTransform','letterSpacing','margin','padding','display','backgroundColor','borderRadius','overflow','objectFit','aspectRatio','border','boxShadow','position','flexDirection','justifyContent','alignItems','gap','maxWidth','width','height','whiteSpace','WebkitLineClamp']
  const pick = el => { const c = cs(el); const o = {}; P.forEach(k => { const v = c[k]; if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)') o[k] = v }); return o }
  const walk = (el, d = 0, max = 6) => d > max ? null : ({
    tag: el.tagName.toLowerCase(),
    classes: el.className?.toString().split(' ').slice(0, 5).join(' '),
    ...box(el),
    text: [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) ? el.textContent.trim().replace(/\s+/g,' ').slice(0,140) : null,
    styles: pick(el),
    img: el.tagName === 'IMG' ? { src: el.src.slice(0,130), natural: el.naturalWidth + 'x' + el.naturalHeight } : undefined,
    children: [...el.children].slice(0, 8).map(c => walk(c, d + 1, max)).filter(Boolean),
  })
  // find the row whose absolute top is ~3222
  const rows = [...document.querySelectorAll('#content .row')]
  const target = rows.map(r => ({ r, t: Math.round(r.getBoundingClientRect().top + scrollY) })).find(x => Math.abs(x.t - 3222) < 12)
  const row = target && target.r
  return row ? {
    row: { ...box(row), styles: pick(row), cols: row.children.length, colMaxWidth: cs(row.firstElementChild).maxWidth, colPadding: cs(row.firstElementChild).padding },
    firstCard: walk(row.children[0], 0, 6),
    allCardHeights: [...row.children].map(c => box(c).h),
  } : { error: 'not found', rowTops: rows.map(r => Math.round(r.getBoundingClientRect().top + scrollY)) }
})
await fs.writeFile(RESEARCH + '/raw-newsrow.json', JSON.stringify(out, null, 2))
console.log(out.error ? JSON.stringify(out) : 'cols=' + out.row.cols + ' maxW=' + out.row.colMaxWidth)
await browser.close()
