import {test,expect} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const origin='http://127.0.0.1:4357';
const tables=['printers','tasks','logs','readings','inventory','repairs','profiles'];
const clone=value=>structuredClone(value);
let fixture;

test.beforeAll(async()=>{
 // Initial setup only. Restoration always uses the React file input and handlers.
 fixture=JSON.parse(await readFile('tests/fixtures/legacy-schema1.synthetic.json','utf8'));
 const applied=fixture.profiles.find(p=>p.id==='flashforge-creator-5');
 const archive={...clone(applied),id:'version:flashforge-creator-5:1.0.0',profileId:applied.id};
 const pending={...clone(applied),version:'2.0.0',status:'Pending Verification',revisions:['Synthetic native verification registry update; not new manufacturer evidence.'],templates:applied.templates.map(t=>({...t,source:'Pending Verification',profileVersion:'2.0.0'}))};
 fixture.profiles=fixture.profiles.filter(p=>p.id!==applied.id).concat(pending,archive).sort((a,b)=>a.id.localeCompare(b.id));
 expect(fixture.printers.map(p=>p.id)).toEqual(['p1','p2','p3']);
 expect(fixture.printers.every(p=>p.name.startsWith('Review printer ')&&p.location==='ISOLATED TEST FIXTURE')).toBe(true);
 await writeFile('remediation-phase1/fixture-backup.json',JSON.stringify(fixture,null,2));
});

async function exactOrigin(page){expect(new URL(page.url()).origin).toBe(origin);}
async function snapshot(page){
 await exactOrigin(page);
 // Read-only inspection of the real Chromium IndexedDB; never restore via evaluate.
 return page.evaluate(async()=>{
  if(location.origin!=='http://127.0.0.1:4357')throw Error('Unexpected origin');
  const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('PrintGuard3D');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onupgradeneeded=()=>{r.transaction.abort();reject(Error('Expected existing fixture database'));};});
  try{const names=[...db.objectStoreNames];const tx=db.transaction(names,'readonly');const result={};await Promise.all(names.map(name=>new Promise((resolve,reject)=>{const r=tx.objectStore(name).getAll();r.onsuccess=()=>{result[name]=r.result;resolve();};r.onerror=()=>reject(r.error);})));return result;}finally{db.close();}
 });
}
async function attach(testInfo,name,value){await testInfo.attach(name,{body:JSON.stringify(value,null,2),contentType:'application/json'});}
async function settings(page){await page.goto('/#Settings');await expect(page.getByRole('heading',{name:'Settings',exact:true})).toBeVisible();await exactOrigin(page);}
async function upload(page,value,name='synthetic.json'){
 await exactOrigin(page);
 if(typeof value==='string')await page.getByLabel('Choose JSON file').setInputFiles({name,mimeType:'application/json',buffer:Buffer.from(value)});
 else await page.getByLabel('Choose JSON file').setInputFiles({name,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});
}
async function download(page,testInfo){
 await settings(page);const before=await snapshot(page);
 const event=page.waitForEvent('download');await page.getByRole('button',{name:'Back Up My Data',exact:true}).click();
 const file=await event;expect(file.suggestedFilename()).toMatch(/^printguard-full-backup-\d{4}-\d{2}-\d{2}\.json$/);
 const path=testInfo.outputPath('native-export.json');await mkdir(testInfo.outputDir,{recursive:true});await file.saveAs(path);
 const bytes=await readFile(path);const data=JSON.parse(bytes);
 for(const name of tables)expect(data[name]).toEqual(before[name]);
 expect(data.preferences).toEqual(before.preferences[0]);
 const digest=createHash('sha256').update(bytes).digest('hex');
 await attach(testInfo,'export-verification',{sha256:digest,counts:Object.fromEntries(tables.map(k=>[k,data[k].length])),preferencesMatch:true});
 await expect.poll(async()=>(await snapshot(page)).preferences[0].lastBackup).toBe(new Date().toISOString().slice(0,10));
 return {data,path,digest};
}
async function previewReady(page){const modal=page.getByRole('dialog');await expect(modal.getByRole('heading',{name:'Review your backup'})).toBeVisible();await expect(modal.getByText(/Checking matching/)).toHaveCount(0);return modal;}
async function commit(page,replace){const modal=await previewReady(page);await modal.getByLabel(replace?'Replace all local records with this backup':'Merge safely — keep existing records').check();await modal.getByLabel(/I reviewed this import and confirm/).check();const save=modal.getByRole('button',{name:replace?'Restore and replace':'Restore and merge',exact:true});await expect(save).toBeEnabled();await save.click();await expect(page.getByRole('heading',{name:'Review your backup'})).toHaveCount(0);}
async function acknowledgeFixture(page){
 // UI acknowledgment is synthetic test conduct, never a human legal acceptance.
 await page.getByRole('button',{name:'Review the disclaimer',exact:true}).click();
 await page.getByLabel(/I understand that PrintGuard 3D is an unofficial application/).check();
 await page.getByRole('button',{name:'I Understand and Agree',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Meet your next great print'})).toBeVisible();
 await page.getByRole('button',{name:'Close dialog',exact:true}).click();
}
async function replace(page,path){await settings(page);await exactOrigin(page);await page.getByLabel('Choose JSON file').setInputFiles(path);await commit(page,true);}
async function assertRestored(page,data){const after=await snapshot(page);for(const name of tables)expect(after[name]).toEqual(data[name]);expect(after.preferences).toEqual([{...data.preferences,acknowledgment:null}]);return after;}
async function editName(page,name){await page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:/^My Printers/}).click();await page.getByRole('button',{name:'Edit Review printer p1',exact:true}).click();await page.getByLabel('Printer name',{exact:true}).fill(name);await page.getByRole('button',{name:'Save printer',exact:true}).click();await expect(page.getByRole('heading',{name:name,exact:true})).toBeVisible();}

