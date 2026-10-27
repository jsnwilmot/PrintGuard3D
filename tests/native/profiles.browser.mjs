import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const origin='http://127.0.0.1:4357';
const library=JSON.parse(await readFile('src/profile-library/flashforge/creator-5-1.1.0.json','utf8'));
async function inspect(page){
 expect(new URL(page.url()).origin).toBe(origin);
 const probe=await page.context().newPage();await probe.goto('/review.html');
 await probe.getByRole('button',{name:'Inspect fixture database',exact:true}).click();
 await expect(probe.locator('#result')).toContainText('"raw"');
 const raw=JSON.parse(await probe.locator('#result').innerText()).raw;await probe.close();return raw;
}
async function settings(page){await page.goto('/#Settings');await expect(page.getByRole('heading',{name:'Settings',exact:true})).toBeVisible();}
async function review(page){await settings(page);await page.getByRole('button',{name:'Review Creator 5 v1.1.0',exact:true}).click();return page.getByRole('dialog');}
async function acknowledge(page){
 // Explicitly simulated consent in a fresh local test context, never a user's acceptance.
 await page.getByRole('button',{name:'Review the disclaimer',exact:true}).click();
 await page.getByLabel(/I understand that PrintGuard 3D is an unofficial application/).check();
 await page.getByRole('button',{name:'I Understand and Agree',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Meet your next great print'})).toBeVisible();
 await page.getByRole('button',{name:'Close dialog',exact:true}).click();
}
test.beforeEach(async({page,context})=>{
 const fixture=JSON.parse(await readFile('tests/fixtures/legacy-schema1.synthetic.json','utf8'));
 await context.route('**/*',route=>{
  const url=new URL(route.request().url());if(url.origin!==origin)return route.abort();
  if(url.pathname==='/fixture-backup.json')return route.fulfill({json:fixture});return route.continue();
 });
 await page.goto('/review.html');await page.getByRole('button',{name:'Inspect fixture database'}).click();
 await expect(page.locator('#result')).toContainText('"counts"');
 expect(JSON.parse(await page.locator('#result').innerText()).counts.printers).toBe(0);
 await page.getByRole('button',{name:'Seed isolated test records'}).click();
 await expect.poll(async()=>JSON.parse(await page.locator('#result').innerText()).counts.printers).toBe(3);
});

test('P3B01 explicit update, full comparison, defer, independent baselines and native backup restoration',async({page},info)=>{
 const before=await inspect(page);let modal=await review(page);
 await expect(modal.getByText('Complete old/new comparison',{exact:true})).toBeVisible();
 const safety=modal.locator('.profile-comparison details').filter({has:page.locator('summary').filter({hasText:/safety$/})}).first();
 await safety.locator('summary').click();await expect(safety.getByText('Before',{exact:true})).toBeVisible();await expect(safety.getByText('After',{exact:true})).toBeVisible();
 await expect(modal.getByRole('button',{name:'Accept profile package'})).toBeDisabled();
 await modal.getByRole('button',{name:'Defer update'}).click();expect(await inspect(page)).toEqual(before);
 modal=await review(page);
 const target=modal.getByRole('combobox',{name:/^Optional: apply/});expect(await target.locator('option').allTextContents()).toEqual(['Install profile only; retain current schedules','Review printer p1','Review printer p2']);
 await target.selectOption('p1');
 for(const box of await modal.getByRole('checkbox',{name:/^Add procedure:/}).all())await box.uncheck();
 const cold=library.templates.find(t=>t.templateId==='nozzle-cold-pull-cleaning');
 const y=library.templates.find(t=>t.templateId==='clean-and-lubricate-the-y-axis-linear-guide-rail');
 await modal.getByRole('checkbox',{name:'Add procedure: '+cold.title,exact:true}).check();
 await modal.getByRole('combobox',{name:new RegExp('^Usage band for '+y.title)}).selectOption('regular');
 await modal.getByLabel(/I reviewed the changes and official documentation/).check();await modal.getByRole('button',{name:'Accept profile package'}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 const after=await inspect(page);
 for(const name of ['logs','readings','inventory','repairs','preferences'])expect(after[name]).toEqual(before[name]);
 for(const task of before.tasks)expect(after.tasks).toContainEqual(task);
 expect(after.tasks).toHaveLength(before.tasks.length+2);
 const added=after.tasks.filter(t=>!before.tasks.some(old=>old.id===t.id));
 expect(added.every(t=>t.printerId==='p1'&&t.source==='Manufacturer Verified'&&t.anchorHours===600&&t.anchorPrints===20&&t.profileVersion==='1.1.0')).toBe(true);
 expect(added.find(t=>t.templateId===y.templateId).interval).toEqual({mode:'calendar',months:2});
 expect(after.printers.filter(p=>p.id!=='p1')).toEqual(before.printers.filter(p=>p.id!=='p1'));
 expect(after.printers.find(p=>p.id==='p1')).toEqual({...before.printers.find(p=>p.id==='p1'),profileVersion:'1.1.0'});
 expect(after.profiles.find(p=>p.id==='version:flashforge-creator-5:1.0.0').templates).toEqual(before.profiles.find(p=>p.id==='flashforge-creator-5').templates);
 const event=page.waitForEvent('download');await page.getByRole('button',{name:'Back Up My Data',exact:true}).click();const file=await event;const path=info.outputPath('phase3-backup.json');await file.saveAs(path);
 const exported=JSON.parse(await readFile(path,'utf8'));for(const name of ['printers','tasks','logs','readings','inventory','repairs','profiles'])expect(exported[name]).toEqual(after[name]);
 await page.getByLabel('Choose JSON file').setInputFiles(path);modal=page.getByRole('dialog');await expect(modal.getByText(/Checking matching/)).toHaveCount(0);
 await modal.getByLabel('Replace all local records with this backup').check();await modal.getByLabel(/I reviewed this import and confirm/).check();await modal.getByRole('button',{name:'Restore and replace'}).click();
 await expect(page.getByRole('heading',{name:'Welcome to a better-kept workshop'})).toBeVisible();
 const restored=await inspect(page);for(const name of ['printers','tasks','logs','readings','inventory','repairs','profiles'])expect(restored[name]).toEqual(exported[name]);expect(restored.preferences).toEqual([{...exported.preferences,acknowledgment:null}]);
 await acknowledge(page);await page.reload();const reloaded=await inspect(page);expect(reloaded.tasks).toEqual(restored.tasks);expect(reloaded.logs).toEqual(restored.logs);
 await info.attach('profile-update-preservation',{body:JSON.stringify({before,after,restored},null,2),contentType:'application/json'});
});

test('P3B02 actual registration keeps Creator 5 and Pro separate, selects expanded version without auto-activating usage bands',async({page},info)=>{
 await page.goto('/#Dashboard');await page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:/^My Printers/}).click();
 for(const [name,model,version,count] of [['Synthetic Phase3 C5','Creator 5','1.1.0',8],['Synthetic Phase3 Pro','Creator 5 Pro','',1]]){
  await page.getByRole('button',{name:'Add printer',exact:true}).click();const modal=page.getByRole('dialog');
  await modal.getByRole('combobox',{name:/^Model/}).selectOption(model);await modal.getByLabel('Printer name',{exact:true}).fill(name);await modal.getByLabel('Current operating hours').fill('321');await modal.getByLabel('Completed prints',{exact:true}).fill('12');
  if(version)await modal.getByRole('combobox',{name:/^Maintenance profile version/}).selectOption(version);
  await modal.getByRole('button',{name:'Add printer & create schedule'}).click();await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
  const raw=await inspect(page);const p=raw.printers.find(p=>p.name===name);const tasks=raw.tasks.filter(t=>t.printerId===p.id);expect(tasks).toHaveLength(count);expect(tasks.every(t=>t.anchorHours===321&&t.anchorPrints===12&&t.interval.mode==='hours'&&t.source==='Manufacturer Verified')).toBe(true);
  if(model==='Creator 5 Pro'){expect(tasks[0].interval.hours).toBe(1000);expect(p.profileId).toBe('flashforge-creator-5-pro');}
 }
 await page.getByRole('button',{name:'Synthetic Phase3 C5',exact:true}).click();const modal=page.getByRole('dialog');await modal.getByText('Maintenance documentation',{exact:true}).click();await expect(modal.getByText(/8 fixed-interval procedure/)).toBeVisible();await expect(modal.getByText(/Partial overall coverage/i)).toBeVisible();
 await page.screenshot({path:info.outputPath('expanded-profile.png'),fullPage:true});
 await modal.getByRole('button',{name:'Close dialog'}).click();
 const before=await inspect(page),pro=before.printers.find(p=>p.name==='Synthetic Phase3 Pro');
 expect(before.logs.some(l=>l.printerId==='p1')).toBe(true);expect(before.logs.some(l=>l.printerId==='p2')).toBe(true);
 const update=await review(page),target=update.getByRole('combobox',{name:/^Optional: apply/});
 expect(await target.locator('option').allTextContents()).not.toContain('Synthetic Phase3 Pro');
 await target.selectOption('p1');await update.getByLabel(/I reviewed the changes and official documentation/).check();await update.getByRole('button',{name:'Accept profile package'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 const after=await inspect(page);expect(after.printers.find(p=>p.id===pro.id)).toEqual(pro);expect(after.tasks.filter(t=>t.printerId===pro.id)).toEqual(before.tasks.filter(t=>t.printerId===pro.id));expect(after.logs).toEqual(before.logs);expect(after.printers.find(p=>p.id==='p2')).toEqual(before.printers.find(p=>p.id==='p2'));
});

test('P3B03 altered released definition stays pending and cannot overwrite immutable versions',async({page},info)=>{
 await settings(page);const before=await inspect(page);const altered=structuredClone(library);altered.templates[0].safety='Synthetic unreviewed replacement';
 await page.getByLabel('Import profile JSON').setInputFiles({name:'synthetic-tampered-profile.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(altered))});
 const modal=page.getByRole('dialog');await expect(modal.getByText(/Pending Verification. Unsubstantiated/)).toBeVisible();await expect(modal.getByRole('combobox',{name:/^Optional: apply/}).locator('option')).toHaveCount(3);
 await modal.getByLabel(/I reviewed the changes and official documentation/).check();await modal.getByRole('button',{name:'Accept profile package'}).click();await expect(page.getByText(/different immutable definition/)).toBeVisible();expect(await inspect(page)).toEqual(before);
 await info.attach('rejected-version',{body:JSON.stringify({everyStoreUnchanged:true,allVerificationClaimsPending:true}),contentType:'application/json'});
});

test('P3B04 unavailable source flag appears in tasks and schedule reports and survives full export',async({page},info)=>{
 await page.goto('/#Dashboard');await page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:/^My Printers/}).click();await page.getByRole('button',{name:'Review printer p1',exact:true}).click();let modal=page.getByRole('dialog');await modal.getByText('Maintenance documentation',{exact:true}).click();
 const before=await inspect(page);await modal.locator('.documentation-item').getByRole('button',{name:'Flag source issue'}).click();await expect(modal.getByText(/Flagged for review.*check current manufacturer instructions/)).toBeVisible();await modal.getByRole('button',{name:'Close dialog'}).click();
 await page.goto('/#Maintenance');await page.getByLabel('Filter by printer').selectOption('p1');await page.locator('button.task-row').filter({hasText:'Service positioning balls'}).click();await expect(page.getByRole('dialog').getByText(/flagged/i)).toBeVisible();await page.getByRole('button',{name:'Close dialog'}).click();
 await page.goto('/#Reports');await page.locator('label.field').filter({has:page.getByText('Report',{exact:true})}).locator('select').selectOption('Complete Maintenance Schedule');await expect(page.getByRole('cell',{name:/Flagged/}).first()).toBeVisible();
 const after=await inspect(page);for(const name of ['printers','tasks','logs','readings','inventory','repairs','profiles'])expect(after[name]).toEqual(before[name]);expect(after.preferences[0].sourceFlags).toHaveLength(1);
 await settings(page);const event=page.waitForEvent('download');await page.getByRole('button',{name:'Back Up My Data'}).click();const file=await event;const path=info.outputPath('flagged-source-backup.json');await file.saveAs(path);expect(JSON.parse(await readFile(path,'utf8')).preferences.sourceFlags).toEqual(after.preferences[0].sourceFlags);
});
