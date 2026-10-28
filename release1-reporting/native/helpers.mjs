import {readFile} from 'node:fs/promises';
import {expect} from '@playwright/test';
export const origin='http://127.0.0.1:4359';
export const originalStores=['printers','tasks','logs','readings','inventory','repairs','profiles','preferences'];
export async function fixture(){
 const b=JSON.parse(await readFile('tests/fixtures/legacy-schema1.synthetic.json','utf8'));
 b.preferences.acknowledgment={version:'1.0',date:'2026-10-28'};b.preferences.theme='light';
 b.logs=b.logs.map((row,index)=>({...row,category:'Lubrication',priority:'High',currency:index%2?'USD':'CAD'}));
 const example=b.logs.find(row=>row.printerId==='p1');
 b.logs.push({...example,id:'explicit-skip',date:'2026-01-20',outcome:'Skipped',onTime:false,currency:undefined,category:undefined,priority:undefined,cost:7},{...example,id:'explicit-postpone',date:'2026-01-21',outcome:'Postponed',cost:0,currency:'CAD'});
 return b;
}
// Synthetic setup only. Actual restoration below always uses the React file input.
export async function legacySetup(page,context,b,version=10){
 await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
 await page.clock.setFixedTime(new Date('2026-10-28T12:00:00.000Z'));await page.goto('/review.html');
 await page.evaluate(async({b,version})=>{if(location.origin!=='http://127.0.0.1:4359')throw Error('Unexpected test origin');const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('PrintGuard3D',version);r.onupgradeneeded=()=>{for(const name of ['printers','tasks','logs','readings','inventory','repairs','profiles','preferences'])r.result.createObjectStore(name,{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});await new Promise((resolve,reject)=>{const tx=db.transaction([...db.objectStoreNames],'readwrite');for(const name of db.objectStoreNames)for(const row of name==='preferences'?[b.preferences]:b[name])tx.objectStore(name).add(row);tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});db.close();},{b,version});
}
export async function raw(page){return page.evaluate(async()=>{if(location.origin!=='http://127.0.0.1:4359')throw Error('Unexpected test origin');const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('PrintGuard3D');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});try{const result={version:db.version};const tx=db.transaction([...db.objectStoreNames],'readonly');await Promise.all([...db.objectStoreNames].map(name=>new Promise((resolve,reject)=>{const r=tx.objectStore(name).getAll();r.onsuccess=()=>{result[name]=r.result;resolve();};r.onerror=()=>reject(r.error);})));return result;}finally{db.close();}});}
export async function dashboard(page){await page.goto('/#Dashboard');await expect(page.getByRole('heading',{name:'Workshop overview'})).toBeVisible();}
export async function reports(page,type){await page.goto('/#Reports');await page.getByRole('combobox',{name:'Report',exact:true}).selectOption(type);}
export const rowIds=page=>page.locator('.report-sheet tbody tr').evaluateAll(rows=>rows.map(row=>row.dataset.recordId));
export async function download(page,info,label,name){const pending=page.waitForEvent('download');await page.getByRole('button',{name:label,exact:true}).click();const file=await pending,path=info.outputPath(name||file.suggestedFilename());await file.saveAs(path);return {path,text:await readFile(path,'utf8')};}
export async function upload(page,data){await page.getByLabel('Choose JSON file').setInputFiles({name:'synthetic-reporting.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});}
export async function replace(page,b){await upload(page,b);const modal=page.getByRole('dialog');await modal.getByLabel('Replace all local records with this backup').check();await modal.getByLabel(/I reviewed this import and confirm/).check();await modal.getByRole('button',{name:'Restore and replace'}).click();await expect(page.getByRole('heading',{name:'Welcome to a better-kept workshop'})).toBeVisible();}
export async function acknowledge(page){await page.getByRole('button',{name:'Review the disclaimer'}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:/I Understand and Agree/}).click();await expect(page.getByRole('heading',{name:'Meet your next great print'})).toBeVisible();await page.getByRole('button',{name:'Close dialog'}).click();}
export async function usage(page,hours){await page.goto('/#My%20Printers');await page.getByRole('button',{name:'Review printer p1',exact:true}).click();await page.getByRole('button',{name:'Log usage',exact:true}).click();await page.getByRole('dialog').getByLabel('Total operating hours').fill(String(hours));await page.getByRole('button',{name:'Save reading',exact:true}).click();await expect(page.getByRole('heading',{name:'Record printer usage',exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Close dialog'}).click();}
