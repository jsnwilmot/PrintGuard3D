import http from 'node:http';
import {readFile,writeFile,mkdir,appendFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import os from 'node:os';
import {prefix} from './worker.mjs';
const run=resolve(process.env.PRINTGUARD_CAUSAL_RUN||''),meta=JSON.parse(await readFile(join(run,'SOURCE.json'),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');for(const [file,hash]of Object.entries(meta.files))if(sha(await readFile(join(meta.source,'dist',file)))!==hash)throw Error('Frozen bytes changed');
const {instrumentWorker}=await import(pathToFileURL(join(run,'tooling/old-worker.mjs'))),original=await readFile(join(meta.source,'dist/sw.js'),'utf8');const m=original.match(/const CACHE=("[^"]+"),ASSETS=(\[.*?\]),HASHES=(\{.*?\});/);if(!m)throw Error('Unknown worker');
const originalCreate=http.createServer;let current=null,upstream,front,serial=Promise.resolve();const states=new Map();await mkdir(join(run,'events'),{recursive:true});
const record=(context,event)=>{serial=serial.then(()=>appendFile(join(run,'events',context+'.ndjson'),JSON.stringify({context,receivedAt:new Date().toISOString(),nodeMonotonic:process.hrtime.bigint().toString(),...event})+'\n'));return serial;};
const release=s=>{s.installReleased=true;for(const r of s.installWaiters.splice(0))r();};const releaseHTML=s=>{s.htmlReleased=true;for(const r of s.htmlWaiters.splice(0))r();};
http.createServer=handler=>{
 upstream=originalCreate(handler);
 front=originalCreate(async(req,res)=>{try{
  const url=new URL(req.url,'http://127.0.0.1:4359');
  if(url.pathname==='/__forensic/health'){res.end('synthetic');return;}
  if(url.pathname==='/__forensic/config'){
   let body='';for await(const b of req)body+=b;const c=JSON.parse(body);if(!/^[a-zA-Z0-9_-]{1,160}$/.test(c.context))throw Error('Bad context');current={...c,installWaiters:[],htmlWaiters:[],installReleased:!c.gated,htmlReleased:false,holdHTML:false};states.set(c.context,current);await record(c.context,{source:'server',event:'configured',configuration:c});res.end('configured');return;
  }
  if(url.pathname==='/__forensic/log'){
   let body='';for await(const b of req){body+=b;if(body.length>100000)throw Error('Too large');}const e=JSON.parse(body);if(!states.has(e.context))throw Error('Bad context');await record(e.context,e);res.end('recorded');return;
  }
  const s=url.searchParams.has('context')?states.get(url.searchParams.get('context')):current;if(!s)throw Error('No context');
  if(url.pathname==='/__forensic/install-gate'){if(!s.installReleased)await new Promise(r=>s.installWaiters.push(r));res.end('released');return;}
  if(url.pathname==='/__forensic/release-install'){release(s);res.end('released');return;}
  if(url.pathname==='/__forensic/hold-html'){s.holdHTML=true;res.end('holding');return;}
  if(url.pathname==='/__forensic/release-html'){releaseHTML(s);res.end('released');return;}
  if(url.pathname==='/__forensic/events'){await serial;res.setHeader('Content-Type','application/json');res.end(JSON.stringify((await readFile(join(run,'events',s.context+'.ndjson'),'utf8')).trim().split('\n').map(x=>JSON.parse(x))));return;}
  await record(s.context,{source:'server',event:'request',path:url.pathname});
  if(s.holdHTML&&['/','/index.html'].includes(url.pathname)){await record(s.context,{source:'server',event:'html-held'});if(!s.htmlReleased)await new Promise(r=>s.htmlWaiters.push(r));await record(s.context,{source:'server',event:'html-release'});}
  res.on('finish',()=>void record(s.context,{source:'server',event:'response',path:url.pathname,status:res.statusCode}));
  // Intercept the worker body after the original handler has selected its headers.
  if(url.pathname==='/sw.js'&&s.instrumented){const copy=prefix(s)+instrumentWorker(original,{context:s.context,originalSHA:meta.files['sw.js'],cache:JSON.parse(m[1]),hashes:JSON.parse(m[3])});await writeFile(join(run,'events',s.context+'.worker.js'),copy);await record(s.context,{source:'server',event:'worker-copy',originalSHA:meta.files['sw.js'],instrumentedSHA:sha(copy)});if(s.transport==='direct'){const end=res.end.bind(res);res.end=()=>end(copy);return handler(req,res);}const forwarded=http.request({hostname:'127.0.0.1',port:4351,path:req.url,headers:req.headers},incoming=>{incoming.resume();incoming.on('end',()=>{res.writeHead(incoming.statusCode||502,incoming.headers);res.end(copy);});});forwarded.on('error',()=>res.destroy());forwarded.end();return;}
  if(url.pathname==='/workshop.svg'&&['503','hash','delay'].includes(s.fault)){
   if(s.fault==='delay')await new Promise(r=>setTimeout(r,1000));else{res.writeHead(s.fault==='503'?503:200,{'Content-Type':'image/svg+xml'});res.end('<svg xmlns="http://www.w3.org/2000/svg"><title>Synthetic fault</title></svg>');return;}
  }
  if(s.transport==='direct')return handler(req,res);
  const p=http.request({hostname:'127.0.0.1',port:4351,path:req.url,method:req.method,headers:req.headers},incoming=>{res.writeHead(incoming.statusCode||502,incoming.headers);incoming.pipe(res);});p.on('error',()=>res.destroy());req.pipe(p);
 }catch(e){res.writeHead(500);res.end('Diagnostic server error');console.error(e.message);}});
 return {listen:()=>{upstream.listen(4351,'127.0.0.1');front.listen(4359,'127.0.0.1',()=>console.log('Isolated claim comparison4359'));return front;}};
};
process.chdir(meta.source);process.argv=[process.execPath,join(meta.source,'remediation-phase1/server.mjs'),'4359','--source-headers','--offline-control'];await import(pathToFileURL(process.argv[1]));http.createServer=originalCreate;
let prior=process.hrtime.bigint();const timer=setInterval(()=>{const now=process.hrtime.bigint(),s=current;if(s)void record(s.context,{source:'resources',event:'sample',nodeCPU:process.cpuUsage(),memory:process.memoryUsage(),freeMemory:os.freemem(),loadAverage:os.platform()==='win32'?null:os.loadavg(),intervalMilliseconds:Number(now-prior)/1e6});prior=now;},500);timer.unref();
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{for(const s of states.values()){release(s);releaseHTML(s);}clearInterval(timer);front.close();upstream.close();process.exit();});
