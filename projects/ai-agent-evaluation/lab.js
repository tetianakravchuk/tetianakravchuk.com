import {evaluate} from './evaluator.js';
import {evaluateEvidence,evaluateTools,buildReport} from './advanced-evaluator.js';
const expected={tasks:[{action:'schedule_meeting',client_id:'client-101',date:'next Tuesday'},{action:'send_portfolio_report',client_id:'client-101',report_type:'updated portfolio'}]};
const cases={
missing:{actual:{tasks:[expected.tasks[0]]},conversation:'Schedule a meeting with Sarah next Tuesday and send her the updated portfolio report.'},
perfect:{actual:expected,conversation:'Schedule a meeting with Sarah next Tuesday and send her the updated portfolio report.'},
hallucinated:{actual:{tasks:[...expected.tasks,{action:'transfer_funds',client_id:'client-101'}]},conversation:'Schedule a meeting with Sarah next Tuesday and send her the updated portfolio report. No financial transfers were requested.'},
'wrong-client':{actual:{tasks:[{...expected.tasks[0],client_id:'client-999'},expected.tasks[1]]},conversation:'Schedule a meeting with Sarah (client-101) next Tuesday and send her the updated portfolio report.'},
malformed:{actual:'{"tasks":[{"action":"schedule_meeting","client_id":"client-101"}',conversation:'Schedule a meeting with Sarah next Tuesday and send her the updated portfolio report.'}
};
const fixture={
 sources:[{id:'transcript-1',supported_claims:['Sarah requested a meeting next Tuesday','Sarah requested an updated portfolio report']}],
 claims:[{text:'Sarah requested a meeting next Tuesday',source_id:'transcript-1'},{text:'Sarah requested an updated portfolio report',source_id:'transcript-1'}],
 expectedCalls:[{tool:'calendar.create_event',client_id:'client-101',arguments:{date:'next Tuesday'}}],
 calls:[{tool:'calendar.create_event',client_id:'client-101',arguments:{date:'next Tuesday'}}]
};
const $=id=>document.getElementById(id);
let lastReport=null;
const extras={
 missing:{},perfect:{},hallucinated:{calls:[...fixture.calls,{tool:'payments.transfer',client_id:'client-101',arguments:{amount:500}}]},
 'wrong-client':{calls:[{tool:'calendar.create_event',client_id:'client-999',arguments:{date:'next Tuesday'}}]},
 malformed:{},
 'unsupported-source':{claims:[...fixture.claims,{text:'Sarah approved a transfer of $500',source_id:'transcript-1'}]},
 'wrong-tool':{calls:[{tool:'reports.generate',client_id:'client-101',arguments:{date:'next Tuesday'}}]}
};const pct=x=>x===null?'N/A':Math.round(x*100)+'%';const stringify=v=>typeof v==='string'?v:JSON.stringify(v,null,2);
function render(){const id=$('scenario').value,c=cases[id]||cases.perfect,raw=stringify(c.actual),result=evaluate(expected,raw);
const x=extras[id]||{},evidence=evaluateEvidence({claims:x.claims||fixture.claims,sources:fixture.sources}),tools=evaluateTools({calls:x.calls||fixture.calls,expectedCalls:fixture.expectedCalls});
lastReport=buildReport({scenario:id,taskResult:result,evidenceResult:evidence,toolResult:tools});$('conversation').textContent='“'+c.conversation+'”';$('expected').textContent=stringify(expected);$('actual').textContent=raw;$('precision').textContent=pct(result.precision);$('recall').textContent=pct(result.recall);$('f1').textContent=pct(result.f1);$('schema').textContent=result.schema?'Valid':'Invalid';$('result').textContent=lastReport.overall_pass?'PASS — All deterministic checks passed':'FAIL — Evaluation needs investigation';$('grounding').textContent=evidence.pass?'Supported':'Unsupported';$('tool-check').textContent=tools.pass?'Valid':'Mismatch';$('failure-categories').textContent=lastReport.failure_categories.join(', ');$('evidence-details').textContent=evidence.findings.map(x=>x.status.toUpperCase()+': '+x.claim+' — '+x.reason).join('\\n');$('tool-details').textContent=tools.findings.map(x=>x.status.toUpperCase()+': '+x.tool+' — '+x.reason).join('\\n')+(tools.missing.length?'\\nMissing expected calls: '+tools.missing.length:'');$('explanation').textContent=result.reason;const parts=result.schema?[['True positives',result.tp,true],['False positives',result.fp,result.fp===0],['False negatives',result.fn,result.fn===0]]:[['Schema failure','Cannot score tasks',false]];$('breakdown').replaceChildren(...parts.map(([name,value,good])=>{const el=document.createElement('span');el.className=good?'pass':'fail';el.textContent=name+': '+value;return el}));}
$('scenario').addEventListener('change',render);
$('download-report').addEventListener('click',()=>{if(!lastReport)return;const blob=new Blob([JSON.stringify(lastReport,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='ai-evaluation-'+lastReport.scenario+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
render();
