import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

// Check the exact tracked/staged surface that will be public, not local backups.
const files=execFileSync('git',['ls-files','--cached','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const forbiddenPath=/(^|\/)(node_modules|dist|coverage|test-results|playwright-report|\.verification-local|\.credentials)(\/|$)|(^|\/)\.env(?!\.example$)|\.(?:sqlite3?|db|db-shm|db-wal|log|tmp)$/i;
const rawOutput=/^(?:acceptance-review|remediation-phase1)\/(?:.*-tests\.json|fixture-backup\.json|browser-.*\.json|test-index\.csv)$/;
const secretPatterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/gh[pousr]_[A-Za-z0-9]{30,}/,/github_pat_[A-Za-z0-9_]{30,}/,/AKIA[0-9A-Z]{16}/];
const problems=[];
for(const file of files){
 if(forbiddenPath.test(file)||rawOutput.test(file))problems.push(`${file}: local/generated/private file must not be tracked`);
 const bytes=readFileSync(file);
 if(!bytes.includes(0)&&secretPatterns.some(pattern=>pattern.test(bytes.toString('utf8'))))problems.push(`${file}: possible credential material; inspect without printing its value`);
 if(file.endsWith('.mjs')){try{execFileSync(process.execPath,['--check',file],{stdio:'pipe'});}catch{problems.push(`${file}: JavaScript syntax check failed`);}}
}
const legacy=JSON.parse(readFileSync('tests/fixtures/legacy-schema1.synthetic.json','utf8'));
if(legacy.printers.length!==3||legacy.printers.some(p=>!['p1','p2','p3'].includes(p.id)||!p.name.startsWith('Review printer ')||p.location!=='ISOLATED TEST FIXTURE'))problems.push('Legacy fixture is not the labelled synthetic dataset');
const lock=JSON.parse(readFileSync('package-lock.json','utf8')).packages;
for(const [parent,binary] of [['rollup','@rollup/rollup-linux-x64-gnu'],['esbuild','@esbuild/linux-x64'],['@tailwindcss/oxide','@tailwindcss/oxide-linux-x64-gnu'],['lightningcss','lightningcss-linux-x64-gnu']]){
 const entry=lock[`node_modules/${binary}`];
 if(!entry?.optional||entry.version!==lock[`node_modules/${parent}`]?.optionalDependencies?.[binary])problems.push(`${binary}: platform-optional lock entry is missing or does not match its parent`);
}
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
console.log(`Validated ${files.length} tracked files: no prohibited output paths, obvious credential patterns or invalid .mjs syntax. Synthetic fixture identity confirmed. This is a targeted guard, not an exhaustive security audit.`);
