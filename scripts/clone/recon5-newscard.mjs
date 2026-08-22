import { chromium } from 'playwright'
import fs from 'node:fs/promises'
const R = '/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/research/minhdathanh-com-b3d3a9eb/root-8a5edab2'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('https://minhdathanh.com/', { waitUntil: 'domcontentloaded', timeout: 60000 })
await p.waitForTimeout(2500)
await p.evaluate(async () => { await new Promise(r => { let y = 0; const s = () => { y += innerHeight * 0.8; scrollTo(0, y); if (y < document.body.scrollHeight) setTimeout(s, 110); else { scrollTo(0, 0); setTimeout(r, 500) } }; s() }) })
await p.waitForTimeout(800)
const out = await p.evaluate(() => {
  const cs = el => getComputedStyle(el)
  const box = el => { const r = el.getBoundingClientRect(); return { w: +r.width.toFixed(2), h: +r.height.toFixed(2) } }
  const P = ['fontSize','lineHeight','fontWeight','color','textAlign','textTransform','letterSpacing','margin','padding','display','borderRadius','overflow','objectFit','position','backgroundColor']
  const pick = el => { const c = cs(el); const o = {}; P.forEach(k => o[k] = c[k]); return o }
  const bt = document.querySelector('.box-blog-post .box-text')
  const bi = document.querySelector('.box-blog-post .box-image')
  const nodes = bt ? [...bt.querySelectorAll('*')].slice(0, 15).map(n => ({ tag: n.tagName.toLowerCase(), classes: n.className?.toString().slice(0,60), text: (n.textContent||'').trim().replace(/\s+/g,' ').slice(0,90), ...box(n), ...pick(n) })) : null
  const im = bi && bi.querySelector('img')
  // product/tile card title (h5) inside the 4-up rows, if any
  const h5 = document.querySelector('#content .col-inner h5, #content .box-text h5')
  return {
    boxImage: bi && { ...box(bi), ...pick(bi), imgStyles: im && { ...box(im), ...pick(im), natural: im.naturalWidth+'x'+im.naturalHeight, aspectRatio: cs(im).aspectRatio } },
    boxText: bt && { ...box(bt), ...pick(bt) },
    nodes,
    h5: h5 && { text: h5.textContent.trim().slice(0,60), ...box(h5), ...pick(h5) },
  }
})
await fs.writeFile(R + '/raw-newscard.json', JSON.stringify(out, null, 2))
console.log(JSON.stringify(out.nodes?.map(n => n.tag + '.' + (n.classes||'').split(' ')[0] + ' ' + n.fontSize + '/' + n.lineHeight + ' ' + n.fontWeight + ' ' + n.color + ' m=' + n.margin + ' "' + n.text.slice(0,40) + '"'), null, 1))
console.log('IMG', JSON.stringify(out.boxImage))
await b.close()
