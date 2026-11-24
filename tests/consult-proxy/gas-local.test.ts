import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createHash, createHmac } from "node:crypto";
import vm from "node:vm";
import ts from "typescript";
import { options, assessmentFormContract } from "../../src/components/consult/consult-content";

// Explicit local paths only. Never load this snapshot into a Google runtime.
const originalPath = process.env.GAS_ORIGINAL_PATH;
const modifiedPath = process.env.GAS_MODIFIED_PATH;
const localTest = originalPath && modifiedPath ? test : test.skip;
const id = "11111111-1111-4111-8111-111111111111";
const jobId = "22222222-2222-4222-8222-222222222222";
const secret = "controlled-test-credential-only-32-bytes";
const payload = {...assessmentFormContract, submissionId:id, name:"QA", nickname:"QA", email:"qa@example.test",
  contactConsent:false, marketingConsent:false, discoveryChannels:[], discoveryOther:"", dcardExposure:null,
  location:options.location[0], awareness:options.awareness[0], timeline:options.timeline[4], plan:options.plan[4],
  budget:options.budget[5], workIntention:options.workIntention[1], englishGoal:options.englishGoal[0], cityPreference:options.cityPreference[0],
  goals:options.goals[0], barriers:options.barriers[0], resources:options.resources[0], lifeChange:"", webinar:""};

function declarations(source: string) {
  source = source.replace(/\r\n/g, "\n");
  const file = ts.createSourceFile("local.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  return new Map(file.statements.filter(ts.isFunctionDeclaration).map(node => [node.name!.text, node.getText(file)]));
}

function harness() {
  const source = readFileSync(modifiedPath!, "utf8");
  let records: Record<string, unknown>[] = [];
  const calls = {mail:[] as Record<string, any>[], calendar:0, trigger:0, append:[] as unknown[][]};
  const properties: Record<string, string> = {CONSULT_GAS_CREDENTIAL:secret, CONSULT_APPROVED_POLICY_VERSION:"agreement-reference.v1"};
  const lock = {waitLock(){}, tryLock(){return true;}, releaseLock(){}};
  let headers: string[] = [];
  const range = {setValues(values: string[][]){headers.push(...values[0]); return this;}, setFontWeight(){return this;}};
  const sheet = {getLastColumn:()=>headers.length, getMaxColumns:()=>200, getLastRow:()=>records.length+1,
    getRange:(row=1,column=1)=>({...range, getValues:()=>[headers], setValue(value:unknown){
      const record=records[row-2];
      if (record) record[Object.keys(record)[column-1]]=value;
    }}), setFrozenRows(){}, appendRow(row: unknown[]){calls.append.push(row);},
    getDataRange:()=>({getValues:()=>[Object.keys(records[0] || {}), ...records.map(record=>Object.values(record))]})};
  const context: any = vm.createContext({console:{log(){},warn(){},error(){}}, Logger:{log(){}},
    PropertiesService:{getScriptProperties:()=>({getProperty:(key: string)=>properties[key], getProperties:()=>({...properties}), deleteProperty:(key:string)=>{delete properties[key];}, setProperty:(key:string,value:string)=>{properties[key]=value;}})},
    Utilities:{getUuid:()=>id, formatDate:(date:Date,_zone:string,format:string)=>new Date(date.getTime()+8*3600000).toISOString().slice(0,10),
      computeHmacSha256Signature:(message:string,key:string)=>[...createHmac("sha256",key).update(message).digest()], base64EncodeWebSafe:(bytes:number[])=>Buffer.from(bytes).toString("base64url")},
    LockService:{getScriptLock:()=>lock}, SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush(){}},
    CalendarApp:{getDefaultCalendar:()=>({createAllDayEvent(){calls.calendar++;}})},
    MailApp:{sendEmail:(data:Record<string,any>)=>{calls.mail.push(data);}},
    DriveApp:{getFileById(){throw new Error("isolated attachment failure");}},
    ScriptApp:{newTrigger:()=>({timeBased(){return this;},after(){return this;},create(){calls.trigger++;}}),getProjectTriggers:()=>[],deleteTrigger(){}},
    ContentService:{MimeType:{JSON:"json"}, createTextOutput:(text:string)=>({setMimeType:()=>JSON.parse(text)})},
  });
  new vm.Script(source).runInContext(context);
  return {context,calls,properties, setRecords:(value:Record<string,unknown>[])=>{records=value;}, getHeaders:()=>headers};
}

