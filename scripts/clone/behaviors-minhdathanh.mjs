import { chromium } from 'playwright'
import fs from 'node:fs/promises'
const OUT='/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/research/minhdathanh-com-b3d3a9eb/root-8a5edab2'
const SHOTS='/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/design-references/minhdathanh-com-b3d3a9eb/root-8a5edab2'
const browser=await chromium.launch()
const out={}

async function load(page){
  await page.goto('https://minhdathanh.com/',{waitUntil:'domcontentloaded',timeout:60000})
  await page.waitForLoadState('load',{timeout:60000}).catch(()=>{})
  await page.waitForTimeout(2500)
  await page.evaluate(async()=>{await new Promise(r=>{let y=0;const s=()=>{y+=700;window.scrollTo(0,y);if(y<document.body.scrollHeight)setTimeout(s,90);else{window.scrollTo(0,0);setTimeout(r,500)}};s()})})
  await page.waitForTimeout(1200)
}
const snap=(page,sel,props)=>page.evaluate(({sel,props})=>{const el=document.querySelector(sel);if(!el)return null
const s=getComputedStyle(el),r=el.getBoundingClientRect(),o={_h:Math.round(r.height),_top:Math.round(r.top)}
for(const p of props)o[p]=s[p];return o},{sel,props})

// ---- header scroll behavior ----
const page=await browser.newPage({viewport:{width:1440,height:900}})
await load(page)
const HP=['position','top','backgroundColor','boxShadow','height','transition','transform','opacity','zIndex']
out.header_scroll0={ header:await snap(page,'#header',HP), topbar:await snap(page,'.header-top',HP), main:await snap(page,'.header-main',HP), wrapper:await snap(page,'#masthead',HP), sticky:await snap(page,'.header-wrapper',HP) }
await page.evaluate(()=>window.scrollTo(0,600)); await page.waitForTimeout(1000)
out.header_scroll600={ header:await snap(page,'#header',HP), topbar:await snap(page,'.header-top',HP), main:await snap(page,'.header-main',HP), wrapper:await snap(page,'#masthead',HP), sticky:await snap(page,'.header-wrapper',HP) }
out.header_classes_scrolled=await page.evaluate(()=>({header:document.querySelector('#header')?.className,wrapper:document.querySelector('.header-wrapper')?.className,body:document.body.className.slice(0,200)}))
await page.screenshot({path:SHOTS+'/header-scrolled-1440.png'})
await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(800)

// ---- hover states ----
const HOV=['color','backgroundColor','transform','opacity','boxShadow','textDecorationLine','transition']
const hoverTargets={ navLink:'.header-nav-main > li:nth-child(3) > a', tileImg:'#content section.section:nth-of-type(1) .col:nth-child(1) .img-inner img', tileLink:'#content section.section:nth-of-type(1) .col:nth-child(1) p a' }
out.hover={}
for(const [k,sel] of Object.entries(hoverTargets)){
  const before=await snap(page,sel,HOV)
  await page.hover(sel,{timeout:4000}).catch(()=>{})
  await page.waitForTimeout(700)
  const after=await snap(page,sel,HOV)
  out.hover[k]={sel,before,after,changed:before&&after?Object.keys(after).filter(p=>before[p]!==after[p]):null}
  await page.mouse.move(0,0); await page.waitForTimeout(400)
}
// smooth-scroll library / global js
out.globals=await page.evaluate(()=>({
  lenis:!!document.querySelector('.lenis'), locomotive:!!document.querySelector('[data-scroll-container]'),
  htmlClasses:document.documentElement.className.slice(0,200),
  bodyClasses:document.body.className.slice(0,300),
  flickity:!!window.Flickity, jquery:!!window.jQuery,
  scrollBehavior:getComputedStyle(document.documentElement).scrollBehavior,
  stickyHeader:!!document.querySelector('.has-sticky'),
}))
await page.close()

// ---- responsive ----
for(const [name,w,h] of [['tablet-768',768,1024],['mobile-390',390,844]]){
  const p2=await browser.newPage({viewport:{width:w,height:h}})
  await load(p2)
  await p2.screenshot({path:`${SHOTS}/${name}-full.png`,fullPage:true})
  out['resp_'+name]=await p2.evaluate(()=>{
    const q=(s)=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect(),c=getComputedStyle(e)
    return {w:Math.round(r.width),h:Math.round(r.height),display:c.display,vis:c.visibility,fontSize:c.fontSize,padding:c.padding,maxWidth:c.maxWidth}}
    return {
      scrollHeight:document.body.scrollHeight,
      topbar:q('.header-top'), headerMain:q('.header-main'), logo:q('#logo img'),
      navMain:q('.header-nav-main'), burger:q('.mobile-nav, .off-canvas-left, [data-open]'),
      slider:q('#content .slider-wrapper'), container:q('#content .row-main'),
      tile:q('#content section.section:nth-of-type(1) .col'),
      tileCols:(()=>{const e=document.querySelector('#content section.section:nth-of-type(1) .col');return e?getComputedStyle(e).maxWidth:null})(),
      sectionTitle:q('.section-title-main'), footerCol:q('.footer-widgets .col'),
    }
  })
  await p2.close()
}
await fs.writeFile(OUT+'/raw-behaviors.json',JSON.stringify(out,null,2))
console.log(JSON.stringify({globals:out.globals,hdr0:out.header_scroll0,hdr600:out.header_scroll600},null,1).slice(0,2200))
await browser.close()
