// Run against the built app on :3100 and the original handoff/site on :3101.
// Compare content only; the shared shell/nav and requested interaction changes are intentional.
const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const sharp=require('sharp');
const fontDir=process.cwd()+'/public/events/black-friday-2026/fonts/';
let css=fs.readFileSync('src/components/events/black-friday/black-friday-fonts.css','utf8');
for(const [a,b] of [['Black Friday Inter','Inter'],['Black Friday Sans','Noto Sans TC'],['Black Friday Serif','Noto Serif TC']])css=css.replaceAll(a,b);
css=css.replaceAll('/events/black-friday-2026/fonts/','http://127.0.0.1:3101/__fonts/');
const properties=['display','position','width','height','marginTop','marginRight','marginBottom','marginLeft','paddingTop','paddingRight','paddingBottom','paddingLeft','gap','fontFamily','fontSize','fontWeight','fontKerning','fontFeatureSettings','lineHeight','letterSpacing','color','backgroundColor','borderTopWidth','borderTopColor','borderRadius','boxShadow','textAlign','alignItems','justifyContent','gridTemplateColumns','overflow','transform','opacity','whiteSpace','wordBreak','writingMode','aspectRatio','objectFit','maskImage','maskSize','maskPosition','maskRepeat'];
(async()=>{const browser=await chromium.launch();try{
 for(const width of [1440,1024,760,759,390,320]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  // The handoff's Google Fonts URL is served the exact recovered fonts, without external requests.
  await context.route('**/*',r=>{
   const url=new URL(r.request().url());
   if(url.hostname==='fonts.googleapis.com')return r.fulfill({contentType:'text/css',body:css});
   if(url.origin==='http://127.0.0.1:3101'&&url.pathname.startsWith('/__fonts/'))return r.fulfill({contentType:'font/woff2',body:fs.readFileSync(fontDir+url.pathname.split('/').pop())});
   if(['http://127.0.0.1:3100','http://127.0.0.1:3101'].includes(url.origin))return r.continue();
   return r.abort();
  });
  const source=await context.newPage();const actual=await context.newPage();
  await source.goto('http://127.0.0.1:3101',{waitUntil:'networkidle'});
  await actual.goto('http://127.0.0.1:3100/events/black-friday-2026',{waitUntil:'networkidle'});
  for(const page of [source,actual]){
   await page.evaluate(async()=>{
    await document.fonts.ready;
    for(const image of document.querySelectorAll('main img')){image.loading='eager';await image.decode().catch(()=>{});}
   });
  }
  const measure=async(page)=>page.evaluate(properties=>{
   const sections=[...document.querySelectorAll('main section')];
   return sections.map(section=>{
    const base=section.getBoundingClientRect();
    const elements=[section,...section.querySelectorAll('*')].filter(el=>el.tagName!=='STYLE'&&!el.classList.contains('sc-interp')&&getComputedStyle(el).display!=='contents'&&(el.getBoundingClientRect().width>0||el.getBoundingClientRect().height>0));
    return {id:section.id||'hero',height:base.height,nodes:elements.map(el=>{
     const s=getComputedStyle(el),r=el.getBoundingClientRect();
     return {tag:el.tagName,text:el.childElementCount?'':el.textContent.trim(),x:r.x,y:r.y-base.y,w:r.width,h:r.height,
      styles:Object.fromEntries(properties.map(p=>[p,s[p].replaceAll('Black Friday Inter','Inter').replaceAll('Black Friday Sans','Noto Sans TC').replaceAll('Black Friday Serif','Noto Serif TC').replaceAll('"','').replaceAll("'",'').replace(/https?:\/\/[^ )]+\/([^/ )]+)/g,'$1')]))};
    })};
   });
  },properties);
  const expected=await measure(source),received=await measure(actual);
  assert.equal(expected.length,9);
  assert.equal(received.length,9);
  const differences=[];
  for(let i=0;i<expected.length;i++){
   const a=expected[i],b=received[i];
   if(a.nodes.length!==b.nodes.length)differences.push({section:a.id,nodeCounts:[a.nodes.length,b.nodes.length],tagsA:a.nodes.map(n=>n.tag).join(','),tagsB:b.nodes.map(n=>n.tag).join(',')});
   const count=Math.min(a.nodes.length,b.nodes.length);
   for(let j=0;j<count;j++){
    const x=a.nodes[j],y=b.nodes[j];
    if(x.tag!==y.tag){differences.push({section:a.id,index:j,tags:[x.tag,y.tag]});continue;}
    const delta={};
    for(const p of ['x','y','w','h'])if(Math.abs(x[p]-y[p])>.5)delta[p]=[x[p],y[p]];
    for(const p of properties)if(x.styles[p]!==y.styles[p])delta[p]=[x.styles[p],y.styles[p]];
    if(Object.keys(delta).length)differences.push({section:a.id,index:j,tag:x.tag,text:x.text.slice(0,40),delta});
   }
  }
  fs.mkdirSync('artifacts/black-friday/parity',{recursive:true});
  fs.writeFileSync(`artifacts/black-friday/parity/${width}-differences.json`,JSON.stringify({width,sections:expected.map((s,i)=>({id:s.id,sourceHeight:s.height,actualHeight:received[i].height})),differences},null,2));
  console.log(JSON.stringify({width,sections:expected.length,comparedNodes:expected.reduce((sum,s)=>sum+s.nodes.length,0),differences:differences.length,first:differences.slice(0,6)}));
  assert.equal(differences.length,0,'Source content geometry/computed styles must match; see the differences JSON');
  for(const [page,label]of [[source,'source'],[actual,'actual']]){
   await page.addStyleTag({content:'html{scroll-behavior:auto!important;scroll-padding:0!important}body{padding-bottom:3000px!important}[data-site-top-strip],[data-cta-loc="sticky_mobile"],div:has(>a[data-cta-location="sticky_mobile"]){visibility:hidden!important}'});
   await page.evaluate(()=>{
    document.querySelector('header').style.visibility='hidden';
    document.querySelector('[data-site-top-strip]')?.style.setProperty('visibility','hidden');
    document.querySelector('[data-cta-location="sticky_mobile"]')?.parentElement.style.setProperty('visibility','hidden');
    for(const el of document.querySelectorAll('body *'))if(getComputedStyle(el).position==='sticky'&&getComputedStyle(el).bottom==='0px')el.style.visibility='hidden';
   });
   await page.screenshot({path:`artifacts/black-friday/parity/${width}-${label}.png`,fullPage:true});
   await page.locator('#faq').screenshot({path:`artifacts/black-friday/parity/${width}-${label}-faq.png`});
  }
  const pixels=[];
  for(let i=0;i<9;i++){
   const buffers=[];
   for(const [page,label]of [[source,'source'],[actual,'actual']]){
    await page.setViewportSize({width,height:Math.max(900,Math.ceil(expected[i].height)+2)});
    await page.locator('main section').nth(i).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
    const rect=await page.locator('main section').nth(i).boundingBox();
    const data=await page.screenshot({clip:{x:0,y:Math.max(0,rect.y),width,height:Math.ceil(rect.height)},animations:'disabled'});
    fs.writeFileSync(`artifacts/black-friday/parity/${width}-${label}-${expected[i].id}.png`,data);
    buffers.push(await sharp(data).ensureAlpha().raw().toBuffer({resolveWithObject:true}));
   }
   assert.deepEqual(buffers[0].info,buffers[1].info,'Screenshot dimensions must match');
   // Ignore the outer pixel (adjacent section/shell) and tiny antialiasing color rounding.
   let different=0;
   const {width:w,height:h}=buffers[0].info;
   for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const p=(y*w+x)*4;
    if([0,1,2].some(c=>Math.abs(buffers[0].data[p+c]-buffers[1].data[p+c])>2))different++;
   }
   const ratio=different/((w-2)*(h-2));
   pixels.push({section:expected[i].id,differentPixels:different,ratio});
   assert(ratio<.001,'Less than 0.1% of interior pixels may differ; inspect the saved screenshots');
  }
  fs.writeFileSync(`artifacts/black-friday/parity/${width}-pixels.json`,JSON.stringify(pixels,null,2));
  console.log(JSON.stringify({width,pixels}));
  await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
