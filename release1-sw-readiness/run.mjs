// Investigation only: unchanged frozen application, disposable localhost profiles.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {Session,digest} from '../release1-clean-origin/harness.mjs';
import {mutate} from '../release1-clean-origin/actions.mjs';
import {expect,chromium,firefox,webkit} from '@playwright/test';
// Diagnostic bootstrap has its own bounded setup failure, below the unchanged
// original case ceiling. This does not modify any original test or helper.
for(const browser of [chromium,firefox,webkit]){
 const launch=browser.launchPersistentContext.bind(browser);
 browser.launchPersistentContext=(profile,options)=>launch(profile,{...options,timeout:20000});
}
const run=resolve(process.argv[2]||''),repetitions=Number(process.argv[3]||10);
if(!Number.isInteger(repetitions)||repetitions<1||repetitions>10)throw Error('Repetitions must be 1..10');
const manifest=JSON.parse(await readFile(join(run,'manifest.json'),'utf8'));
if(manifest.commit!=='0d388b42afff7f57db01028a64deac85e293d2ba')throw Error('Only approved pinned main may be investigated');
const out=join(run,'readiness-'+new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(out);
const rows=[],sessions=[];let activeRow;const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const backup=JSON.parse(await readFile('release1-release-governance/evidence/pre-update-full.synthetic.json','utf8'));backup.preferences.observationRecording=false;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const runnerSHA256=sha(await readFile(import.meta.filename));
async function instrument(s){
 await s.context.tracing.start({snapshots:true,screenshots:false,sources:false});
 s.traceStarted=true;
 s.log??=[];s.fault??=null;s.delay??=0;
 if(!s.diagWrapped){s.diagWrapped=true;
 const handler=s.server.listeners('request')[0];s.server.removeAllListeners('request');
 s.server.on('request',async(req,res)=>{const path=new URL(req.url,s.origin).pathname;const event={kind:'server',at:Date.now(),path,generation:s.generation};s.log.push(event);res.on('finish',()=>{event.finishedAt=Date.now();event.status=res.statusCode;});res.on('close',()=>{event.closedAt=Date.now();});
  if(path==='/workshop.svg'&&s.delay)await sleep(s.delay);
  if(path==='/workshop.svg'&&s.fault==='hash'){res.writeHead(200,{'Content-Type':'image/svg+xml'});res.end('<svg xmlns="http://www.w3.org/2000/svg"><title>Injected hash mismatch</title></svg>');return;}
  if(path===s.importFailure){res.writeHead(503);res.end('Injected dynamic import failure');return;}
  await handler(req,res);
 });}
 await s.context.exposeBinding('__recordSW',(_source,event)=>s.log.push({kind:'browser',receivedAt:Date.now(),...event}));
 await s.context.addInitScript(()=>{
  const sw=navigator.serviceWorker;if(!sw)return;
  const w=value=>value?{script:value.scriptURL,state:value.state}:null;
  const log=(kind,data={})=>{globalThis.__recordSW({event:kind,date:Date.now(),performance:performance.now(),url:location.href,controller:w(sw.controller),...data}).catch(()=>{});};
  globalThis.__readyObserved=false;sw.ready.then(r=>{globalThis.__readyObserved=true;log('ready-resolved',{active:w(r.active),waiting:w(r.waiting),installing:w(r.installing)});});
  sw.addEventListener('controllerchange',()=>log('controllerchange'));
  const observe=r=>{const track=worker=>{if(worker){log('worker-state',{worker:w(worker)});worker.addEventListener('statechange',()=>log('worker-state',{worker:w(worker)}));}};track(r.installing);track(r.waiting);track(r.active);r.addEventListener('updatefound',()=>{log('updatefound');track(r.installing);});};
  const register=sw.register.bind(sw);sw.register=(...args)=>{log('register-call',{args});return register(...args).then(r=>{log('register-resolved');observe(r);return r;},error=>{log('register-rejected',{error:error.message});throw error;});};
  addEventListener('error',e=>log('window-error',{error:e.message}));addEventListener('unhandledrejection',e=>log('unhandled-rejection',{error:String(e.reason)}));log('document-start');
 });
 s.context.on('console',message=>s.log.push({kind:'console',at:Date.now(),type:message.type(),text:message.text()}));
 s.context.on('requestfailed',request=>s.log.push({kind:'request-failed',at:Date.now(),url:request.url(),error:request.failure()}));
 s.context.on('page',page=>page.on('pageerror',error=>s.log.push({kind:'page-error',at:Date.now(),error:error.message})));
}
async function snapshot(s){return s.page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();const w=v=>v?{state:v.state,script:v.scriptURL}:null;return {ready:globalThis.__readyObserved===true,controller:w(navigator.serviceWorker.controller),registration:r?{installing:w(r.installing),waiting:w(r.waiting),active:w(r.active)}:null,caches:await caches.keys(),url:location.href,title:document.querySelector('h1')?.textContent};});}
async function observe(s,milliseconds=5000){const started=Date.now();let state;do{state=await snapshot(s);if(state.ready&&state.controller)break;await sleep(50);}while(Date.now()-started<milliseconds);return {milliseconds:Date.now()-started,...state};}
async function fresh(engine){
 const session=new Session(run,engine);session.log=[{kind:'setup',event:'open-start',at:Date.now()}];
 // Own resources before awaiting startup, so a rejected launch cannot escape cleanup.
 sessions.push(session);activeRow.phase='browser bootstrap';await session.open();
 session.log.push({kind:'setup',event:'open-resolved',at:Date.now(),profile:session.profile});
 activeRow.browser=session.context.browser().version();activeRow.phase='application workflow';
 const stop=session.stop.bind(session);
 session.stop=async()=>{
  if(session.context&&session.traceStarted){
   const keep=activeRow.attempt===1||activeRow.status==='FAIL',path=join(out,activeRow.id+'-'+Date.now()+'.zip');
   await session.context.tracing.stop(keep?{path}:{});session.traceStarted=false;
   if(keep)(activeRow.traces??=[]).push(path);
  }
  await stop();
 };
 await instrument(session);return session;
}
async function seed(s){await s.call('restore',[backup,true]);await s.call('consent',[backup.preferences]);await s.page.goto(s.origin+'/#Dashboard');await expect(s.page.getByRole('heading',{name:'Workshop overview'})).toBeVisible();}
async function check(engine,name,index,work){
 const row={id:engine+'-'+name+'-'+index,engine,scenario:name,attempt:index,status:'NOT VERIFIED',startedAt:new Date().toISOString()};
 activeRow=row;let timer,halt=false;
 try{
  Object.assign(row,await Promise.race([work(),new Promise((_,reject)=>{timer=setTimeout(()=>{halt=true;reject(Error('Original 120-second ceiling exceeded; remaining cases NOT VERIFIED'));},120000);})]));
  row.status='PASS';
 }catch(error){row.status='FAIL';row.error=error.stack;}
 finally{
  clearTimeout(timer);
  for(const session of sessions){
   row.events=(row.events||[]).concat(session.log||[]);row.external=session.events;
   if(session.context)try{row.finalState=await Promise.race([snapshot(session),sleep(2000).then(()=>({diagnosticSnapshot:'Unavailable within2seconds'}))]);}catch(error){row.snapshotError=error.message;}
   try{await Promise.race([session.close(),sleep(10000).then(()=>{throw Error('Diagnostic cleanup exceeded10seconds');})]);}
   catch(error){row.cleanupError=error.message;row.status='FAIL';halt=true;}
  }
  sessions.length=0;row.finishedAt=new Date().toISOString();rows.push(row);
  await writeFile(join(out,'RESULTS.json'),JSON.stringify({version:1,pinnedCommit:manifest.commit,runnerSHA256,artifactManifestSHA256:sha(await readFile(join(run,'manifest.json'))),repetitions,environment:{node:process.version,platform:process.platform,arch:process.arch},measurement:'Observer-wrapped register and event listeners; real Node clock; 5s observation window,20s diagnostic bootstrap,120s case ceiling; zero retries; any case/cleanup ceiling halts remaining cases',halted:halt,results:rows,releaseApproved:false},null,2));
  console.log(row.status+' '+row.id);
 }
 if(halt)process.exit(1);
}
for(const engine of ['chromium','firefox','webkit']){
 for(const mode of ['cold','routed','clock','clock-routed'])for(let index=1;index<=repetitions;index++)await check(engine,mode,index,async()=>{const s=await fresh(engine);if(mode.includes('routed'))await s.context.route('**/*',route=>new URL(route.request().url()).origin===s.origin?route.continue():route.abort());if(mode.includes('clock'))await s.page.clock.setFixedTime(new Date('2400-02-29T23:30:00Z'));await s.page.goto(s.origin);await expect(s.page.getByRole('heading',{name:'Welcome to a better-kept workshop'})).toBeVisible();const state=await observe(s);expect(state.ready&&!!state.controller).toBe(true);return {observation:state};});
 await check(engine,'second-navigation',1,async()=>{const s=await fresh(engine);await s.page.goto(s.origin);const first=await observe(s);expect(first.ready&&!!first.controller).toBe(true);await seed(s);const before=await s.raw();await s.page.reload();const second=await observe(s);expect(second.ready&&!!second.controller).toBe(true);expect(await s.raw()).toEqual(before);return {first,second,before:digest(before),after:digest(await s.raw())};});
 for(const offline of [false,true])await check(engine,offline?'offline-cold-process':'online-cold-process',1,async()=>{const s=await fresh(engine);await s.page.goto(s.origin);expect((await observe(s)).controller).not.toBeNull();await seed(s);const before=await s.raw();await s.stop();s.offline=offline;await s.open();await instrument(s);await s.page.goto(s.origin+'/#Dashboard');await expect(s.page.getByRole('heading',{name:'Workshop overview'})).toBeVisible();const state=await observe(s);expect(state.ready&&!!state.controller).toBe(true);expect(await s.raw()).toEqual(before);return {offline,observation:state,before:digest(before),after:digest(await s.raw()),actualInstalledPWA:'NOT VERIFIED',OSRestart:'NOT VERIFIED'};});
 for(const fault of ['503','hash'])await check(engine,'failed-install-'+fault,1,async()=>{const s=await fresh(engine);s.fault=fault;if(fault==='503')s.failedPath='/workshop.svg';await s.page.goto(s.origin);await expect(s.page.getByRole('heading',{name:'Welcome to a better-kept workshop'})).toBeVisible();await seed(s);const before=await s.raw(),state=await observe(s);expect(state.ready).toBe(false);expect(state.controller).toBeNull();expect(await s.raw()).toEqual(before);const body=await s.page.locator('body').innerText();const exported=await s.call('backup');await s.call('validateBackup',[exported]);
  // A native synthetic future requirement tests the real fence without a controller.
  await s.page.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const q=indexedDB.open('PrintGuard3D');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});await new Promise((resolve,reject)=>{const tx=db.transaction('writerControl','readwrite'),store=tx.objectStore('writerControl'),q=store.get('__printguard_writer_control_v1__');q.onsuccess=()=>store.put({...q.result,generation:2});tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});db.close();});
  const fenced=await s.raw(),write=await mutate(s.page,'notes');expect(write.accepted).toBe(false);expect(await s.raw()).toEqual(fenced);
  await s.stop();s.offline=true;await s.open();await instrument(s);let offlineError='';try{await s.page.goto(s.origin);}catch(error){offlineError=error.message;}expect(offlineError).not.toBe('');await s.stop();s.offline=false;await s.open();await instrument(s);await s.page.goto(s.origin);await expect(s.page.getByRole('heading',{name:'Read-only workshop'})).toBeVisible();expect(await s.raw()).toEqual(fenced);
  return {injectedFault:fault,readinessStatus:'FAIL',expectedNegative:true,observation:state,visibleHeading:state.title,visibleSWFailureWarning:/offline.*unavailable|service.worker.*fail|cache.*incomplete/i.test(body),before:digest(before),after:digest(fenced),controlChange:'Native synthetic fixture generation2; every other store unchanged',uncontrolledWriteRefusal:write,validatedFullBackup:true,offlineColdError:offlineError,onlineRecoveryPreservesEveryStore:true};});
 await check(engine,'navigation-during-install',1,async()=>{const s=await fresh(engine);s.delay=1000;await s.page.goto(s.origin);await expect(s.page.getByRole('heading',{name:'Welcome to a better-kept workshop'})).toBeVisible();for(let i=0;i<100&&!s.log.some(e=>e.kind==='server'&&e.path==='/workshop.svg');i++)await sleep(20);await s.page.clock.setFixedTime(new Date('2500-01-01'));await s.page.reload();const state=await observe(s);expect(state.ready&&!!state.controller).toBe(true);return {injectedDelay:1000,observation:state};});
 await check(engine,'dynamic-import-failure',1,async()=>{const s=await fresh(engine);s.importFailure=Object.keys(manifest.builds[1].files).find(p=>p.startsWith('assets/App-'));s.importFailure='/'+s.importFailure;await s.page.goto(s.origin);await expect(s.page.getByRole('heading',{name:'Compatible application assets are unavailable'})).toBeVisible();const state=await observe(s);expect(state.registration).toBeNull();return {injectedFault:s.importFailure,expectedNegative:true,readinessStatus:'FAIL',observation:state};});
 await check(engine,'held-old-tab-update',1,async()=>{const s=await fresh(engine);await s.page.goto(s.origin);expect((await observe(s)).controller).not.toBeNull();await seed(s);const before=await s.raw();s.generation=3;await s.page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});let pending;for(let i=0;i<100;i++){pending=await snapshot(s);if(pending.registration?.waiting)break;await sleep(50);}expect(pending.ready).toBe(true);expect(pending.registration?.waiting?.state).toBe('installed');expect(await s.raw()).toEqual(before);
  const heldHTML=await s.page.locator('meta[name="printguard-build"]').getAttribute('content');
  const activeBuild=await s.page.evaluate(async({build,control})=>{const {updates}=await import('/probe1.js');const registration=await navigator.serviceWorker.getRegistration();await updates.workerRequest(registration.waiting,{type:'PRINTGUARD_ACTIVATE',build,control});for(let i=0;i<100;i++){const active=registration.active;if(active?.state==='activated'){const result=await updates.workerRequest(active,{type:'PRINTGUARD_DESCRIBE'});if(result.identity.build===build)return result.identity.build;}await new Promise(resolve=>setTimeout(resolve,50));}throw Error('New worker activation not observed');},{build:manifest.builds[3].identity,control:before.writerControl[0]});
  expect(activeBuild).toBe(manifest.builds[3].identity);expect(await s.page.locator('meta[name="printguard-build"]').getAttribute('content')).toBe(heldHTML);expect(await s.raw()).toEqual(before);
  return {observation:pending,afterActivation:await snapshot(s),activeBuild,heldHTML,activationActor:'Synthetic other reviewed client sends exact target/control protocol; no owner merge or public update',readyDoesNotMeanNewestWorkerActive:true,before:digest(before),after:digest(await s.raw())};});
}
console.log(out);process.exitCode=rows.some(r=>r.status==='FAIL')?1:0;
