import {type Task,type Log,type Printer,type Reading,type Recommendation,taskSchema,readingSchema,recommendationSchema,today,uid,dateSchema} from './domain';
import {isVerifiedTask} from './profiles';
import {addInterval} from './engine';
import {sameRecord} from './comparison';

const root='https://wiki.flashforge.com/en/creator-series/creator-5-series/maintenance/';
export const recommendationPolicy={version:'1.0.0',reviewed:'2026-10-29',
 explanation:'Manufacturer Documented means an exact-model source matches the specific published interval or condition, not manufacturer endorsement, full video/safety certification or complete catalogue coverage. PrintGuard Suggested is an optional unverified application interpretation. User Defined is an owner choice.',
 warning:'Inspection/review reminder only. Not a direction to clean, lubricate, adjust, heat or replace equipment. More frequent physical maintenance is not proven safer. FlashForge has not confirmed this interpretation.',
 counter:'Published hour interval retained. Whole-printer cumulative operating hours are only a provisional PrintGuard counter proxy: actual printing versus powered-on time and per-component/extruder usage are not manufacturer-confirmed. No exact component age or calendar due date is established.',
 coverage:'Creator 5 retains its accepted fixed facts and explicitly selected published bands; Pro retains only its own 1,000-print-hour shaft-wiping interval. No Pro series transfer or filtration replacement cadence. 75 media inventoried, four partially sampled, zero fully audiovisually reviewed; Q01–Q14 unresolved.',
};
export const reviewGroups={
 fan:{label:'Fan guidance',url:root+'cooling-fan-dust-cleaning',ranges:'Working hours T<5: 9 months; 5<T<10: 6 months; T>10: 3 months. Exactly 5 and 10 are unassigned.'},
 xy:{label:'X/Y guidance',url:root+'clean-and-lubricate-the-x-axis-linear-shaft',ranges:'Daily printing T<1: 3 months; 1–5: 2 months; T>=5: 1 month. The written ranges overlap at 5.'},
 z:{label:'Z guidance',url:root+'z-axis-lead-screw-cleaning-and-lubrication',ranges:'Daily printing T<1: 5 months; 1–5: 4 months; T>=5: 3 months. The written ranges overlap at 5.'},
 filter:{label:'Filter condition inspection',url:root+'filter-cartridge-replacement',ranges:'Pro HEPA13/carbon hardware is documented. Cleaning versus replacement, discoloration scope and cadence are unresolved. No interval is supplied by PrintGuard.'},
} as const;
export type ReviewGroup=keyof typeof reviewGroups;
export function suggestedMonths(group:ReviewGroup,hours:number){
 if(group==='fan')return hours===5?6:hours===10?3:null;
 return hours===5?(group==='xy'?1:group==='z'?3:null):null;
}
export const exactReviewModel=(p:{manufacturer:string;model:string;technology:string})=>p.manufacturer==='FlashForge'&&p.technology==='FDM/FFF'&&['Creator 5','Creator 5 Pro'].includes(p.model);

