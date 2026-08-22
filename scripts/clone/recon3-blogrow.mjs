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
  const P = ['fontSize','lineHeight','fontWeight','color','textAlign','textTransform','letterSpacing','margin','padding','display','backgroundColor','borderRadius','overflow','objectFit','aspectRatio','border','boxShadow','position','flexDirection','justifyContent','alignItems','gap','maxWidth','width','height']
  const pick = el => { const c = cs(el); const o = {}; P.forEach(k => { const v = c[k]; if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px') o[k] = v }); return o }
  const walk = (el, d = 0, max = 5) => d > max ? null : ({
    tag: el.tagName.toLowerCase(),
    classes: el.className?.toString().split(' ').slice(0, 4).join(' '),
    ...box(el),
    text: [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) ? el.textContent.trim().replace(/\s+/g,' ').slice(0,120) : null,
    styles: pick(el),
    img: el.tagName === 'IMG' ? { src: el.src.slice(0,120), natural: el.naturalWidth + 'x' + el.naturalHeight } : undefined,
    children: [...el.children].slice(0, 8).map(c => walk(c, d + 1, max)).filter(Boolean),
  })

  // blog row = the row whose columns contain .post-item / article
  const rows = [...document.querySelectorAll('#content .row')]
  const blogRow = rows.find(r => r.querySelector('article, .post-item, .box-blog-post'))
  // slider chrome
  const prev = document.querySelector('.flickity-prev-next-button.previous')
  const dots = document.querySelector('.flickity-page-dots')
  const dot = document.querySelector('.flickity-page-dots .dot')
  // footer widgets
  const fw = [...document.querySelectorAll('.footer-widgets .col')]
  return {
    blogRow: blogRow ? { ...box(blogRow), styles: pick(blogRow), cols: blogRow.children.length, colMaxWidth: cs(blogRow.firstElementChild).maxWidth, tree: walk(blogRow.firstElementChild, 0, 5) } : null,
    sliderChrome: {
      prev: prev && { ...box(prev), styles: pick(prev) },
      dots: dots && { ...box(dots), styles: pick(dots) },
      dot: dot && { ...box(dot), styles: pick(dot) },
      dotActive: document.querySelector('.flickity-page-dots .dot.is-selected') && pick(document.querySelector('.flickity-page-dots .dot.is-selected')),
    },
    footerWidgets: fw.map(c => ({ ...box(c), styles: pick(c), tree: walk(c, 0, 3) })),
    backToTop: document.querySelector('#top-link, .back-to-top') && pick(document.querySelector('#top-link, .back-to-top')),
  }
})
await fs.writeFile(RESEARCH + '/raw-recon3.json', JSON.stringify(out, null, 2))
console.log('ok', out.blogRow ? 'blogRow cols=' + out.blogRow.cols : 'no blogRow')
await browser.close()
