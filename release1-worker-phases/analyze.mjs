// Summarize recorded evidence only. Never upgrades a test outcome.
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
const run=resolve(process.argv[2]||''),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=async path=>JSON.parse(await readFile(join(run,path),'utf8'));
const ndjson=async path=>{try{return(await readFile(path,'utf8')).trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));}catch(error){if(error.code==='ENOENT')return[];throw error;}};
const summary={source:await read('SOURCE.json'),cases:[],contexts:[],rootCause:'NOT DETERMINED',releaseApproved:false};
for(const name of await readdir(join(run,'case-outcomes'))){const result=await read('case-outcomes/'+name);summary.cases.push(result);}
for(const name of (await readdir(join(run,'page-events'))).filter(name=>name.endsWith('.ndjson'))){
 const id=name.slice(0,-7),page=await ndjson(join(run,'page-events',name)),worker=await ndjson(join(run,'events',name));
 const has=event=>page.some(row=>row.event===event),count=event=>worker.filter(row=>row.event===event).length;
 // Missing await resolution is meaningful only if the named await started.
 const blocked=has('controller-wait-start')&&!has('controller-wait-resolved')?'controllerchange':has('ready-wait-start')&&!has('ready-wait-resolved')?'ready':null;
 summary.contexts.push({id,blocked,caseEnd:page.findLast(row=>row.event==='case-end')?.status||null,readyStarted:has('ready-wait-start'),readyResolved:has('ready-wait-resolved'),controllerResolved:has('controller-wait-resolved')||has('controller-already-present'),nativeStates:page.filter(row=>row.event==='native-worker-state').map(row=>row.state),digests:count('digest'),mismatches:worker.filter(row=>row.event==='digest'&&!row.match),puts:count('cache-put-end'),marker:count('marker-complete'),installComplete:count('install-complete'),installReject:count('install-reject'),activateStart:count('activate-start'),activateComplete:count('activate-complete'),claimStart:count('claim-start'),claimEnd:count('claim-end'),workerCopies:worker.filter(row=>row.event==='worker-copy'),pageLogSHA:sha(await readFile(join(run,'page-events',name))),workerLogSHA:worker.length?sha(await readFile(join(run,'events',name))):null});
}
await writeFile(join(run,'SUMMARY.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify({cases:summary.cases.map(row=>({engine:row.engine,repeat:row.repeat,status:row.status})),blocked:summary.contexts.filter(row=>row.blocked).map(({id,blocked,caseEnd,digests,puts,marker,claimEnd})=>({id,blocked,caseEnd,digests,puts,marker,claimEnd}))},null,2));
