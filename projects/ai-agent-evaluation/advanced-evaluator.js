// Deterministic, synthetic evidence and tool-call checks. No network calls or execution.
const allowedTools = new Set(['calendar.create_event','reports.generate']);
export function evaluateEvidence({claims=[],sources=[]}={}){
 const sourceMap=new Map(sources.map(s=>[s.id,s]));
 const findings=claims.map(c=>{
  const source=sourceMap.get(c.source_id);
  const supported=!!source && Array.isArray(source.supported_claims) && source.supported_claims.includes(c.text);
  return {claim:c.text,source_id:c.source_id,status:supported?'supported':'unsupported',reason:!source?'Missing cited source':supported?'Exact claim supported by synthetic source':'Claim absent from cited source'};
 });
 return {pass:findings.every(x=>x.status==='supported'),findings};
}
export function evaluateTools({calls=[],expectedCalls=[]}={}){
 const key=x=>JSON.stringify([x.tool,x.client_id,x.arguments||{}]);
 const remaining=new Map();
 for(const x of expectedCalls){const k=key(x);remaining.set(k,(remaining.get(k)||0)+1)}
 const findings=calls.map(x=>{
  const k=key(x),n=remaining.get(k)||0;
  if(!allowedTools.has(x.tool))return {tool:x.tool,status:'blocked',reason:'Tool is not allowlisted'};
  if(n>0){remaining.set(k,n-1);return {tool:x.tool,status:'valid',reason:'Matches approved expected call'}}
  return {tool:x.tool,status:'unexpected',reason:'Not supported by approved intent/arguments'};
 });
 const missing=[];for(const x of expectedCalls){const k=key(x),n=remaining.get(k)||0;if(n>0){missing.push(x);remaining.set(k,n-1)}}
 return {pass:findings.every(x=>x.status==='valid')&&missing.length===0,findings,missing};
}
export function classifyFailure({schema=true,taskResult,evidenceResult,toolResult}={}){
 const failures=[];
 if(!schema)failures.push('schema_invalid');
 if(taskResult?.fn)failures.push('missing_task');
 if(taskResult?.fp)failures.push('unexpected_or_misattributed_task');
 if(evidenceResult&&!evidenceResult.pass)failures.push('unsupported_claim');
 if(toolResult&&!toolResult.pass)failures.push('tool_call_mismatch');
 return failures.length?failures:['none'];
}
export function buildReport({scenario,taskResult,evidenceResult,toolResult}){
 const categories=classifyFailure({schema:taskResult.schema,taskResult,evidenceResult,toolResult});
 return {version:'2.0',scenario,fixture_type:'synthetic_deterministic',generated_at:new Date().toISOString(),overall_pass:taskResult.pass&&evidenceResult.pass&&toolResult.pass,metrics:{precision:taskResult.precision,recall:taskResult.recall,f1:taskResult.f1,schema_valid:taskResult.schema},task_counts:{tp:taskResult.tp,fp:taskResult.fp,fn:taskResult.fn},evidence:evidenceResult,tool_calls:toolResult,failure_categories:categories,disclaimer:'Illustrative deterministic evaluation; not a production model score or live tool execution.'};
}
