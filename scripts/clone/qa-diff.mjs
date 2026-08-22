import { chromium } from 'playwright'
const SHOTS='/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/design-references/minhdathanh-com-b3d3a9eb/root-8a5edab2'
const browser=await chromium.launch()
for (const [name,w,h] of [['desktop-1440',1440,900],['tablet-768',768,1024],['mobile-390',390,844]]) {
  const p=await browser.newPage({viewport:{width:w,height:h}})
  await p.goto('http://localhost:3311/',{waitUntil:'networkidle',timeout:60000})
  await p.waitForTimeout(1500)
  await p.evaluate(async()=>{await new Promise(r=>{let y=0;const s=()=>{y+=600;window.scrollTo(0,y);if(y<document.body.scrollHeight)setTimeout(s,80);else{window.scrollTo(0,0);setTimeout(r,400)}};s()})})
  await p.waitForTimeout(900)
  await p.screenshot({path:`${SHOTS}/CLONE-${name}-full.png`,fullPage:true})
  const m=await p.evaluate(()=>{
    const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect(),c=getComputedStyle(e)
    return {w:Math.round(r.width),h:Math.round(r.height),bg:c.backgroundColor,color:c.color,fs:c.fontSize,lh:c.lineHeight,ff:c.fontFamily.split(',')[0]}}
    return {docH:document.body.scrollHeight, header:q('header'), topbar:q('header > div:first-child'),
      mainbar:q('header > div:nth-child(2)'), container:q('.vnd-container'),
      h2:q('h2'), footer:q('footer'), body:q('body')}
  })
  console.log(name, JSON.stringify(m))
  await p.close()
}
await browser.close()
