import { chromium } from 'playwright'
import fs from 'node:fs/promises'

const OUT = '/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/research/minhdathanh-com-b3d3a9eb/root-8a5edab2'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('https://minhdathanh.com/', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForLoadState('load', { timeout: 60000 }).catch(()=>{})
await page.waitForTimeout(3000)
await page.evaluate(async () => { await new Promise(r=>{let y=0;const s=()=>{y+=700;window.scrollTo(0,y);if(y<document.body.scrollHeight)setTimeout(s,100);else{window.scrollTo(0,0);setTimeout(r,500)}};s()}) })
await page.waitForTimeout(1200)

const sections = await page.evaluate(() => {
  const cs = el => getComputedStyle(el)
  const rowMain = document.querySelector('#content .row-main') || document.querySelector('#content')
  const out = []
  const walk = (el, depth) => {
    for (const c of el.children) {
      const r = c.getBoundingClientRect()
      if (r.height < 30) continue
      const s = cs(c)
      const cls = (c.className?.toString?.()||'')
      out.push({
        depth, tag: c.tagName.toLowerCase(), id: c.id||null, cls: cls.slice(0,140),
        top: Math.round(r.top+window.scrollY), h: Math.round(r.height), w: Math.round(r.width),
        bg: s.backgroundColor, bgImg: s.backgroundImage!=='none'?s.backgroundImage.slice(0,120):null,
        pad: s.padding, margin: s.margin, display: s.display, flexDir: s.flexDirection,
        gridCols: s.gridTemplateColumns!=='none'?s.gridTemplateColumns:null,
        imgs: c.querySelectorAll('img').length, links: c.querySelectorAll('a').length,
        heads: [...c.querySelectorAll('h1,h2,h3,h4,h5,h6')].slice(0,3).map(h=>h.tagName+':'+h.textContent.trim().slice(0,50)),
        txt: (c.innerText||'').trim().replace(/\s+/g,' ').slice(0,110),
      })
      if (depth < 4) walk(c, depth+1)
    }
  }
  walk(rowMain, 0)
  return out
})
await fs.writeFile(OUT+'/raw-sections.json', JSON.stringify(sections, null, 2))
console.log('nodes:', sections.length)
await browser.close()
