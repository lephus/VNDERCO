import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'

const URL = 'https://minhdathanh.com/'
const ROOT = '/Users/lehuuphu/Documents/workspace/frn/VNDERCO'
const RESEARCH = path.join(ROOT, 'docs/research/minhdathanh-com-b3d3a9eb/root-8a5edab2')

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
})
const page = await ctx.newPage()
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForLoadState('load', { timeout: 60000 }).catch(() => {})
await page.waitForTimeout(2500)
await page.evaluate(async () => {
  await new Promise((r) => { let y = 0; const s = () => { y += innerHeight * 0.8; scrollTo(0, y); if (y < document.body.scrollHeight) setTimeout(s, 110); else { scrollTo(0, 0); setTimeout(r, 600) } }; s() })
})
await page.waitForTimeout(1200)

const out = await page.evaluate(() => {
  const cs = (el) => getComputedStyle(el)
  const box = (el) => { const r = el.getBoundingClientRect(); return { w: +r.width.toFixed(2), h: +r.height.toFixed(2), top: Math.round(r.top + scrollY) } }
  const pick = (el, keys) => { const c = cs(el); const o = {}; keys.forEach(k => o[k] = c[k]); return o }
  const TEXT = ['fontSize','lineHeight','fontWeight','color','textAlign','textTransform','letterSpacing','margin','padding']
  const BOXK = ['display','flexDirection','flexWrap','justifyContent','alignItems','gap','width','maxWidth','minHeight','padding','margin','backgroundColor','borderRadius','boxShadow','position','overflow']

  // 1. assembly order of the main column
  const colInner = document.querySelector('#content .row.row-main > .col > .col-inner')
  const assembly = [...colInner.children].map(el => ({
    tag: el.tagName.toLowerCase(),
    classes: el.className?.toString().slice(0, 90),
    ...box(el),
    bg: cs(el).backgroundColor,
    padding: cs(el).padding,
    text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 70),
  }))

  // 2. every section-title on the page
  const titles = [...document.querySelectorAll('.section-title-container')].map(el => {
    const h2 = el.querySelector('h2')
    const span = el.querySelector('.section-title-main, span')
    const rule = el.querySelector('b')
    const link = el.querySelector('a')
    return {
      ...box(el), containerStyles: pick(el, ['margin','padding','maxWidth','width']),
      h2: h2 && { ...box(h2), ...pick(h2, [...TEXT, 'display','justifyContent','alignItems','flexWrap']) },
      span: span && { text: span.textContent.trim(), ...box(span), ...pick(span, TEXT) },
      rule: rule && { ...box(rule), ...pick(rule, ['backgroundColor','height','display','flexGrow','flex']) },
      link: link && { text: link.textContent.trim(), href: link.href, ...pick(link, [...TEXT, 'display','alignItems']) },
    }
  })

  // 3. tile rows: how many rows, how many tiles each
  const rows = [...document.querySelectorAll('#content .row')].filter(r => r.querySelector('.col-inner .img')).map(r => ({
    classes: r.className.slice(0, 70), ...box(r), ...pick(r, ['display','flexWrap','margin']),
    cols: r.children.length,
    colWidth: r.firstElementChild && cs(r.firstElementChild).maxWidth,
    colPadding: r.firstElementChild && cs(r.firstElementChild).padding,
    tiles: [...r.children].slice(0, 12).map(c => {
      const img = c.querySelector('img')
      const cap = c.querySelector('p a span, p a, p')
      const imgWrap = c.querySelector('.img')
      return {
        caption: cap && cap.textContent.trim().slice(0, 60),
        capStyles: cap && pick(cap, ['fontSize','lineHeight','fontWeight','color','textAlign']),
        capP: c.querySelector('p') && pick(c.querySelector('p'), ['margin','textAlign']),
        imgWrap: imgWrap && { ...box(imgWrap), ...pick(imgWrap, ['margin','overflow','borderRadius']) },
        img: img && { natural: img.naturalWidth + 'x' + img.naturalHeight, ...box(img), ...pick(img, ['objectFit','borderRadius','aspectRatio','transition']) },
      }
    }),
  }))

  // 4. commitment band right column
  const band = [...document.querySelectorAll('section.section')].find(s => cs(s).backgroundColor === 'rgb(20, 135, 201)')
  const bandRow = band && band.querySelector('.row')
  const bandCols = bandRow ? [...bandRow.children].map(c => ({
    ...box(c), ...pick(c, ['maxWidth','padding','textAlign']),
    html: c.innerHTML.replace(/\s+/g, ' ').slice(0, 700),
    nodes: [...c.querySelectorAll('h1,h2,h3,h4,h5,p,li,a,img,span')].slice(0, 20).map(n => ({
      tag: n.tagName.toLowerCase(),
      text: (n.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
      ...pick(n, TEXT),
      ...(n.tagName === 'IMG' ? { src: n.src, natural: n.naturalWidth + 'x' + n.naturalHeight, ...box(n) } : {}),
    })),
  })) : null
  const bandStyles = band && { ...box(band), ...pick(band, BOXK) }

  // 5. blue tile section wrapper + overlay
  const blue = [...document.querySelectorAll('section.section')].find(s => cs(s).backgroundColor === 'rgb(50, 137, 245)')
  const blueOverlay = blue && blue.querySelector('.section-bg-overlay')
  const blueInfo = blue && {
    section: { ...box(blue), ...pick(blue, BOXK) },
    bg: blue.querySelector('.section-bg') && pick(blue.querySelector('.section-bg'), ['backgroundColor','backgroundImage','position','width','height']),
    overlay: blueOverlay && pick(blueOverlay, ['backgroundColor','position','width','height']),
    inner: blue.querySelector('.col-inner') && box(blue.querySelector('.col-inner')),
  }

  // 6. header details
  const header = document.querySelector('#header')
  const nav = [...document.querySelectorAll('#masthead .header-nav > li > a')].map(a => ({
    text: a.textContent.trim().replace(/\s+/g, ' '), href: a.href, ...pick(a, [...TEXT, 'display']),
    hasChildren: !!a.parentElement.querySelector('ul'),
  }))
  const logo = document.querySelector('#logo img')
  const topbarText = [...document.querySelectorAll('.header-top .flex-col')].map(c => ({
    text: c.textContent.trim().replace(/\s+/g, ' ').slice(0, 60), ...pick(c, TEXT),
  }))

  // 7. slider
  const slider = document.querySelector('.slider-wrapper, .slider')
  const slides = [...document.querySelectorAll('.slider .banner, .flickity-slider > *')].slice(0, 8).map(s => {
    const im = s.querySelector('img')
    return { ...box(s), img: im && { src: im.src, natural: im.naturalWidth + 'x' + im.naturalHeight } }
  })

  return {
    docHeight: document.body.scrollHeight,
    assembly, titles, rows, bandStyles, bandCols, blueInfo,
    header: header && { ...box(header), ...pick(header, ['position','zIndex']) },
    nav, logo: logo && { src: logo.src, ...box(logo), natural: logo.naturalWidth + 'x' + logo.naturalHeight },
    topbarText,
    slider: slider && { ...box(slider), ...pick(slider, ['overflow','position','margin']) },
    slides,
    contentWrapper: pick(document.querySelector('#content'), ['padding','backgroundColor']),
    rowMain: pick(document.querySelector('.row-main'), ['maxWidth','margin','padding','width']),
  }
})

