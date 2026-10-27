from pathlib import Path
import csv,json,hashlib,subprocess,datetime
root=Path.cwd(); out=root/'remediation-phase1'; base=root/'acceptance-review'
standard=json.loads((out/'all-tests.json').read_text(encoding='utf-8')); review=json.loads((out/'review-tests.json').read_text(encoding='utf-8'))
assert standard['numFailedTests']==0
assert review['numPassedTests']==39 and review['numFailedTests']==6
link=lambda name:f'[{name}](../{name})'
raw=link('tests/integrity.test.ts')+'; '+link('tests/integrity-ui.test.tsx')+'; '+link('remediation-phase1/contracts.audit.ts')+'; [CI runs](https://github.com/jsnwilmot/PrintGuard3D/actions)'
rows=list(csv.DictReader((base/'acceptance-matrix.csv').read_text(encoding='utf-8-sig').splitlines())); fields=list(rows[0])
for row in rows:
 row['Evidence']=link('acceptance-review/MATRIX.md')+f" (original row {row['ID']}; prior evidence, not a new native check)."
 row['Tests']='Baseline evidence carried forward; see original row. '+row['Tests']
updates={}
def update(id,status,implementation,tests,issues,action):
 updates[id]=dict(Status=status,Implementation=implementation,Evidence=raw,Tests=tests,Issues=issues,Action=action)
