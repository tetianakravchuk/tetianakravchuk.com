import {evaluate} from './evaluator.js';
const expected={tasks:[{action:'schedule_meeting',client_id:'client-101',date:'next Tuesday'},{action:'send_portfolio_report',client_id:'client-101',report_type:'updated portfolio'}]};
const cases={
missing:{actual:{tasks:[expected.tasks[0]]},conversation:'Schedule a meeting with Sarah next Tuesday and send her the updated portfolio report.'},
perfect:{actual:expected,conversation:'Schedule a meeting with Sarah next Tuesday and send her the updated portfolio report.'},
hallucinated:{actual:{tasks:[...expected.tasks,{action:'transfer_funds',client_id:'client-101'}]},conversation:'Schedule a meeting with Sarah next Tuesday and send her the updated portfolio report. No financial transfers were requested.'},
'wrong-client':{actual:{tasks:[{...expected.tasks[0],client_id:'client-999'},expected.tasks[1]]},conversation:'Schedule a meeting with Sarah (client-101) next Tuesday and send her the updated portfolio report.'},
malformed:{actual:'{"tasks":[{"action":"schedule_meeting","client_id":"client-101"}',conversation:'Schedule a meeting with Sarah next Tuesday and send her the updated portfolio report.'}
};
const $=id=>document.getElementById(id);const pct=x=>x===null?'N/A':Math.round(x*100)+'%';const stringify=v=>typeof v==='string'?v:JSON.stringify(v,null,2);
function render(){const c=cases[$('scenario').value],raw=stringify(c.actual),result=evaluate(expected,raw);$('conversation').textContent='“'+c.conversation+'”';$('expected').textContent=stringify(expected);$('actual').textContent=raw;$('precision').textContent=pct(result.precision);$('recall').textContent=pct(result.recall);$('f1').textContent=pct(result.f1);$('schema').textContent=result.schema?'Valid':'Invalid';$('result').textContent=result.pass?'PASS — Required tasks extracted':'FAIL — Agent output needs investigation';$('explanation').textContent=result.reason;const parts=result.schema?[['True positives',result.tp,true],['False positives',result.fp,result.fp===0],['False negatives',result.fn,result.fn===0]]:[['Schema failure','Cannot score tasks',false]];$('breakdown').replaceChildren(...parts.map(([name,value,good])=>{const el=document.createElement('span');el.className=good?'pass':'fail';el.textContent=name+': '+value;return el}));}
$('scenario').addEventListener('change',render);render();
