import { chromium } from 'playwright'
import fs from 'node:fs/promises'

const OUT = '/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/research/minhdathanh-com-b3d3a9eb/root-8a5edab2'
const SHOTS = '/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/design-references/minhdathanh-com-b3d3a9eb/root-8a5edab2'

const PROPS = ['fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color','textTransform','textAlign','textDecorationLine','backgroundColor','backgroundImage','padding','margin','width','height','maxWidth','minHeight','display','flexDirection','flexWrap','justifyContent','alignItems','gap','gridTemplateColumns','borderRadius','border','borderBottom','borderTop','boxShadow','overflow','position','top','left','right','bottom','zIndex','opacity','transform','transition','objectFit','textShadow','float']

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('https://minhdathanh.com/', { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForLoadState('load', { timeout: 60000 }).catch(()=>{})
await page.waitForTimeout(3000)
await page.evaluate(async () => { await new Promise(r=>{let y=0;const s=()=>{y+=700;window.scrollTo(0,y);if(y<document.body.scrollHeight)setTimeout(s,100);else{window.scrollTo(0,0);setTimeout(r,500)}};s()}) })
await page.waitForTimeout(1500)

await page.exposeFunction('__props', () => PROPS)

const grab = (sel, label) => page.evaluate(({sel, PROPS}) => {
  const el = document.querySelector(sel)
  if (!el) return { error: 'not found: '+sel }
  const pick = (e) => { const s = getComputedStyle(e); const o = {}; for (const p of PROPS) { const v = s[p]; if (v && v!=='none' && v!=='normal' && v!=='auto' && v!=='0px' && v!=='rgba(0, 0, 0, 0)') o[p]=v } return o }
  const walk = (e, d) => ({
    tag: e.tagName.toLowerCase(),
    cls: (e.className?.toString?.()||'').slice(0,110),
    rect: (r=>({w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y+window.scrollY)}))(e.getBoundingClientRect()),
    text: e.children.length===0 ? (e.textContent||'').trim().slice(0,150) : null,
    img: e.tagName==='IMG' ? { src:e.currentSrc||e.src, alt:e.alt, nw:e.naturalWidth, nh:e.naturalHeight } : null,
    href: e.tagName==='A' ? e.getAttribute('href') : null,
    styles: pick(e),
    children: d<4 ? [...e.children].slice(0,14).map(c=>walk(c,d+1)) : [],
  })
  return walk(el, 0)
}, {sel, PROPS})

const results = {}
const targets = {
  header:        '#header',
  headerTop:     '#top-bar',
  headerMain:    '.header-main',
  logo:          '#logo',
  navMain:       '.header-nav-main',
  navItem:       '.header-nav-main > li:nth-child(2)',
  slider:        '#content .slider-wrapper',
  sectionTitle:  '.section-title-container',
  blueSection:   '#content section.section',
  footer:        '#footer',
  footerWidgets: '.footer-widgets',
  absoluteFooter:'.absolute-footer',
}
for (const [k, sel] of Object.entries(targets)) results[k] = await grab(sel, k)

// all section.section blocks in order
const sectionCount = await page.evaluate(() => document.querySelectorAll('#content section.section').length)
results.sections = []
for (let i = 0; i < sectionCount; i++) results.sections.push(await grab(`#content section.section:nth-of-type(${i+1})`, 'sec'+i))

await fs.writeFile(OUT+'/raw-detail.json', JSON.stringify(results, null, 2))
console.log('sections:', sectionCount, 'keys:', Object.keys(results).join(','))

// ---- section screenshots ----
await fs.mkdir(SHOTS, { recursive: true })
const shots = [
  ['header', '#header'], ['hero-slider', '#content .slider-wrapper'],
  ['footer', '#footer'],
]
for (const [name, sel] of shots) {
  const el = await page.$(sel)
  if (el) { await el.screenshot({ path: `${SHOTS}/section-${name}.png` }).catch(e=>console.log('shot fail',name,e.message)) }
}
for (let i = 0; i < sectionCount; i++) {
  const el = await page.$(`#content section.section:nth-of-type(${i+1})`)
  if (el) await el.screenshot({ path: `${SHOTS}/section-block-${i+1}.png` }).catch(()=>{})
}
await browser.close()
