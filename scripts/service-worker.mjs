// Generated worker has no remote imports or data migrations.
export function serviceWorkerSource({cache,assets,hashes,identity,writer,canonicalOrigin,deployable}){
 return `const CACHE=${JSON.stringify(cache)},ASSETS=${JSON.stringify(assets)},HASHES=${JSON.stringify(hashes)};
const IDENTITY=${JSON.stringify({protocol:1,build:identity,writer})},PUBLIC_ORIGIN=${JSON.stringify(canonicalOrigin)},DEPLOYABLE=${JSON.stringify(deployable)};
self.addEventListener('install',e=>e.waitUntil((async()=>{
 if(self.location.origin===PUBLIC_ORIGIN&&!DEPLOYABLE)throw Error('Non-deployable artifact cannot install at the canonical origin');
 const initial=!self.registration.active,staged=[];
 for(const path of ASSETS){const response=await fetch(new Request(path,{cache:'reload'}));if(!response.ok)throw Error('Incomplete update');const bytes=await response.clone().arrayBuffer(),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');if(hash!==HASHES[path])throw Error('Mixed update assets');staged.push([path,response]);}
 const cache=await caches.open(CACHE);for(const [path,response]of staged)await cache.put(path,response);await cache.put('/__printguard_install__',new Response(JSON.stringify({initial})));
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{const record=await(await caches.open(CACHE)).match('/__printguard_install__');if(record&&(await record.json()).initial)await self.clients.claim();})()));
async function checkControl(expected){
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open('PrintGuard3D');
  request.onupgradeneeded=()=>request.transaction.abort();request.onerror=()=>reject(Error('Workshop requirements unavailable'));
  request.onsuccess=()=>{const db=request.result;if(db.version!==20||!db.objectStoreNames.contains('writerControl')){db.close();reject(Error('Unknown workshop layout'));return;}
   const tx=db.transaction('writerControl','readonly'),read=tx.objectStore('writerControl').get('__printguard_writer_control_v1__');let valid=false;
   read.onsuccess=()=>{const control=read.result,shape=value=>value&&JSON.stringify(Object.keys(value).sort())===JSON.stringify(['capabilities','generation','id','protocol']);valid=shape(control)&&shape(expected)&&control.id===expected.id&&control.protocol===expected.protocol&&control.generation===expected.generation&&JSON.stringify(control.capabilities)===JSON.stringify(expected.capabilities)&&control.id==='__printguard_writer_control_v1__'&&control.protocol===IDENTITY.writer.protocol&&Number.isSafeInteger(control.generation)&&control.generation>0&&control.generation<=IDENTITY.writer.generation&&JSON.stringify(control.capabilities)===JSON.stringify(IDENTITY.writer.capabilities);};
   tx.oncomplete=()=>{db.close();valid?resolve():reject(Error('Workshop requirements changed or are incompatible'));};tx.onabort=tx.onerror=()=>{db.close();reject(Error('Workshop requirements could not be checked'));};
  };
 });
}
self.addEventListener('message',e=>{
 const reply=value=>e.ports[0]?.postMessage(value);
 if(e.data?.type==='PRINTGUARD_DESCRIBE'){reply({ok:true,identity:IDENTITY});return;}
 if(e.data?.type==='PRINTGUARD_OFFLINE_INSPECT'){reply({ok:true,identity:IDENTITY,offline:{cache:CACHE,assets:ASSETS,hashes:HASHES}});return;}
 if(e.data?.type==='PRINTGUARD_ACTIVATE')e.waitUntil((async()=>{
  try{if(!e.ports[0]||e.data.build!==IDENTITY.build)throw Error('Update confirmation does not match this build');await checkControl(e.data.control);await self.skipWaiting();reply({ok:true,identity:IDENTITY});}
  catch(error){reply({ok:false,error:error.message});}
 })());
});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin)return;if(e.request.mode==='navigate'&&['/','/index.html'].includes(u.pathname)){e.respondWith(caches.open(CACHE).then(c=>c.match('/index.html')).then(hit=>hit||new Response('Offline application cache incomplete. Reconnect to recover; do not clear site data.',{status:503})));return;}if(ASSETS.includes(u.pathname))e.respondWith(caches.open(CACHE).then(c=>c.match(u.pathname)).then(hit=>hit||new Response('Compatible asset unavailable. Reconnect and review the application update.',{status:503})));});`;
}
