# Chromium trace encoding control experiment

This local-only four-case fixture contains no PrintGuard runtime, IndexedDB or user records. It separates actual fetch bytes from trace-resource representation. It is not an application regression or a reproduction of N09. Chromium156 / Playwright1.64.1 were used; the exact script/trace digests and results are in [ENCODING-RESULTS.json](ENCODING-RESULTS.json).

Save the following as `.verification-local/issue41-encoding-probe.mjs` in UTF-8 and run it from this repository with Node22 or later and the installed Chromium binary. Set PLAYWRIGHT_BROWSERS_PATH only when using a custom test cache. It creates only loopback fixtures, temporary contexts and ignored traces. Do not use a real browser profile. The four cells are explicit UTF-8 charset absent/present × Playwright routing absent/present; no retry occurs. The five-second cap is this probe's diagnostic bound, not any alteration of N09.

```js
import http from 'node:http';
import {chromium} from '@playwright/test';
import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
const out='.verification-local/issue41-encoding';await mkdir(out,{recursive:true});
const css=Buffer.from('body::before { content: "minus − é α"; }','utf8'),expected=createHash('sha256').update(css).digest('hex');
const browser=await chromium.launch({headless:true});const rows=[];
for(const charset of [false,true])for(const routed of [false,true]){
 const server=http.createServer((req,res)=>{
  if(req.url==='/payload.css'){res.writeHead(200,{'Content-Type':'text/css'+(charset?'; charset=utf-8':'')});res.end(css);}
  else if(req.url==='/encoding-sw.js'){res.writeHead(200,{'Content-Type':'text/javascript'});res.end(`let actual;self.addEventListener('install',e=>e.waitUntil((async()=>{const b=await(await fetch('/payload.css')).arrayBuffer();actual=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b))).map(x=>x.toString(16).padStart(2,'0')).join('');if(actual!==${JSON.stringify(expected)})throw Error('Actual response bytes mismatch');})()));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('message',e=>e.ports[0].postMessage({actual}));`);}
  else{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end('<!doctype html><link rel="stylesheet" href="/payload.css"><title>Synthetic encoding diagnostic</title>');}
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const context=await browser.newContext();await context.tracing.start({snapshots:true,screenshots:false,sources:false});
 if(routed)await context.route('**/*',route=>route.continue());const page=await context.newPage();await page.goto(origin);
 let value,error;try{value=await Promise.race([page.evaluate(async()=>{const bytes=await(await fetch('/payload.css')).arrayBuffer(),pageSHA=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');await navigator.serviceWorker.register('/encoding-sw.js');const r=await navigator.serviceWorker.ready;const workerSHA=await new Promise(resolve=>{const c=new MessageChannel();c.port1.onmessage=e=>resolve(e.data.actual);r.active.postMessage('hash',[c.port2]);});return {pageSHA,workerSHA};}),new Promise((_,reject)=>setTimeout(()=>reject(Error('Five-second diagnostic bound exceeded')),5000))]);}catch(e){error=e.message;}
 const trace=out+'/charset-'+charset+'-route-'+routed+'.zip';await context.tracing.stop({path:trace});await context.close();await new Promise(r=>server.close(r));rows.push({charset,routed,expected,...value,error,trace});
}await browser.close();await writeFile(out+'/RESULTS.json',JSON.stringify({fixture:'Synthetic CSS UTF-8 bytes, no PrintGuard application or data',rows},null,2));console.log(JSON.stringify(rows));
```

Each page and worker hashes native `Response.arrayBuffer()` bytes and compares them with Node's known UTF-8 buffer. All four cases matched. With no explicit charset, trace resource entries nevertheless contained a different52-byte representation of the44-byte CSS, including the worker record; adding charset aligned the recorded representation. Routing did not change the actual-byte result. Inspect each ZIP's `*.network` resource entries for `/payload.css` and SHA256 the referenced `resources/*` bytes to reproduce that comparison.

This establishes that a trace text-resource hash can differ while the actual worker digest succeeds in this fixture. It does **not** establish which stage failed historically, prove that all historical bytes were correct, or authorize a production header/hash/worker change. The old N09 trace's CSS representation discrepancy alone cannot establish hash rejection.
