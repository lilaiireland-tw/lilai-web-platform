import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createHash, createHmac} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {proxyConsultation} from '../../src/lib/consult/proxy';
import {options, assessmentFormContract} from '../../src/components/consult/consult-content';
import {harness, Sheet, payload, secret, id, pdf} from './gas-harness';

const body = (changes:Record<string,unknown>={})=>({...payload,...changes,_serverCredential:secret});
const queue = (h:ReturnType<typeof harness>)=>h.sheets.get('報告佇列')!;
const records = (h:ReturnType<typeof harness>)=>h.sheets.get('填表資料')!;
function withdraw(h:ReturnType<typeof harness>) { h.ctx.withdrawAssessmentConsent(id,'contact'); }
function stored(h:ReturnType<typeof harness>) {return JSON.parse(queue(h).rows[1][4]);}
function feedback(h:ReturnType<typeof harness>, jobId:string) {
  return h.post({type:'accuracy_feedback',submissionId:id,jobId,accuracyAnswer:'不太準',_serverCredential:secret,
    _feedbackProof:createHmac('sha256',secret).update(`feedback.v1|${id}|${jobId}`).digest('base64url')});
}

for (const legacy of [true,false]) test(`${legacy?'legacy':'v1'} actual doPost/prepare/save/enqueue completed-cache and IN_FLIGHT dedup`,()=>{
  const h=harness(); const input:Record<string,unknown>=body();
  if(legacy) for(const key of [...Object.keys(assessmentFormContract),'submissionId','contactConsent','marketingConsent','discoveryChannels','discoveryOther','dcardExposure']) delete input[key];
  const first=h.post(input), second=h.post(input);
  assert.equal(records(h).rows.length,3); assert.equal(queue(h).rows.length,2);
  assert.equal(second.deduplicated,true); assert.equal(first.jobId,second.jobId);
  assert.ok(stored(h).submissionId); if(!legacy) assert.equal(stored(h).submissionId,id);
  h.setCache('IN_FLIGHT'); const flight=h.post(input);
  assert.equal(flight.accepted,false); assert.equal(flight.status,'in_flight');
  assert.equal(queue(h).rows.length,2); assert.equal(records(h).rows.length,3);
});

test('actual GAS completed-cache ACK through Proxy cannot reissue feedback cookie',async()=>{
  const h=harness(); const first=h.post(body());
  let actual:any;
  const request=new Request('https://lilaiireland.com/api/consult/submissions',{method:'POST',headers:{Origin:'https://lilaiireland.com','Content-Type':'application/json','X-Consult-Request':'1'},body:JSON.stringify(payload)});
  const response=await proxyConsultation(request,false,'https://script.google.com/macros/s/LOCAL_ONLY/exec',async(_url,init)=>{
    actual=h.post(JSON.parse(String(init?.body)));return Response.json(actual);
  },secret);
  assert.equal(actual.deduplicated,true); assert.equal(actual.jobId,first.jobId);
  assert.equal(response.status,200); assert.equal(response.headers.get('set-cookie'),null);
  assert.equal(queue(h).rows.length,2);
});

test('actual feedback append failure throws before status:ok',()=>{
  const h=harness();const ack=h.post(body());const sheet=new Sheet();sheet.rows=[['時間']];sheet.failAppend=true;h.sheets.set('準確度回饋',sheet);
  assert.throws(()=>feedback(h,ack.jobId),/isolated sheet write failure/);assert.equal(h.events.length,0);
});

test('verified PDF conversion success/failure and unavailable report errors preserve Queue email checkpoint',()=>{
  for(const mode of ['attached','conversion','lookup','missing','trash','mime','empty','mismatch','id','private','permission','download','url']) {
    const h=harness();h.post(body());const data=stored(h);
    const fileId=pdf.match(/\/d\/([^/]+)/)![1];
    const file={...h.validPdf(fileId),getAs(){if(mode==='conversion')throw new Error('conversion failure');return {testPdf:true};}};
    if(mode==='trash')file.isTrashed=()=>true;
    if(mode==='mime')file.getMimeType=()=> 'application/vnd.google-apps.presentation';
    if(mode==='empty')file.getSize=()=>0;
    if(mode==='mismatch')file.getName=()=> 'another assessment.pdf';
    if(mode==='id')file.getId=()=> 'another_report';
    if(mode==='private')file.getSharingAccess=()=> 'private';
    if(mode==='permission')file.getSharingPermission=()=> 'none';
    if(mode==='download')file.getDownloadUrl=()=> '';
    h.ctx.DriveApp={...h.ctx.DriveApp,getFileById(){if(mode==='lookup')throw new Error('lookup failure');return mode==='missing'?null:file;}};
    const report=mode==='url'?'https://example.test/not-a-pdf':pdf;
    h.ctx.createPdfReport=()=>report;
    assert.equal(h.ctx.processAssessmentQueue(),['attached','conversion'].includes(mode),mode);
    const state=stored(h)._stepState;
    if(['attached','conversion'].includes(mode)) {
      assert.equal(queue(h).rows[1][2],'COMPLETED');assert.equal(state.userEmailSent,true);
      assert.equal(h.mails[0].attachments?.length,mode==='attached'?1:undefined);
      assert.ok(h.mails[0].body.includes(pdf));assert.ok(h.mails[0].htmlBody.includes(pdf));
      assert.match(h.mails[0].htmlBody,mode==='attached'?/PDF 已隨信附上/:/附件未能加入/);
    } else {
      assert.equal(h.mails.length,0);assert.notEqual(state?.userEmailSent,true);
      assert.equal(queue(h).rows[1][2],'RETRY');
      assert.throws(()=>h.ctx.sendEmailToUser(data,report));
    }
  }
});