test.beforeEach(async({page,context})=>{
 // An owned fresh nonpersistent context; block all requests outside this one origin.
 await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
 await page.goto('/review.html');await exactOrigin(page);
 await page.getByRole('button',{name:'Inspect fixture database',exact:true}).click();
 await expect(page.locator('#result')).toContainText('"counts"');
 await expect.poll(async()=>JSON.parse(await page.locator('#result').innerText()).counts.printers).toBe(0);
 await page.getByRole('button',{name:'Seed isolated test records',exact:true}).click();
 await expect.poll(async()=>JSON.parse(await page.locator('#result').innerText()).counts.printers).toBe(3);
 await settings(page);
});

test('N01 real export, replacement, all stores, renewed acknowledgment and reload persistence',async({page,context},testInfo)=>{
 const exported=await download(page,testInfo);
 await editName(page,'Review printer p1 changed after export');
 await settings(page);await page.getByLabel('On-time maintenance goal (%)').fill('77');
 await expect.poll(async()=>(await snapshot(page)).preferences[0].target).toBe(77);
 await replace(page,exported.path);
 const restored=await assertRestored(page,exported.data);await attach(testInfo,'restored-before-acknowledgment',restored);
 await expect(page.getByRole('heading',{name:'Welcome to a better-kept workshop'})).toBeVisible();
 await acknowledgeFixture(page);
 const acknowledged=await snapshot(page);expect(acknowledged.preferences[0].acknowledgment.version).toBe('1.0');expect(acknowledged.preferences[0].acknowledgment.date).not.toBe(exported.data.preferences.acknowledgment.date);
 await page.reload();expect(await snapshot(page)).toEqual(acknowledged);
 const another=await context.newPage();await another.goto('/#Dashboard');expect(await snapshot(another)).toEqual(acknowledged);await another.close();
 await page.screenshot({path:testInfo.outputPath('restored-workshop.png'),fullPage:true});
 await attach(testInfo,'renewed-acknowledgment-and-persistence',{acknowledgment:acknowledged.preferences[0].acknowledgment,reload:true,newPage:true});
});

