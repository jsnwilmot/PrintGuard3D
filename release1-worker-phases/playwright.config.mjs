import {defineConfig} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),run=resolve(process.env.PRINTGUARD_FORENSIC_RUN||'');
export default defineConfig({testDir:'.',testMatch:process.env.PRINTGUARD_PHASE_CONTROLS==='1'?'controls.mjs':'observed.mjs',fullyParallel:false,workers:1,retries:0,timeout:120000,expect:{timeout:15000},
 outputDir:run+(process.env.PRINTGUARD_PHASE_CONTROLS==='1'?'/controls-traces':'/observed-traces'),reporter:[['list'],['json',{outputFile:run+(process.env.PRINTGUARD_PHASE_CONTROLS==='1'?'/controls.json':'/observed.json')}]],
 use:{baseURL:'http://127.0.0.1:4359',headless:true,viewport:{width:1440,height:1100},locale:'en-US',timezoneId:'UTC',trace:'on',screenshot:'only-on-failure'},
 projects:['chromium','firefox','webkit'].map(browserName=>({name:browserName,use:{browserName}})),
 webServer:{command:'node release1-worker-phases/server.mjs',cwd:root,url:'http://127.0.0.1:4359/__forensic/health',reuseExistingServer:false,timeout:15000}
});
