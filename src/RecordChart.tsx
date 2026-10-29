import {BarChart,Bar,CartesianGrid,XAxis,YAxis,Tooltip,ResponsiveContainer} from 'recharts';
import {type ChartPoint,type ReportQuery} from './reportModel';

export function RecordChart({title,description,points,unit='records',controlLabel,onQuery,percent=false}:{title:string;description:string;points:ChartPoint[];unit?:string;controlLabel:string;onQuery:(query:ReportQuery)=>void;percent?:boolean}){
 return <section className="panel record-chart" aria-label={title}><h2>{title}</h2><p>{description}</p>
  {points.length>0&&points.every(point=>point.value===0||point.value===null)&&<p className="muted">{points.every(point=>point.value===null)?'Insufficient eligible recorded data.':'Recorded values are zero; no physical history is inferred.'}</p>}
  {points.length?<>
   {points.some(point=>point.value!==null&&point.value!==0)&&<div className="record-chart-plot"><ResponsiveContainer width="100%" height={210}><BarChart data={points} accessibilityLayer={false} role="img" aria-label={`${title}; exact values and record controls follow in the list.`}><CartesianGrid vertical={false} stroke="var(--line)"/><XAxis dataKey="label" tick={{fontSize:11,fill:'var(--muted)'}} interval="preserveStartEnd"/><YAxis allowDecimals={percent} domain={percent?[0,100]:undefined} tick={{fontSize:11,fill:'var(--muted)'}}/><Tooltip formatter={value=>[`${value} ${unit}`,title]}/><Bar dataKey="value" fill="var(--blue)" cursor="pointer" onClick={(_,index)=>{const point=points[index];if(point)onQuery(point.query);}}/></BarChart></ResponsiveContainer></div>}
   <ul className="record-chart-values" aria-label={`${title} values and record controls`}>{points.map(point=><li key={point.id}><span>{point.label}: </span><strong>{point.value===null?'Insufficient recorded data':`${point.value} ${unit}`}</strong>{point.note&&<small>{point.note}</small>}<button type="button" className="button secondary" onClick={()=>onQuery(point.query)} aria-label={`View ${controlLabel} records for ${point.label}`}>View {controlLabel} records</button></li>)}</ul>
  </>:<p className="muted">No recorded data for this chart. No historical observation recorded where collection has not occurred.</p>}
 </section>;
}
