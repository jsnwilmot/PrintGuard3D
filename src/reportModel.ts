import {taskClassification,taskContext,historicalContext,recommendationPolicy} from './recommendations';
import {type Printer,type Task,type Log,type Repair,type Reading,type Preferences,today,intervalLabel,formatDate} from './domain';
import {type Observation} from './observations';
import {status,due,compliance,addInterval} from './engine';
import {upcomingOccurrences,usageDue,validCalendarDate,upcomingTask} from './scheduleView';
import {historicalMetadataMatches,unclassifiedForFilter,currencyLabel,money,expenseGroups,expenseSummary,estimateUsageDate} from './reporting';
import {reviewTask} from './profiles';

export const reportTypes=['Complete Maintenance History','Complete Maintenance Schedule','Upcoming Maintenance','Overdue Maintenance','Maintenance Compliance','Printer Maintenance Performance','Recorded Operating Hours','Maintenance Expenses','Parts Replacement History','Open Repairs','Annual Maintenance Summary','Recorded Missed Maintenance','Usage Estimates','Overdue Critical Maintenance','Current Maintenance','Printer Register','Observed Overdue History','Observed Task Details'] as const;
export type ReportType=typeof reportTypes[number];
export interface ReportData {printers:Printer[];tasks:Task[];logs:Log[];readings:Reading[];repairs:Repair[];prefs:Preferences;observations?:Observation[];}
export interface ReportFilters {
 printer:string;manufacturer:string;category:string;priority:string;state:string;currency:string;start:string;end:string;
 active:'all'|'active'|'archived';detail:'summary'|'records'|'current';workload:'all'|'dated'|'usage-due'|'due-now'|'overdue'|'estimate';
 recordKeys?:string[];observationIds?:string[];outcomes?:Log['outcome'][];
}
export interface ReportQuery {type:ReportType;filters:Partial<ReportFilters>;}
export type MoneyValue={amount:number;currency:string|null};
export type ReportValue=string|number|boolean|null|MoneyValue|MoneyValue[];
export interface ReportColumn {key:string;label:string;type:'text'|'number'|'date'|'datetime'|'url'|'money'|'money-groups';friendlyDate?:boolean;}
export interface ReportRow {id:string;values:ReportValue[];printerId?:string;provenance:Record<string,string|number|boolean|null>;drilldown?:ReportQuery;}
export interface ReportResult {name:ReportType;generatedAt:string;filters:ReportFilters;columns:ReportColumn[];rows:ReportRow[];printers:Printer[];tasks:Task[];warnings:string[];stats:{completed:number;compliance:number|null;hours:number;expenses:string};}
export const defaultReportFilters=():ReportFilters=>({printer:'',manufacturer:'',category:'',priority:'',state:'',currency:'',start:today().slice(0,4)+'-01-01',end:today(),active:'all',detail:'summary',workload:'all'});
export const encodeReportQuery=(query:ReportQuery)=>query.type+'|query:'+encodeURIComponent(JSON.stringify(query.filters));
export function reportRequest(initial:string,data:ReportData):ReportQuery{
 const [typeName,argument]=initial.split('|');const type=reportTypes.includes(typeName as ReportType)?typeName as ReportType:reportTypes[0];
 const filters:Partial<ReportFilters>={};
 if(initial){const dates=[...data.logs,...data.repairs,...data.readings].map(row=>row.date).sort();filters.start=dates[0]||today();filters.end=dates.at(-1)!>today()?dates.at(-1)!:today();}
 if(type==='Overdue Critical Maintenance')filters.priority='Critical';
 if(type==='Maintenance Compliance'&&initial)filters.detail='records';
 if(type==='Recorded Operating Hours'&&initial){filters.detail='current';filters.active='active';}
 if(type==='Upcoming Maintenance'&&argument&&!argument.startsWith('query:')){filters.start=today();filters.end=addInterval(today(),Number(argument)||30);}
 if(argument?.startsWith('printer:'))filters.printer=argument.slice(8);
 if(/^\d{4}-\d{2}$/.test(argument||'')){filters.start=argument+'-01';filters.end=addInterval(addInterval(filters.start,0,1),-1);if(type==='Complete Maintenance History')filters.state='Completed';}
 if(argument?.startsWith('query:')){
  try{const input=JSON.parse(decodeURIComponent(argument.slice(6)));if(input&&typeof input==='object'&&!Array.isArray(input)){
   for(const key of ['printer','manufacturer','category','priority','state','currency','start','end'] as const)if(typeof input[key]==='string')filters[key]=input[key];
   if(['all','active','archived'].includes(input.active))filters.active=input.active;
   if(['summary','records','current'].includes(input.detail))filters.detail=input.detail;
   if(['all','dated','usage-due','due-now','overdue','estimate'].includes(input.workload))filters.workload=input.workload;
   for(const key of ['recordKeys','observationIds','outcomes'] as const)if(Array.isArray(input[key])&&input[key].every((v:unknown)=>typeof v==='string'))(filters[key] as string[])=input[key];
  }}catch{/* Invalid local navigation falls back to its visible report filters. */}
 }
 return {type,filters};
}
export function formatReportValue(value:ReportValue,column?:ReportColumn):string{
 if(value===null)return column?.type==='number'?'Insufficient data':'—';
 if(Array.isArray(value))return value.map(v=>money(v.amount,v.currency||undefined)).join(' · ')||'No recorded expenses';
 if(typeof value==='object')return money(value.amount,value.currency||undefined);
 if(column?.friendlyDate&&typeof value==='string')return formatDate(value);
 return String(value);
}
const amount=(row:{cost:number;currency?:string}):MoneyValue=>({amount:row.cost,currency:row.currency||null});
const groups=(logs:Log[],repairs:Repair[]):MoneyValue[]=>expenseGroups(logs,repairs).map(g=>({amount:g.total,currency:g.currency==='Unclassified currency'?null:g.currency}));
const moneyMatches=(currency:string|undefined,filter:string)=>!filter||(filter==='__unknown__'?!currency:currency===filter);
const columns=(labels:string[],kinds:ReportColumn['type'][]=[]):ReportColumn[]=>labels.map((label,i)=>({key:'c'+i,label,type:kinds[i]||'text'}));
export function selectReport(data:ReportData,type:ReportType,filters:ReportFilters,now=today(),generatedAt=new Date().toISOString()):ReportResult{
 const {printers,tasks,logs,readings,repairs,prefs}=data;
 const ps=printers.filter(p=>(!filters.printer||p.id===filters.printer)&&(!filters.manufacturer||p.manufacturer===filters.manufacturer)&&(filters.active==='all'||(filters.active==='active'?!p.archived:p.archived)));
 const ids=new Set(ps.map(p=>p.id)),name=(id:string)=>{const printer=printers.find(p=>p.id===id);return printer?printer.name+(ps.filter(p=>p.name===printer.name).length>1?' ['+id+']':''):'Missing printer';};
 const keyMatches=(key:string)=>!filters.recordKeys||filters.recordKeys.includes(key);
 const dateMatches=(date:string)=>validCalendarDate(filters.start)&&validCalendarDate(filters.end)&&filters.start<=filters.end&&date>=filters.start&&date<=filters.end;
 const matchesTask=(task:Task)=>ids.has(task.printerId)&&(!filters.category||task.category===filters.category)&&(!filters.priority||task.priority===filters.priority)&&(!filters.state||status(task,printers.find(p=>p.id===task.printerId)!,now,prefs.reminderDays)===filters.state)&&keyMatches('task:'+task.id);
 const ts=tasks.filter(matchesTask);
 const matchingLogs=logs.filter(log=>ids.has(log.printerId)&&dateMatches(log.date)&&historicalMetadataMatches(log,filters.category,filters.priority)&&(!filters.state||filters.state===log.outcome)&&(!filters.outcomes||filters.outcomes.includes(log.outcome))&&moneyMatches(log.currency,filters.currency)&&keyMatches('log:'+log.id));
 const ls=matchingLogs.filter(log=>!unclassifiedForFilter(log,filters.category,filters.priority));
 const rs=repairs.filter(repair=>ids.has(repair.printerId)&&dateMatches(repair.date)&&!filters.category&&(!filters.priority||repair.severity===filters.priority)&&(!filters.state||repair.status===filters.state)&&moneyMatches(repair.currency,filters.currency)&&keyMatches('repair:'+repair.id));
 const rows:ReportRow[]=[];let cs=columns(['Task','Printer','Date','Status','Usage','Cost','Documentation','Notes'],['text','text','date','text','text','money','url','text']);cs[2].friendlyDate=true;
 const add=(id:string,values:ReportValue[],printerId?:string,provenance:ReportRow['provenance']={},drilldown?:ReportQuery)=>rows.push({id,values,printerId,provenance,...(drilldown?{drilldown}:{})});
 const logRow=(log:Log)=>add('log:'+log.id,[log.title,name(log.printerId),log.date,log.outcome,`${log.hours} h / ${log.prints} prints`,amount(log),log.sourceUrl,log.notes],log.printerId,{category:log.category||null,priority:log.priority||null,currency:log.currency||null,source:log.source,sourceUrl:log.sourceUrl,profileId:log.profileId||null,profileVersion:log.profileVersion||null,onTime:log.onTime});
 const warnings=[recommendationPolicy.explanation,recommendationPolicy.counter,recommendationPolicy.coverage,'Historical facts are never inferred from current rules. Missing attribution/currency remains unclassified.','Recorded compliance describes completed and explicitly skipped occurrences; postponements are excluded. It is not a mechanical health or reliability measurement.'];
 if(type==='Complete Maintenance History'||(type==='Maintenance Compliance'&&filters.detail==='records')){
  const selected=type==='Maintenance Compliance'?ls.filter(log=>log.outcome!=='Postponed'):ls;selected.forEach(logRow);
 }else if(type==='Complete Maintenance Schedule'){
  cs=columns(['Task','Printer','Next date','Usage threshold','Interval','Status','Documentation','Source','Profile version','Documentation checked','Safety','Source review','Description','Model','Original interval']);cs[6].type='url';
  for(const task of ts){const printer=printers.find(p=>p.id===task.printerId)!,d=due(task);add('task:'+task.id,[task.title,name(printer.id),task.postponedUntil||d.date,[d.hours!==null?`${d.hours} h`:'',d.prints!==null?`${d.prints} prints`:''].filter(Boolean).join(' or '),intervalLabel(task.interval),status(task,printer,now,prefs.reminderDays),task.sourceUrl,taskClassification(task,printer),task.profileVersion,task.verified,task.safety,prefs.sourceFlags?.some(flag=>flag.url===task.sourceUrl)?'Flagged for review':'Check current source before servicing',task.description,printer.model,intervalLabel(task.originalInterval)],printer.id,{source:reviewTask(task,printer).source,profileVersion:task.profileVersion});}
 }else if(type==='Upcoming Maintenance'){
  cs=columns(['Task','Printer','Date','Occurrence / current status','Interval / usage threshold','Source','Documentation']);cs[6].type='url';
  for(const task of ts){const printer=printers.find(p=>p.id===task.printerId)!;
   if(filters.workload!=='usage-due')for(const event of upcomingOccurrences(task,printer,filters.start,filters.end,now))add(task.id+'@'+event.date,[task.title,name(printer.id),event.date,event.projected?'Projected recurrence':'Next due',intervalLabel(task.interval),taskClassification(task,printer),task.sourceUrl],printer.id,{projected:event.projected,taskId:task.id});
   if(filters.workload!=='dated'&&dateMatches(now)&&usageDue(task,printer,now))add(task.id+'@usage',[task.title,name(printer.id),'',`${status(task,printer,now)} · current usage; calendar date unknown`,intervalLabel(task.interval),taskClassification(task,printer),task.sourceUrl],printer.id,{projected:false,taskId:task.id});
  }
 }else if(type==='Overdue Maintenance'||type==='Overdue Critical Maintenance'||type==='Current Maintenance'){
  cs=columns(['Task','Printer','Calendar due','Hour threshold','Print threshold','Interval','Documentation','Current status']);cs[6].type='url';
  for(const task of ts){const printer=printers.find(p=>p.id===task.printerId)!,state=status(task,printer,now,prefs.reminderDays);if(printer.archived||!task.enabled)continue;if(type!=='Current Maintenance'&&state!=='Overdue')continue;if(type==='Overdue Critical Maintenance'&&task.priority!=='Critical')continue;const d=due(task);add('task:'+task.id,[task.title,name(printer.id),task.postponedUntil||d.date,d.hours,d.prints,intervalLabel(task.interval),task.sourceUrl,state],printer.id,{source:reviewTask(task,printer).source,profileVersion:task.profileVersion});}
  warnings.push('These are current recorded maintenance states; the reporting date range does not reconstruct earlier outstanding work.');
 }else if(type==='Recorded Operating Hours'&&filters.detail!=='current'){
  cs=columns(['Printer','Reading date','Cumulative operating hours','Cumulative print count'],['text','date','number','number']);
  for(const reading of readings.filter(r=>ids.has(r.printerId)&&dateMatches(r.date)&&keyMatches('reading:'+r.id)))add('reading:'+reading.id,[name(reading.printerId),reading.date,reading.hours,reading.prints],reading.printerId);
 }else if(type==='Printer Register'||type==='Recorded Operating Hours'){
  cs=columns(['Printer','Manufacturer','Model','State','Cumulative operating hours','Cumulative print count'],['text','text','text','text','number','number']);
  for(const printer of ps.filter(p=>keyMatches('printer:'+p.id)))add('printer:'+printer.id,[printer.name,printer.manufacturer,printer.model,printer.archived?'Archived':'Active',printer.hours,printer.prints],printer.id);
 }else if(type==='Open Repairs'){
  cs=columns(['Problem','Printer','Identified','Status','Severity','Cost','Notes'],['text','text','date','text','text','money','text']);
  for(const repair of rs.filter(r=>!['Resolved','Closed'].includes(r.status)))add('repair:'+repair.id,[repair.title,name(repair.printerId),repair.date,repair.status,repair.severity,amount(repair),repair.notes],repair.printerId,{currency:repair.currency||null});
 }else if(type==='Parts Replacement History'){
  cs=columns(['Task','Printer','Date','Status','Materials / parts','Cost','Documentation','Notes'],['text','text','date','text','text','money','url','text']);cs[2].friendlyDate=true;
  for(const log of ls.filter(l=>l.materials||l.inventoryId))add('log:'+log.id,[log.title,name(log.printerId),log.date,log.outcome,log.materials||`Inventory item: ${log.inventoryId}`,amount(log),log.sourceUrl,log.notes],log.printerId,{currency:log.currency||null,source:log.source,profileVersion:log.profileVersion||null});
 }else if(type==='Maintenance Expenses'){
  cs=columns(['Description','Printer','Date','Type','Cost'],['text','text','date','text','money']);
  for(const log of ls)add('log:'+log.id,[log.title,name(log.printerId),log.date,`Maintenance (${log.outcome})`,amount(log)],log.printerId,{currency:log.currency||null,source:log.source,profileVersion:log.profileVersion||null});
  for(const repair of rs)add('repair:'+repair.id,[repair.title,name(repair.printerId),repair.date,'Repair',amount(repair)],repair.printerId,{currency:repair.currency||null});
 }else if(type==='Recorded Missed Maintenance'){
  cs=columns(['Task','Printer','Date','Recorded outcome','Explicit skip','Elapsed unrecorded cycles'],['text','text','date','text','number','number']);
  for(const log of ls.filter(l=>l.outcome!=='Postponed'&&(l.outcome==='Skipped'||l.skippedCycles>0)))add('log:'+log.id,[log.title,name(log.printerId),log.date,log.outcome,log.outcome==='Skipped'?1:0,log.skippedCycles],log.printerId);
 }else if(type==='Usage Estimates'){
  cs=columns(['Task','Printer','Estimated date (not a due date)','Basis / limits','Actual status']);
  for(const task of ts){const printer=printers.find(p=>p.id===task.printerId)!,estimate=estimateUsageDate(task,printer,readings,now);if(estimate&&!dateMatches(estimate.date))continue;add('task:'+task.id,[task.title,name(printer.id),estimate?.date||'Unknown / insufficient recent history',estimate?`${estimate.reason} ${estimate.from} through ${estimate.through}; ${estimate.rate.toFixed(2)} ${estimate.basis}/day.`:'Requires a positive usage change over 7–90 days, a reading within 30 days matching current totals, and an unreached threshold. Estimates are never schedule triggers.',status(task,printer,now)],printer.id,{estimate:true});}
 }else if(type==='Observed Overdue History'||type==='Observed Task Details'){
  cs=type==='Observed Overdue History'?columns(['Observed UTC instant','Recorded local date','Captured printer','Eligible tasks in filter','Overdue tasks in filter','Collection source','Captured timezone'],['datetime','date','text','number','number','text','text']):columns(['Task','Captured printer','Observed UTC instant','Captured status','Category','Priority','Recorded usage','Documentation','Captured profile version','Captured eligibility'],['text','text','datetime','text','text','text','text','url','text','text']);
  for(const observation of [...(data.observations||[])].sort((a,b)=>a.observedAt.localeCompare(b.observedAt)||a.id.localeCompare(b.id))){const printer=observation.printer;if((filters.printer&&printer.id!==filters.printer)||(filters.manufacturer&&printer.manufacturer!==filters.manufacturer)||!dateMatches(observation.localDate)||(filters.observationIds&&!filters.observationIds.includes(observation.id))||(filters.active==='active'&&printer.archived)||(filters.active==='archived'&&!printer.archived))continue;
   const matched=observation.tasks.filter(task=>(!filters.category||task.category===filters.category)&&(!filters.priority||task.priority===filters.priority)&&(!filters.state||task.status===filters.state));
   if(type==='Observed Overdue History')add(observation.id,[observation.observedAt,observation.localDate,printer.name,matched.filter(t=>t.eligible).length,matched.filter(t=>t.eligible&&t.status==='Overdue').length,observation.source,`${observation.timezone} (UTC offset ${observation.utcOffsetMinutes} min)`],printer.id,{observationId:observation.id,manufacturer:printer.manufacturer,model:printer.model},{type:'Observed Task Details',filters:{...filters,observationIds:[observation.id],state:'Overdue',recordKeys:matched.filter(task=>task.eligible&&task.status==='Overdue').map(task=>observation.id+':'+task.id)}});
   else for(const task of matched.filter(task=>keyMatches(observation.id+':'+task.id)))add(observation.id+':'+task.id,[task.title,printer.name,observation.observedAt,task.status,task.category,task.priority,`${printer.hours} h / ${printer.prints} prints`,task.sourceUrl,task.profileVersion,task.eligible?'Active rule on active printer':'Excluded: archived printer or disabled rule'],printer.id,{observationId:observation.id,source:task.source,profileId:task.profileId||null,profileVersion:task.profileVersion,eligible:task.eligible});
  }
  warnings.push('Only the listed instants were observed. No historical observation recorded before the first point or between points; closed-app gaps are unknown. Captured identities and states never use current printer data.');
 }else{
  cs=columns(['Printer','Completed tasks','On-time completion (%)','Overdue now','Cumulative hours','Period maintenance costs'],['text','number','number','number','number','money-groups']);
  for(const printer of ps){const selected=ls.filter(l=>l.printerId===printer.id);add('summary:'+printer.id,[printer.name,selected.filter(l=>l.outcome==='Completed').length,compliance(selected),ts.filter(t=>t.printerId===printer.id&&status(t,printer,now)==='Overdue').length,printer.hours,groups(selected,rs.filter(r=>r.printerId===printer.id))],printer.id,{}, {type:'Complete Maintenance History',filters:{...filters,printer:printer.id,recordKeys:selected.map(l=>'log:'+l.id)}});}
 }
 if(type==='Printer Register'||type.startsWith('Observed')){cs.push({key:'printerId',label:'Printer ID',type:'text'});for(const row of rows)row.values.push(row.printerId||null);}
 // Append without changing the original typed column positions used by drilldowns.
 cs.push({key:'recommendationContext',label:'Recommendation classification and assumptions',type:'text'});
 const taskById=new Map(tasks.map(t=>[t.id,t])),logById=new Map(logs.map(l=>[l.id,l]));
 const capturedById=new Map(type==='Observed Task Details'?(data.observations||[]).flatMap(o=>o.tasks.map(t=>[o.id+':'+t.id,{...t,manufacturer:o.printer.manufacturer,model:o.printer.model,technology:o.printer.technology}] as const)):[]);
 for(const row of rows){
  const task=taskById.get(typeof row.provenance.taskId==='string'?row.provenance.taskId:row.id.startsWith('task:')?row.id.slice(5):'');
  const log=logById.get(row.id.startsWith('log:')?row.id.slice(4):'');
  const captured=capturedById.get(row.id);
  const context=task?taskContext(task,printers.find(p=>p.id===task.printerId)!):log?historicalContext(log):captured?historicalContext(captured):recommendationPolicy.explanation;
  row.values.push(context);row.provenance.recommendationContext=context;
 }
 const used=new Set(rows.map(row=>row.printerId));const historical=type.startsWith('Observed');
 return {name:type,generatedAt,filters:{...filters},columns:cs,rows,printers:historical?[]:ps.filter(p=>used.has(p.id)),tasks:type==='Complete Maintenance Schedule'?ts:[],warnings,stats:{completed:ls.filter(l=>l.outcome==='Completed').length,compliance:compliance(ls),hours:ps.reduce((total,p)=>total+p.hours,0),expenses:expenseSummary(ls,rs)}};
}
export function unclassifiedReport(data:ReportData,filters:ReportFilters,generatedAt=new Date().toISOString()):ReportResult{
 const primary=selectReport(data,'Complete Maintenance History',{...filters,category:'',priority:''},today(),generatedAt);
 const unknownIds=new Set(data.logs.filter(log=>historicalMetadataMatches(log,filters.category,filters.priority)&&unclassifiedForFilter(log,filters.category,filters.priority)).map(log=>'log:'+log.id));
 const rows=primary.rows.filter(row=>unknownIds.has(row.id));const used=new Set(rows.map(row=>row.printerId));
 return {...primary,filters:{...filters},rows,printers:primary.printers.filter(p=>used.has(p.id)),warnings:[...primary.warnings,'Separate unclassified historical output: selected category or priority facts were not captured. No current-rule attribution is inferred.']};
}

