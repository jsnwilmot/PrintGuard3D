import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const origin='http://127.0.0.1:4357';
test.beforeEach(async({page,context})=>{
 const fixture=JSON.parse(await readFile('tests/fixtures/legacy-schema1.synthetic.json','utf8'));
 fixture.printers.find(p=>p.id==='p1').hours=1100;
 fixture.printers.find(p=>p.id==='p3').prints=8;
 fixture.logs=fixture.logs.map(l=>({...l,category:'Lubrication',priority:'Normal',currency:'USD'}));
 fixture.tasks.find(t=>t.id==='condition').category='Cleaning';
 const weekly=fixture.tasks.find(t=>t.id==='weekly');
 fixture.tasks.push({...structuredClone(weekly),id:'monthly',title:'Synthetic monthly recurrence',anchorDate:'2024-01-31',interval:{mode:'calendar',months:1},originalInterval:{mode:'calendar',months:1}});
 await context.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin)return route.abort();
  if(url.pathname==='/fixture-backup.json')return route.fulfill({json:fixture});
  return route.continue();
 });
 await page.goto('/review.html');expect(new URL(page.url()).origin).toBe(origin);
 await page.getByRole('button',{name:'Inspect fixture database'}).click();
 await expect(page.locator('#result')).toContainText('"counts"');
 expect(JSON.parse(await page.locator('#result').innerText()).counts.printers).toBe(0);
 await page.getByRole('button',{name:'Seed isolated test records'}).click();
 await expect.poll(async()=>JSON.parse(await page.locator('#result').innerText()).counts.printers).toBe(3);
});

test('B01 U18: native segmented year typing, leap dates, navigation and indefinite recurrence through 2400',async({page},info)=>{
 await page.goto('/#Calendar');const input=page.getByLabel('Jump to calendar date');
 await input.fill('2026-10-27');
 // Move to the first date segment, then to year; type actual keyboard events.
 await input.focus();
 for(const key of ['ArrowLeft','ArrowLeft','ArrowLeft','ArrowRight','ArrowRight'])await page.keyboard.press(key);
 const typed=[];for(const digit of '2035'){await page.keyboard.press(digit);typed.push(await input.inputValue());await expect(page.locator('.calendar-cell')).toHaveCount(42);await expect(page.locator('.calendar-cell').filter({hasText:'NaN'})).toHaveCount(0);}
 await info.attach('typed-year-values',{body:JSON.stringify(typed),contentType:'application/json'});
 expect(typed).toEqual(['0002-10-27','0020-10-27','0203-10-27','2035-10-27']);
 await expect(input).toHaveValue('2035-10-27');await expect(page.getByRole('heading',{name:'October 2035'})).toBeVisible();
 for(const date of ['2040-02-29','2400-02-29']){await input.fill(date);await expect(page.locator('.calendar-cell')).toHaveCount(42);await expect(page.locator('.calendar-cell').filter({hasText:'NaN'})).toHaveCount(0);await expect(page.locator('button.calendar-event').filter({hasText:'Synthetic monthly recurrence'}).first()).toBeVisible();}
 await page.getByRole('button',{name:'Next period'}).click();await expect(page.getByRole('heading',{name:'March 2400'})).toBeVisible();
 await page.screenshot({path:info.outputPath('calendar-2400.png'),fullPage:true});
});

test('B02 U10/U11: native usage panel and historical filters across all views',async({page},info)=>{
 await page.goto('/#Calendar');
 for(const view of ['Month','Week','Day','Agenda']){
  await page.getByRole('button',{name:view,exact:true}).click();
  const usage=page.getByRole('region',{name:'Maintenance due from recorded usage'});
  await expect(usage.getByRole('button').filter({hasText:'Service positioning balls'})).toHaveCount(1);
  await expect(usage.getByRole('button').filter({hasText:'Resin user inspection'})).toHaveCount(1);
  await expect(usage.getByText(/No calendar date is forecast/)).toBeVisible();
 }
 await page.getByLabel('Calendar printer').selectOption('p3');await expect(page.getByRole('region',{name:'Maintenance due from recorded usage'}).getByRole('button')).toHaveCount(1);
 await page.getByLabel('Calendar status').selectOption('Upcoming');await expect(page.getByRole('region',{name:'Maintenance due from recorded usage'}).getByRole('button')).toHaveCount(0);
 await page.getByLabel('Calendar printer').selectOption('');await page.getByLabel('Calendar status').selectOption('Completed');await page.getByLabel('Jump to calendar date').fill('2026-03-01');await page.getByRole('button',{name:'Month',exact:true}).click();
 await expect(page.locator('.calendar-event.complete')).toHaveCount(2);
 await page.getByLabel('Calendar category').selectOption('Cleaning');await expect(page.locator('.calendar-event.complete')).toHaveCount(0);
 await page.getByLabel('Calendar category').selectOption('Lubrication');await page.getByLabel('Calendar priority').selectOption('High');await expect(page.locator('.calendar-event.complete')).toHaveCount(0);
 await page.getByLabel('Calendar priority').selectOption('Normal');await page.getByLabel('Calendar printer').selectOption('p2');await expect(page.locator('.calendar-event.complete')).toHaveCount(1);
 await page.getByRole('button',{name:'Agenda',exact:true}).click();await expect(page.locator('.calendar-event.complete')).toHaveCount(1);
 await page.getByLabel('Calendar status').selectOption('Overdue');await expect(page.locator('.calendar-event.complete')).toHaveCount(0);
 await page.screenshot({path:info.outputPath('calendar-filtered.png'),fullPage:true});
});

test('B03 U07/U08/U12: native reports, CSV mapping, print content and horizons',async({page},info)=>{
 await page.goto('/#Reports');await page.locator('label.field').filter({has:page.getByText('Report',{exact:true})}).locator('select').selectOption('Upcoming Maintenance');await page.getByLabel('Reporting period').selectOption('7');
 const due=page.getByRole('row').filter({hasText:'calendar date unknown'});await expect(due).toHaveCount(2);
 await expect(page.getByRole('cell',{name:'Observed condition',exact:true})).toHaveCount(0);
 await page.getByLabel('From',{exact:true}).fill('2035-01-01');await page.getByLabel('Through',{exact:true}).fill('2035-01-31');await expect(due).toHaveCount(0);
 await page.locator('label.field').filter({has:page.getByText('Report',{exact:true})}).locator('select').selectOption('Parts Replacement History');await page.getByLabel('Reporting period').selectOption('year');
 const headers=await page.getByRole('columnheader').allTextContents();expect(headers[4]).toBe('Materials / parts');expect(headers[5]).toBe('Cost');
 const cells=page.getByRole('row').nth(1).getByRole('cell');await expect(cells.nth(4)).toHaveText('Grease');await expect(cells.nth(5)).toHaveText('12.50 USD');
 const event=page.waitForEvent('download');await page.getByRole('button',{name:'Export CSV',exact:true}).click();const file=await event;const path=info.outputPath('parts.csv');await file.saveAs(path);const csv=await readFile(path,'utf8');expect(csv).toContain('Materials / parts');expect(csv).toContain('"Grease","12.50 USD"');
 await page.emulateMedia({media:'print'});await expect(cells.nth(4)).toHaveText('Grease');await expect(cells.nth(5)).toHaveText('12.50 USD');await page.screenshot({path:info.outputPath('parts-print.png'),fullPage:true});
 await info.attach('parts-export',{path,contentType:'text/csv'});
});
