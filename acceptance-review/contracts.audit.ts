import {beforeEach,it,expect} from 'vitest';
import {empty,seed,printer,task,input,log} from './fixtures';
import {db,completeTask,makeBackup,validateBackup,restoreBackup} from '../src/db';
import {profileSchema} from '../src/domain';
import {bundled} from '../src/profiles';
import {due,advance} from '../src/engine';
beforeEach(empty);
// These assertions express required acceptance behavior, so failures are intentionally retained as evidence.
it('R01: backup validation rejects a history row whose task belongs to a different printer',async()=>{await seed();const b=await makeBackup();b.logs.push(log('wrong',{printerId:'p2',taskId:'t1'}));expect(()=>validateBackup(b)).toThrow();});
it('R02: merge rejects ID collisions that attach new history to an unrelated existing task',async()=>{await db.printers.add(printer('p1'));await db.tasks.add(task('same','p1'));const b=await makeBackup();b.printers=[printer('p2')];b.tasks=[task('same','p2')];b.logs=[log('incoming',{printerId:'p2',taskId:'same'})];await expect(restoreBackup(b,false)).rejects.toThrow();});
it('R03: backup validation rejects stored usage below already completed maintenance readings',async()=>{await seed();const b=await makeBackup();b.logs.push(log());expect(()=>validateBackup(b)).toThrow();});
it('R04: a future-dated one-time job can be completed early without being mistaken for a baseline',async()=>{await db.printers.add(printer());await db.tasks.add(task('once','p1',{interval:{mode:'once'},anchorDate:'2026-12-01'}));await expect(completeTask('once',input())).resolves.toBeUndefined();});
it('R05: scheduled-cadence completion rejects a date earlier than its latest permanent completion',async()=>{await db.printers.add(printer());await db.tasks.add(task('t1','p1',{interval:{mode:'calendar',months:1},base:'scheduled'}));await completeTask('t1',input({date:'2026-06-01'}));await expect(completeTask('t1',input({date:'2026-02-01'}))).rejects.toThrow();});
it('R06: a manufacturer-verified template requires official documentation, date and original interval provenance',()=>{const p=structuredClone(bundled[0]);p.templates[0].sourceUrl='';p.templates[0].verified='';p.templates[0].interval={mode:'hours',hours:1};expect(()=>profileSchema.parse(p)).toThrow();});
it('R07: schema rejects task baselines above the associated printers recorded usage',async()=>{await seed();const b=await makeBackup();b.tasks[0].anchorHours=999999;expect(()=>validateBackup(b)).toThrow();});
it('R08: editing a fixed-cadence interval preserves the already-advanced baseline',()=>{const t=task('t','p1',{anchorDate:'2026-01-31',interval:{mode:'calendar',months:1},base:'scheduled'});const progressed=advance(t,'2026-06-30',600,20).task;expect(due(progressed).date).toBe('2026-07-31');const edited={...progressed,interval:{mode:'calendar' as const,months:2},cycleOffset:0};expect(due(edited).date>='2026-06-30').toBe(true);});
