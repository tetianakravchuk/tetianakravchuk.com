export function evaluate(expected, rawActual) {
  let actual;
  try { actual=JSON.parse(rawActual); } catch {return {schema:false,precision:null,recall:null,f1:null,tp:0,fp:0,fn:0,missing:[],extra:[],pass:false,reason:'The response is not valid JSON.'};}
  const valid=actual && typeof actual==='object' && !Array.isArray(actual) && Array.isArray(actual.tasks) && actual.tasks.every(t=>t && typeof t==='object' && !Array.isArray(t) && typeof t.action==='string' && typeof t.client_id==='string' && Object.keys(t).every(k=>['action','client_id','date','report_type'].includes(k)) && (t.date===undefined||typeof t.date==='string') && (t.report_type===undefined||typeof t.report_type==='string'));
  if(!valid)return {schema:false,precision:null,recall:null,f1:null,tp:0,fp:0,fn:0,missing:[],extra:[],pass:false,reason:'The JSON does not match the required task schema.'};
  const key=t=>JSON.stringify([t.action,t.client_id,t.date??null,t.report_type??null]);
  const remaining=new Map();for(const t of expected.tasks){const k=key(t);remaining.set(k,(remaining.get(k)||0)+1);}
  let tp=0;const extra=[];for(const t of actual.tasks){const k=key(t),n=remaining.get(k)||0;if(n>0){tp++;remaining.set(k,n-1)}else extra.push(t);}
  const missing=[];for(const t of expected.tasks){const k=key(t),n=remaining.get(k)||0;if(n>0){missing.push(t);remaining.set(k,n-1)}}
  const fp=extra.length,fn=missing.length;const precision=tp+fp===0?(expected.tasks.length===0?1:0):tp/(tp+fp);const recall=tp+fn===0?1:tp/(tp+fn);const f1=precision+recall===0?0:2*precision*recall/(precision+recall);
  return {schema:true,precision,recall,f1,tp,fp,fn,missing,extra,pass:fp===0&&fn===0,reason:fp===0&&fn===0?'All required tasks match.':fn&&fp?'Required tasks are missing and unsupported or incorrect tasks were generated.':fn?'One or more required tasks are missing.':'One or more generated tasks are unsupported or incorrect.'};
}