export interface ChartPoint {id:string;label:string;value:number|null;query:ReportQuery;note?:string;}
export function monthlyWindows(start:string,end:string){
 if(!validCalendarDate(start)||!validCalendarDate(end)||start>end)return [];
 const lower=start>addInterval(end.slice(0,7)+'-01',0,-59)?start:addInterval(end.slice(0,7)+'-01',0,-59);const windows:{label:string;start:string;end:string}[]=[];
 for(let date=lower.slice(0,7)+'-01';date<=end;date=addInterval(date,0,1)){const last=addInterval(addInterval(date,0,1),-1);windows.push({label:date.slice(0,7),start:date>start?date:start,end:last<end?last:end});}
 return windows;
}
export function selectCharts(data:ReportData,filters:ReportFilters,days:number,now=today()){
 const history=selectReport(data,'Complete Maintenance History',filters,now);
 const windows=monthlyWindows(filters.start,filters.end);
 const completions:ChartPoint[]=[],complianceTrend:ChartPoint[]=[];
 for(const window of windows){const scoped={...filters,start:window.start,end:window.end};const report=selectReport(data,'Complete Maintenance History',scoped,now);const eligible=report.rows.filter(row=>row.values[3]!=='Postponed');const completed=report.rows.filter(row=>row.values[3]==='Completed');
  completions.push({id:window.label,label:window.label,value:completed.length,query:{type:'Complete Maintenance History',filters:{...scoped,state:'Completed',recordKeys:completed.map(row=>row.id)}}});
  const onTime=eligible.filter(row=>row.values[3]==='Completed'&&row.provenance.onTime===true).length;
  complianceTrend.push({id:window.label,label:window.label,value:eligible.length?Math.round(100*onTime/eligible.length):null,query:{type:'Complete Maintenance History',filters:{...scoped,outcomes:['Completed','Skipped'],recordKeys:eligible.map(row=>row.id)}},note:`${onTime} on time / ${eligible.length} completed or explicitly skipped`});
 }
 const activity:ChartPoint[]=data.printers.filter(printer=>(!filters.printer||printer.id===filters.printer)&&(!filters.manufacturer||printer.manufacturer===filters.manufacturer)&&(filters.active==='all'||(filters.active==='active'?!printer.archived:printer.archived))).map(printer=>{const rows=history.rows.filter(row=>row.printerId===printer.id);return {id:printer.id,label:printer.name+' ['+printer.id+']',value:rows.length,query:{type:'Complete Maintenance History',filters:{...filters,printer:printer.id,recordKeys:rows.map(row=>row.id)}}};});
 const expenseCurrencies=new Set(selectReport(data,'Maintenance Expenses',filters,now).rows.map(row=>row.provenance.currency as string|null));
 const expenses=[...expenseCurrencies].map(currency=>({currency:currencyLabel(currency||undefined),points:windows.map(window=>{const scoped={...filters,start:window.start,end:window.end,currency:currency||'__unknown__'};const report=selectReport(data,'Maintenance Expenses',scoped,now);return {id:window.label,label:window.label,value:report.rows.reduce((sum,row)=>sum+(row.values[4] as MoneyValue).amount,0),query:{type:'Maintenance Expenses' as const,filters:{...scoped,recordKeys:report.rows.map(row=>row.id)}}};})}));
 const scopedTasks=data.tasks.filter(task=>{const printer=data.printers.find(p=>p.id===task.printerId);return printer&&!printer.archived&&task.enabled&&(!filters.printer||printer.id===filters.printer)&&(!filters.manufacturer||printer.manufacturer===filters.manufacturer)&&(!filters.category||task.category===filters.category)&&(!filters.priority||task.priority===filters.priority);});
 const horizon=addInterval(now,days),dated=scopedTasks.filter(task=>upcomingTask(task,data.printers.find(p=>p.id===task.printerId)!,now,horizon,now)&&status(task,data.printers.find(p=>p.id===task.printerId)!,now)!=='Due Today');
 const workload:ChartPoint[]=[];
 const buckets=[{label:'Due today',kind:'due-now',tasks:scopedTasks.filter(t=>status(t,data.printers.find(p=>p.id===t.printerId)!,now)==='Due Today')},{label:'Overdue now',kind:'overdue',tasks:scopedTasks.filter(t=>status(t,data.printers.find(p=>p.id===t.printerId)!,now)==='Overdue')},{label:'Reached usage thresholds (undated)',kind:'usage-due',tasks:scopedTasks.filter(t=>!due(t).date&&usageDue(t,data.printers.find(p=>p.id===t.printerId)!,now))}];
 // Due/overdue buckets exclude undated usage work so every current rule appears once.
 for(const bucket of buckets){const tasks=bucket.kind==='usage-due'?bucket.tasks:bucket.tasks.filter(t=>due(t).date||!usageDue(t,data.printers.find(p=>p.id===t.printerId)!,now));workload.push({id:bucket.kind,label:bucket.label,value:tasks.length,query:{type:'Current Maintenance',filters:{...filters,start:now,end:horizon,recordKeys:tasks.map(t=>'task:'+t.id)}}});}
 const dates=[...new Set(dated.map(task=>task.postponedUntil||due(task).date))].sort();
 for(const date of dates){const tasks=dated.filter(task=>(task.postponedUntil||due(task).date)===date);workload.push({id:date,label:date,value:tasks.length,query:{type:'Current Maintenance',filters:{...filters,start:date,end:date,recordKeys:tasks.map(t=>'task:'+t.id)}}});}
 const estimates=scopedTasks.filter(task=>!due(task).date&&!task.postponedUntil&&!usageDue(task,data.printers.find(p=>p.id===task.printerId)!,now)&&!['Overdue','Due Today'].includes(status(task,data.printers.find(p=>p.id===task.printerId)!,now))).filter(task=>{const estimate=estimateUsageDate(task,data.printers.find(p=>p.id===task.printerId)!,data.readings,now);return estimate&&estimate.date>=now&&estimate.date<=horizon;});
 workload.push({id:'estimate',label:'Non-due estimates (not confirmed work)',value:estimates.length,query:{type:'Usage Estimates',filters:{...filters,start:now,end:horizon,recordKeys:estimates.map(t=>'task:'+t.id)}},note:'Separate estimate-only group; never an actual due/overdue trigger.'});
 const observed=selectReport(data,'Observed Overdue History',filters,now);
 const overdue:ChartPoint[]=observed.rows.map(row=>({id:row.id,label:`${row.values[2]} [${row.printerId}] · ${row.values[0]}`,value:row.values[4] as number,query:{type:'Observed Task Details',filters:{...filters,state:'Overdue',observationIds:[row.id],recordKeys:(data.observations||[]).find(observation=>observation.id===row.id)!.tasks.filter(task=>task.eligible&&task.status==='Overdue'&&(!filters.category||task.category===filters.category)&&(!filters.priority||task.priority===filters.priority)).map(task=>row.id+':'+task.id)}}}));
 return {completions,complianceTrend,activity,expenses,workload,overdue};
}
