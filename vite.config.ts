import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {readdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
function offline(){return {name:'printguard-offline',closeBundle(){
 const walk=(root:string):string[]=>readdirSync(root,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(root,e.name)):[join(root,e.name)]);
 const files=walk('dist').filter(p=>!p.endsWith('sw.js')&&!p.endsWith('_headers')&&!p.endsWith('_redirects')).sort().map(p=>'/'+p.replaceAll('\\','/').replace(/^dist\//,''));
 const version=createHash('sha256').update(files.map(p=>readFileSync('dist'+p).toString('base64')).join('')).digest('hex').slice(0,12);
 const hashes=Object.fromEntries(files.map(p=>[p,createHash('sha256').update(readFileSync('dist'+p)).digest('hex')]));
 writeFileSync('dist/sw.js',`const CACHE='printguard-${version}';const ASSETS=${JSON.stringify(files)};const HASHES=${JSON.stringify(hashes)};
 self.addEventListener('install',e=>e.waitUntil((async()=>{const initial=!self.registration.active;const staged=[];for(const path of ASSETS){const response=await fetch(new Request(path,{cache:'reload'}));if(!response.ok)throw Error('Incomplete update');const bytes=await response.clone().arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');if(hash!==HASHES[path])throw Error('Mixed update assets');staged.push([path,response]);}const cache=await caches.open(CACHE);for(const [path,response]of staged)await cache.put(path,response);await cache.put('/__printguard_install__',new Response(JSON.stringify({initial})));})()));
 self.addEventListener('activate',e=>e.waitUntil((async()=>{const record=await(await caches.open(CACHE)).match('/__printguard_install__');if(record&&(await record.json()).initial)await self.clients.claim();})()));
 self.addEventListener('message',e=>{if(e.data?.type==='PRINTGUARD_ACTIVATE')e.waitUntil(self.skipWaiting());});
 self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin)return;if(e.request.mode==='navigate'&&['/','/index.html'].includes(u.pathname)){e.respondWith(caches.open(CACHE).then(c=>c.match('/index.html')).then(hit=>hit||new Response('Offline application cache incomplete. Reconnect to recover; do not clear site data.',{status:503})));return;}if(ASSETS.includes(u.pathname)){e.respondWith(caches.open(CACHE).then(c=>c.match(u.pathname)).then(hit=>hit||new Response('Compatible asset unavailable. Reconnect and review the application update.',{status:503})));}});`);
 }};}
const sourceFiles=(root:string):string[]=>readdirSync(root,{withFileTypes:true}).flatMap(e=>e.isDirectory()?sourceFiles(join(root,e.name)):[join(root,e.name)]).sort();
const generation=Number(process.env.PRINTGUARD_WRITER_GENERATION||1);
if(!Number.isSafeInteger(generation)||generation<1)throw Error('Invalid build writer generation');
const identity=createHash('sha256').update([...sourceFiles('src'),...sourceFiles('public')].map(p=>readFileSync(p)).map(b=>b.toString('base64')).join('|')).update(readFileSync('package-lock.json')).update(readFileSync('index.html')).update(readFileSync('vite.config.ts')).update(String(generation)).digest('hex').slice(0,24);
export default defineConfig({
 define:{__PRINTGUARD_BUILD__:JSON.stringify(process.env.VITEST?'source-test':identity),__PRINTGUARD_GENERATION__:generation},
 plugins:[react(),tailwindcss(),{name:'printguard-build-identity',transformIndexHtml(html){return html.replace('<head>',`<head><meta name="printguard-build" content="${identity}"/>`);}},offline()],
 build:{outDir:'dist',rollupOptions:{output:{manualChunks:{react:['react','react-dom'],charts:['recharts'],database:['dexie','dexie-react-hooks'],validation:['zod']}}}}
});
