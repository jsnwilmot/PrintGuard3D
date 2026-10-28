import {defineConfig} from '@playwright/test';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export default defineConfig({
 testDir:'./native',fullyParallel:false,workers:1,retries:0,timeout:120000,expect:{timeout:15000},
 outputDir:'../test-results/phase5',reporter:[['list'],['json',{outputFile:root+'test-results/phase5-native.json'}],['html',{outputFolder:root+'playwright-report/phase5',open:'never'}]],
 use:{baseURL:'http://127.0.0.1:4358',headless:true,actionTimeout:15000,navigationTimeout:20000,viewport:{width:1440,height:1100},locale:'en-US',timezoneId:'UTC',trace:'on',screenshot:'only-on-failure'},
 projects:[...['chromium','firefox','webkit'].map(browserName=>({name:browserName,testMatch:'*.cross.mjs',use:{browserName}})),{name:'print-chromium',testMatch:'*.print.mjs',use:{browserName:'chromium'}}],
 webServer:{command:'node remediation-phase1/server.mjs 4358 --source-headers --offline-control',cwd:root,url:'http://127.0.0.1:4358/review.html',reuseExistingServer:false,timeout:15000}
});
