import { chromium } from 'playwright'
import fs from 'node:fs/promises'
const R = '/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/research/minhdathanh-com-b3d3a9eb/root-8a5edab2'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('https://minhdathanh.com/', { waitUntil: 'domcontentloaded', timeout: 90000 })
await p.waitForTimeout(2500)
await p.evaluate(async () => { await new Promise((r) => { let y = 0; const s = () => { y += innerHeight * 0.8; scrollTo(0, y); if (y < document.body.scrollHeight) setTimeout(s, 100); else { scrollTo(0, 0); setTimeout(r, 500) } }; s() }) })
await p.waitForTimeout(1000)

const out = await p.evaluate(() => {
  const txt = (e) => (e?.textContent || '').trim().replace(/\s+/g, ' ')
  // menu chính + menu con
  const nav = [...document.querySelectorAll('#masthead .header-nav > li')].map((li) => ({
    label: txt(li.querySelector(':scope > a')),
    children: [...li.querySelectorAll('ul li a')].map((a) => txt(a)),
  }))
  // 8 ô danh mục trong dải xanh
  const blue = [...document.querySelectorAll('section.section')]
    .find((s) => getComputedStyle(s).backgroundColor === 'rgb(50, 137, 245)')
  const tiles = blue ? [...blue.querySelectorAll('.col .col-inner')].map((c) => txt(c.querySelector('p'))) : []
  // tiêu đề các nhóm + số thẻ mỗi nhóm
  const colInner = document.querySelector('#content .row.row-main > .col > .col-inner')
  const grid = [...document.querySelectorAll('section.section')][1]
  const groups = []
  if (grid) {
    const kids = [...grid.querySelector('.col-inner').children]
    let current = null
    for (const k of kids) {
      if (k.classList.contains('section-title-container')) {
        current = { title: txt(k.querySelector('.section-title-main')), items: [] }
        groups.push(current)
      } else if (k.classList.contains('row') && current) {
        current.items = [...k.querySelectorAll('.col')].map((c) => txt(c.querySelector('p, h5')) || null).filter(Boolean)
      }
    }
  }
  return { nav, tiles, groups, standaloneTitle: txt(document.querySelector('.section-title-container .section-title-main')) }
})
await fs.writeFile(R + '/raw-taxonomy.json', JSON.stringify(out, null, 2))
console.log(JSON.stringify(out, null, 1))
await b.close()
