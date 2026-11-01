import {chromium,firefox,webkit} from '@playwright/test';
import {readdir,writeFile,stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname,join} from 'node:path';
import os from 'node:os';
const run=resolve(process.argv[2]||''),paths={chromium:chromium.executablePath(),firefox:firefox.executablePath(),webkit:webkit.executablePath()},cache=process.env.PLAYWRIGHT_BROWSERS_PATH||dirname(dirname(dirname(paths.chromium)));
const names=new Set(['chrome.exe','chrome-headless-shell.exe','firefox.exe','Playwright.exe','MiniBrowser.exe','WebKitWebProcess.exe','WebKitNetworkProcess.exe','chrome','chrome-headless-shell','firefox','MiniBrowser','pw_run.sh']),binaries={};
async function walk(path,depth=0){if(depth>4)return;for(const e of await readdir(path,{withFileTypes:true})){const p=join(path,e.name);if(e.isDirectory())await walk(p,depth+1);else if(names.has(e.name)){const hash=createHash('sha256');for await(const chunk of createReadStream(p))hash.update(chunk);binaries[p]={bytes:(await stat(p)).size,sha256:hash.digest('hex')};}}}
await walk(cache);await writeFile(join(run,'BROWSER-BINARIES.json'),JSON.stringify({at:new Date().toISOString(),node:process.version,platform:os.platform(),release:os.release(),arch:os.arch(),CPU:os.cpus().map(c=>c.model),totalMemory:os.totalmem(),launcherPaths:paths,binaries,note:'Only the disposable Playwright install cache is inspected; no browser user profiles. Per-case browser.version records actual engine version. Headless shell is included separately from full Chromium.'},null,2));console.log(Object.keys(binaries).length+' test browser binaries hashed');
