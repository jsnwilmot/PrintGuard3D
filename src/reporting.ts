import {type Log,type Repair,type Reading,type Printer,type Task,today} from './domain';
import {due,dayDiff,addInterval} from './engine';

export const unclassifiedForFilter=(row:Pick<Log,'category'|'priority'>,category:string,priority:string)=>!!((category&&!row.category)||(priority&&!row.priority));
// Missing historical facts remain unknown; current rules/preferences are never substitutes.
export function historicalMetadataMatches(row:Pick<Log,'category'|'priority'>,category:string,priority:string){
 return (!category||!row.category||row.category===category)&&(!priority||!row.priority||row.priority===priority);
}
export const currencyLabel=(currency?:string)=>currency||'Unclassified currency';
export const money=(cost:number,currency?:string)=>`${cost.toFixed(2)} ${currencyLabel(currency)}`;
export function expenseGroups(logs:Log[],repairs:Repair[]=[]){
 const groups=new Map<string,number>();
 for(const row of [...logs,...repairs]){
  const currency=currencyLabel(row.currency);groups.set(currency,(groups.get(currency)||0)+row.cost);
 }
 return [...groups].sort(([a],[b])=>a.localeCompare(b)).map(([currency,total])=>({currency,total}));
}
export const expenseSummary=(logs:Log[],repairs:Repair[]=[])=>expenseGroups(logs,repairs).map(g=>money(g.total,g.currency)).join(' · ')||'No recorded expenses';
export const missedOccurrences=(logs:Log[])=>logs.filter(l=>l.outcome!=='Postponed').reduce((n,l)=>n+l.skippedCycles+(l.outcome==='Skipped'?1:0),0);
export const openRepair=(repair:Repair)=>!['Resolved','Closed'].includes(repair.status);

export type UsageEstimate={date:string;basis:'hours'|'prints';rate:number;from:string;through:string;reason:string};
export function estimateUsageDate(task:Task,printer:Printer,readings:Reading[],now=today()):UsageEstimate|null{
 if(!task.enabled||printer.archived||task.postponedUntil>now)return null;
 const history=readings.filter(r=>r.printerId===printer.id&&r.date<=now).sort((a,b)=>a.date.localeCompare(b.date)||a.hours-b.hours||a.prints-b.prints);
 if(history.length<2||history.some((r,i)=>i>0&&(r.hours<history[i-1].hours||r.prints<history[i-1].prints)))return null;
 const last=history.at(-1)!;
 if(dayDiff(now,last.date)>30||last.hours!==printer.hours||last.prints!==printer.prints)return null;
 const first=history.find(r=>dayDiff(last.date,r.date)>=7&&dayDiff(last.date,r.date)<=90);
 if(!first)return null;
 const span=dayDiff(last.date,first.date),threshold=due(task);
 if((threshold.hours!==null&&printer.hours>=threshold.hours)||(threshold.prints!==null&&printer.prints>=threshold.prints))return null;
 const candidates:UsageEstimate[]=[];
 for(const basis of ['hours','prints'] as const){
  const remaining=threshold[basis]===null?0:threshold[basis]!-printer[basis];
  const rate=(last[basis]-first[basis])/span;
  if(remaining<=0||rate<=0)continue;
  const days=Math.ceil(remaining/rate);
  if(!Number.isFinite(days)||days>dayDiff('9999-12-31',last.date))continue;
  const date=addInterval(last.date,days);
  if(date<=now)continue;
  candidates.push({date,basis,rate,from:first.date,through:last.date,reason:`Estimate from ${span} days of recorded ${basis}; assumes the same average usage continues. Actual readings alone determine usage due/overdue status.`});
 }
 return candidates.sort((a,b)=>a.date.localeCompare(b.date))[0]||null;
}
