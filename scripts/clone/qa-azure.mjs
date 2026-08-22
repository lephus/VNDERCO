import { chromium } from 'playwright'
const SHOTS='/Users/lehuuphu/Documents/workspace/frn/VNDERCO/docs/design-references/minhdathanh-com-b3d3a9eb/root-8a5edab2'
// Bảng màu preset `azure` — sinh bởi buildPalette('#2390EF').
const AZURE={'--vnd-primary-50':'#e1f8ff','--vnd-primary-100':'#caefff','--vnd-primary-200':'#a4ddff',
'--vnd-primary-300':'#77c3ff','--vnd-primary-400':'#43a3fe','--vnd-primary-500':'#1789e7',
'--vnd-primary-600':'#0073cf','--vnd-primary-700':'#005bae','--vnd-primary-800':'#00458b',
'--vnd-primary-900':'#002f69','--vnd-primary-fg':'#ffffff'}
const browser=await chromium.launch()
for (const [name,w,h] of [['desktop-1440',1440,900],['mobile-390',390,844]]) {
  const p=await browser.newPage({viewport:{width:w,height:h}})
  await p.goto('http://localhost:3311/',{waitUntil:'networkidle',timeout:60000})
  // Ghi đè biến màu ngay trên phần tử mà layout gắn style inline, để xem giao
  // diện với bảng màu azure mà KHÔNG phải ghi vào cơ sở dữ liệu của khách.
  await p.evaluate((vars)=>{const el=document.querySelector('[style*="--vnd-primary"]')||document.documentElement
    for(const [k,v] of Object.entries(vars)) el.style.setProperty(k,v)},AZURE)
  await p.waitForTimeout(600)
  await p.evaluate(async()=>{await new Promise(r=>{let y=0;const s=()=>{y+=600;window.scrollTo(0,y);if(y<document.body.scrollHeight)setTimeout(s,80);else{window.scrollTo(0,0);setTimeout(r,400)}};s()})})
  await p.waitForTimeout(800)
  await p.screenshot({path:`${SHOTS}/CLONE-azure-${name}-full.png`,fullPage:true})
  console.log(name, JSON.stringify(await p.evaluate(()=>{
    const q=s=>{const e=document.querySelector(s);if(!e)return null;const c=getComputedStyle(e)
    return {bg:c.backgroundColor,color:c.color}}
    return {topbar:q('header > div:first-child'),h2:q('h2'),rule:q('h2 span[aria-hidden]')}})))
  await p.close()
}
await browser.close()
