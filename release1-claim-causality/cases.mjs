import {test,expect} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import os from 'node:os';
import {observe} from './observe.mjs';
const run=resolve(process.env.PRINTGUARD_CAUSAL_RUN||''),meta=JSON.parse(await readFile(join(run,'SOURCE.json'),'utf8'));
const {fixture,legacySetup,raw,dashboard}=await import(pathToFileURL(join(meta.source,'release1-reporting/native/helpers.mjs')));
const origin='http://127.0.0.1:4359',out=join(run,'case-outcomes');await mkdir(out,{recursive:true});
const api=(request,path)=>request.get(origin+'/__forensic/'+path);
async function events(request){return(await api(request,'events')).json();}
async function milestone(request,name){await expect.poll(async()=>(await events(request)).some(e=>e.event===name),{timeout:15000}).toBe(true);}
const mode=process.env.PRINTGUARD_CAUSAL_MODE||'matrix';
const runtimeFiles=['cases.mjs','observe.mjs','worker.mjs','server.mjs','playwright.config.mjs'];const hashes={};for(const name of runtimeFiles)hashes[name]=createHash('sha256').update(await readFile('release1-claim-causality/'+name)).digest('hex');
const harnessPath=join(run,mode+'-HARNESS.json');let recorded;try{recorded=JSON.parse(await readFile(harnessPath,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
if(recorded){if(JSON.stringify(recorded.hashes)!==JSON.stringify(hashes))throw Error('Executed diagnostic source changed during sampling');}
else await writeFile(harnessPath,JSON.stringify({commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),hashes,node:process.version,platform:os.platform(),release:os.release(),arch:os.arch(),CPU:os.cpus().map(c=>c.model),memory:os.totalmem(),startedAt:new Date().toISOString()},null,2));
const configurations=mode==='controls'?meta.plan.controls.perEngine.map(fault=>({clock:'native',transport:'direct',navigation:'natural',count:0,fault})):meta.plan.clock.flatMap(clock=>meta.plan.transport.flatMap(transport=>meta.plan.navigation.flatMap(navigation=>meta.plan.printerCounts.map(count=>({clock,transport,navigation,count})))));
for(const config of configurations)test(Object.values(config).join('-'),async({browser,request},info)=>{
 const id=[info.project.name,...Object.values(config)].join('-'),context=await browser.newContext({baseURL:origin,timezoneId:'Asia/Kathmandu'}),record=await observe(context,info,id,run);
 const row={id,configuration:config,engine:info.project.name,browser:browser.version(),caseTimeout:info.timeout,retries:0,originalN09:'NOT VERIFIED: altered diagnostic arm',status:'NOT VERIFIED',timingQualified:config.navigation==='natural',startedAt:new Date().toISOString()};
 const sampling=setInterval(()=>void record.write({source:'resources',event:'runner-sample',cpu:process.cpuUsage(),memory:process.memoryUsage(),freeMemory:os.freemem(),loadAverage:os.platform()==='win32'?null:os.loadavg()}),500);sampling.unref();
 try{
  await request.post(origin+'/__forensic/config',{data:{...config,context:id,instrumented:true,gated:config.navigation!=='natural'}});
  const page=await context.newPage();if(config.clock==='native')page.clock.setFixedTime=async()=>{};
  const b=await fixture(),base=b.printers[0],weekly=b.tasks.find(t=>t.id==='weekly');b.printers=Array.from({length:config.count},(_,index)=>({...base,id:'many-'+index,name:'Synthetic multi printer '+index}));b.tasks=b.printers.map(printer=>({...weekly,id:'rule-'+printer.id,printerId:printer.id}));for(const k of ['logs','readings','inventory','repairs'])b[k]=[];
  await legacySetup(page,context,b);if(config.clock==='fixed')await page.clock.setFixedTime(new Date('2400-02-29T23:30:00Z'));await dashboard(page);
  if(mode==='controls'){
   if(config.fault==='delay'){await milestone(request,'native-claim-end');await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller),{timeout:5000}).toBe(true);}else{await milestone(request,'install-reject');expect(await page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(false);if(config.fault==='hash')expect((await events(request)).some(e=>e.event==='digest'&&e.match===false)).toBe(true);}
   row.status='PASS';return;
  }
  await page.getByRole('button',{name:'Start recording observed history',exact:true}).click();await expect.poll(async()=>(await raw(page)).observations.length).toBe(config.count);const before=await raw(page),first=before.observations;row.firstDocument=await page.evaluate(()=>({document:globalThis.__causalDocument,controller:!!navigator.serviceWorker.controller,readyState:document.readyState}));
  if(config.clock==='fixed'){expect(first.every(r=>r.localDate==='2400-03-01'&&r.utcOffsetMinutes===345)).toBe(true);await page.clock.setFixedTime(new Date('2500-01-01T00:00:00Z'));}
  if(config.navigation!=='natural')await milestone(request,'install-gate-enter');
  await record.write({source:'harness',event:'reload-intent',placement:config.navigation});
  if(config.navigation==='before'){
   await page.reload();await record.write({source:'harness',event:'reload-committed-before-release'});await api(request,'release-install');await milestone(request,'native-claim-end');row.timingQualified=true;
  }else if(config.navigation==='spanning'){
   await api(request,'hold-html');const reload=page.reload();reload.catch(()=>{});await milestone(request,'html-held');await api(request,'release-install');await milestone(request,'native-claim-end');await api(request,'release-html');await reload;row.timingQualified=true;
  }else if(config.navigation==='after'){
   await api(request,'release-install');await milestone(request,'native-claim-end');await page.reload();row.timingQualified=true;
  }else await page.reload();
  await expect(page.getByRole('heading',{name:'Workshop overview'})).toBeVisible();const expected=config.clock==='fixed'?config.count*2:config.count;await expect.poll(async()=>(await raw(page)).observations.length).toBe(expected);
  const after=await raw(page);for(const r of first)expect(after.observations.find(x=>x.id===r.id)).toEqual(r);for(const k of ['printers','tasks','logs','readings','inventory','repairs','profiles'])expect(after[k]).toEqual(before[k]);row.historicalRowsPreserved=true;
  let controlled=false;try{await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller),{timeout:10000}).toBe(true);controlled=true;}catch{}
  row.measurement={controllerWithin10s:controlled,document:await page.evaluate(()=>({document:globalThis.__causalDocument,controller:!!navigator.serviceWorker.controller,readyState:document.readyState,readyResolved:globalThis.__causalReady})),sampleAt:new Date().toISOString()};
  if(!controlled){row.status='FAIL';row.reason='UNCONTROLLED_AT_10S; original120s outcome and offline proof NOT VERIFIED';throw Error(row.reason);}
  await context.unrouteAll({behavior:'wait'});await request.post(origin+'/__synthetic-network/off');try{let unreachable=false;try{await request.get(origin+'/index.html',{timeout:3000});}catch{unreachable=true;}expect(unreachable).toBe(true);await page.reload();await expect(page.getByRole('heading',{name:'Workshop overview'})).toBeVisible();expect((await raw(page)).observations).toEqual(after.observations);row.offlineProof=true;}finally{await request.post(origin+'/__synthetic-network/on');}
  row.status='PASS';
 }catch(e){row.error=e.stack;if(row.status!=='FAIL'){row.status='FAIL';row.reason=row.timingQualified?'WORKFLOW ASSERTION FAILED':'PRECONDITION FAILED; requested timing NOT VERIFIED';}throw e;}
 finally{
  clearInterval(sampling);row.finishedAt=new Date().toISOString();await writeFile(join(out,id+'.json'),JSON.stringify(row,null,2));await api(request,'release-install').catch(()=>{});await api(request,'release-html').catch(()=>{});await request.post(origin+'/__synthetic-network/on').catch(()=>{});await record.write({source:'harness',event:'case-end',status:row.status,reason:row.reason});await record.flush();row.finishedAt=new Date().toISOString();await writeFile(join(out,id+'.json'),JSON.stringify(row,null,2));await context.close().catch(()=>{});
 }
});
