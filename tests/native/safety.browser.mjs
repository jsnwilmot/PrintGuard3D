import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';

const origin='http://127.0.0.1:4357';
const tables=['printers','tasks','logs','readings','inventory','repairs','profiles'];
const tags=['wcag2a','wcag2aa','wcag21aa','wcag22aa'];
async function inspect(page){
 expect(new URL(page.url()).origin).toBe(origin);const probe=await page.context().newPage();await probe.goto('/review.html');await probe.getByRole('button',{name:'Inspect fixture database'}).click();await expect(probe.locator('#result')).toContainText('"raw"');const raw=JSON.parse(await probe.locator('#result').innerText()).raw;await probe.close();return raw;
}
async function go(page,name){await page.locator('.sidebar').getByRole('button',{name:new RegExp('^'+name)}).click();}
async function settings(page){await page.goto('/#Settings');await expect(page.getByRole('heading',{name:'Settings',exact:true})).toBeVisible();}
async function audit(page,info,name){
 await page.evaluate(()=>Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))));
 const result=await new AxeBuilder({page}).withTags(tags).analyze();
 await info.attach(name,{body:JSON.stringify({url:page.url(),browser:page.context().browser().version(),violations:result.violations,incomplete:result.incomplete,passes:result.passes.map(p=>p.id)},null,2),contentType:'application/json'});
 expect(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),name).toEqual([]);
}
async function download(page,button,path){const event=page.waitForEvent('download');await page.getByRole('button',{name:button,exact:true}).click();const file=await event;await file.saveAs(path);return readFile(path,'utf8');}
test.beforeEach(async({page,context},info)=>{
 const fixture=JSON.parse(await readFile('tests/fixtures/legacy-schema1.synthetic.json','utf8'));
 if(info.title.startsWith('C01')){fixture.preferences.acknowledgment={version:'0.9',date:'2026-01-01'};fixture.preferences.notifications=true;}
 await context.addInitScript(()=>{window.__testNotifications=[];window.Notification=class{static permission='granted';constructor(title,options){window.__testNotifications.push({title,options});}};});
 await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!==origin)return route.abort();if(url.pathname==='/fixture-backup.json')return route.fulfill({json:fixture});return route.continue();});
 await page.goto('/review.html');await page.getByRole('button',{name:'Inspect fixture database'}).click();await expect(page.locator('#result')).toContainText('"counts"');expect(JSON.parse(await page.locator('#result').innerText()).counts.printers).toBe(0);await page.getByRole('button',{name:'Seed isolated test records'}).click();await expect.poll(async()=>JSON.parse(await page.locator('#result').innerText()).counts.printers).toBe(3);
});

test('C01 existing-data renewal prevents DOM, search, routes, notifications, print and export disclosure until explicit acknowledgment',async({page},info)=>{
 const before=await inspect(page);await page.goto('/#Reports');await expect(page.getByRole('heading',{name:'Welcome to a better-kept workshop'})).toBeVisible();await audit(page,info,'renewal-onboarding-axe');
 await page.getByRole('button',{name:'Explore the dashboard first'}).click();
 for(const route of ['Dashboard','Reports','Settings','Calendar','My%20Printers','Maintenance','Inventory']){
  await page.goto('/#'+route);await expect(page.locator('body')).not.toContainText('Review printer p1');await expect(page.locator('body')).not.toContainText('Historical lubrication');expect(await page.getByRole('button',{name:/Export CSV|Export ICS|Back Up My Data|Print Schedule/}).count()).toBe(0);
 }
 await page.getByLabel('Search printers and tasks').fill('Review printer');await expect(page.getByText('No matching printers or tasks.')).toBeVisible();await page.getByRole('button',{name:/^Notifications/}).click();await expect(page.getByRole('heading',{name:'Your workshop, at a glance'})).toHaveCount(0);
 expect(await page.evaluate(()=>window.__testNotifications)).toEqual([]);
 await page.emulateMedia({media:'print'});await expect(page.getByText('Workshop records are locked until the current disclaimer is acknowledged on this device.')).toBeVisible();await expect(page.locator('body')).not.toContainText('Review printer p1');await page.pdf({path:info.outputPath('locked-print.pdf')});await page.emulateMedia({media:'screen'});
 expect(await inspect(page)).toEqual(before);
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:/^Maintenance/}).click();await expect(page.getByRole('heading',{name:'Before we get started'})).toBeVisible();await expect(page.getByRole('checkbox')).not.toBeChecked();await expect(page.getByRole('button',{name:/I Understand and Agree/})).toBeDisabled();await audit(page,info,'full-disclaimer-axe');
 const box=page.getByRole('checkbox');await box.focus();await page.keyboard.press('Space');await expect(box).toBeChecked();await page.keyboard.press('Tab');await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:/I Understand and Agree/})).toBeFocused();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{name:'Meet your next great print'})).toBeVisible();await page.getByRole('button',{name:'Close dialog'}).click();
 const after=await inspect(page);for(const key of tables)expect(after[key]).toEqual(before[key]);expect({...after.preferences[0],acknowledgment:null}).toEqual({...before.preferences[0],acknowledgment:null});expect(after.preferences[0].acknowledgment.version).toBe('1.0');
 await page.reload();await expect(page.locator('body')).toContainText('Review printer p1');await info.attach('consent-renewal-preservation',{body:JSON.stringify({before,after},null,2),contentType:'application/json'});
});