update('3','PARTIAL','Installed definitions extend manufacturer/model choices. Exact Creator 5 and Pro remain distinct. Bundled verified coverage is still one procedure.','U01/P36; baseline source research retained.','F07: full Creator 5 coverage is incomplete. F09 corrected.','Research remaining official procedures in a separately authorized phase; do not invent intervals.')
update('4','PARTIAL','Current and immutable archived profile definitions share the existing IndexedDB profiles store. Exact applied-version lookup, stable template IDs, old/incoming interval display and quarantined claims are implemented.','U01-U04/P20-P22/P31-P33/P36/P40-P43.','Legacy templates use title identity; comprehensive semantic diff and trusted new manufacturer coverage remain incomplete.','Require stable template IDs for future packages; finish complete diff/coverage review later.')
update('5','PARTIAL','Verification is limited to app-reviewed exact model/technology/version/procedure evidence. Unknown imported claims remain pending; malformed verified provenance is rejected.','R06/U05/P17/P19-P22/P40/P43.','Only the existing bundled procedure is allowlisted. Other manufacturer procedures and live documentation availability were not re-researched in Phase 1.','Retain the original procedure evidence; research additional exact-model sources separately.')
update('8','PASS','Printer/task/history ownership is protected during task edits, merge planning and commit. Rules with history cannot change printers; independent same-model records survive roundtrips.','Existing identical-printer test; A08/A10/A11/A19; P01-P07/P16-P19/P27/P35/P37.','Existing corrupt legacy databases are not repaired automatically; conflicting imports fail closed.','Keep regression tests and review any real legacy inconsistency separately after an intact export.')
update('9','PARTIAL','Fixed-cadence edits rebase on the processed boundary and preview next due; completion chronology, actual usage baselines and valid early one-time completion are corrected.','R04/R05/R08/U06/P11/P24-P28/P38/P44.','Usage-to-date forecasting remains absent; native future-year calendar entry still fails separately.','Authorize subsequent calendar and forecasting work after reviewing Phase 1.')
update('12','PARTIAL','Completion, skip and postponement use guarded transactions and snapshot attribution. History cannot move through a task edit.','A08/A13; P18/P23/P25-P29/P34/P37/P46.','Guided in-app procedures remain absent and explicitly R2.','Retain source links and warnings; do not add invented procedure steps.')
update('15','PARTIAL','History filtering uses captured category/priority and recorded outcomes rather than the current task. Individual historical costs use their recorded currency.','U09/P23/P39; baseline actual-data assurances.','U07/U08 still fail. Legacy attribution is unknown; mixed-currency aggregate/report semantics still need review.','Fix due-work inclusion, report columns and cost aggregation in a separately authorized phase.')
update('18','PARTIAL','Source and destination graph checks, per-record conflicts, commit-time revalidation, atomic rollback and full/printer roundtrips are verified automatically. The original native schema-1 export restores byte-equivalent record values in tests.','R01-R03/R07; A08-A13; P01-P16/P35/P41/P45/P46.','Current native file-chooser restore was not completed. No migration registry beyond schema 1. Original strict readers may reject the new optional fields.','Reverify native export/file chooser/merge/replacement on the final build; use the updated reader for new exports.')
update('23','PARTIAL','Guarded imports and exact verification applicability repair the previously demonstrated integrity/security failures. React escaping, local storage and no account/telemetry architecture are preserved.','A12/A15/A16; R01-R03/R06/R07; P01-P15/P19-P22/P41-P44.','Production headers, exhaustive security/privacy behavior and external integrations remain unverified.','Keep access unchanged; perform separate host and cross-browser acceptance before any release.')
update('25','PARTIAL',f"Original 29 tests plus {standard['numTotalTests']-29} new regressions: {standard['numPassedTests']}/{standard['numTotalTests']} pass. Acceptance: 39/45 pass. TypeScript and build pass.",'all-tests.json; review-tests.json; build.log; protected-files.json.','Six acceptance failures and native restore/cross-browser verification gaps remain.','Retain failing contracts; do not classify the application as release-ready.')
update('27','FAIL','Phase 1 integrity/safety exit contracts pass; the complete Release 1 journey still has known failures.','R01-R08/U01-U06/U09 pass; U07/U08/U10/U11/U12/U18 fail.','Calendar, due-work visibility, reporting/KPIs, profile coverage, legal/accessibility/integration checks remain.','Review Phase 1, then authorize the next remediation scope; no deployment or merge in this phase.')
update('28','FAIL','Existing architecture retained; focused source corrections, README, regression tests and reproducible evidence added. Local build succeeds.','78 passing standard tests; 39 passing acceptance checks; build.log.','The complete original application specification is not satisfied.','Keep original baseline and current evidence distinguishable; finish remaining accepted scope before release consideration.')
update('29','PARTIAL','No schedule end date/cap was added. Multi-year generation, repeated completion, reload and backup tests pass; edit/chronology defects are corrected.','A01-A08/A18/A19; R05/R08/P16/P24/P25/P38.','U18 native segmented future-year entry remains a demonstrated failure.','Repair and reverify date input in the next authorized phase; engine tests alone do not pass the UI requirement.')
checks={
 '4.2':('Installed new manufacturers/models are selectable with profile technology; untrusted templates are not auto-activated.','U01/P36'),
 '4.3':('Profile application appends new template identities and preserves existing task/customization/history rows exactly.','U03/P23/P31-P33'),
 '4.4':('Documentation resolves the exact applied ID/version; earlier definitions remain retrievable and backed up.','U04/P31/P41/P42'),
 '4.5':('Preview displays current and incoming intervals, descriptions, materials and safety before acceptance.','U02/P40'),
 '5.1':('Malformed verified metadata is rejected. Plausible self-asserted claims are quarantined unless exact reviewed evidence matches.','R06/P19-P22/P40/P43'),
 '8.2':('No historical rule reassignment; reassignment without history becomes user defined and clears active verification/version claims.','U05/P17-P19/P27/P37'),
 '9.3':('Edit and preview share the same rebase helper. Jan 31 progressed through June becomes Aug 30 under a two-month rule.','R08/P24/P38'),
 '9.4':('Completion/skip must not precede latest printer maintenance or usage; current totals cannot decrease.','R05/P25/P26/P44/P46'),
 '9.5':('Default selected printer and cumulative baselines are initialized together; guards reject baselines above actual totals.','U06/R07/P11'),
 '9.7':('One-time due dates no longer act as a last-service baseline; valid early completion disables the rule.','R04; original once-rule test'),
 '12.1':('Completion, inventory, rule and usage writes remain atomic; injected history-write failure after deduction rolls back all stores.','A08/A13/P26/P46'),
 '15.4':('Historical filters use immutable captured metadata. Legacy missing fields stay unknown and remain visible without category/priority filtering.','U09/P23/P39/P45'),
 '18.3':('Conflicting identity/ownership/history rows and invalid resulting graphs block merge; commit revalidates against fresh destination rows.','R02/P01-P07/P13-P15/P35'),
 '18.4':('Ownership, stock references, usage chronology, baselines, duplicate activity and profile-version references are checked before any write.','R01/R03/R07/P08-P12/P41/P44'),
}
for id,(implementation,tests) in checks.items():
 caveat='Verified only for the stated contracts; original baseline limits still apply.'
 if id=='15.4':caveat='Legacy fields are not reconstructed; aggregate currency semantics remain outside this narrow filter pass.'
 if id=='4.3':caveat='Legacy packages without template IDs retain title fallback; renames require review.'
 update(id,'PASS',implementation,tests,caveat,'Retain targeted regression coverage; do not broaden this pass to the entire section.')
update('18.1','NOT VERIFIED','Prior native export/restore evidence is retained. This phase opened and seeded a fresh labelled localhost database, but file chooser automation returned without an import preview.','Prior browser-export/browser-after-restore artifacts; P16/P45 prove domain roundtrip, not a fresh native end-to-end restore.','No current native import/restore success is claimed.','Recheck the final build with the actual native chooser and exports after tooling is available.')
update('18.5','PARTIAL','Schema 1 and IndexedDB version/store layout retained; optional fields preserve legacy input support and immutable versions without a migration.','A12/P31/P41/P45.','Original strict readers may reject enriched schema-1 exports; no general migration registry exists.','Use the updated reader; introduce explicit format evolution/migrations before a future incompatible schema.')
update('29.7','PARTIAL','Engine/lifecycle/backup checks and edit/chronology repairs pass. Native segmented year input remains failing.','A01-A08/A18/A19; R05/R08; U18 FAIL.','Whole perpetual requirement cannot pass while the calendar UI is corruptible.','Retain U18 and fix it in the next authorized phase.')
for row in rows:
 if row['ID'] in updates:row.update(updates[row['ID']])
