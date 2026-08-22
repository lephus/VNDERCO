import { chromium } from 'playwright'
import fs from 'node:fs/promises'
const OUT='/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/research/minhdathanh-com-b3d3a9eb/root-8a5edab2'
const P=['fontSize','fontWeight','lineHeight','letterSpacing','color','textTransform','textAlign','backgroundColor','padding','margin','width','height','maxWidth','minHeight','display','justifyContent','alignItems','gap','borderRadius','border','boxShadow','overflow','position','objectFit','transition','transform','opacity','textDecorationLine','aspectRatio']
const browser=await chromium.launch()
const page=await browser.newPage({viewport:{width:1440,height:900}})
await page.goto('https://minhdathanh.com/',{waitUntil:'domcontentloaded',timeout:60000})
await page.waitForLoadState('load',{timeout:60000}).catch(()=>{})
await page.waitForTimeout(3000)
await page.evaluate(async()=>{await new Promise(r=>{let y=0;const s=()=>{y+=700;window.scrollTo(0,y);if(y<document.body.scrollHeight)setTimeout(s,100);else{window.scrollTo(0,0);setTimeout(r,500)}};s()})})
await page.waitForTimeout(1200)
const dump=(sel)=>page.evaluate(({sel,P})=>{const el=document.querySelector(sel);if(!el)return{error:'nf '+sel}
const pick=e=>{const s=getComputedStyle(e),o={};for(const p of P){const v=s[p];if(v&&v!=='none'&&v!=='normal'&&v!=='auto'&&v!=='0px'&&v!=='rgba(0, 0, 0, 0)')o[p]=v}return o}
const w=(e,d)=>({tag:e.tagName.toLowerCase(),cls:(e.className?.toString?.()||'').slice(0,100),
rect:(r=>({w:Math.round(r.width),h:Math.round(r.height)}))(e.getBoundingClientRect()),
text:e.children.length===0?(e.textContent||'').trim().slice(0,90):null,
img:e.tagName==='IMG'?{src:e.currentSrc||e.src,nw:e.naturalWidth,nh:e.naturalHeight}:null,
href:e.tagName==='A'?e.getAttribute('href'):null,styles:pick(e),
children:d<6?[...e.children].slice(0,10).map(c=>w(c,d+1)):[]})
return w(el,0)},{sel,P})
const r={}
r.tile1=await dump('#content section.section:nth-of-type(1) .col:nth-child(1) .col-inner')
r.sec2=await dump('#content section.section:nth-of-type(2) > .section-content > .row')
r.sec3=await dump('#content section.section:nth-of-type(3)')
r.footerFull=await dump('#footer')
r.slider=await dump('#content .slider-wrapper')
await fs.writeFile(OUT+'/raw-tiles.json',JSON.stringify(r,null,2))
console.log('ok', Object.keys(r).join(','))
await browser.close()