test('N02 safe merge retains local mutable values, adds new records, repeats idempotently and blocks ownership conflicts',async({page},testInfo)=>{
 const {data}=await download(page,testInfo);await editName(page,'Review printer p1 retained by merge');await settings(page);
 const incoming=clone(data);incoming.tasks.push({...clone(data.tasks.find(t=>t.id==='condition')),id:'merge-custom',title:'Synthetic merged task'});
 incoming.inventory.push({...clone(data.inventory[0]),id:'merge-stock',name:'Synthetic new stock'});
 const before=await snapshot(page);await upload(page,incoming);await commit(page,false);
 const merged=await snapshot(page);expect(merged.printers).toEqual(before.printers);expect(merged.preferences).toEqual(before.preferences);expect(merged.tasks).toHaveLength(before.tasks.length+1);expect(merged.inventory).toHaveLength(before.inventory.length+1);
 for(const name of ['logs','readings','repairs','profiles'])expect(merged[name]).toEqual(before[name]);
 for(const name of ['tasks','inventory'])expect(merged[name]).toEqual([...before[name],incoming[name].at(-1)].sort((a,b)=>a.id.localeCompare(b.id)));
 await upload(page,incoming);await commit(page,false);expect(await snapshot(page)).toEqual(merged);
 const conflict=clone(data);conflict.tasks.find(t=>t.id==='condition').printerId='p1';
 await upload(page,conflict);const modal=await previewReady(page);await expect(modal.getByText('Import blocked. No records changed.')).toBeVisible();await modal.getByLabel(/I reviewed this import/).check();await expect(modal.getByRole('button',{name:'Restore and merge',exact:true})).toBeDisabled();expect(await snapshot(page)).toEqual(merged);
 await attach(testInfo,'merge-and-conflict',{repeatedImportUnchanged:true,localValuesRetained:true,newRecordsAdded:2,conflictText:await modal.innerText()});
});

test('N03 malformed, unsupported, duplicate IDs and invalid ownership reject with every store unchanged',async({page},testInfo)=>{
 const before=await snapshot(page);const duplicate=clone(fixture);duplicate.tasks.push(clone(duplicate.tasks[0]));const invalid=clone(fixture);invalid.logs[0].printerId=invalid.logs[0].printerId==='p1'?'p2':'p1';
 const cases=[['malformed','{"application":',/JSON|Unexpected|property|position/i],['unsupported',{...clone(fixture),schemaVersion:99},/unsupported schema/i],['duplicate',duplicate,/duplicate/i],['ownership',invalid,/printer|ownership|belong/i]];
 const results=[];
 for(const [name,value,message] of cases){await upload(page,value,name+'.json');await expect(page.locator('.form-error')).toContainText(message);expect(await snapshot(page)).toEqual(before);expect(await page.getByRole('heading',{name:'Review your backup'}).count()).toBe(0);results.push({name,error:await page.locator('.form-error').innerText(),everyStoreUnchanged:true});}
 await page.screenshot({path:testInfo.outputPath('rejected-invalid-import.png'),fullPage:true});await attach(testInfo,'invalid-imports',results);
});

test('N04 incompatible FDM verification is disclosed and quarantined on resin, never promoted to verified',async({page},testInfo)=>{
 const incoming=clone(fixture);const claim={...clone(incoming.tasks.find(t=>t.id==='t1')),id:'resin-claim',printerId:'p3',anchorHours:5,anchorPrints:3};incoming.tasks.push(claim);
 const before=await snapshot(page);await upload(page,incoming);const modal=await previewReady(page);await expect(modal.getByText('1 task(s) pending verification.',{exact:true})).toBeVisible();expect(await snapshot(page)).toEqual(before);
 await commit(page,false);const after=await snapshot(page);expect(after.tasks.find(t=>t.id===claim.id)).toEqual({...claim,source:'Pending Verification'});for(const name of tables.filter(k=>k!=='tasks'))expect(after[name]).toEqual(before[name]);
 await page.goto('/#Maintenance');await page.getByLabel('Filter by printer').selectOption('p3');await page.locator('button.task-row').filter({hasText:claim.title}).click();await expect(page.getByRole('dialog').getByText('Pending Verification',{exact:true})).toBeVisible();await expect(page.getByRole('dialog').getByText('Manufacturer Verified',{exact:true})).toHaveCount(0);
 await attach(testInfo,'quarantine',{incomingSource:claim.source,storedSource:after.tasks.find(t=>t.id===claim.id).source,previewDisclosed:true});
});