with (out/'acceptance-matrix.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.DictWriter(f,fields);w.writeheader();w.writerows(rows)
(out/'acceptance-matrix.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False),encoding='utf-8')
md=['# PrintGuard 3D — Phase 1 updated acceptance matrix','', 'This is the current development assessment, not release approval. All 29 sections and 57 granular entries are retained. Unchanged evidence is explicitly carried forward from the original review. Current native restore is NOT VERIFIED.','', '| '+' | '.join(fields)+' |','|'+'|'.join('---' for _ in fields)+'|']
for row in rows:md.append('| '+' | '.join(str(row[k]).replace('|','/').replace('\n',' ') for k in fields)+' |')
(out/'MATRIX.md').write_text('\n'.join(md)+'\n',encoding='utf-8')
findings=list(csv.DictReader((base/'findings.csv').read_text(encoding='utf-8-sig').splitlines()))
resolved={'F01':'R01/R02; P01-P09/P13-P16/P35/P48/P49','F02':'R03/R07; P10/P11/P25/P41/P44','F03':'U05; P17-P21/P37','F04':'R08; P24/P38','F05':'R05; P25/P26','F08':'R06; P19-P22/P40/P43','F09':'U01; P36','F11':'U06/R07; P11','F21':'R04'}
partial={'F10':'U02/U03/U04; P31-P33/P40-P42. Version retention/applied lookup and interval preview corrected; complete diff and legacy template identity remain limited.','F15':'U09; P23/P39/P45. New snapshots and honest unknown legacy attribution corrected; historical reconstruction and mixed-currency aggregates remain limited.'}
for f in findings:
 f['Phase1Status']='CORRECTED' if f['ID'] in resolved else 'PARTIAL' if f['ID'] in partial else 'OPEN — outside Phase 1'
 f['Phase1Evidence']=resolved.get(f['ID'],partial.get(f['ID'],'Original evidence retained; no corrective acceptance claim.'))
with (out/'findings.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.DictWriter(f,list(findings[0]));w.writeheader();w.writerows(findings)
index=[]
for name,j in [('standard',standard),('acceptance',review)]:
 for suite in j['testResults']:
  for t in suite['assertionResults']:index.append({'Suite':name,'File':Path(suite['name']).name,'Test':t['title'],'Status':t['status']})
with (out/'test-index.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.DictWriter(f,['Suite','File','Test','Status']);w.writeheader();w.writerows(index)
prior=json.loads((base/'before-sha256.json').read_text(encoding='utf-8'))
protected=['.openai/hosting.json','package.json','package-lock.json','public/logo.png','src/legal.ts','src/styles.css','vite.config.ts','tests/core.test.ts','tests/ui.test.tsx']
protected_rows={p:{'before':prior.get(p),'after':hashlib.sha256((root/p).read_bytes()).hexdigest()} for p in protected if (root/p).exists()}
for v in protected_rows.values():v['unchanged']=v['before']==v['after']
assert all(v['unchanged'] for v in protected_rows.values())
(out/'protected-files.json').write_text(json.dumps(protected_rows,indent=2),encoding='utf-8')
status=subprocess.check_output(['git','status','--short'],text=True)
(out/'git-status.txt').write_text(status,encoding='utf-8')
sections=[r for r in rows if '.' not in r['ID']]
counts={s:sum(r['Status']==s for r in sections) for s in ['PASS','PARTIAL','FAIL','NOT VERIFIED']}
summary={'reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'branch':'remediation/phase1-integrity-safety','baselineCommit':'c938bd8bdf1e9089f1473d3fb1c2e74597066b58','sectionCounts':counts,'matrixEntries':len(rows),'originalTests':29,'newRegressionTests':standard['numTotalTests']-29,'standardPassed':standard['numPassedTests'],'standardFailed':standard['numFailedTests'],'acceptancePassed':review['numPassedTests'],'acceptanceFailed':review['numFailedTests'],'correctedFindings':list(resolved),'partialFindings':list(partial),'releaseReady':False,'phase2Started':False,'deployed':False,'productionDataAccessed':False,'nativeRestore':'NOT VERIFIED — file chooser automation produced no import preview','typecheck':'PASS','build':'PASS — see build.log'}
(out/'summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
print(json.dumps(summary,indent=2))
