// Native synthetic warning/data tests. No real browser profile or provider.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {Session,digest} from '../release1-clean-origin/harness.mjs';
import {mutate} from '../release1-clean-origin/actions.mjs';
import {expect,chromium,firefox,webkit} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const run=resolve(process.argv[2]||''),manifest=JSON.parse(await readFile(join(run,'manifest.json'),'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex'),runnerSHA256=sha(await readFile(import.meta.filename));
for(const [id,build]of Object.entries(manifest.builds))for(const [path,hash]of Object.entries(build.files))if(sha(await readFile(join(run,'generation'+id,path)))!==hash)throw Error('Frozen bytes changed: '+path);
const out=join(run,'warning-'+new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(out);
const original=JSON.parse(await readFile('release1-release-governance/evidence/pre-update-full.synthetic.json','utf8'));original.preferences.observationRecording=false;
const warning='Offline access is not ready. Your workshop remains available while online. Stay online, keep a backup and reconnect/recheck before relying on offline use.';
let blocked=false;for(const type of [chromium,firefox,webkit]){const launch=type.launchPersistentContext.bind(type);type.launchPersistentContext=(profile,options)=>launch(profile,{...options,timeout:20000,serviceWorkers:blocked?'block':'allow'});}
const rows=[],sessions=[];let current;const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const region=page=>page.getByRole('region',{name:'Offline access status'});
async function open(engine){const s=new Session(run,engine);s.responses=[];sessions.push(s);await s.open();s.context.setDefaultTimeout(20000);
 const handler=s.server.listeners('request')[0];s.server.removeAllListeners('request');s.release=()=>{s.hold=false;for(const resume of s.held||[])resume();s.held=[];};
 s.server.on('request',async(request,response)=>{const path=new URL(request.url,s.origin).pathname;response.on('finish',()=>s.responses.push({path,status:response.statusCode,at:new Date().toISOString()}));
  if(path==='/workshop.svg'&&s.hold)await new Promise(resolve=>(s.held??=[]).push(resolve));
  if(path==='/workshop.svg'&&s.badHash){response.writeHead(200,{'Content-Type':'image/svg+xml'});response.end('<svg xmlns="http://www.w3.org/2000/svg"><title>Injected bad bytes</title></svg>');return;}
  await handler(request,response);
 });
 await s.context.tracing.start({snapshots:true,screenshots:false,sources:false});return s;
}
async function seed(s){await s.page.goto(s.origin,{waitUntil:'domcontentloaded'});await expect(s.page.getByRole('heading',{name:'Welcome to a better-kept workshop'})).toBeVisible();await s.call('restore',[original,true]);await s.call('consent',[original.preferences]);await expect(s.page.getByRole('heading',{name:'Workshop overview'})).toBeVisible();}
async function controlled(s){await expect.poll(()=>s.page.evaluate(()=>!!navigator.serviceWorker.controller),{timeout:20000}).toBe(true);await expect(region(s.page)).toHaveCount(0,{timeout:20000});}
async function futureFence(s){
 await s.page.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const q=indexedDB.open('PrintGuard3D');q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});await new Promise((resolve,reject)=>{const tx=db.transaction('writerControl','readwrite'),store=tx.objectStore('writerControl'),q=store.get('__printguard_writer_control_v1__');q.onsuccess=()=>store.put({...q.result,generation:2});tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});db.close();});
 const before=await s.raw(),refusal=await mutate(s.page,'notes');expect(refusal.accepted).toBe(false);expect(await s.raw()).toEqual(before);return {refusal,before:digest(before),after:digest(await s.raw())};
}
async function check(engine,name,work){current={id:engine+'-'+name,engine,requirement:name,status:'NOT VERIFIED',startedAt:new Date().toISOString()};let timer,halt=false;
 try{Object.assign(current,await Promise.race([work(),new Promise((_,reject)=>{timer=setTimeout(()=>{halt=true;reject(Error('120-second case ceiling; remaining cases NOT VERIFIED'));},120000);})]));current.status='PASS';}
 catch(error){current.status='FAIL';current.error=error.stack;}
 finally{clearTimeout(timer);current.traces=[];for(const s of sessions){s.release?.();if(s.context){try{current.lastDOM=await s.page.locator('body').innerText({timeout:2000});}catch{}const path=join(out,current.id+'-'+current.traces.length+'.zip');try{await s.context.tracing.stop({path});current.traces.push({path,sha256:sha(await readFile(path))});}catch{} }current.responses=(current.responses||[]).concat(s.responses);await s.close();}sessions.length=0;blocked=false;current.finishedAt=new Date().toISOString();rows.push(current);await writeFile(join(out,'RESULTS.json'),JSON.stringify({version:1,commit:manifest.commit,runnerSHA256,manifestSHA256:sha(await readFile(join(run,'manifest.json'))),results:rows,releaseApproved:false},null,2));console.log(current.status+' '+current.id);}
 if(halt)process.exit(1);
}
for(const engine of ['chromium','firefox','webkit']){
 for(const fault of ['503','hash'])await check(engine,'first-install-'+fault,async()=>{
  const s=await open(engine);if(fault==='503')s.failedPath='/workshop.svg';else s.badHash=true;await seed(s);
  await expect(region(s.page).getByText(warning,{exact:true})).toBeVisible();await expect(region(s.page).getByRole('alert')).toHaveCount(1);
  const before=await s.raw();const value=await s.call('backup');await s.call('validateBackup',[value]);
  await region(s.page).getByRole('button',{name:'Dismiss warning for this session'}).click();await expect(region(s.page).getByRole('button',{name:'Recheck offline access'})).toBeFocused();await expect(region(s.page).getByRole('alert')).toHaveCount(0);
  await region(s.page).getByRole('button',{name:'Recheck offline access'}).click();await expect(region(s.page).getByText(warning,{exact:true})).toBeVisible();expect(await s.raw()).toEqual(before);
  await s.page.setViewportSize({width:390,height:844});expect(await s.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  for(const theme of ['light','dark']){await s.page.evaluate(theme=>{document.documentElement.dataset.theme=theme;},theme);const scan=await new AxeBuilder({page:s.page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(scan.violations).toEqual([]);await s.page.screenshot({path:join(out,engine+'-'+fault+'-'+theme+'.png'),fullPage:true});}
  expect(await s.raw()).toEqual(before);
  const target=await open(engine);await target.setup(value);expect(await target.raw()).toEqual(before);
  const afterNotice=await s.raw();expect(afterNotice).toEqual(before);const fence=await futureFence(s);await expect(s.page.getByRole('heading',{name:'Read-only workshop'})).toBeVisible();expect(digest(await s.raw())).toEqual(fence.after);
  return {fault,before:digest(before),afterNotice:digest(afterNotice),validatedFullBackup:true,restoredEveryStore:true,restoreDigests:digest(await target.raw()),futureGeneration:fence,readiness:'failed-install warning; no readiness/root-cause claim'};
 });
 await check(engine,'delayed-then-complete',async()=>{const s=await open(engine);s.hold=true;await seed(s);const before=await s.raw();await expect(region(s.page)).toContainText('Preparing offline access');expect(await region(s.page).getAttribute('class')).toBe('sr-only');const focus=s.page.getByRole('button',{name:'Settings',exact:true});await focus.focus();await sleep(500);expect(await region(s.page).getByRole('alert').count()).toBe(0);
  await expect(region(s.page).getByText(warning,{exact:true})).toBeVisible({timeout:20000});await expect(focus).toBeFocused();expect(await s.raw()).toEqual(before);s.release();await controlled(s);expect(await s.raw()).toEqual(before);return {boundedUnconfirmed:true,laterComplete:true,before:digest(before),after:digest(await s.raw())};});
 await check(engine,'worker-policy-blocked',async()=>{blocked=true;const s=await open(engine);await seed(s);const before=await s.raw();await expect(region(s.page).getByText(warning,{exact:true})).toBeVisible({timeout:20000});expect(await s.page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(false);await region(s.page).getByRole('button',{name:'Recheck offline access'}).click();expect(await s.raw()).toEqual(before);return {nativePolicy:'serviceWorkers:block',before:digest(before),after:digest(await s.raw())};});
 await check(engine,'offline-before-first-install',async()=>{const s=await open(engine);s.hold=true;await seed(s);const before=await s.raw();await s.context.setOffline(true);await expect(region(s.page)).toContainText('reopening offline is not verified');expect(await s.raw()).toEqual(before);await s.context.setOffline(false);s.release();await s.page.reload();await controlled(s);expect(await s.raw()).toEqual(before);return {offlineUnknown:true,explicitReload:true,before:digest(before),after:digest(await s.raw())};});
 await check(engine,'verified-offline-cold-reopen',async()=>{const s=await open(engine);await s.setup(original);await controlled(s);const before=await s.raw();await s.context.tracing.stop({path:join(out,engine+'-healthy-first.zip')});await s.stop();s.offline=true;await s.open();await s.context.tracing.start({snapshots:true,screenshots:false,sources:false});await s.page.goto(s.origin+'/#Dashboard');await expect(s.page.getByRole('heading',{name:'Workshop overview'})).toBeVisible();await controlled(s);expect(await s.raw()).toEqual(before);return {applicationOriginUnreachable:true,actualColdBrowserReopen:true,installedPWA:'NOT VERIFIED',before:digest(before),after:digest(await s.raw())};});
 await check(engine,'healthy-preparation-layout',async()=>{const s=await open(engine);s.hold=true;await seed(s);await expect(region(s.page)).toHaveClass('sr-only');const heading=s.page.getByRole('heading',{name:'Workshop overview'}),beforeBox=await heading.boundingBox(),before=await s.raw();s.release();await controlled(s);const afterBox=await heading.boundingBox();expect(afterBox).toEqual(beforeBox);await s.page.getByRole('button',{name:/Maintenance costs/}).click();await expect(s.page.getByRole('combobox',{name:'Report',exact:true})).toHaveValue('Maintenance Expenses');expect(await s.raw()).toEqual(before);return {preparingHasNoFlowBox:true,headingBefore:beforeBox,headingAfter:afterBox,kpiDrilldown:true,before:digest(before),after:digest(await s.raw())};});
 await check(engine,'cache-entry-loss',async()=>{const s=await open(engine);await s.setup(original);await controlled(s);const before=await s.raw();await s.page.evaluate(async()=>{const controller=navigator.serviceWorker.controller,packet=await new Promise(resolve=>{const c=new MessageChannel();c.port1.onmessage=e=>resolve(e.data);controller.postMessage({type:'PRINTGUARD_OFFLINE_INSPECT'},[c.port2]);});await(await caches.open(packet.offline.cache)).delete('/workshop.svg');});await s.page.evaluate(()=>window.dispatchEvent(new Event('focus')));await expect(region(s.page).getByText(warning,{exact:true})).toBeVisible();expect(await s.raw()).toEqual(before);return {injectedCacheEntryLoss:true,appNeverDeletesCache:true,before:digest(before),after:digest(await s.raw())};});
}
console.log(out);process.exitCode=rows.some(row=>row.status==='FAIL')?1:0;
