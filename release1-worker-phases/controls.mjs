import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {observeContext,origin} from './observe-context.mjs';
for(const mode of ['503','hash','delay'])test('Worker phase negative/positive control '+mode,async({browser},info)=>{
 const context=await browser.newContext({baseURL:origin});const record=await observeContext(context,info,0,mode);
 try{
  const page=await context.newPage();await page.goto('/#Dashboard');await expect(page.getByRole('heading',{name:'Welcome to a better-kept workshop'})).toBeVisible();
  const path=join(resolve(process.env.PRINTGUARD_FORENSIC_RUN),'events',record.id+'.ndjson');
  const events=async()=>{try{return(await readFile(path,'utf8')).trim().split('\n').map(line=>JSON.parse(line));}catch{return[];}};
  if(mode==='delay'){
   await expect.poll(async()=>(await events()).some(event=>event.event==='claim-end'),{timeout:15000}).toBe(true);
   await expect.poll(async()=>page.evaluate(()=>!!navigator.serviceWorker.controller),{timeout:5000}).toBe(true);
   expect((await events()).filter(event=>event.event==='digest').every(event=>event.match)).toBe(true);
   expect((await events()).some(event=>event.event==='marker-complete')).toBe(true);
  }else{
   await expect.poll(async()=>(await events()).some(event=>event.event==='install-reject'),{timeout:10000}).toBe(true);
   const rows=await events();expect(rows.some(event=>event.event==='marker-complete')).toBe(false);expect(await page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(false);
   if(mode==='hash')expect(rows.some(event=>event.event==='digest'&&event.match===false)).toBe(true);
  }
  await info.attach('forensic-context',{body:JSON.stringify({context:record.id,mode}),contentType:'application/json'});
 }finally{await context.close();}
});