// Complete daily endpoint coverage is deliberately stricter than a lifetime or sparse slope.
export function printingAverage(readings:Reading[],printer:Printer,end=today()){
 const start=addInterval(end,-30),days=Array.from({length:31},(_,i)=>addInterval(start,i));
 const selected=readings.filter(r=>r.printerId===printer.id&&r.date>=start&&r.date<=end);
 const values:Reading[]=[];
 for(const day of days){const matches=selected.filter(r=>r.date===day);if(!matches.length||matches.some(r=>!Number.isFinite(r.hours)||r.hours<0||r.hours!==matches[0].hours||r.prints!==matches[0].prints))return null;values.push(matches[0]);}
 if(!dateSchema.safeParse(end).success||selected.some(r=>!readingSchema.safeParse(r).success)||start<printer.installed||values.at(-1)!.hours!==printer.hours||values.at(-1)!.prints!==printer.prints)return null;
 if(values.some((r,i)=>i>0&&(r.hours<values[i-1].hours||r.hours-values[i-1].hours>24||r.prints<values[i-1].prints)))return null;
 return {hours:(values[30].hours-values[0].hours)/30,start,end,coverage:31};
}
type Fact={source:string;sourceUrl:string;recommendation?:Recommendation};
export function decisionIssue(record:Fact,model?:{manufacturer:string;model:string;technology:string}){
 const d=record.recommendation;if(!d)return '';
 if(!recommendationSchema.safeParse(d).success)return 'Unsupported or invalid recommendation policy metadata.';
 if(record.source!=='General Recommendation'&&record.source!=='User Defined')return 'Recommendation decisions cannot assert manufacturer verification.';
 if(d.decision==='customized'&&record.source!=='User Defined')return 'An owner-customized decision must remain User Defined.';
 if(model&&(!exactReviewModel(model)||d.model!==model.model))return 'Recommendation decision is incompatible with the exact model.';
 if((d.group==='filter')!==(d.model==='Creator 5 Pro'))return 'Series suggestions cannot transfer to Pro or stock C5 filtration.';
 if(record.sourceUrl!==reviewGroups[d.group].url)return 'Recommendation provenance source must retain its policy reference.';
 return '';
}
export function taskDecisionIssue(t:Task,p:Pick<Printer,'manufacturer'|'model'|'technology'>){
 const issue=decisionIssue(t,p);if(issue||!t.recommendation)return issue;
 const d=t.recommendation;
 if(t.profileId||t.templateId||t.profileVersion||t.verified)return 'Suggested reminders cannot claim a verified profile identity.';
 if(d.group==='filter'&&(t.interval.mode!=='condition'||t.originalInterval.mode!=='condition'))return 'Pro inspection has no predefined cadence.';
 const original=d.group==='filter'?{mode:'condition'}:{mode:'calendar',months:d.chosenMonths};
 if(!sameRecord(t.originalInterval,original))return 'Initial decision interval must remain immutable.';
 if(t.source==='General Recommendation'&&(d.decision!=='accepted'||!sameRecord(t.interval,original)))return 'A custom decision or edited interval must be User Defined.';
 return '';
}
export function taskClassification(t:Task,p:Pick<Printer,'manufacturer'|'model'|'technology'>){if(t.recommendation){const issue=taskDecisionIssue(t,p);if(issue)throw Error(issue);}return t.recommendation?(t.source==='User Defined'?'User Defined':'PrintGuard Suggested'):isVerifiedTask(t,p)?'Manufacturer Documented':t.source==='User Defined'?'User Defined':t.source==='General Recommendation'?'User Defined':'Pending Verification';}
export function decisionContext(d:Recommendation){recommendationSchema.parse(d);const g=reviewGroups[d.group];return `${d.model}; ${d.decision==='customized'?'User Defined':'PrintGuard Suggested'} initial decision; policy ${d.policyVersion}, sources reviewed ${recommendationPolicy.reviewed}; acknowledged ${d.acceptedOn}; basis ${d.basis}${d.windowStart?` ${d.windowStart}–${d.windowEnd}`:''}${d.dailyHours!==undefined?`; daily hours ${d.dailyHours}`:''}; original owner interval ${d.chosenMonths?d.chosenMonths+' months':'condition only'}. Source: ${g.url}. Published: ${g.ranges} ${recommendationPolicy.warning}${d.group==='fan'?' Fan source says working hours; printing-hour interpretation is an unresolved metric mismatch.':''}`;}
export function taskContext(t:Task,p:Printer){return `${taskClassification(t,p)}. ${p.manufacturer} ${p.model} (${p.technology}); source ${t.sourceTitle||'not recorded'} (${t.sourceUrl||'no link'}); source checked ${t.verified||'unverified'}; profile ${t.profileVersion||'none'}. ${t.recommendation?decisionContext(t.recommendation):recommendationPolicy.explanation+(t.source==='General Recommendation'?' Legacy/imported general recommendation: no approved PrintGuard policy decision is recorded.':'')}${t.interval.hours&&isVerifiedTask(t,p)?' '+recommendationPolicy.counter:''}${t.scheduleKind==='usage-dependent'?' Published ranges/option only; owner selection does not resolve gaps/overlap at 5/10 hours, working versus printing metrics or averaging. No band was inferred by PrintGuard.':''}`;}
export function historicalContext(l:Pick<Log,'source'|'recommendation'> & Partial<Pick<Log,'manufacturer'|'model'|'technology'|'profileVersion'|'sourceUrl'>>){const scope=`Captured model: ${l.manufacturer||'not recorded'} ${l.model||'not recorded'}; technology ${l.technology||'not recorded'}; profile ${l.profileVersion||'not recorded'}; documentation ${l.sourceUrl||'not recorded'}. `;return scope+(l.recommendation?`${l.source==='User Defined'?'User Defined':'PrintGuard Suggested'}. ${decisionContext(l.recommendation)}`:`Recorded source: ${l.source||'unknown'} (historical attribution, not a new verification). ${recommendationPolicy.explanation} ${recommendationPolicy.counter}`);}


