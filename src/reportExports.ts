import {type ReportResult,type ReportRow,formatReportValue} from './reportModel';
import {safeUrl} from './domain';
import {exportSafety,reportCSV} from './safety';

export const reportMatrix=(result:ReportResult)=>result.rows.map(row=>row.values.map((value,index)=>formatReportValue(value,result.columns[index])));
export const serializeReportCSV=(result:ReportResult)=>reportCSV(result.columns.map(column=>column.label),reportMatrix(result));
function selectedFilters(result:ReportResult){
 const filters={...result.filters};
 if(filters.recordKeys)filters.recordKeys=result.rows.map(row=>row.id);
 if(filters.observationIds)filters.observationIds=[...new Set(result.rows.map(row=>row.provenance.observationId).filter((id):id is string=>typeof id==='string'))];
 return filters;
}
export function reportJSON(result:ReportResult,classification:'classified'|'unclassified'='classified'){
 return JSON.stringify({application:'PrintGuard3D',kind:'tabular-report',reportSchemaVersion:1,reportName:result.name,generatedAt:result.generatedAt,classification,
  filters:selectedFilters(result),columns:result.columns,rows:result.rows.map(row=>({id:row.id,printerId:row.printerId||null,values:Object.fromEntries(result.columns.map((column,index)=>[column.key,row.values[index]])),provenance:row.provenance})),
  safetyNotice:exportSafety,caveats:result.warnings},null,2);
}
export const escapeReportHTML=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export function localReportImage(value:string){
 if(value.length>6000000||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value))return '';
 try{const prefix=atob(value.slice(value.indexOf(',')+1).slice(0,32));
  if(value.startsWith('data:image/png;')&&prefix.startsWith('\x89PNG\r\n\x1a\n'))return value;
  if(value.startsWith('data:image/jpeg;')&&prefix.startsWith('\xff\xd8\xff'))return value;
  if(value.startsWith('data:image/webp;')&&prefix.startsWith('RIFF')&&prefix.slice(8,12)==='WEBP')return value;
 }catch{/* Invalid raster bytes are omitted, never interpreted as SVG/HTML. */}
 return '';
}
const css=`:root{color-scheme:light;font:15px/1.5 Arial,sans-serif;color:#172334;background:#fff}body{max-width:1000px;margin:24px auto;padding:0 20px}h1{font-size:26px}h2{font-size:19px}h1,h2,dt{break-after:avoid;overflow-wrap:anywhere}p,dd,li,a{overflow-wrap:anywhere;white-space:pre-wrap}header,.safety{border-bottom:2px solid #37465a;padding-bottom:12px}.safety{font-weight:bold}dl{margin:0}dl>div{margin:10px 0;break-inside:avoid}dt{font-weight:bold}dd{margin:0}.record{border-top:1px solid #788697;padding:16px 0;break-inside:auto}.printers{display:flex;flex-wrap:wrap;gap:20px}.printer{break-inside:avoid}.printer img{max-width:130px;max-height:100px;object-fit:contain}a{color:#174a86}footer{margin-top:24px;border-top:1px solid #788697;padding-top:12px;break-inside:avoid}@page{margin:12mm}@media print{body{font-size:10pt;max-width:none;margin:0;padding:0}h1{font-size:18pt}h2{font-size:13pt}.record p{orphans:3;widows:3}a{color:#111}}`;
export function reportHTML(result:ReportResult,classification:'classified'|'unclassified'='classified'){
 const esc=escapeReportHTML;
 const cell=(row:ReportRow,index:number)=>{const value=formatReportValue(row.values[index],result.columns[index]);return result.columns[index].type==='url'&&safeUrl(value)?`<a href="${esc(value)}" rel="noreferrer noopener">${esc(value)}</a>`:esc(value);};
 const filters=Object.entries(selectedFilters(result)).filter(([key,value])=>!['recordKeys','observationIds'].includes(key)&&value!==''&&value!==undefined).map(([key,value])=>`${key}: ${Array.isArray(value)?value.join(', '):value}`).join(' · ');
 const printers=result.printers.map(printer=>{const image=localReportImage(printer.image);return `<section class="printer">${image?`<img src="${image}" alt="${esc(printer.name)} — user supplied printer photograph">`:'<p>No embedded printer photograph; generic illustration omitted.</p>'}<h2>${esc(printer.name)}</h2><p>${esc(printer.manufacturer)} ${esc(printer.model)} · Printer ID ${esc(printer.id)}</p></section>`;}).join('');
 const records=result.rows.map((row,index)=>`<section class="record"><h2>Record ${index+1}</h2>${row.printerId?`<p>Printer ID: ${esc(row.printerId)}</p>`:''}<dl>${result.columns.map((column,n)=>`<div><dt>${esc(column.label)}</dt><dd>${cell(row,n)}</dd></div>`).join('')}</dl></section>`).join('');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; font-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'"><title>${esc(result.name)} — PrintGuard 3D</title><style>${css}</style></head><body><header><p>PrintGuard 3D · Rose &amp; Paw Digital Designs</p><h1>${esc(result.name)}</h1><p>Generated ${esc(result.generatedAt)} · ${classification==='unclassified'?'Separate unclassified historical output':'Selected tabular report'}</p><p>${esc(filters)}</p></header><p class="safety">${esc(exportSafety)}</p><ul>${result.warnings.map(warning=>`<li>${esc(warning)}</li>`).join('')}<li>Only selected tabular rows are included. Unclassified history is exported separately when selected attribution is missing. External documentation requires internet.</li></ul><div class="printers">${printers}</div>${records||'<p>No selected records.</p>'}<footer><p>${esc(exportSafety)}</p><p>Developed by Rose &amp; Paw Digital Designs · design@roseandpaw.ca</p></footer></body></html>`;
}
