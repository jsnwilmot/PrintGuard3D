import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {readdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {configureBuild} from './scripts/release-contract.mjs';
import {serviceWorkerSource} from './scripts/service-worker.mjs';
export default defineConfig(({mode})=>{
const configured=configureBuild(process.cwd(),process.env,mode);
const {context,deployable}=configured;
function offline(){return {name:'printguard-offline',closeBundle(){
 writeFileSync('dist/build-contract.json',JSON.stringify({...context,deployable},null,2));
 const walk=(root:string):string[]=>readdirSync(root,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(root,e.name)):[join(root,e.name)]);
 const files=walk('dist').filter(p=>!p.endsWith('sw.js')&&!p.endsWith('_headers')&&!p.endsWith('_redirects')).sort().map(p=>'/'+p.replaceAll('\\','/').replace(/^dist\//,''));
 const version=createHash('sha256').update(files.map(p=>readFileSync('dist'+p).toString('base64')).join('')).digest('hex').slice(0,12);
 const hashes=Object.fromEntries(files.map(p=>[p,createHash('sha256').update(readFileSync('dist'+p)).digest('hex')]));
 writeFileSync('dist/sw.js',serviceWorkerSource({cache:'printguard-'+version,assets:files,hashes,identity:context.buildIdentity,writer:context.writer}));
 }};}
const generation=context.writer.generation,identity=context.buildIdentity;
return {
 define:{__PRINTGUARD_BUILD__:JSON.stringify(process.env.VITEST?'source-test':identity),__PRINTGUARD_GENERATION__:generation,__PRINTGUARD_DEPLOYABLE__:deployable},
 plugins:[react(),tailwindcss(),{name:'printguard-build-identity',transformIndexHtml(html){return html.replace('<head>',`<head><meta name="printguard-build" content="${identity}"/>`);}},offline()],
 build:{outDir:'dist',rollupOptions:{output:{manualChunks:{react:['react','react-dom'],charts:['recharts'],database:['dexie','dexie-react-hooks'],validation:['zod']}}}}
};
});
