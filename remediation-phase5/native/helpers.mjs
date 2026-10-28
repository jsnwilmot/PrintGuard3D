import {readFile} from 'node:fs/promises';
import {expect} from '@playwright/test';
export const origin='http://127.0.0.1:4358';
export const tables=['printers','tasks','logs','readings','inventory','repairs','profiles'];
export const fixture=async()=>JSON.parse(await readFile('tests/fixtures/legacy-schema1.synthetic.json','utf8'));
export async function seed(page,context,data){
 data=data||await fixture();
 await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!==origin)return route.abort();if(url.pathname==='/fixture-backup.json')return route.fulfill({json:data});return route.continue();});
 await page.goto('/review.html');expect(new URL(page.url()).origin).toBe(origin);await page.getByRole('button',{name:'Inspect fixture database'}).click();await expect(page.locator('#result')).toContainText('"counts"');expect(JSON.parse(await page.locator('#result').innerText()).counts.printers).toBe(0);await page.getByRole('button',{name:'Seed isolated test records'}).click();await expect.poll(async()=>JSON.parse(await page.locator('#result').innerText()).counts.printers).toBe(data.printers.length);
}
export async function raw(page){
 expect(new URL(page.url()).origin).toBe(origin);
 return page.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('PrintGuard3D');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});const result={};const tx=db.transaction([...db.objectStoreNames],'readonly');await Promise.all([...db.objectStoreNames].map(name=>new Promise((resolve,reject)=>{const r=tx.objectStore(name).getAll();r.onsuccess=()=>{result[name]=r.result;resolve();};r.onerror=()=>reject(r.error);})));db.close();return result;});
}
export async function upload(page,data,name='synthetic.json'){await page.getByLabel('Choose JSON file').setInputFiles({name,mimeType:'application/json',buffer:Buffer.from(typeof data==='string'?data:JSON.stringify(data))});}
export async function exportBackup(page,info,name='backup.json'){
 const event=page.waitForEvent('download',{timeout:60000});await page.getByRole('button',{name:'Back Up My Data',exact:true}).click({timeout:60000});const file=await event,path=info.outputPath(name);await file.saveAs(path);return JSON.parse(await readFile(path,'utf8'));
}
export async function acknowledge(page){await page.getByRole('button',{name:'Review the disclaimer'}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:/I Understand and Agree/}).click();await expect(page.getByRole('heading',{name:'Meet your next great print'})).toBeVisible();await page.getByRole('button',{name:'Close dialog'}).click();}
export async function replace(page,data){await upload(page,data);const modal=page.getByRole('dialog');await modal.getByLabel('Replace all local records with this backup').check();await modal.getByLabel(/I reviewed this import and confirm/).check();await expect(modal.getByRole('button',{name:'Restore and replace'})).toBeEnabled();await modal.getByRole('button',{name:'Restore and replace'}).click();await expect(page.getByRole('heading',{name:'Welcome to a better-kept workshop'})).toBeVisible();}
export async function printerImage(page){return page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=900;canvas.height=600;const ctx=canvas.getContext('2d'),image=ctx.createImageData(900,600);let n=12345;for(let i=0;i<image.data.length;i+=4){n=(Math.imul(n,1664525)+1013904223)>>>0;image.data[i]=n&255;image.data[i+1]=(n>>>8)&255;image.data[i+2]=(n>>>16)&255;image.data[i+3]=255;}ctx.putImageData(image,0,0);ctx.fillStyle='#fff';ctx.fillRect(50,50,500,110);ctx.fillStyle='#000';ctx.font='bold 45px sans-serif';ctx.fillText('SYNTHETIC PRINTER',70,120);return canvas.toDataURL('image/png');});}