export interface ReviewChoice {group:ReviewGroup;dailyHours?:number;months?:number;custom:boolean;basis:Recommendation['basis'];printingCounterConfirmed:boolean;acknowledged:boolean;reviewedOn?:string;}
export function createReviewReminder(p:Printer,choice:ReviewChoice,readings:Reading[],date=today()):Task{
 if(choice.acknowledged!==true)throw Error('Review and acknowledge the optional reminder before saving.');
 if(choice.reviewedOn&&choice.reviewedOn!==date)throw Error('The review date changed. Reopen and review the current window before saving.');
 if(!exactReviewModel(p)||p.archived)throw Error('Select an active supported exact-model printer.');
 if((choice.group==='filter')!==(p.model==='Creator 5 Pro'))throw Error('No series transfer to Pro or stock C5 filter suggestion.');
 let hours=choice.dailyHours,window:Partial<Recommendation>={};
 if(choice.basis==='rolling30'){
  if(choice.printingCounterConfirmed!==true)throw Error('Confirm that readings record actual printing hours, not powered-on time.');
  const average=printingAverage(readings,p,date);if(!average)throw Error('A complete valid 31-endpoint / 30-calendar-day printing window is required.');
  if(choice.dailyHours!==undefined&&choice.dailyHours!==average.hours)throw Error('The printing average changed after review. Review the current readings again.');
  hours=average.hours;window={windowStart:average.start,windowEnd:average.end};
 }
 const suggested=choice.group==='filter'?null:suggestedMonths(choice.group,hours??NaN);
 if(choice.group!=='filter'&&suggested===null)throw Error('No approved boundary suggestion for this exact value.');
 if(choice.group!=='filter'&&!['manual','rolling30'].includes(choice.basis))throw Error('Choose the disclosed daily-use basis.');
 if(choice.group==='filter'&&(choice.basis!=='condition'||choice.months!==undefined||!choice.custom))throw Error('Pro filter inspection is owner-defined and condition-only.');
 const months=choice.group==='filter'?undefined:choice.custom?choice.months:suggested!;
 if(choice.group!=='filter'&&(!Number.isInteger(months)||months!<=0||months!>1200))throw Error('Choose a whole calendar interval of 1–1200 months.');
 const recommendation:Recommendation={version:1,policyVersion:'1.0.0',model:p.model as Recommendation['model'],group:choice.group,decision:choice.custom?'customized':'accepted',basis:choice.basis,acknowledged:true,acceptedOn:date,...(choice.group==='filter'?{}:{dailyHours:hours,suggestedMonths:suggested!,chosenMonths:months}),...window};
 const interval=choice.group==='filter'?{mode:'condition' as const}:{mode:'calendar' as const,months};
 const task=taskSchema.parse({id:uid(),printerId:p.id,title:`Review ${reviewGroups[choice.group].label.toLowerCase()} — ${choice.custom?'User Defined':'PrintGuard Suggested'}`,description:decisionContext(recommendation),category:'Inspection',priority:'Normal',interval,originalInterval:interval,anchorDate:date,anchorHours:p.hours,anchorPrints:p.prints,base:'completion',source:choice.custom?'User Defined':'General Recommendation',sourceUrl:reviewGroups[choice.group].url,sourceTitle:'Ambiguous manufacturer reference; independent owner-approved review reminder',verified:'',materials:'',safety:recommendationPolicy.warning,minutes:0,notes:'',enabled:true,postponedUntil:'',condition:false,profileVersion:'',recommendation});
 const issue=taskDecisionIssue(task,p);if(issue)throw Error(issue);return task;
}
