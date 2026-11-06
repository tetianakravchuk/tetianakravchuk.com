import {validateDecision,decisionLabel} from '../wph-discovery/fixtures.js';
import {discoveryRecords as records,evidenceLabel} from '../wph-discovery/discovery-data.js';
const get=id=>document.getElementById(id);
const select=get('review-record');
const audit=[];
const state=new Map(records.map(record=>[record.id,{status:'pending',reviewed:false}]));
const make=(tag,text)=>{const el=document.createElement(tag);el.textContent=String(text);return el};
function clearFeedback(){get('review-feedback').textContent='';get('review-feedback').removeAttribute('data-kind')}
function feedback(message,kind){get('review-feedback').textContent=message;get('review-feedback').dataset.kind=kind}
function renderOptions(){const selected=select.value||records[0].id;select.replaceChildren(...records.map(record=>{const option=document.createElement('option');option.value=record.id;const current=state.get(record.id);option.textContent=record.title+' — '+(current.reviewed?decisionLabel(current.status):'Pending review');return option}));select.value=selected}
function addField(dl,label,value){dl.append(make('dt',label),make('dd',value))}
function renderEvidence(){
 const record=records.find(item=>item.id===select.value);const panel=get('review-evidence');panel.replaceChildren();
 panel.append(make('h3',record.title),make('p',record.notes));
 const dl=document.createElement('dl');
 for(const [label,value] of Object.entries({Record:record.id,Author:record.author,Country:record.country,Language:record.language,'Publication year':record.status==='conflicting_evidence'?'Conflicting: 1934 / 1936':record.year??'Unknown','Translation availability':record.translation,Rights:record.rights,'Review status':state.get(record.id).reviewed?decisionLabel(state.get(record.id).status):'Pending review'}))addField(dl,label,value);
 panel.append(dl,make('h4','Illustrative AI-assisted claims'));
 const claims=document.createElement('ul');
 for(const claim of [{name:'Title',value:record.title},{name:'Language',value:record.language},{name:'Publication year',value:record.year??'Unknown'},{name:'Translation status',value:record.translation},{name:'Rights',value:record.rights}]){
  const li=make('li',claim.name+': '+claim.value+' — unverified demo claim');claims.append(li)
 }panel.append(claims,make('h4','Supporting evidence'));
 if(!record.evidence.length)panel.append(make('p','No source evidence provided.'));
 else{const list=document.createElement('ul');for(const source of record.evidence)list.append(make('li',source.id+' · '+source.type+' · Covers: '+source.claim+' · '+evidenceLabel(record,source)));panel.append(list)}
 panel.append(make('p','No fictional claim may be approved as independently verified.'));
}
function render(){renderOptions();renderEvidence();clearFeedback();get('rationale').value='';updateCount()}
function updateCount(){const trimmed=get('rationale').value.trim();get('reason-count').textContent=trimmed.length+' non-whitespace-trimmed characters; minimum 12.'}
select.addEventListener('change',render);
get('rationale').addEventListener('input',()=>{updateCount();clearFeedback()});
get('review-form').addEventListener('submit',event=>{
 event.preventDefault();
 try{
  const record=records.find(item=>item.id===select.value);
  const previous=state.get(record.id);
  const result=validateDecision(record,get('decision').value,get('rationale').value,previous.status);
  const entry={...result,sequence:audit.length+1,reviewed_at:new Date().toISOString()};
  audit.push(entry);state.set(record.id,{status:result.record_status_after,reviewed:true});
  const item=document.createElement('li');
  item.append(make('strong',record.title+' — '+decisionLabel(result.record_status_after)),make('span',' · '+entry.reviewed_at+' · '+entry.actor+' · Before: '+decisionLabel(entry.record_status_before)+' · Reason: '+entry.rationale));
  get('audit-log').append(item);renderOptions();renderEvidence();get('rationale').value='';updateCount();feedback('Decision recorded in this browser session only.','success');
 }catch(error){feedback(error.message,'error')}
});
get('download-audit').addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify({synthetic:true,persistent:false,entries:audit},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='wph-review-demo.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
render();
