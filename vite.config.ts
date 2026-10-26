import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {readdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
function offline(){return {name:'printguard-offline',closeBundle(){
 const walk=(root:string):string[]=>readdirSync(root,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(root,e.name)):[join(root,e.name)]);
 const files=walk('dist').filter(p=>!p.endsWith('sw.js')&&!p.endsWith('_headers')).map(p=>'/'+p.replaceAll('\\','/').replace(/^dist\//,''));
 const version=createHash('sha256').update(files.map(p=>readFileSync('dist'+p).toString('base64')).join('')).digest('hex').slice(0,12);
 writeFileSync('dist/sw.js',`const CACHE='printguard-${version}';const ASSETS=${JSON.stringify(files)};
 self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
 self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('printguard-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
 self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('/index.html')));return;}e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request)));});`);
 }};}
export default defineConfig({
 plugins:[react(),tailwindcss(),offline()],
 build:{outDir:'dist',rollupOptions:{output:{manualChunks:{react:['react','react-dom'],charts:['recharts'],database:['dexie','dexie-react-hooks'],validation:['zod']}}}}
});