localTest("local snapshot integrity and protected algorithms/queue/retry/fallback/checkpoint/cache timing unchanged", () => {
  const original = readFileSync(originalPath!);
  assert.equal(createHash("sha256").update(original).digest("hex"), "b206bc35d5fb450128c0a89efd5aed20027a24c60759a066ff1d9ef2eba25d61");
  const before = declarations(original.toString("utf8"));
  const source = readFileSync(modifiedPath!, "utf8");
  const after = declarations(source);
  for (const name of ["calcMotivationClarity","calcDimensionsGAS","calcRouteScores","getRouteRecommendationGAS","calcIrelandFitCheck","classifyStage","classifyLead","generateAIAnalysis",
    "createPdfReport","enqueueAssessmentJob","getJobQueueSheet","processAssessmentQueue","saveJobCheckpoint","fallbackAssessmentQueue","recoverStaleAssessmentJobs","runAssessmentQueueWorker","ensureAssessmentQueueWorker","getNext1811TaipeiMs"]) assert.equal(after.get(name),before.get(name),name);
  const h = harness();
  assert.deepEqual(JSON.parse(JSON.stringify(vm.runInContext("ASSESSMENT_OPTIONS",h.context))), options);
});

function evidence(data: Record<string, any>) {
  return {Email:data.email, submissionId:data.submissionId, ...assessmentFormContract, consentTimestamp:data.consentTimestamp,
    contactConsent:data.contactConsent, marketingConsent:data.marketingConsent,
    contactConsentState:data.contactConsent ? "granted" : "declined", marketingConsentState:data.marketingConsent ? "granted" : "declined",
    contactWithdrawnAt:"", marketingUnsubscribedAt:""};
}

localTest("four opt-ins save false, preserve complete results/service email, gate all shared side effects and current withdrawal", () => {
  for (const contactConsent of [false,true]) for (const marketingConsent of [false,true]) {
    const h = harness(); const gas = h.context;
    const data = gas.prepareAssessmentData({...payload, contactConsent,marketingConsent, consentTimestamp:"client-forged", teamEmail:"evil", _stepState:{userEmailSent:true}});
    assert.equal(data.lifeChange, ""); assert.equal(data.teamEmail, undefined); assert.equal(data._stepState, undefined);
    assert.match(data.consentTimestamp,/^\d{4}-\d{2}-\d{2}T.*Z$/);
    h.setRecords([evidence(data)]);
    gas.saveToSheet(data);
    const saved = Object.fromEntries(h.getHeaders().map((key,i)=>[key,h.calls.append[0][i]]));
    assert.equal(saved.contactConsent,contactConsent); assert.equal(saved.marketingConsent,marketingConsent);
    assert.equal(saved.discoveryChannels,"[]"); assert.equal(saved.dcardExposure,"");
    assert.equal(gas.assessmentConsent(data,"contact"),contactConsent);
    assert.equal(gas.assessmentConsent(data,"marketing"),marketingConsent);
    gas.createCalendarEvent(data); gas.create25plus8CalendarEvent(data); gas.sendTeam25plus8Alert(data); gas.schedule25plus8Greeting(data,jobId); gas.send25plus8Greeting(data);
    assert.equal(h.calls.calendar > 0,contactConsent); assert.equal(h.calls.trigger > 0,contactConsent); assert.equal(h.calls.mail.length > 0,contactConsent);
    const start = h.calls.mail.length;
    gas.sendEmailToUser(data,"https://drive.google.com/file/d/ISOLATED_REPORT_ID_1234567890/view");
    assert.equal(h.calls.mail.length,start+1);
    assert.match(h.calls.mail.at(-1)!.body,/附件未能加入/); assert.match(h.calls.mail.at(-1)!.htmlBody,/附件未能加入/);
    assert.throws(()=>gas.sendEmailToUser(data,"https://example.test/resource"));
    h.setRecords([{...evidence(data),contactConsentState:"withdrawn",contactWithdrawnAt:"2026-11-24T00:00:00Z"}]);
    const count = [h.calls.mail.length,h.calls.calendar,h.calls.trigger];
    gas.createCalendarEvent(data); gas.create25plus8CalendarEvent(data); gas.sendTeam25plus8Alert(data); gas.schedule25plus8Greeting(data,jobId); gas.send25plus8Greeting(data);
    assert.deepEqual([h.calls.mail.length,h.calls.calendar,h.calls.trigger],count);
    assert.equal(gas.assessmentNewContact(data),false);
  }
});

