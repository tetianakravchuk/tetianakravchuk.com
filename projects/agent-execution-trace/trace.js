import {buildTrace} from './trace-data.js';
const $=id=>document.getElementById(id);
let trace=buildTrace(),active=0;
const display=value=>typeof value==='string'?value:JSON.stringify(value,null,2);
function render(){
 const event=trace.events[active];
 $('description').textContent=trace.description;
 $('trace-id').textContent=trace.trace_id+' · Synthetic deterministic fixture · Final decision: '+trace.final_decision.replaceAll('_',' ');
 $('steps').replaceChildren(...trace.events.map((step,index)=>{
  const li=document.createElement('li'),button=document.createElement('button');
  button.type='button';button.className='trace-step '+(index===active?'selected ':'')+step.status;
  button.setAttribute('aria-current',index===active?'step':'false');
  button.textContent=step.sequence+'. '+step.label+' — '+step.status.replaceAll('_',' ');
  button.addEventListener('click',()=>{active=index;render();$('steps').children[index]?.querySelector('button')?.focus();});
  li.append(button);return li;
 }));
 $('stage-title').textContent=event.label;
 $('stage-status').textContent='Status: '+event.status.replaceAll('_',' ');
 $('payload').textContent=display(event.input);
 $('risk').textContent=event.risk;
 $('guardrail').textContent=event.guardrail;
 $('outcome').textContent=trace.final_decision.replaceAll('_',' ');
 $('previous').disabled=active===0;
 $('next').disabled=active===trace.events.length-1;
}
$('scenario').addEventListener('change',()=>{trace=buildTrace($('scenario').value);active=0;render();});
$('reset').addEventListener('click',()=>{active=0;render();});
$('previous').addEventListener('click',()=>{active=Math.max(0,active-1);render();$('stage-title').focus();});
$('next').addEventListener('click',()=>{active=Math.min(trace.events.length-1,active+1);render();$('stage-title').focus();});
$('download').addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify(trace,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='agent-trace-'+trace.scenario+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
render();