await fs.writeFile(path.join(RESEARCH, 'raw-recon2.json'), JSON.stringify(out, null, 2))
console.log('desktop done, docHeight', out.docHeight, 'assembly', out.assembly.length, 'titles', out.titles.length, 'rows', out.rows.length)

// responsive pass
const resp = {}
for (const [name, w, h] of [['tablet-768', 768, 1024], ['mobile-390', 390, 844]]) {
  const p2 = await ctx.newPage()
  await p2.setViewportSize({ width: w, height: h })
  await p2.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await p2.waitForTimeout(2500)
  resp[name] = await p2.evaluate(() => {
    const cs = (el) => el && getComputedStyle(el)
    const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { w: +r.width.toFixed(2), h: +r.height.toFixed(2) } }
    const blue = [...document.querySelectorAll('section.section')].find(s => cs(s).backgroundColor === 'rgb(50, 137, 245)')
    const band = [...document.querySelectorAll('section.section')].find(s => cs(s).backgroundColor === 'rgb(20, 135, 201)')
    const row = document.querySelector('#content .row .col-inner .img')?.closest('.row')
    const title = document.querySelector('.section-title-main')
    return {
      docHeight: document.body.scrollHeight,
      blue: blue && { ...box(blue), padding: cs(blue).padding, minHeight: cs(blue).minHeight },
      band: band && { ...box(band), padding: cs(band).padding },
      bandCols: band ? [...band.querySelectorAll('.row > .col')].map(c => ({ ...box(c), maxWidth: cs(c).maxWidth })) : null,
      tileCol: row && { colMaxWidth: cs(row.firstElementChild).maxWidth, ...box(row.firstElementChild) },
      titleFont: title && cs(title).fontSize,
      headerMain: box(document.querySelector('#masthead')),
      topbar: box(document.querySelector('.header-top')),
      navVisible: cs(document.querySelector('.header-nav'))?.display,
      slider: box(document.querySelector('.slider-wrapper, .slider')),
      rowMain: box(document.querySelector('.row-main')),
    }
  })
  await p2.close()
}
await fs.writeFile(path.join(RESEARCH, 'raw-recon2-responsive.json'), JSON.stringify(resp, null, 2))
console.log('responsive done')
await browser.close()
