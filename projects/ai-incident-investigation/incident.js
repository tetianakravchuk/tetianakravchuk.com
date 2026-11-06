import {investigate} from './incident-data.js';
const $=id=>document.getElementById(id);
let report=investigate(),selected=0;
function render(){
 const event=report.events[selected];
 $('transport').textContent='HTTP '+report.transport_status;
 $('severity').textContent=report.severity;
 $('signal').textContent=report.first_signal?.replaceAll('_',' ')||'None';
 $('disposition').textContent=report.events.at(-1).status;
 $('summary').textContent=report.summary;
 $('timeline').replaceChildren(...report.events.map((span,i)=>{
  const li=document.createElement('li'),button=document.createElement('button');
  button.type='button';button.className='incident-span '+span.status+(i===selected?' selected':'');
  button.setAttribute('aria-current',i===selected?'step':'false');
  button.textContent=span.sequence+'. '+span.name+' · '+span.status+' · '+(span.latency_ms===null?'—':span.latency_ms+' ms');
  button.addEventListener('click',()=>{selected=i;render();$('timeline').children[i]?.querySelector('button')?.focus();});li.append(button);return li;
 }));
 $('span-title').textContent=event.name+' — '+event.layer;
 $('span-status').textContent='Status: '+event.status+' · '+(event.latency_ms===null?'—':event.latency_ms+' ms');
 $('span-detail').textContent=event.detail;
 $('span-evidence').textContent=event.evidence;
 $('root-cause').textContent=report.root_cause;
 $('corrective-action').textContent=report.corrective_action;
 $('regression-test').textContent=report.regression_test;
 $('prev').disabled=selected===0;$('next').disabled=selected===report.events.length-1;
}
$('incident').addEventListener('change',()=>{report=investigate($('incident').value);selected=0;render();});
$('prev').addEventListener('click',()=>{selected=Math.max(0,selected-1);render();$('span-title').focus();});
$('next').addEventListener('click',()=>{selected=Math.min(report.events.length-1,selected+1);render();$('span-title').focus();});
$('download').addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ai-incident-'+report.incident_id.toLowerCase()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});render();