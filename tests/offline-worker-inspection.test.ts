import {it,expect} from 'vitest';
import {runInNewContext} from 'node:vm';
import {serviceWorkerSource} from '../scripts/service-worker.mjs';
it('W05 the offline query exposes only compiled public metadata without cache/DB/activation calls',()=>{
 const handlers:Record<string,(event:unknown)=>void>={},calls:string[]=[],replies:unknown[]=[],writer={protocol:1,generation:1,capabilities:['backup:1']};
 const source=serviceWorkerSource({cache:'printguard-0123456789ab',assets:['/index.html'],hashes:{'/index.html':'a'.repeat(64)},identity:'b'.repeat(24),writer,canonicalOrigin:'https://example.invalid',deployable:false});
 runInNewContext(source,{self:{addEventListener:(type:string,handler:(event:unknown)=>void)=>{handlers[type]=handler;},skipWaiting:()=>calls.push('activate'),clients:{claim:()=>calls.push('claim')}},fetch:()=>calls.push('fetch'),caches:{open:()=>calls.push('cache')},indexedDB:{open:()=>calls.push('db')}});
 handlers.message({data:{type:'PRINTGUARD_OFFLINE_INSPECT'},ports:[{postMessage:(reply:unknown)=>replies.push(reply)}]});
 expect(calls).toEqual([]);expect(replies).toEqual([{ok:true,identity:{protocol:1,build:'b'.repeat(24),writer},offline:{cache:'printguard-0123456789ab',assets:['/index.html'],hashes:{'/index.html':'a'.repeat(64)}}}]);
});
