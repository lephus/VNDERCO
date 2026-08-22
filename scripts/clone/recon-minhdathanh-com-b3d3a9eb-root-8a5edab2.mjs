import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'

const URL = 'https://minhdathanh.com/'
const SITE = 'minhdathanh-com-b3d3a9eb'
const PAGE = 'root-8a5edab2'
const ROOT = '/Users/lehuuphu/Documents/workspace/frn/VNDERCO'
const SHOTS = path.join(ROOT, 'docs/design-references', SITE, PAGE)
const RESEARCH = path.join(ROOT, 'docs/research', SITE, PAGE)

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
})
const page = await ctx.newPage()
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForLoadState('load', { timeout: 60000 }).catch(() => {}); await page.waitForTimeout(3000)

// force lazy images to load by scrolling through the page
await page.evaluate(async () => {
  await new Promise((resolve) => {
    let y = 0
    const step = () => {
      y += window.innerHeight * 0.8
      window.scrollTo(0, y)
      if (y < document.body.scrollHeight) setTimeout(step, 120)
      else { window.scrollTo(0, 0); setTimeout(resolve, 600) }
    }
    step()
  })
})
await page.waitForTimeout(1500)

await fs.mkdir(SHOTS, { recursive: true })
await page.screenshot({ path: path.join(SHOTS, 'desktop-1440-full.png'), fullPage: true })
await page.screenshot({ path: path.join(SHOTS, 'desktop-1440-viewport.png') })

// ---------- global extraction ----------
const global = await page.evaluate(() => {
  const cs = (el) => getComputedStyle(el)
  const uniq = (a) => [...new Set(a)]
  const body = document.body

  // color census across visible elements
  const colorCount = {}, bgCount = {}, fontCount = {}, sizeCount = {}
  const els = [...document.querySelectorAll('body *')]
  for (const el of els) {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue
    const s = cs(el)
    colorCount[s.color] = (colorCount[s.color] || 0) + 1
    if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') bgCount[s.backgroundColor] = (bgCount[s.backgroundColor] || 0) + 1
    fontCount[s.fontFamily] = (fontCount[s.fontFamily] || 0) + 1
    if (el.textContent && el.children.length === 0) sizeCount[`${s.fontSize}/${s.lineHeight}/${s.fontWeight}`] = (sizeCount[`${s.fontSize}/${s.lineHeight}/${s.fontWeight}`] || 0) + 1
  }
  const top = (o, n = 20) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n)

  return {
    title: document.title,
    lang: document.documentElement.lang,
    bodyFont: cs(body).fontFamily,
    bodyFontSize: cs(body).fontSize,
    bodyLineHeight: cs(body).lineHeight,
    bodyColor: cs(body).color,
    bodyBg: cs(body).backgroundColor,
    scrollHeight: document.body.scrollHeight,
    topColors: top(colorCount),
    topBackgrounds: top(bgCount),
    topFonts: top(fontCount, 10),
    topTextStyles: top(sizeCount, 25),
    headings: ['h1','h2','h3','h4','h5'].map(t => {
      const el = document.querySelector(t)
      if (!el) return null
      const s = cs(el)
      return { tag: t, text: el.textContent.trim().slice(0,80), fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, color: s.color, fontFamily: s.fontFamily, letterSpacing: s.letterSpacing, textTransform: s.textTransform, margin: s.margin }
    }).filter(Boolean),
    fontLinks: [...document.querySelectorAll('link[rel="stylesheet"],link[rel="preload"]')].map(l => l.href).filter(h => /font/i.test(h)),
    stylesheets: [...document.styleSheets].map(s => s.href).filter(Boolean),
    favicons: [...document.querySelectorAll('link[rel*="icon"]')].map(l => ({ href: l.href, sizes: l.sizes?.toString(), rel: l.rel })),
    scripts: [...document.querySelectorAll('script[src]')].map(s => s.src),
    containerWidths: uniq([...document.querySelectorAll('.row, .container, .section-content, .flex-row')].map(el => cs(el).width + ' / max ' + cs(el).maxWidth)).slice(0, 15),
  }
})

// ---------- page topology: top-level sections ----------
const topology = await page.evaluate(() => {
  const cs = (el) => getComputedStyle(el)
  const out = []
  const walk = (el, depth) => {
    for (const child of el.children) {
      const r = child.getBoundingClientRect()
      const s = cs(child)
      if (r.height < 40) continue
      const tag = child.tagName.toLowerCase()
      if (['script','style','noscript'].includes(tag)) continue
      out.push({
        depth,
        tag,
        id: child.id || null,
        classes: (child.className?.toString?.() || '').slice(0, 160),
        top: Math.round(r.top + window.scrollY),
        height: Math.round(r.height),
        width: Math.round(r.width),
        position: s.position,
        bg: s.backgroundColor,
        bgImage: s.backgroundImage !== 'none' ? s.backgroundImage.slice(0, 200) : null,
        padding: s.padding,
        zIndex: s.zIndex,
        text: (child.innerText || '').trim().slice(0, 120).replace(/\s+/g, ' '),
        childCount: child.children.length,
      })
      if (depth < 3) walk(child, depth + 1)
    }
  }
  walk(document.body, 0)
  return out
})

// ---------- assets ----------
const assets = await page.evaluate(() => {
  const abs = (u) => { try { return new URL(u, location.href).href } catch { return u } }
  return {
    images: [...document.querySelectorAll('img')].map(img => ({
      src: img.currentSrc || img.src, alt: img.alt,
      w: img.naturalWidth, h: img.naturalHeight,
      displayW: Math.round(img.getBoundingClientRect().width),
      displayH: Math.round(img.getBoundingClientRect().height),
      cls: (img.className?.toString?.()||'').slice(0,80),
      parentCls: (img.parentElement?.className?.toString?.()||'').slice(0,80),
      srcset: (img.srcset||'').slice(0,300),
    })).filter(i => i.src),
    backgroundImages: [...new Set([...document.querySelectorAll('*')].map(el => {
      const b = getComputedStyle(el).backgroundImage
      return b && b !== 'none' ? b : null
    }).filter(Boolean))].map(b => {
      const m = b.match(/url\(["']?(.*?)["']?\)/)
      return m ? abs(m[1]) : b
    }).slice(0, 60),
    videos: [...document.querySelectorAll('video')].map(v => ({ src: v.src || v.querySelector('source')?.src, poster: v.poster, autoplay: v.autoplay, loop: v.loop, muted: v.muted })),
    inlineSvgs: [...document.querySelectorAll('svg')].map(s => ({ cls: (s.className?.baseVal||'').slice(0,60), viewBox: s.getAttribute('viewBox'), html: s.outerHTML.slice(0, 900) })).slice(0, 40),
    iconFonts: [...new Set([...document.querySelectorAll('i,span')].map(el => getComputedStyle(el).fontFamily).filter(f => /icon|fontawesome|flatsome/i.test(f)))],
  }
})

await fs.mkdir(RESEARCH, { recursive: true })
await fs.writeFile(path.join(RESEARCH, 'raw-global.json'), JSON.stringify(global, null, 2))
await fs.writeFile(path.join(RESEARCH, 'raw-topology.json'), JSON.stringify(topology, null, 2))
await fs.writeFile(path.join(RESEARCH, 'raw-assets.json'), JSON.stringify(assets, null, 2))

console.log('scrollHeight', global.scrollHeight)
console.log('sections captured', topology.length)
console.log('images', assets.images.length, 'bgImages', assets.backgroundImages.length, 'svgs', assets.inlineSvgs.length)

await browser.close()