test('C02 actual ICS, CSV and browser PDF exports include warnings and preserve date/event and column syntax',async({page},info)=>{
 await page.goto('/#Calendar');await page.getByLabel('Jump to calendar date').fill('2035-01-01');const text=await download(page,'Export ICS',info.outputPath('safe-schedule.ics'));
 for(const line of text.split('\r\n'))expect(Buffer.byteLength(line,'utf8')).toBeLessThanOrEqual(75);
 const unfolded=text.replace(/\r\n /g,'');expect(unfolded).toContain('X-WR-CALDESC:Independent');const events=unfolded.split('BEGIN:VEVENT\r\n').slice(1);expect(events.length).toBeGreaterThan(0);for(const event of events){expect(event).toContain('DESCRIPTION:');expect(event).toContain('at your own risk');expect(event).toContain('Not affiliated');expect(event).toMatch(/DTSTART;VALUE=DATE:2035\d{4}/);expect(event).toContain('DTEND;VALUE=DATE:');}
 await page.goto('/#Reports');await page.locator('label.field').filter({has:page.getByText('Report',{exact:true})}).locator('select').selectOption('Complete Maintenance Schedule');const csv=await download(page,'Export CSV',info.outputPath('safe-schedule.csv'));expect(csv).toContain('"Safety notice: Independent');expect(csv).toContain('Not affiliated with or endorsed');expect(csv).toContain('"Task","Printer","Next date"');
 await page.emulateMedia({media:'print'});expect(await page.locator('html').evaluate(el=>getComputedStyle(el).colorScheme)).toBe('light');expect(await page.locator('.report-safety').evaluate(el=>getComputedStyle(el).color)).toBe('rgb(34, 34, 34)');await expect(page.locator('.report-disclaimer')).toContainText('at your own risk');await expect(page.locator('.report-disclaimer')).toContainText('Not affiliated');await page.pdf({path:info.outputPath('safe-schedule.pdf'),format:'A4',printBackground:true});await page.screenshot({path:info.outputPath('safe-schedule-print.png'),fullPage:true});
});

