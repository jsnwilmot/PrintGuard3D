import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';

// A checked-in digest is an authoring/review guard, not a manufacturer signature.
const manifest=JSON.parse(readFileSync('src/profile-manifest.json','utf8'));
const files=readdirSync('src/profile-library',{recursive:true}).filter(f=>f.endsWith('.json')).map(f=>join('src/profile-library',f).replaceAll('\\','/')).sort();
if(JSON.stringify(files)!==JSON.stringify(manifest.map(m=>m.file).sort()))throw Error('Every library definition needs a reviewed manifest entry.');
const identities=new Set();
for(const entry of manifest){
 const bytes=readFileSync(entry.file,'utf8').replaceAll('\r\n','\n'),p=JSON.parse(bytes);
 if(createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw Error(`${entry.file}: reviewed content digest changed; publish a new version and review its evidence.`);
 if(p.id!==entry.id||p.model!==entry.model||p.version!==entry.version||p.verified!==entry.reviewed||p.profileId)throw Error(`${entry.file}: manifest identity differs.`);
 if(!/^\d+\.\d+\.\d+$/.test(p.version)||identities.has(p.id+':'+p.version))throw Error(`${entry.file}: invalid or duplicate release identity.`);
 identities.add(p.id+':'+p.version);
 if(!entry.legacy)for(const t of p.templates){
  if(!t.templateId||t.profileId!==p.id||t.profileVersion!==p.version||!t.materials||!t.safety||!t.sourceTitle||t.verified!==p.verified)throw Error(`${entry.file}: incomplete template provenance.`);
  if(t.source==='Manufacturer Verified'&&!entry.sourceHosts?.includes(new URL(t.sourceUrl).hostname))throw Error(`${entry.file}: unexpected verified source authority; review the source authority allowlist.`);
  if(t.scheduleKind==='usage-dependent'&&(t.interval.mode!=='condition'||!t.intervalOptions?.length))throw Error(`${entry.file}: usage-dependent procedures must remain inactive without a published band selection.`);
 }
}
console.log(`Validated ${manifest.length} reviewed data definitions and immutable content digests. Manufacturer evidence still requires human review.`);