localTest("legacy/invalid booleans/sources, all Stages and 25+8 preserve scoring; policy, credentials, proof, old properties fail closed", () => {
  const h=harness(); const gas=h.context;
  const legacy=gas.prepareAssessmentData({name:"QA",email:"qa@example.test",budget:payload.budget,lifeChange:""});
  assert.equal(legacy.contactConsent,null); assert.equal(legacy.marketingConsent,null); assert.equal(legacy.consentTimestamp,null); assert.equal(legacy.discoveryChannels,null);
  for (const change of [{contactConsent:"false"},{marketingConsent:0},{contactConsent:null},{discoveryChannels:null},{discoveryChannels:["unknown","dcard"]},{discoveryChannels:["dcard","dcard"]},{discoveryOther:"=IMPORTXML()"},{dcardExposure:"unknown"}]) assert.throws(()=>gas.prepareAssessmentData({...payload,...change}));
  for (const change of [{discoveryChannels:["unknown"]},{dcardExposure:"no_recall"},{discoveryChannels:["other"],discoveryOther:"=IMPORTXML()"}]) assert.doesNotThrow(()=>gas.prepareAssessmentData({...payload,...change}));
  for (const key of ["goals","barriers","resources","webinar"] as const) for (const label of options[key]) assert.doesNotThrow(()=>gas.prepareAssessmentData({...payload,[key]:label}));
  assert.throws(()=>gas.prepareAssessmentData({...payload,barriers:options.barriers[0]+"、"}));
  assert.equal(gas.assessmentCell(false),false); assert.equal(gas.assessmentCell("  =SUM(1)"),"'  =SUM(1)");
  const stages=new Set();
  for (const awareness of options.awareness) for (const timeline of options.timeline) for (const plan of [options.plan[4],options.plan[2]]) {
    const data=gas.prepareAssessmentData({...payload,awareness,timeline,plan}); stages.add(data.stage);
    for (const consent of [false,true]) {
      const withConsent=gas.prepareAssessmentData({...payload,awareness,timeline,plan,contactConsent:consent,marketingConsent:consent,discoveryChannels:["dcard"]});
      assert.equal(withConsent.stage,data.stage); assert.equal(withConsent.leadQuality,data.leadQuality);
      assert.equal(JSON.stringify(withConsent.routeResult),JSON.stringify(data.routeResult));
      assert.equal(withConsent.lifeChange,"");
    }
  }
  assert.deepEqual([...stages].sort(),["action","explore","ready","watch"]);
  for (const action of [undefined,"accuracy_feedback","send_25plus8_greeting","withdraw_assessment_consent"]) {
    for (const credential of [undefined,"wrong"]) assert.throws(()=>gas.doPost({postData:{contents:JSON.stringify({...payload,type:action,_serverCredential:credential})}}));
  }
  assert.doesNotThrow(()=>gas.assessmentCredential({_serverCredential:secret}));
  const proof=createHmac("sha256",secret).update(`feedback.v1|${id}|${jobId}`).digest("base64url");
  assert.doesNotThrow(()=>gas.assessmentFeedbackProof({submissionId:id,jobId,_feedbackProof:proof}));
  assert.throws(()=>gas.assessmentFeedbackProof({submissionId:id,jobId:id,_feedbackProof:proof}));
  h.properties.greeting_old=JSON.stringify({email:"qa@example.test",name:"Legacy"});
  gas.run25plus8Greeting(); assert.equal(h.properties.greeting_old,undefined); assert.equal(h.calls.mail.length,0);
  const data=gas.prepareAssessmentData({...payload,contactConsent:true}); h.setRecords([evidence(data)]);
  delete h.properties.CONSULT_APPROVED_POLICY_VERSION; assert.equal(gas.assessmentConsent(data,"contact"),false);
  assert.equal(gas.assessmentFollowUpDate(new Date("2026-11-27T10:00:00Z")).toISOString(),"2026-11-29T16:00:00.000Z");
});