test('HTML text and attributes escape user input; template markup, CTA and plain text survive',()=>{
  const h=harness();const injected='<a href="https://untrusted.test/">\'&</a>';
  const ack=h.post(body({nickname:injected,name:injected,instagram:injected,lineId:injected,lifeChange:injected}));
  const data=stored(h);h.ctx.DriveApp={...h.ctx.DriveApp,getFileById:(fileId:string)=>({...h.validPdf(fileId),getName:()=>`【哩來愛爾蘭】出發評估報告 - ${injected}.pdf`})};
  h.ctx.sendEmailToUser(data,pdf);h.ctx.send25plus8Greeting(data);
  assert.ok(ack.jobId);assert.equal(h.mails.length,2);
  for(const mail of h.mails) {
    assert.ok(mail.body.includes(injected));assert.ok(!mail.htmlBody.includes(injected));
    assert.ok(!mail.htmlBody.includes('<a href="https://untrusted.test/">'));
    assert.ok(mail.htmlBody.includes('&lt;a href=&quot;'));assert.ok(mail.htmlBody.includes('#2d5016'));
    assert.ok(mail.htmlBody.includes('<table'));
  }
  assert.ok(h.mails[0].htmlBody.includes('https://line.me/'));
  const html=h.ctx.buildUserEmailHtml({...data,stageName:injected,stageDescription:injected,nextSteps:injected},pdf+'?x=" onmouseover="bad',false);
  assert.ok(html.includes('x=&quot; onmouseover=&quot;bad'));assert.ok(!html.includes('x=" onmouseover="bad'));
  assert.equal(h.ctx.assessmentHtml('<>"\'&'), '&lt;&gt;&quot;&#39;&amp;');
});

test('four opt-ins and withdrawal gate all actual Queue, Hot, 25+8, feedback and delayed effects',()=>{
  for(const contactConsent of [false,true]) for(const marketingConsent of [false,true]) for(const revoked of [false,true]) {
    const h=harness();const ack=h.post(body({contactConsent,marketingConsent,plan:options.plan[2],awareness:options.awareness[4],timeline:options.timeline[0],budget:options.budget[4]}));
    if(revoked) {withdraw(h);h.ctx.withdrawAssessmentConsent(id,'marketing');}
    assert.equal(h.ctx.processAssessmentQueue(),true);assert.equal(queue(h).rows[1][2],'COMPLETED');
    const allowed=contactConsent&&!revoked;
    assert.equal(h.events.length,allowed?3:0);assert.equal(h.mails.length,allowed?3:2);
    assert.equal(h.ctx.assessmentConsent(stored(h),'marketing'),marketingConsent&&!revoked);
    feedback(h,ack.jobId);assert.equal(h.events.length,allowed?4:0);
    for(const [key,value] of Object.entries(h.props)) if(key.startsWith('greeting_trigger_')) {
      const item=JSON.parse(value);item.dueAt=0;h.props[key]=JSON.stringify(item);
    }
    if(allowed)withdraw(h);
    const mailCount=h.mails.length;h.ctx.run25plus8Greeting();assert.equal(h.mails.length,mailCount);
    assert.equal(Object.keys(h.props).some(key=>key.startsWith('greeting_trigger_')),false);
  }
});

test('unapproved policy preserves complete necessary service and suppresses contact',()=>{
  const h=harness(false);const ack=h.post(body({plan:options.plan[2]}));assert.equal(h.ctx.processAssessmentQueue(),true);
  assert.equal(queue(h).rows[1][2],'COMPLETED');assert.equal(h.mails.length,2);assert.equal(h.events.length,0);
  assert.equal(h.count.dataReads,0);assert.equal(h.ctx.assessmentConsent(stored(h),'marketing'),false);
  h.ctx.CalendarApp={getDefaultCalendar(){throw new Error('Calendar unavailable');}};
  assert.equal(feedback(h,ack.jobId).status,'ok');assert.equal(h.events.length,0);
});

