import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash,createHmac,randomUUID} from 'node:crypto';
import {options,assessmentFormContract} from '../../src/components/consult/consult-content';
// Entire script is local: every Google service below is an in-memory stub.
assert.ok(process.env.GAS_MODIFIED_PATH, 'Set GAS_MODIFIED_PATH');
export const source=fs.readFileSync(process.env.GAS_MODIFIED_PATH,'utf8');
export const secret='review-only-random-test-secret-32-characters';
export const id='11111111-1111-4111-8111-111111111111';
export const pdf='https://drive.google.com/file/d/REVIEW_FAKE_PDF_123456789012345/view';
export const payload={...assessmentFormContract,submissionId:id,name:'Synthetic',nickname:'Review',email:'qa@example.test',
 contactConsent:true,marketingConsent:false,discoveryChannels:[],discoveryOther:'',dcardExposure:null,lifeChange:'',webinar:'',
 location:options.location[0],awareness:options.awareness[0],timeline:options.timeline[3],plan:options.plan[0],budget:options.budget[0],
 workIntention:options.workIntention[1],englishGoal:options.englishGoal[0],cityPreference:options.cityPreference[0],goals:options.goals[0],barriers:options.barriers[0],resources:options.resources[0]};
export class Sheet {
 rows:any[][]=[]; failAppend=false;
 getLastRow(){return this.rows.length;} getLastColumn(){return Math.max(0,...this.rows.map(r=>r.length));} getMaxColumns(){return 200;}
 getDataRange(){return this.getRange(1,1,this.getLastRow(),this.getLastColumn());}
 getRange(row:number,col:number,height=1,width=1){const s=this;return {
  getValues(){return Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>s.rows[row-1+y]?.[col-1+x]??''));},
  setValues(values:any[][]){for(let y=0;y<height;y++)for(let x=0;x<width;x++){s.rows[row-1+y]??=[];s.rows[row-1+y][col-1+x]=values[y][x];}return this;},
  setValue(value:any){return this.setValues([[value]]);},setFontWeight(){return this;}};}
 appendRow(row:any[]){if(this.failAppend)throw new Error('isolated sheet write failure');this.rows.push([...row]);}
 setFrozenRows(){} insertColumnsAfter(){}
}
export function harness(approved=true,snapshot=source,measure=false){
 const sheets=new Map<string,Sheet>([['填表資料',new Sheet()],['報告佇列',new Sheet()]]);
 sheets.get('報告佇列')!.rows=[['Job ID','建立時間','狀態','嘗試次數','Data JSON','PDF URL','錯誤訊息','更新時間']];
 sheets.get('填表資料')!.rows=[['Email','submissionId','contactConsentState','contactWithdrawnAt'],['legacy@example.test','legacy-record','unknown','']];
 const props:Record<string,string>={CONSULT_GAS_CREDENTIAL:secret,...(approved?{CONSULT_APPROVED_POLICY_VERSION:'agreement-reference.v1'}:{})};
 const logs:string[]=[],mails:any[]=[],events:any[]=[];let cache:string|null=null;const cacheEntries=new Map<string,string>();
 const count={open:0,dataReads:0,propertyReads:0,scans:0,records:0,consent:0,newContact:0};let active=0; let credential=0;
 const getProps=()=>({getProperty(k:string){if(active || credential)count.propertyReads++;return props[k]??null;},setProperty(k:string,v:string){props[k]=v;},deleteProperty(k:string){delete props[k];},getProperties(){if(active || credential)count.propertyReads++;return {...props};}});
 const lock={tryLock(){return true;},waitLock(){},releaseLock(){}};
 const ss={getSheetByName:(name:string)=>sheets.get(name),insertSheet:(name:string)=>{const s=new Sheet();sheets.set(name,s);return s;}};
 const google={
  PropertiesService:{getScriptProperties:getProps},
  SpreadsheetApp:{openById(){if(active)count.open++;return ss;},flush(){}},
  Utilities:{getUuid:randomUUID,formatDate(d:Date,_tz:string,fmt:string){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);return fmt==='yyyy/M/d'?parts.replaceAll('-','/'):parts;},
   computeHmacSha256Signature:(msg:string,key:string)=>[...createHmac('sha256',key).update(msg).digest()],computeDigest:(_alg:any,value:string)=>[...createHash('sha256').update(value).digest()],DigestAlgorithm:{SHA_256:'sha256'},base64EncodeWebSafe:(bytes:any)=>Buffer.from(bytes).toString('base64url')},
  LockService:{getScriptLock:()=>lock},CacheService:{getScriptCache:()=>({get:(k:string)=>cache??cacheEntries.get(k)??null,put(k:string,v:string){cacheEntries.set(k,v);},remove(k:string){cacheEntries.delete(k);}})},
  CalendarApp:{getDefaultCalendar:()=>({createAllDayEvent(...args:any[]){events.push(args);}})},MailApp:{sendEmail:(mail:any)=>mails.push(mail)},
  DriveApp:{Access:{ANYONE_WITH_LINK:'link'},Permission:{VIEW:'view'},getFileById(fileId:string){if(activePdf)throw new Error('STOP_BEFORE_REAL_PDF_SERVICE');return validPdf(fileId);}},ScriptApp:{newTrigger:()=>({timeBased(){return this;},after(){return this;},create(){}}),getProjectTriggers:()=>[],deleteTrigger(){}},
  ContentService:{MimeType:{JSON:'json'},createTextOutput:(text:string)=>({setMimeType:()=>JSON.parse(text)})},
  console:{log:(...x:any[])=>logs.push(x.join(' ')),warn:(...x:any[])=>logs.push(x.join(' ')),error:(...x:any[])=>logs.push(x.join(' '))},Logger:{log:(...x:any[])=>logs.push(x.join(' '))},
 };
 const ctx:any=vm.createContext({...google,__scan:()=>{if(active)count.scans++;}});
 // Count row-object construction and consent passes, not header/cell maps or original Queue reads.
 const measured=snapshot.replace('return rows.map((row, index)', "__scan(); return rows.map((row, index)")
  .replace('const matches = records.filter(record', '__scan(); const matches = records.filter(record')
  .replace('!records.some(item', '!(__scan(), records.some(item').replace("(item.values[withdrawn] || item.values[key + 'State'] === 'withdrawn'));", "(item.values[withdrawn] || item.values[key + 'State'] === 'withdrawn')));")
  .replace('for (const item of assessmentRecords()) {', '__scan(); for (const item of assessmentRecords()) {')
  .replace('!assessmentRecords().some(record', '!(__scan(), assessmentRecords().some(record')
  .replace('!assessmentRecords(sheet).some(record', '!(__scan(), assessmentRecords(sheet).some(record')
  .replace("(record.values.contactWithdrawnAt || record.values.contactConsentState === 'withdrawn'));", "(record.values.contactWithdrawnAt || record.values.contactConsentState === 'withdrawn')));");
 new vm.Script(measure?measured:snapshot).runInContext(ctx);
 const origCredential=ctx.assessmentCredential;
 ctx.assessmentCredential=function(...args:any[]){credential++;try{return origCredential(...args);}finally{credential--;}};
 const origRecords=ctx.assessmentRecords;
 ctx.assessmentRecords=function(...args:any[]){count.records++;const sheet=sheets.get('填表資料')!;const previous=sheet.getDataRange;sheet.getDataRange=function(){const range=previous.call(this);const getter=range.getValues;range.getValues=function(){if(active)count.dataReads++;return getter.call(this);};return range;};try{return origRecords(...args);}finally{sheet.getDataRange=previous;}};
 for(const [name,key] of [['assessmentConsent','consent'],['assessmentNewContact','newContact']] as const){const f=ctx[name];if(!f)continue;ctx[name]=function(...args:any[]){count[key]++;active++;try{return f(...args);}finally{active--;}};}
 let activePdf=false;
 const validPdf=(fileId:string)=>({getId:()=>fileId,isTrashed:()=>false,getMimeType:()=> 'application/pdf',getSize:()=>100,
  getName:()=>`【哩來愛爾蘭】出發評估報告 - ${reportName}.pdf`,getSharingAccess:()=> 'link',getSharingPermission:()=> 'view',getDownloadUrl:()=>pdf,getAs:()=>({testPdf:true})});
 let reportName=payload.nickname;
 const originalPdf=ctx.createPdfReport;
 ctx.createPdfReport=(data:any)=>{reportName=data.nickname || data.name;activePdf=true;try{originalPdf(data);}catch(error){if((error as Error).message!=='STOP_BEFORE_REAL_PDF_SERVICE')throw error;}finally{activePdf=false;}return pdf;};
 ctx.ensureAssessmentQueueWorker=()=>{}; // unchanged scheduling infrastructure excluded from new-helper counts
 return {ctx,sheets,props,logs,mails,events,count,validPdf,setCache:(value:string|null)=>cache=value,post:(data:any)=>ctx.doPost({postData:{contents:JSON.stringify(data)}})};
}