localTest("real doPost ACK boundary and feedback errors; feedback cannot create consent", () => {
  const h=harness(); const gas=h.context;
  const post = (data:Record<string,unknown>) => gas.doPost({postData:{contents:JSON.stringify({...data,_serverCredential:secret})}});
  let saved=0, queued=0, cacheValue:string|null=null;
  gas.saveToSheet=()=>{saved++;};
  gas.enqueueAssessmentJob=()=>{queued++; return jobId;};
  gas.CacheService={getScriptCache:()=>({get:()=>cacheValue,put(){},remove(){}})};
  gas.Utilities.DigestAlgorithm={SHA_256:"SHA_256"}; gas.Utilities.computeDigest=()=>[1,2,3];
  const ack=post(payload);
  assert.equal(ack.status,"ok"); assert.equal(ack.accepted,true); assert.equal(ack.jobId,jobId); assert.equal(ack.submissionId,id);
  assert.equal(saved,1); assert.equal(queued,1);
  cacheValue="IN_FLIGHT";
  assert.equal(post(payload).accepted,false); assert.equal(queued,1);
  cacheValue=null;
  gas.saveToSheet=()=>{throw new Error("isolated persistence failure");};
  assert.throws(()=>post(payload)); assert.equal(queued,1);
  const original=gas.prepareAssessmentData(payload); h.setRecords([evidence(original)]);
  gas.assessmentOriginal=()=>original;
  const proof=createHmac("sha256",secret).update(`feedback.v1|${id}|${jobId}`).digest("base64url");
  const feedback={type:"accuracy_feedback",submissionId:id,jobId,_feedbackProof:proof,accuracyAnswer:"不太準",contactConsent:true,email:"attacker@example.test"};
  assert.equal(post(feedback).status,"ok"); assert.equal(h.calls.calendar,0);
  assert.equal(h.calls.append[0][3],payload.email); assert.equal(gas.assessmentConsent(original,"contact"),false);
  h.setRecords([{...evidence(original),contactConsent:true,contactConsentState:"granted"}]);
  gas.CalendarApp={getDefaultCalendar(){throw new Error("isolated calendar failure");}};
  assert.throws(()=>post(feedback));
});

localTest("withdrawal updates only current state, preserves evidence and suppresses anonymous re-fill; trusted Queue lookup", () => {
  const h=harness(); const gas=h.context;
  const data=gas.prepareAssessmentData({...payload,contactConsent:true,marketingConsent:true});
  const record=evidence(data); const original={...record}; h.setRecords([record]);
  gas.withdrawAssessmentConsent(id,"contact");
  assert.equal(record.contactConsentState,"withdrawn"); assert.ok(record.contactWithdrawnAt);
  const timestamp=record.contactWithdrawnAt;
  gas.withdrawAssessmentConsent(id,"contact"); assert.equal(record.contactWithdrawnAt,timestamp);
  for (const key of Object.keys(original) as (keyof typeof original)[]) {
    if (!['contactConsentState','contactWithdrawnAt'].includes(key)) assert.equal(record[key],original[key]);
  }
  const second={...evidence(data),submissionId:jobId}; h.setRecords([record,second]);
  assert.equal(gas.assessmentConsent({...data,submissionId:jobId},"contact"),false);
  assert.equal(gas.assessmentConsent(data,"marketing"),true);
  gas.withdrawAssessmentConsent(id,"marketing"); assert.equal(record.marketingConsent,true); assert.equal(gas.assessmentConsent(data,"marketing"),false);
  gas.SpreadsheetApp={openById:()=>({getSheetByName:()=>({getLastRow:()=>2,getRange:()=>({getValues:()=>[[jobId,"","",0,JSON.stringify(data),"","",""]]})})})};
  const found=gas.assessmentOriginal({submissionId:id,jobId,email:"attacker@example.test"});
  assert.equal(found.email,payload.email);
  assert.throws(()=>gas.assessmentOriginal({submissionId:jobId,jobId}));
});

localTest("revoked queued greeting and scheduling fallback skip without retry; attachment success is described truthfully", () => {
  const h=harness(); const gas=h.context;
  const data=gas.prepareAssessmentData({...payload,contactConsent:true});
  const record={...evidence(data),contactWithdrawnAt:"2026-11-24T00:00:00Z"}; h.setRecords([record]);
  h.properties.greeting_pending=JSON.stringify({dueAt:0,attempts:0,data});
  gas.run25plus8Greeting(); assert.equal(h.properties.greeting_pending,undefined); assert.equal(h.calls.mail.length,0);
  record.contactWithdrawnAt="";
  gas.ScriptApp.newTrigger=()=>({timeBased(){return this;},after(){return this;},create(){record.contactWithdrawnAt="2026-11-24T00:00:00Z"; throw new Error("isolated trigger failure");}});
  gas.schedule25plus8Greeting(data,jobId); assert.equal(h.calls.mail.length,0);
  gas.DriveApp={getFileById:()=>({getAs:()=>({isolatedPdf:true})})};
  gas.sendEmailToUser(data,"https://drive.google.com/file/d/ISOLATED_REPORT_ID_1234567890/view");
  assert.equal(h.calls.mail.length,1); assert.equal(h.calls.mail[0].attachments.length,1);
  assert.match(h.calls.mail[0].body,/PDF 已隨信附上/); assert.match(h.calls.mail[0].htmlBody,/PDF 已隨信附上/);
});