test('fresh checks after append, Hot checkpoint, scheduling fallback, and delayed send observe withdrawal',()=>{
  // appendRow can coincide with operator withdrawal; feedback must recheck afterwards.
  const h=harness();const ack=h.post(body());const sheet=new Sheet();sheet.rows=[['時間']];const append=sheet.appendRow.bind(sheet);
  sheet.appendRow=row=>{append(row);withdraw(h);};h.sheets.set('準確度回饋',sheet);
  feedback(h,ack.jobId);assert.equal(h.events.length,0);
  const hot=harness();hot.post(body());const data={...stored(hot),leadQuality:'Hot'};
  hot.ctx.createCalendarEvent(data,{},()=>withdraw(hot));assert.equal(hot.events.length,1);
  const schedule=harness();schedule.post(body());
  schedule.ctx.ScriptApp.newTrigger=()=>({timeBased(){return this;},after(){return this;},create(){withdraw(schedule);throw new Error('trigger failure');}});
  schedule.ctx.schedule25plus8Greeting(stored(schedule),ack.jobId);assert.equal(schedule.mails.length,0);
  const delayed=harness();delayed.post(body());delayed.ctx.schedule25plus8Greeting(stored(delayed),ack.jobId);
  for(const [key,value] of Object.entries(delayed.props)) if(key.startsWith('greeting_trigger_')) {
    const item=JSON.parse(value);item.dueAt=0;delayed.props[key]=JSON.stringify(item);
  }
  withdraw(delayed);delayed.ctx.run25plus8Greeting();assert.equal(delayed.mails.length,0);
  // Text generation can revoke consent; send still performs its own final check.
  const greeting=harness();greeting.post(body());greeting.ctx.generate25plus8PersonalizedSummary=()=>{withdraw(greeting);return 'summary';};
  greeting.ctx.send25plus8Greeting(stored(greeting));assert.equal(greeting.mails.length,0);
});

test('25+8 discriminator, PDF placeholders and Email retain special content and flow',()=>{
  const h=harness();h.post(body({plan:options.plan[2]}));const data=stored(h);
  const content=h.ctx.getAssessmentContent(data,data.stage);
  assert.equal(content.cta,'twentyfive_plus8');assert.equal(content.stageCTALink,'');
  assert.match(content.nextSteps,/預算/);assert.match(content.nextSteps,/免費/);
  for(const stage of ['watch','explore','ready','action']) {
    const special=h.ctx.getAssessmentContent(data,stage);assert.equal(special.cta,'twentyfive_plus8');
    assert.match(special.nextSteps,['ready','action'].includes(stage)?/總預算/:/最想了解的問題/);
    assert.equal(h.ctx.getPdfNextSteps(data,stage)[0].title,['ready','action'].includes(stage)?'整理預算與時間':'整理想了解的問題');
  }
  assert.equal(content.nextSteps.includes('\\n'),false);
  const placeholders=h.ctx.getRoutePlaceholders(data);assert.match(JSON.stringify(placeholders),/免費索取重播/);
  assert.equal(h.ctx.processAssessmentQueue(),true);assert.equal(h.mails.length,3);assert.equal(h.events.length,2);
  assert.ok(Object.keys(h.props).some(key=>key.startsWith('greeting_trigger_')));
});

test('local helper service-call measurements with explicit before snapshot; no Google timing claims',()=>{
  const beforePath=process.env.GAS_BEFORE_PATH;
  assert.ok(beforePath,'Set GAS_BEFORE_PATH for measured pre-fix comparison');
  const before=readFileSync(beforePath,'utf8');const comparison:any={};
  assert.equal(createHash('sha256').update(readFileSync(beforePath)).digest('hex'),'81a4cf67709707e377174df291dca6a78859848205b9e71a4a1254d48ca7922e');
  for(const [label,changes] of Object.entries({normalFalse:{contactConsent:false},normalTrue:{},hot:{awareness:options.awareness[4],timeline:options.timeline[0],budget:options.budget[4]},plus8False:{plan:options.plan[2],contactConsent:false},plus8True:{plan:options.plan[2]},plus8Hot:{plan:options.plan[2],awareness:options.awareness[4],timeline:options.timeline[0],budget:options.budget[4]}})) {
    const row:any={};
    for(const version of ['before','after']) {
      const h=version==='before'?harness(true,before,true):harness(true,undefined,true);
      h.post(body(changes));const submit={...h.count};assert.equal(h.ctx.processAssessmentQueue(),true);assert.equal(queue(h).rows[1][2],'COMPLETED');
      row[version]={submit,total:{...h.count}};
      if(label==='plus8True') {
        for(const [key,value] of Object.entries(h.props)) if(key.startsWith('greeting_trigger_')) {const item=JSON.parse(value);item.dueAt=0;h.props[key]=JSON.stringify(item);}
        const count={...h.count};h.ctx.run25plus8Greeting();
        row[version].delayed=Object.fromEntries(Object.keys(count).map(key=>[key,h.count[key as keyof typeof count]-count[key as keyof typeof count]]));
        assert.equal(h.mails.length,4);
      }
      assert.ok(!JSON.stringify(h.mails).includes(secret));assert.ok(!JSON.stringify([...h.sheets].map(([,s])=>s.rows)).includes(secret));
    }
    assert.ok(row.after.total.dataReads<row.before.total.dataReads);
    comparison[label]=row;
  }
  assert.equal(comparison.normalFalse.after.total.dataReads,0);
  assert.equal(comparison.normalTrue.after.total.dataReads,4);
  if(process.env.GAS_METRICS_PATH)writeFileSync(process.env.GAS_METRICS_PATH,JSON.stringify(comparison,null,2)+'\n');
});
