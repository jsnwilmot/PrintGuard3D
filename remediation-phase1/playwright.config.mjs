import {defineConfig} from '@playwright/test';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));

export default defineConfig({
 testDir:'../tests/native',testMatch:'*.browser.mjs',fullyParallel:false,workers:1,
 retries:0,timeout:90000,expect:{timeout:10000},
 outputDir:'../test-results/native',
 reporter:[['list'],['json',{outputFile:root+'test-results/native-results.json'}],['html',{outputFolder:root+'playwright-report',open:'never'}]],
 use:{baseURL:'http://127.0.0.1:4357',browserName:'chromium',headless:true,actionTimeout:10000,navigationTimeout:15000,viewport:{width:1440,height:1100},locale:'en-US',timezoneId:'UTC',trace:'on',screenshot:'only-on-failure'},
 webServer:{command:'node remediation-phase1/server.mjs 4357',cwd:root,url:'http://127.0.0.1:4357/review.html',reuseExistingServer:false,timeout:15000}
});