test('C03 nested disclaimer, task completion error, profile review and restore dialog keep unique labels, inert background and keyboard focus',async({page},info)=>{
 await page.goto('/#Maintenance');await page.getByLabel('Filter by printer').selectOption('p1');const row=page.locator('button.task-row').filter({hasText:'Service positioning balls'});await row.focus();await page.keyboard.press('Enter');let modal=page.getByRole('dialog');
 await expect(page.locator('#root')).toHaveAttribute('inert','');const link=modal.getByRole('button',{name:'Read full safety & legal disclaimer'});await link.focus();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{name:'Safety & legal disclaimer'})).toBeFocused();await audit(page,info,'nested-disclaimer-axe');
 const ids=await page.locator('[role=dialog]').evaluateAll(items=>items.map(el=>el.getAttribute('aria-labelledby')));expect(new Set(ids).size).toBe(ids.length);await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Close dialog'})).toBeFocused();expect(await page.evaluate(()=>{const r=document.activeElement.getBoundingClientRect();return r.top>=0&&r.left>=0&&r.bottom<=innerHeight&&r.right<=innerWidth&&!document.activeElement.closest('[inert]');})).toBe(true);await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Close dialog'})).toBeFocused();await page.keyboard.press('Escape');await expect(link).toBeFocused();
 await modal.getByRole('button',{name:'Record maintenance',exact:true}).click();modal=page.getByRole('dialog');await audit(page,info,'completion-axe');const before=await inspect(page);
 await modal.getByLabel(/I have reviewed the applicable instructions/).check();await modal.getByLabel('Date',{exact:true}).fill('2024-01-01');await modal.getByLabel('Work performed / reason skipped').fill('Synthetic invalid chronology; no record should be written');await modal.getByRole('checkbox',{name:/I have now reviewed/}).check();await modal.getByRole('button',{name:'Save completed record'}).click();await expect(page.getByRole('heading',{name:'That couldn’t be saved'})).toBeFocused();await expect(page.getByRole('alert')).toContainText('Completion cannot precede');await audit(page,info,'async-error-axe');expect(await inspect(page)).toEqual(before);await page.getByRole('button',{name:'Understood'}).click();await page.getByRole('button',{name:'Close dialog'}).click();await expect(row).toBeFocused();
 await settings(page);await page.getByRole('button',{name:'Review Creator 5 v1.1.0',exact:true}).click();await audit(page,info,'profile-review-axe');await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Review Creator 5 v1.1.0',exact:true})).toBeFocused();
 const fixture=JSON.parse(await readFile('tests/fixtures/legacy-schema1.synthetic.json','utf8'));await page.getByLabel('Choose JSON file').setInputFiles({name:'synthetic.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});await expect(page.getByRole('heading',{name:'Review your backup'})).toBeVisible();await page.getByLabel('Replace all local records with this backup').check();await audit(page,info,'restore-warning-axe');await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('C04 axe WCAG A/AA scans and computed text/control/focus contrast in both themes across every application page',async({page},info)=>{
 test.setTimeout(240000);const pairs=[];
 for(const theme of ['Light','Dark']){
  await settings(page);await page.getByRole('button',{name:theme,exact:true}).click();await expect(page.getByRole('button',{name:theme,exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.locator('html')).toHaveAttribute('data-theme',theme.toLowerCase());
  for(const name of ['Dashboard','My Printers','Maintenance','Calendar','Reports','Inventory','Settings','Help & documentation']){
   await go(page,name);await audit(page,info,theme+'-'+name.replaceAll(' ','-'));
  }
  await settings(page);
  const result=await page.evaluate(()=>{
   const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);const lum=rgb=>rgb.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((sum,x,i)=>sum+x*[.2126,.7152,.0722][i],0);const ratio=(a,b)=>{const x=lum(rgb(a)),y=lum(rgb(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
   const samples=['.page-heading p','.nav-item:not(.active)','.button:not(.secondary)','.field>span','.field input'];
   return samples.map(selector=>{const el=document.querySelector(selector),style=getComputedStyle(el);let node=el,bg;while(node){bg=getComputedStyle(node).backgroundColor;if(!bg.includes('rgba')&&bg!=='transparent')break;node=node.parentElement;}let parent=el.parentElement,focusBg;while(parent){focusBg=getComputedStyle(parent).backgroundColor;if(!focusBg.includes('rgba')&&focusBg!=='transparent')break;parent=parent.parentElement;}return {selector,foreground:style.color,background:bg,ratio:ratio(style.color,bg),controlBorder:style.borderColor,borderRatio:ratio(style.borderColor,bg),focusRatio:ratio(getComputedStyle(document.documentElement).getPropertyValue('--focus').trim().replace(/^#(.{2})(.{2})(.{2})$/,(_,r,g,b)=>'rgb('+[r,g,b].map(x=>parseInt(x,16)).join(',')+')'),focusBg),focusBackground:focusBg,focus:getComputedStyle(document.documentElement).getPropertyValue('--focus').trim()};});
  });for(const pair of result){expect(pair.ratio,theme+' '+pair.selector).toBeGreaterThanOrEqual(4.5);expect(pair.focusRatio,theme+' focus '+pair.selector).toBeGreaterThanOrEqual(3);if(pair.selector==='.field input')expect(pair.borderRatio,theme+' control boundary').toBeGreaterThanOrEqual(3);}pairs.push({theme,pairs:result});
 }
 await info.attach('computed-contrast-pairs',{body:JSON.stringify(pairs,null,2),contentType:'application/json'});
});

test('C05 200/400-percent equivalent reflow widths, landscape, reduced motion, mobile keyboard navigation and keyboard calendar rescheduling',async({page},info)=>{
 test.setTimeout(180000);const measurements=[];
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [640,320]){
  await page.setViewportSize({width,height:900});
  for(const route of ['Dashboard','Calendar','Reports','Settings']){
   await page.goto('/#'+route);await expect(page.locator('main')).toBeVisible();const measure=await page.evaluate(()=>({viewport:innerWidth,page:document.documentElement.scrollWidth,motion:matchMedia('(prefers-reduced-motion: reduce)').matches}));expect(measure.page,route+' at '+width).toBeLessThanOrEqual(width);expect(measure.motion).toBe(true);measurements.push({route,...measure});
  }
 }
 const spacing=await page.addStyleTag({content:'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);await expect(page.getByLabel('Expense currency')).toBeVisible();await page.screenshot({path:info.outputPath('text-spacing-320.png'),fullPage:true});await spacing.evaluate(el=>el.remove());
 const skip=page.getByRole('link',{name:'Skip to content'});await skip.focus();await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();const menu=page.getByRole('button',{name:'Open navigation',exact:true});await menu.focus();await page.keyboard.press('Enter');await expect(page.getByRole('dialog',{name:'Workshop navigation'})).toBeVisible();await audit(page,info,'mobile-navigation-axe');await page.keyboard.press('Escape');await expect(menu).toBeFocused();await page.keyboard.press('Enter');await page.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:/^Calendar/}).focus();await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.setViewportSize({width:568,height:320});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(568);await page.setViewportSize({width:1440,height:1100});
 await go(page,'Maintenance');await page.getByLabel('Filter by printer').selectOption('p1');const row=page.locator('button.task-row').filter({hasText:'Custom weekly inspection'});await row.focus();await page.keyboard.press('Enter');await page.getByText('Postpone, reschedule, or pause',{exact:true}).focus();await page.keyboard.press('Enter');await page.getByLabel('Move next occurrence to').fill('2035-01-01');await page.getByRole('button',{name:'Move occurrence',exact:true}).focus();await page.keyboard.press('Enter');await expect(page.getByRole('dialog')).toHaveCount(0);const after=await inspect(page);expect(after.tasks.find(t=>t.id==='weekly').postponedUntil).toBe('2035-01-01');expect(after.logs.some(l=>l.taskId==='weekly'&&l.outcome==='Postponed')).toBe(true);
 await info.attach('reflow-measurements',{body:JSON.stringify({method:'CSS viewport equivalents of 1280px at 200% and 400%; not a claim of manual browser zoom testing',measurements},null,2),contentType:'application/json'});
});

test('C06 unsupported custom model and unavailable source warnings remain truthful offline, with no cached manufacturer instructions',async({page,context},info)=>{
 await page.goto('/#Maintenance');await page.getByLabel('Filter by printer').selectOption('p3');await page.locator('button.task-row').filter({hasText:'Observed condition'}).click();let modal=page.getByRole('dialog');await expect(modal.getByText(/No manufacturer instructions are linked/)).toBeVisible();await expect(modal.getByText(/Printer applicability: Custom Custom Resin/)).toBeVisible();await expect(modal.getByText(/Source status: User Defined/)).toBeVisible();await modal.getByRole('button',{name:'Close dialog'}).click();
 await go(page,'My Printers');await page.getByRole('button',{name:'Review printer p1',exact:true}).click();modal=page.getByRole('dialog');await modal.getByText('Maintenance documentation',{exact:true}).click();await modal.locator('.documentation-item').getByRole('button',{name:'Flag source issue'}).click();await modal.getByRole('button',{name:'Close dialog'}).click();
 await go(page,'Maintenance');await page.getByLabel('Filter by printer').selectOption('p1');await page.locator('button.task-row').filter({hasText:'Service positioning balls'}).click();await context.setOffline(true);modal=page.getByRole('dialog');await expect(modal.getByText(/Documentation flagged for review/)).toBeVisible();await expect(modal.getByText(/If offline, use a current manufacturer copy/)).toBeVisible();await modal.getByRole('button',{name:'Record maintenance',exact:true}).click();await expect(page.getByRole('dialog').getByText(/Documentation flagged for review/)).toBeVisible();await expect(page.getByRole('dialog').getByRole('checkbox',{name:/I have reviewed the applicable instructions/})).not.toBeChecked();await page.screenshot({path:info.outputPath('offline-safety.png'),fullPage:true});await context.setOffline(false);
});

test('C07 native replacement restores all records but locks restored workshop content and exports pending renewed acknowledgment',async({page},info)=>{
 await settings(page);const text=await download(page,'Back Up My Data',info.outputPath('renewal-backup.json'));const backup=JSON.parse(text);
 await page.getByLabel('Choose JSON file').setInputFiles(info.outputPath('renewal-backup.json'));let modal=page.getByRole('dialog');await expect(modal.getByText(/Checking matching/)).toHaveCount(0);await modal.getByLabel('Replace all local records with this backup').check();await modal.getByLabel(/I reviewed this import and confirm/).check();await modal.getByRole('button',{name:'Restore and replace'}).click();await expect(page.getByRole('heading',{name:'Welcome to a better-kept workshop'})).toBeVisible();
 const restored=await inspect(page);for(const key of tables)expect(restored[key]).toEqual(backup[key]);expect(restored.preferences[0].acknowledgment).toBeNull();await expect(page.locator('body')).not.toContainText('Review printer p1');await page.getByRole('button',{name:'Explore the dashboard first'}).click();
 await page.goto('/#Reports');await expect(page.locator('body')).not.toContainText('Review printer p1');await expect(page.getByRole('button',{name:'Export CSV'})).toHaveCount(0);await page.getByLabel('Search printers and tasks').fill('Review printer');await expect(page.getByText('No matching printers or tasks.')).toBeVisible();expect(await inspect(page)).toEqual(restored);
 await info.attach('restored-record-nondisclosure',{body:JSON.stringify({allSevenStoresEqual:true,acknowledgment:null,blankPreview:true,exportsAbsent:true,searchEmpty:true}),contentType:'application/json'});
});
