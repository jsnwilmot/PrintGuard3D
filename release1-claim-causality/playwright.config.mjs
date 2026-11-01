import {defineConfig} from '@playwright/test';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const run=resolve(process.env.PRINTGUARD_CAUSAL_RUN||''),mode=process.env.PRINTGUARD_CAUSAL_MODE||'matrix';
export default defineConfig({testDir:'.',testMatch:'cases.mjs',workers:1,fullyParallel:false,retries:0,timeout:120000,expect:{timeout:15000},outputDir:run+'/'+mode+'-traces',reporter:[['list'],['json',{outputFile:run+'/'+mode+'.json'}]],use:{headless:true,viewport:{width:1440,height:1100},locale:'en-US',timezoneId:'UTC',trace:{mode:'on',screenshots:false,snapshots:true,sources:false},screenshot:'only-on-failure'},projects:['chromium','firefox','webkit'].map(browserName=>({name:browserName,use:{browserName}})),webServer:{cwd:fileURLToPath(new URL('../',import.meta.url)),command:'node release1-claim-causality/server.mjs',url:'http://127.0.0.1:4359/__forensic/health',reuseExistingServer:false,timeout:15000}});
