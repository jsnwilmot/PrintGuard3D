import {defineConfig} from '@playwright/test';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export default defineConfig({
 testDir:'./native',testMatch:'reporting.mjs',fullyParallel:false,workers:1,retries:0,timeout:120000,expect:{timeout:15000},
 outputDir:'../test-results/reporting',reporter:[['list'],['json',{outputFile:root+'test-results/reporting-native.json'}],['html',{outputFolder:root+'playwright-report/reporting',open:'never'}]],
 use:{baseURL:'http://127.0.0.1:4359',headless:true,viewport:{width:1440,height:1100},locale:'en-US',timezoneId:'UTC',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:['chromium','firefox','webkit'].map(browserName=>({name:browserName,use:{browserName}})),
 webServer:{command:'node remediation-phase1/server.mjs 4359 --source-headers --offline-control',cwd:root,url:'http://127.0.0.1:4359/review.html',reuseExistingServer:false,timeout:15000}
});
