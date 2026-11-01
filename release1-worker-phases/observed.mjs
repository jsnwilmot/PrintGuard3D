import {test} from '@playwright/test';
import {pathToFileURL} from 'node:url';
import {join,resolve} from 'node:path';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {observeContext,pinnedSource} from './observe-context.mjs';
const source=await pinnedSource(),file=join(source.source,'release1-reporting/native/reporting.mjs');
if(createHash('sha256').update(await readFile(file)).digest('hex')!==source.originalN09SHA)throw Error('Original N09 changed');
let restore,records=[];
test.beforeEach(async({browser},info)=>{
 if(!info.title.startsWith('N09 '))return;records=[];let index=0;const create=browser.newContext.bind(browser);restore=()=>{browser.newContext=create;};
 browser.newContext=async options=>{const context=await create(options),record=await observeContext(context,info,index++);records.push(record);return context;};
});
test.afterEach(async({},info)=>{
 restore?.();restore=null;
 const run=resolve(process.env.PRINTGUARD_FORENSIC_RUN),directory=join(run,'case-outcomes');await mkdir(directory,{recursive:true});
 for(const record of records)await record.write({source:'harness',event:'case-end',status:info.status,errors:info.errors.map(error=>({message:error.message,stack:error.stack}))});
 if(info.title.startsWith('N09 '))await writeFile(join(directory,info.project.name+'-'+info.repeatEachIndex+'.json'),JSON.stringify({title:info.title,status:info.status,repeat:info.repeatEachIndex,engine:info.project.name,timeout:info.timeout,retry:info.retry,contexts:records.map(record=>record.id),errors:info.errors},null,2));
 records=[];
});
await import(pathToFileURL(file).href);