test('N05 restored printer plans, historical versions, thresholds and completion recurrence remain independent',async({page},testInfo)=>{
 const {data,path}=await download(page,testInfo);await replace(page,path);await assertRestored(page,data);await acknowledgeFixture(page);
 const details=[];
 for(const printer of data.printers){await page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:/^My Printers/}).click();await page.getByRole('button',{name:printer.name,exact:true}).click();const modal=page.getByRole('dialog');for(const task of data.tasks.filter(t=>t.printerId===printer.id&&t.enabled))await expect(modal.locator('button.task-row').filter({hasText:task.title})).toBeVisible();await modal.getByText('Service history ·',{exact:false}).click();for(const log of data.logs.filter(l=>l.printerId===printer.id))await expect(modal.getByText(log.notes,{exact:false}).last()).toBeVisible();await modal.getByText('Maintenance documentation',{exact:true}).click();if(printer.id!=='p3'){await expect(modal.getByText('Documented facts; limited coverage',{exact:true})).toBeVisible();await expect(modal.getByText(/Version 1.0.0/)).toBeVisible();}details.push({printerId:printer.id,text:await modal.innerText()});await modal.getByRole('button',{name:'Close dialog'}).click();}
 await page.goto('/#Maintenance');
 const before=await snapshot(page);
 for(const [id,value] of [['t1','1100 operating hours'],['t2','1150 operating hours'],['prints','8 prints']]){const task=data.tasks.find(t=>t.id===id);await page.getByLabel('Filter by printer').selectOption(task.printerId);await page.locator('button.task-row').filter({hasText:task.title}).click();await expect(page.getByRole('dialog').getByText(value,{exact:true})).toBeVisible();await page.getByRole('button',{name:'Close dialog'}).click();}
 await page.getByLabel('Filter by printer').selectOption('p1');await page.locator('button.task-row').filter({hasText:'Custom weekly inspection'}).click();await page.getByRole('button',{name:'Record maintenance',exact:true}).click();
 await page.getByLabel(/I have reviewed the applicable instructions/).check();await page.getByLabel('Date',{exact:true}).fill('2026-10-27');await page.getByLabel('Work performed / reason skipped').fill('Synthetic post-restore recurrence verification');await page.getByRole('checkbox',{name:/I have now reviewed/}).check();await page.getByRole('button',{name:'Save completed record',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Record maintenance',exact:true})).toHaveCount(0);
 const after=await snapshot(page);expect(after.logs).toHaveLength(before.logs.length+1);for(const log of before.logs)expect(after.logs).toContainEqual(log);expect(after.tasks.filter(t=>t.id!=='weekly')).toEqual(before.tasks.filter(t=>t.id!=='weekly'));expect(after.printers).toEqual(before.printers);
 const weekly=after.tasks.find(t=>t.id==='weekly');expect(weekly.anchorDate).toBe('2026-10-27');expect(weekly.enabled).toBe(true);expect(weekly.interval).toEqual({mode:'calendar',days:7});
 await page.locator('button.task-row').filter({hasText:'Custom weekly inspection'}).click();await expect(page.getByRole('dialog').getByText('Nov 3, 2026',{exact:true})).toBeVisible();await expect(page.getByRole('dialog').getByText('Indefinite · from completion date',{exact:true})).toBeVisible();
 await page.reload();expect(await snapshot(page)).toEqual(after);await attach(testInfo,'plans-and-history',details);await attach(testInfo,'post-restore-completion',{nextDue:'2026-11-03',allPriorLogsPreserved:true,otherPrintersAndRulesUnchanged:true,after});
});

test('N06 a destination change after preview is rejected at commit without partial import',async({page,context},testInfo)=>{
 const incoming=clone(fixture);incoming.inventory.push({...clone(incoming.inventory[0]),id:'must-not-import',name:'Synthetic rollback marker'});
 await upload(page,incoming);const modal=await previewReady(page);await modal.getByLabel(/I reviewed this import/).check();await expect(modal.getByRole('button',{name:'Restore and merge'})).toBeEnabled();
 const second=await context.newPage();await second.goto('/#Maintenance');await second.getByLabel('Filter by printer').selectOption('p3');await second.locator('button.task-row').filter({hasText:'Observed condition'}).click();await second.getByRole('button',{name:'Edit rule',exact:true}).click();await second.getByRole('combobox',{name:/^Printer/}).selectOption('p1');await second.getByRole('button',{name:'Save maintenance rule',exact:true}).click();await expect.poll(async()=>(await snapshot(second)).tasks.find(t=>t.id==='condition').printerId).toBe('p1');
 const changed=await snapshot(page);await modal.getByRole('button',{name:'Restore and merge'}).click();await expect(page.getByText(/Import rejected. No records changed./)).toBeVisible();expect(await snapshot(page)).toEqual(changed);expect(changed.inventory.some(i=>i.id==='must-not-import')).toBe(false);await attach(testInfo,'stale-preview-rejection',{everyStoreUnchanged:true,message:await page.getByText(/Import rejected. No records changed./).innerText()});await second.close();
});
