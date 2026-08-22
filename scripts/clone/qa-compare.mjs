import { chromium } from 'playwright'
import fs from 'node:fs/promises'

const SHOTS = '/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/design-references/minhdathanh-com-b3d3a9eb/root-8a5edab2'
const REF = 'https://minhdathanh.com/'
const CLONE = 'http://localhost:3311/'

/** Bộ "bất biến thiết kế" — thứ PHẢI khớp giữa hai bản, không phụ thuộc số lượng nội dung. */
const PROBE = (which) => {
  const cs = (el) => el && getComputedStyle(el)
  const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { w: +r.width.toFixed(1), h: +r.height.toFixed(1) } }
  const q = (sel) => document.querySelector(sel)
  const isRef = which === 'ref'

  // bộ chọn khác nhau giữa hai bản, nhưng cùng trỏ tới một khối
  const sel = isRef
    ? {
        topbar: '.header-top', mainbar: '#masthead', logo: '#logo img',
        navLink: '#masthead .header-nav > li > a[href$="/"]',
        slider: '.slider-wrapper', row: '.row-main',
        titleWrap: '.section-title-container', titleH2: '.section-title-container h2',
        titleSpan: '.section-title-main', titleRule: '.section-title-container b',
        blue: null, band: null,
        tileImg: null, tileCap: null,
        footerBand: '.footer-widgets', footerCopy: '.absolute-footer',
      }
    : {
        topbar: 'header > div:first-child', mainbar: 'header > div:nth-child(2)', logo: 'header img',
        navLink: 'header nav a',
        slider: 'section[aria-roledescription="carousel"] > div', row: '.vnd-container',
        titleWrap: 'section[aria-label="Danh mục sản phẩm"]', titleH2: 'h2',
        titleSpan: 'h2 > span:nth-child(2)', titleRule: 'h2 > span[aria-hidden]',
        blue: 'section[aria-label="Danh mục sản phẩm"]', band: null,
        tileImg: null, tileCap: null,
        footerBand: 'footer > div:first-child', footerCopy: 'footer > div:last-child',
      }

  // dải xanh: bản gốc nhận ra bằng màu nền, bản clone bằng aria-label
  const sections = [...document.querySelectorAll('section')]
  const blue = isRef
    ? sections.find((s) => cs(s).backgroundColor === 'rgb(50, 137, 245)')
    : q('section[aria-label="Danh mục sản phẩm"]')
  const band = isRef
    ? sections.find((s) => cs(s).backgroundColor === 'rgb(20, 135, 201)')
    : sections[sections.length - 1]

  // ô đầu tiên trong dải xanh
  const firstTile = blue && blue.querySelector(isRef ? '.col .col-inner' : 'article')
  const tileImgWrap = firstTile && firstTile.querySelector(isRef ? '.img' : 'div')
  const tileCap = firstTile && firstTile.querySelector('p')
  const tileCol = blue && blue.querySelector(isRef ? '.row > .col' : '.flex-wrap > div')

  const g = (sel) => { const e = q(sel); return e ? { ...box(e), padding: cs(e).padding, margin: cs(e).margin, bg: cs(e).backgroundColor } : null }
  const t = (sel) => { const e = q(sel); return e ? { fontSize: cs(e).fontSize, lineHeight: cs(e).lineHeight, fontWeight: cs(e).fontWeight, color: cs(e).color, textTransform: cs(e).textTransform, letterSpacing: cs(e).letterSpacing } : null }

  return {
    docHeight: document.body.scrollHeight,
    topbar: g(sel.topbar),
    mainbar: g(sel.mainbar),
    logo: box(q(sel.logo)),
    navLink: t(sel.navLink),
    slider: box(q(sel.slider)),
    contentWidth: box(q(sel.row)),
    titleH2: (() => { const e = q(sel.titleH2); return e ? { ...box(e), margin: cs(e).margin, fontSize: cs(e).fontSize, lineHeight: cs(e).lineHeight, color: cs(e).color, display: cs(e).display, justifyContent: cs(e).justifyContent } : null })(),
    titleSpan: t(sel.titleSpan),
    titleRule: (() => { const e = q(sel.titleRule); return e ? { h: box(e).h, bg: cs(e).backgroundColor } : null })(),
    blue: blue ? { ...box(blue), padding: cs(blue).padding, minHeight: cs(blue).minHeight, alignItems: cs(blue).alignItems } : null,
    blueTint: (() => {
      if (!blue) return null
      // màu thực sự nhìn thấy: lấy pixel nền bằng cách đọc lớp phủ trên cùng
      const layers = [...blue.children].map((c) => cs(c).backgroundColor).filter((c) => c && c !== 'rgba(0, 0, 0, 0)')
      return { sectionBg: cs(blue).backgroundColor, layers }
    })(),
    tileCol: tileCol ? { ...box(tileCol), maxWidth: cs(tileCol).maxWidth, padding: cs(tileCol).padding } : null,
    tileImg: tileImgWrap ? { ...box(tileImgWrap), margin: cs(tileImgWrap).margin, overflow: cs(tileImgWrap).overflow } : null,
    tileCap: tileCap ? { ...box(tileCap), margin: cs(tileCap).margin, textAlign: cs(tileCap).textAlign, fontSize: cs(tileCap).fontSize, lineHeight: cs(tileCap).lineHeight, color: cs(tileCap).color, fontWeight: cs(tileCap).fontWeight } : null,
    band: band ? { ...box(band), padding: cs(band).padding, bg: cs(band).backgroundColor, alignItems: cs(band).alignItems } : null,
    bandCols: band ? [...band.querySelectorAll(isRef ? '.row > .col' : '.flex-wrap > div')].slice(0, 2).map((c) => ({ ...box(c), maxWidth: cs(c).maxWidth, padding: cs(c).padding })) : null,
    footerBand: g(sel.footerBand),
    footerCopy: (() => { const e = q(sel.footerCopy); return e ? { ...box(e), padding: cs(e).padding, bg: cs(e).backgroundColor, fontSize: cs(e).fontSize, color: cs(e).color, textAlign: cs(e).textAlign } : null })(),
    body: t('body'),
  }
}

const browser = await chromium.launch()
const results = {}

for (const [label, url] of [['ref', REF], ['clone', CLONE]]) {
  results[label] = {}
  for (const [name, w, h] of [['desktop-1440', 1440, 900], ['tablet-768', 768, 1024], ['mobile-390', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await page.waitForTimeout(2500)
    await page.evaluate(async () => { await new Promise((r) => { let y = 0; const s = () => { y += innerHeight * 0.8; scrollTo(0, y); if (y < document.body.scrollHeight) setTimeout(s, 100); else { scrollTo(0, 0); setTimeout(r, 500) } }; s() }) })
    await page.waitForTimeout(1200)
    const prefix = label === 'ref' ? '' : 'CLONE-'
    await page.screenshot({ path: `${SHOTS}/${prefix}${name}-full.png`, fullPage: true })
    results[label][name] = await page.evaluate(PROBE, label)
    await page.close()
  }
  console.log(label, 'xong')
}

await fs.writeFile('/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/research/minhdathanh-com-b3d3a9eb/root-8a5edab2/raw-qa-compare.json', JSON.stringify(results, null, 2))
await browser.close()
console.log('đã ghi raw-qa-compare.json')
