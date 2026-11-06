import {records,validateDecision} from '../wph-discovery/fixtures.js';
const select=document.getElementById('review-record');
for(const record of records){const option=document.createElement('option');option.value=record.id;option.textContent=record.title;select.append(option)}
const audit=[];const get=id=>document.getElementById(id);
function render(){const record=records.find(x=>x.id===select.value);get('review-evidence').textContent=record.title+' — '+record.notes+' Evidence: '+(record.evidence.map(x=>x.id+' (unverified)').join(', ')||'none')+'. Rights: '+record.rights;}
select.addEventListener('change',render);
get('review-form').addEventListener('submit',event=>{event.preventDefault();try{const record=records.find(x=>x.id===select.value);const result=validateDecision(record,get('decision').value,get('rationale').value);audit.push(result);const li=document.createElement('li');li.textContent=result.record_id+' — '+result.decision+' — '+result.rationale;get('audit-log').append(li);get('review-feedback').textContent='Simulation recorded in this browser session.';get('rationale').value='';}catch(error){get('review-feedback').textContent=error.message}});
get('download-audit').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({synthetic:true,persistent:false,entries:audit},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='wph-review-demo.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
render();
