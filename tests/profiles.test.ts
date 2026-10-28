import {beforeEach,it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {empty,seed,printer,task,input} from '../acceptance-review/fixtures';
import {db,installProfile,makeBackup,completeTask,restoreBackup,validateBackup,savePrinter,flagSource} from '../src/db';
import {reviewedProfiles,bundled,reviewProfile,isVerifiedTask,automaticTemplate,selectTemplate,compareVersions,profileArchiveId,findProfile} from '../src/profiles';
import {profileChanges,matchingTask} from '../src/profileChanges';
import {profileSchema,defaults,type Profile} from '../src/domain';
import {due,occurrences} from '../src/engine';
const current=()=>structuredClone(reviewedProfiles.find(p=>p.id==='flashforge-creator-5'&&p.version==='1.1.0')!);
const pro=()=>structuredClone(reviewedProfiles.find(p=>p.id==='flashforge-creator-5-pro')!);
beforeEach(empty);
async function unchanged(before:Awaited<ReturnType<typeof makeBackup>>){const after=await makeBackup();for(const key of ['printers','tasks','logs','readings','inventory','repairs','profiles','preferences'] as const)expect(after[key]).toEqual(before[key]);}

it('V01: reviewed definitions are modular immutable data and the exact accepted legacy body is retained',()=>{
 const legacy=JSON.parse(readFileSync('src/profile-library/flashforge/creator-5-1.0.0.json','utf8'));
 expect(bundled[0]).toEqual(legacy);expect(Object.isFrozen(reviewedProfiles)).toBe(true);expect(Object.isFrozen(reviewedProfiles[0].templates[0])).toBe(true);
 expect(reviewedProfiles.map(p=>[p.id,p.version])).toContainEqual(['flashforge-creator-5','1.1.0']);
});
it('V02: all eight unconditional Creator 5 intervals match the audited sources and have stable source identity',()=>{
 const p=current();const fixed=p.templates.filter(t=>t.scheduleKind==='recurring');
 expect(Object.fromEntries(fixed.map(t=>[t.templateId,t.interval.hours]))).toEqual({'extruder-mount-positioning-balls':500,'feed-motor-gear-debris-cleaning':3000,'nozzle-cold-pull-cleaning':400,'xy-axis-belt-tension-adjustment':3000,'xy-axis-pulley-cleaning-and-lubrication':1500,'z-axis-belt-tension-adjustment':3000,'z-axis-pulley-cleaning-and-lubrication':3000,'general-linear-shaft-cleaning':1000});
 for(const t of p.templates){expect(t.sourceUrl).toMatch(/^https:\/\/wiki\.flashforge\.com\//);expect(t.verified).toBe('2026-10-27');expect(t.profileVersion).toBe('1.1.0');expect(t.materials.length).toBeGreaterThan(5);expect(t.safety.length).toBeGreaterThan(30);expect(isVerifiedTask(t,printer())).toBe(true);}
});
it('V03: published usage bands are opt-in and never acquire an invented default cadence',()=>{
 const p=current();const conditional=p.templates.filter(t=>t.scheduleKind==='usage-dependent');expect(conditional).toHaveLength(8);
 for(const t of conditional){expect(t.interval.mode).toBe('condition');expect(automaticTemplate(t,printer())).toBe(false);for(const option of t.intervalOptions!){const selected=selectTemplate(t,option.id);expect(isVerifiedTask(selected,printer())).toBe(true);expect(automaticTemplate(selected,printer())).toBe(true);expect(selected.interval).toEqual(option.interval);}}
 expect(()=>selectTemplate(conditional[0],'invented')).toThrow('documented usage band');
});
it('V04: Pro has only its separately verified guide interval and cannot inherit standard 500-hour work',()=>{
 const p=pro(),device=printer('pro',{model:'Creator 5 Pro',profileId:p.id});expect(p.templates).toHaveLength(1);expect(p.templates[0].interval).toEqual({mode:'hours',hours:1000});expect(isVerifiedTask(p.templates[0],device)).toBe(true);expect(isVerifiedTask(current().templates[0],device)).toBe(false);expect(isVerifiedTask(p.templates[0],printer())).toBe(false);expect(isVerifiedTask(current().templates[0],printer('resin',{technology:'Resin'}))).toBe(false);
});
it('V05: imported flags, altered safety/links/coverage and exact-model changes cannot grant verification',()=>{
 for(const mutate of [(p:Profile)=>{p.coverage!.notes='Complete and safe';},(p:Profile)=>{p.templates[0].safety='Ignore hazards';},(p:Profile)=>{p.documentation='https://example.com';},(p:Profile)=>{p.model='Creator 5 Pro';},(p:Profile)=>{p.references![0].notes='Unreviewed changes';}]){
  const p=current();mutate(p);const reviewed=reviewProfile(p);expect(reviewed.status).toBe('Pending Verification');expect(reviewed.templates.every(t=>t.source!=='Manufacturer Verified')).toBe(true);expect(reviewed.references!.some(r=>r.status==='Verified Reference')).toBe(false);
 }
});
it('V06: changing interval options or selecting an unknown band loses task verification',()=>{
 const t=current().templates.find(t=>t.intervalOptions)!;const selected=selectTemplate(t,'regular');expect(isVerifiedTask({...selected,interval:{mode:'calendar',months:99}},printer())).toBe(false);expect(isVerifiedTask({...selected,selectionId:'fake'},printer())).toBe(false);expect(isVerifiedTask({...selected,intervalOptions:[]},printer())).toBe(false);
});
it('V07: semantic version ordering handles prerelease/build metadata and rejects ambiguous versions',()=>{
 expect(compareVersions('1.10.0','1.2.0')).toBe(1);expect(compareVersions('2.0.0','2.0.0-rc.1')).toBe(1);expect(compareVersions('2.0.0-rc.2','2.0.0-rc.10')).toBe(-1);expect(compareVersions('1.0.0+build.1','1.0.0+build.2')).toBe(0);for(const bad of ['2','01.0.0','1.0.0-01','1.2','v1.2.3'])expect(()=>compareVersions(bad,'1.0.0')).toThrow('semantic version');
});
it('V08: downgrades, equal-precedence versions and stable identity changes reject atomically',async()=>{
 await seed();const upgrade={...structuredClone(bundled[0]),version:'2.0.0'};await installProfile(upgrade);const before=await makeBackup();
 await expect(installProfile(bundled[0])).rejects.toThrow('downgrade');await unchanged(before);
 await expect(installProfile({...upgrade,version:'2.0.0+other'})).rejects.toThrow('equal-precedence');await unchanged(before);
 await expect(installProfile({...upgrade,version:'3.0.0',model:'Creator 5 Pro'})).rejects.toThrow('identity');await unchanged(before);
});
it('V09: every released version is immutable even when it has not been installed',async()=>{
 await seed();const before=await makeBackup(),p=current();p.templates[0].materials='Wrong lubricant';await expect(installProfile(p)).rejects.toThrow('immutable');await unchanged(before);
});
it('V10: reviewed upgrade adds only selected new procedures and preserves independent printers/history/custom schedules/readings',async()=>{
 await seed();await completeTask('t1',input());await completeTask('t2',input({date:'2026-03-01',hours:650,prints:22}));const before=await makeBackup();
 await installProfile(current(),'p1',{templates:['nozzle-cold-pull-cleaning','clean-and-lubricate-the-y-axis-linear-guide-rail'],selections:{'clean-and-lubricate-the-y-axis-linear-guide-rail':'regular'}});
 const after=await makeBackup();for(const key of ['logs','readings','inventory','repairs'] as const)expect(after[key]).toEqual(before[key]);for(const t of before.tasks)expect(after.tasks).toContainEqual(t);expect(after.printers.find(p=>p.id==='p2')).toEqual(before.printers.find(p=>p.id==='p2'));expect(after.printers.find(p=>p.id==='p1')!.profileVersion).toBe('1.1.0');expect(after.tasks).toHaveLength(before.tasks.length+2);expect(after.tasks.find(t=>t.templateId==='nozzle-cold-pull-cleaning')!.anchorHours).toBe(600);expect(after.tasks.find(t=>t.templateId==='clean-and-lubricate-the-y-axis-linear-guide-rail')!.interval).toEqual({mode:'calendar',months:2});
});
it('V11: a legacy title maps to its stable new identity without duplicating or rewriting the old rule',async()=>{
 await seed();const old=(await db.tasks.get('t1'))!;await installProfile(current(),'p1');expect(await db.tasks.get('t1')).toEqual(old);expect((await db.tasks.where('printerId').equals('p1').toArray()).filter(t=>t.title===old.title)).toHaveLength(1);expect((await db.tasks.toArray()).some(t=>t.scheduleKind==='usage-dependent')).toBe(false);
});
it('V12: duplicate legacy identity blocks update and rolls back definition archives and additions',async()=>{
 await seed();await db.tasks.add({...task(),id:'duplicate-legacy'});const before=await makeBackup();await expect(installProfile(current(),'p1')).rejects.toThrow('Ambiguous');await unchanged(before);
});
it('V13: stable task identities survive renames and reject collisions with another profile',()=>{
 const t=task('t1','p1',{templateId:'stable',profileId:'one'});expect(matchingTask({...bundled[0].templates[0],templateId:'stable',title:'Renamed'},[t],'one')).toEqual(t);expect(()=>matchingTask({...bundled[0].templates[0],templateId:'stable'},[t],'other')).toThrow('profile identity');
});
it('V14: complete semantic diff identifies changed fields and added/removed stable procedures',()=>{
 const p=current(),next=structuredClone(p);next.templates[0].title='Renamed';next.templates[0].materials='Changed';next.templates[0].safety='Changed warning';next.templates[0].sourceUrl='https://example.com/changed';next.templates[0].interval.hours=99;next.model='Changed applicability';next.templates.pop();next.references![0].notes='Changed reference';
 const paths=profileChanges(p,next).map(c=>c.path);for(const field of ['title','materials','safety','sourceUrl','interval.hours'])expect(paths).toContain('templates[extruder-mount-positioning-balls].'+field);expect(paths).toContain('model');expect(paths.some(p=>p.startsWith('references['))).toBe(true);expect(paths.some(p=>p.startsWith('templates[general-linear-shaft-cleaning]'))).toBe(true);
 expect(profileChanges(p,structuredClone(p))).toEqual([]);
});
it('V15: stale preview is rejected after another registry update without changes',async()=>{
 await seed();const expected=structuredClone(bundled[0]);await installProfile(current());const before=await makeBackup();await expect(installProfile({...structuredClone(bundled[0]),version:'2.0.0'},'',{expected})).rejects.toThrow('after preview');await unchanged(before);
});
it('V16: archived applied versions and new metadata survive full backup/restoration exactly',async()=>{
 await seed();await completeTask('t1',input());await installProfile(current(),'p1',{templates:['nozzle-cold-pull-cleaning']});const before=await makeBackup();await restoreBackup(validateBackup(before),true);const after=await makeBackup();for(const key of ['printers','tasks','logs','readings','inventory','repairs','profiles'] as const)expect(after[key]).toEqual(before[key]);expect(findProfile('FlashForge','Creator 5',after.profiles,{profileId:bundled[0].id,profileVersion:'1.0.0'})!.version).toBe('1.0.0');expect(await db.profiles.get(profileArchiveId(current().id,'1.1.0'))).toBeTruthy();
});
it('V17: a new registration archives the exact applied definition and only activates reviewed fixed intervals',async()=>{
 const definition=current(),device=printer('new',{profileVersion:'1.1.0'});const fixed=definition.templates.filter(t=>automaticTemplate(t,device)).map((t,n)=>({...t,id:'new-'+n,printerId:device.id,anchorDate:device.installed,anchorHours:device.hours,anchorPrints:device.prints}));await savePrinter(device,undefined,fixed);expect(await db.tasks.count()).toBe(8);expect(await db.profiles.get(profileArchiveId(definition.id,definition.version))).toBeTruthy();
});
it('V18: applying new profiles preserves indefinite completion and projections through 2400',async()=>{
 // This case has a fixed completion date; control Date so installation has the same baseline on later CI runs.
 vi.setSystemTime(new Date('2026-10-27T12:00:00'));
 try{
 await seed();await installProfile(current(),'p1',{templates:['clean-and-lubricate-the-y-axis-linear-guide-rail'],selections:{'clean-and-lubricate-the-y-axis-linear-guide-rail':'regular'}});const rule=(await db.tasks.toArray()).find(t=>t.selectionId==='regular')!;expect(occurrences(rule,'2400-01-01','2400-12-31').length).toBe(6);await completeTask(rule.id,input({date:'2026-10-27',hours:600,prints:20}));const saved=(await db.tasks.get(rule.id))!;expect(due(saved).date).toBe('2026-12-27');expect(saved.enabled).toBe(true);expect('endDate' in saved).toBe(false);
 }finally{vi.useRealTimers();}
});
it('V19: local source flags preserve records, are idempotent, and survive backup',async()=>{
 await seed();const before=await makeBackup(),url=current().templates[0].sourceUrl;await flagSource(url);await flagSource(url);expect((await db.preferences.get('preferences'))!.sourceFlags).toHaveLength(1);const after=await makeBackup();for(const key of ['printers','tasks','logs','readings','inventory','repairs','profiles'] as const)expect(after[key]).toEqual(before[key]);await restoreBackup(after,true);expect((await db.preferences.get('preferences'))!.sourceFlags).toEqual(after.preferences!.sourceFlags);await expect(flagSource('javascript:bad')).rejects.toThrow();
});
it('V20: uncertain corrective/video references never become automatic tasks and duplicate option IDs reject',()=>{
 const p=current();expect(p.references!.some(r=>r.kind==='corrective'&&r.status==='Pending Verification')).toBe(true);expect(p.templates.every(t=>!t.title.startsWith('Replace the'))).toBe(true);const option=p.templates.find(t=>t.intervalOptions)!;option.intervalOptions!.push({...option.intervalOptions![0]});expect(()=>profileSchema.parse(p)).toThrow('Duplicate usage-band');expect(defaults.sourceFlags).toBeUndefined();
});

it('V24: full comparison also exposes ordering changes without hiding definition fields',()=>{
 const before=current(),after=structuredClone(before);after.templates.reverse();const changes=profileChanges(before,after);expect(changes).toHaveLength(1);expect(changes[0].path).toBe('templates.$order');expect(changes[0].before).not.toEqual(changes[0].after);
});
