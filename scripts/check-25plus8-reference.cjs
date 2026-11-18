// Built app on :3100; original handoff served locally, with identical local fonts.
const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const sharp = require('sharp');
const fontCss = fs.readFileSync('src/components/ireland-25-plus-8/fonts.css', 'utf8').replaceAll('Ireland25 ', '').replaceAll('url(/assets/', 'url(http://127.0.0.1:3101/assets/');
const properties = ['display','width','height','marginTop','marginBottom','paddingTop','paddingBottom','gap','fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor','borderRadius','boxShadow','gridTemplateColumns','objectFit'];
const sourceServer = http.createServer((req,res) => {
  const file = req.url === '/' ? 'deploy/ireland-25-plus-8.html' : req.url.startsWith('/assets/ireland-25-plus-8/') ? 'public'+req.url : 'deploy'+req.url;
  if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html; charset=utf-8' : file.endsWith('.svg') ? 'image/svg+xml' : file.endsWith('.woff2') ? 'font/woff2' : 'image/jpeg');
  res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(resolve=>sourceServer.listen(3101,'127.0.0.1',resolve));
 const browser=await chromium.launch();
 try {
  fs.mkdirSync('artifacts/25plus8',{recursive:true});
  const report=[];
  for(const width of [320,375,390,430,768,1024,1440]) {
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   await context.route('**/*', route=>{
    const url=new URL(route.request().url());
    if(url.hostname==='fonts.googleapis.com')return route.fulfill({contentType:'text/css',body:fontCss});
    if(url.hostname==='127.0.0.1')return route.continue();
    return route.abort();
   });
   const reference=await context.newPage(), page=await context.newPage(), errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await reference.goto('http://127.0.0.1:3101/',{waitUntil:'networkidle'});
   await page.goto('http://127.0.0.1:3100/ireland-25-plus-8/',{waitUntil:'networkidle'});
   for(const p of [reference,page]) await p.evaluate(async()=>{
    await document.fonts.ready;
    await Promise.all([...document.querySelectorAll('main img')].map(async img=>{img.loading='eager'; await img.decode();}));
   });
   const measure=p=>p.evaluate(properties=>[...document.querySelectorAll('main section')].map(section=>{
    const top=section.getBoundingClientRect().top;
    return {id:section.id,height:section.getBoundingClientRect().height,nodes:[section,...section.querySelectorAll('*')].filter(el=>getComputedStyle(el).display!=='contents'&&el.getBoundingClientRect().width>0).map(el=>{
     const r=el.getBoundingClientRect(),s=getComputedStyle(el);
     return {tag:el.tagName,text:el.childElementCount?'':el.textContent.trim(),x:r.x,y:r.y-top,w:r.width,h:r.height,styles:Object.fromEntries(properties.map(p=>[p,s[p].replaceAll('Ireland25 ','').replaceAll('"','').replaceAll("'",'')]))};
    })};
   }),properties);
   const expected=await measure(reference),actual=await measure(page),diff=[];
   assert.equal(expected.length,actual.length);
   expected.forEach((section,i)=>{
    const got=actual[i]; assert.equal(section.id,got.id); assert.equal(section.nodes.length,got.nodes.length,section.id);
    section.nodes.forEach((node,j)=>{
     const received=got.nodes[j];
     assert.equal(node.tag,received.tag,section.id+' DOM tag');
     for(const key of ['x','y','w','h']) if(Math.abs(node[key]-received[key])>0.1)diff.push(`${section.id}/${j} ${key}: ${node[key]} => ${received[key]}`);
     for(const [key,value] of Object.entries(node.styles)) if(value!==received.styles[key])diff.push(`${section.id}/${j} ${key}: ${value} => ${received.styles[key]}`);
     assert.equal(node.text,received.text,section.id+' copy');
    });
   });
   fs.writeFileSync(`artifacts/25plus8/diff-${width}.json`,JSON.stringify(diff,null,2));
   const pixels=[];
   // Hide fixed shell overlays only; retain campaign section content and borders.
   for (const p of [reference,page]) await p.addStyleTag({content:'html{scroll-behavior:auto!important}body{padding-bottom:3000px!important}body>header,body>a,.l-hd-mob,.l-hd-desk,[data-site-top-strip],[data-sticky],.l-jr{display:none!important}'});
   const fullScreenshots=[];
   for(const [p,label] of [[reference,'source'],[page,'actual']]) {
    await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    fullScreenshots.push(await p.screenshot({path:`artifacts/25plus8/${width}-${label}-full.png`,fullPage:true}));
   }
   for (const section of expected) {
    const file=`artifacts/25plus8/${width}-${section.id}`;
    const screenshots=[];
    for(const [i,p] of [reference,page].entries()) {
     const rect=await p.locator('#'+section.id).boundingBox();
     screenshots.push(await sharp(fullScreenshots[i]).extract({left:0,top:Math.round(rect.y),width,height:Math.floor(rect.height)}).png().toBuffer());
     fs.writeFileSync(file+(i===0?'-source.png':'-actual.png'),screenshots[i]);
    }
    const [source,result]=screenshots;
    const a=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const b=await sharp(result).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    assert.deepEqual(a.info,b.info,section.id+' image dimensions');
    let changed=0,total=0;
    for(let y=2;y<a.info.height-2;y++)for(let x=2;x<a.info.width-2;x++){
     const offset=(y*a.info.width+x)*4;
     if([0,1,2].some(channel=>Math.abs(a.data[offset+channel]-b.data[offset+channel])>8))changed++;
     total++;
    }
    pixels.push({section:section.id,changedRatio:changed/total});
   }
   fs.writeFileSync(`artifacts/25plus8/pixels-${width}.json`,JSON.stringify(pixels,null,2));
   // Remove only the temporary comparison styles before interaction checks.
   for (const p of [reference,page]) {
    await p.locator('style').last().evaluate(el=>el.remove());
    await p.setViewportSize({width,height:900});
   }
   assert.equal(await page.locator('h1').count(),1);
   assert.equal(await page.locator('body > header').count(),1);
   assert.equal(await page.locator('body > footer').count(),1);
   assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://lilaiireland.com/ireland-25-plus-8/');
   assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex, nofollow');
   const schemas=await page.locator('script[type="application/ld+json"]').evaluateAll(items=>items.map(item=>JSON.parse(item.textContent)));
   assert.equal(schemas.length,2);
   assert.equal(schemas[1].url,'https://lilaiireland.com/ireland-25-plus-8/');
   assert.equal(await page.locator('[data-ireland25]').evaluate(el=>el.classList.contains('l-js')),false,'reduced motion skips reveal transitions');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow '+width);
   for(const list of await page.locator('[role="tablist"]').all()) {
    const tabs=list.locator('[role="tab"]');
    if(!await list.isVisible())continue;
    await tabs.first().focus(); await page.keyboard.press('ArrowRight');
    assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true');
    await page.keyboard.press('Home'); assert.equal(await tabs.first().getAttribute('aria-selected'),'true');
   }
   assert.deepEqual(await page.locator('#faq details').evaluateAll(items=>items.map(item=>item.open)),[true,true,false,false,false,false,false,false,false,false]);
   await page.locator('#faq summary').nth(2).focus(); await page.keyboard.press('Enter');
   await page.waitForFunction(()=>document.querySelectorAll('#faq details')[2].open);
   assert.equal(await page.locator('#faq details[open]').count(),3);
   if(width<=760){
    await page.locator('[data-car-next]').click();
    assert.match(await page.locator('#stories [aria-live]').innerText(),/02\s*\/\s*02/);
    await page.locator('[data-car]').focus(); await page.keyboard.press('ArrowLeft');
    assert.match(await page.locator('#stories [aria-live]').innerText(),/01\s*\/\s*02/);
   }
   const jump=page.locator('[data-jump][data-flash="1"]').first();
   await jump.click();
   const id=await jump.getAttribute('data-jump');
   assert.equal(await page.locator('#'+id).getAttribute('data-flash'),'1');
   assert(await page.locator('#'+id).evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('body > header').getBoundingClientRect().bottom));
   if(width===1440) {
    await page.waitForFunction(()=>document.querySelector('.l-jr-a[data-jump="choose"]').getAttribute('aria-current')==='step');
    assert(await page.locator('.l-jr').isVisible());
   }
   await page.evaluate(()=>scrollTo(0,0));
   await page.screenshot({path:`artifacts/25plus8/${width}.png`});
   if(width===390) {
    await page.emulateMedia({reducedMotion:'no-preference'}); await page.reload({waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.querySelector('[data-ireland25]').classList.contains('l-js'));
    await page.evaluate(()=>scrollTo({top:document.querySelector('#choose').offsetTop,behavior:'instant'}));
    await page.waitForFunction(()=>document.querySelector('[data-sticky]').dataset.show==='true');
    await page.evaluate(()=>{const notice=document.createElement('div');notice.id='lilai-cookie-title';document.body.appendChild(notice);});
    await page.waitForFunction(()=>document.querySelector('[data-sticky]').dataset.show==='false');
    await page.evaluate(()=>document.getElementById('lilai-cookie-title').remove());
    await page.waitForFunction(()=>document.querySelector('[data-sticky]').dataset.show==='true');
    await page.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
    await page.waitForFunction(()=>document.querySelector('[data-sticky]').dataset.show==='false');
    await page.evaluate(()=>{window.dataLayer=[]; document.cookie='lilai_consent_v1=; Max-Age=0; Path=/';});
    await page.locator('[data-jump][data-flash="1"]').first().click();
    assert.equal(await page.evaluate(()=>window.dataLayer.length),0);
    await page.evaluate(()=>{document.cookie='lilai_consent_v1=v1.100; Path=/';});
    await page.locator('[data-jump][data-flash="1"]').first().click();
    assert.equal(await page.evaluate(()=>window.dataLayer.filter(e=>e.event==='click_25plus8_tier_school').length),1);
    await page.evaluate(()=>{window.__lilaiLifecycleCheck=1;});
    await page.locator('body > header a[href="/"]').click();
    await page.waitForURL('http://127.0.0.1:3100/');
    await page.goBack();
    await page.waitForFunction(()=>document.querySelector('[data-ireland25]')?.classList.contains('l-js'));
    assert.equal(await page.evaluate(()=>window.__lilaiLifecycleCheck),1,'same-document client navigation');
    await page.evaluate(()=>{window.dataLayer=[];});
    await page.locator('[data-jump][data-flash="1"]').first().click();
    assert.equal(await page.evaluate(()=>window.dataLayer.filter(e=>e.event==='click_25plus8_tier_school').length),1,'remount retains a single listener');
    console.log('PASS normal/reduced motion, progress rail, mobile sticky/footer/consent suppression, consent-gated analytics and client navigation remount');
   }
   report.push({width,sections:actual.length,nodes:actual.reduce((n,s)=>n+s.nodes.length,0),differences:diff,pixels,errors});
   await context.close();
  }
  fs.writeFileSync('artifacts/25plus8/report.json',JSON.stringify(report,null,2));
  for(const r of report) { console.log(r.width, r.nodes, 'nodes;',r.differences.length,'differences; max pixel ratio',Math.max(...r.pixels.map(p=>p.changedRatio)),r.errors); if(r.differences.length)console.log(r.differences.slice(0,12)); }
  assert(report.every(r=>!r.differences.length&&!r.errors.length&&r.pixels.every(p=>p.changedRatio<0.001)),'See artifacts/25plus8/report.json');
 } finally {await browser.close();sourceServer.close();}
})().catch(e=>{console.error(e);process.exitCode=1;sourceServer.close();});
