export const stages = [
 {id:'request',label:'Request',kind:'input'},
 {id:'retrieval',label:'Retrieval',kind:'evidence'},
 {id:'tool',label:'Tool call',kind:'tool'},
 {id:'output',label:'Structured output',kind:'output'},
 {id:'evaluation',label:'Evaluation',kind:'evaluation'},
 {id:'review',label:'Human review',kind:'decision'}
];
const base={
 request:{input:'Find the publication year for a fictional title and prepare a bibliographic record.',risk:'Ambiguous work/edition identity',guardrail:'Use a bounded research request; require source attribution.'},
 retrieval:{input:'Catalog record CATALOG-17: title and author are present; publication year is not recorded.',risk:'Missing publication year in source',guardrail:'Preserve missing values; never infer a date without evidence.'},
 tool:{input:{tool:'catalog.lookup',args:{record_id:'CATALOG-17'},result:{title:'The Northern Lantern',author:'A. Example',publication_year:null}},risk:'Tool response is incomplete',guardrail:'Allowlisted read-only tool; validate response schema and source ID.'},
 output:{input:{title:'The Northern Lantern',publication_year:null,source_id:'CATALOG-17'},risk:'Generated claim could be unsupported',guardrail:'Validate JSON schema and verify each factual field against evidence.'},
 evaluation:{input:{schema_valid:true,source_grounded:true,tool_allowed:true},risk:'Schema success alone is not factual success',guardrail:'Combine deterministic checks and evidence comparison.'},
 review:{input:{decision:'needs_more_evidence',reason:'Publication year absent from catalog record'},risk:'Unverified data promoted as fact',guardrail:'Human approval required before promotion.'}
};
export const scenarios={
 safe:{name:'Safe abstention',description:'The agent leaves an unsupported publication year blank and routes the record for review.',overrides:{},failedAt:null},
 hallucination:{name:'Unsupported publication year',description:'The agent invents a publication year even though the retrieved source has none.',overrides:{
 output:{input:{title:'The Northern Lantern',publication_year:1987,source_id:'CATALOG-17'},risk:'Invented year is not grounded',guardrail:'Compare output field to retrieved source.'},
 evaluation:{input:{schema_valid:true,source_grounded:false,tool_allowed:true},risk:'Unsupported factual claim detected',guardrail:'Block promotion and preserve a failure trace.'},
 review:{input:{decision:'rejected',reason:'1987 is unsupported by CATALOG-17'},risk:'Incorrect publication year could reach users',guardrail:'Require correction or independently verified evidence.'}
 },failedAt:'evaluation'},
 tool:{name:'Unapproved tool call',description:'The agent attempts a write operation instead of the approved read-only catalog lookup.',overrides:{
 tool:{input:{tool:'catalog.update',args:{record_id:'CATALOG-17',publication_year:1987},result:'BLOCKED'},risk:'Unexpected write-capable tool',guardrail:'Deny non-allowlisted tools before execution.'},
 output:{input:null,risk:'No trusted output can be produced',guardrail:'Stop workflow after blocked tool call.'},
 evaluation:{input:{schema_valid:null,source_grounded:null,tool_allowed:false},risk:'Tool policy violation',guardrail:'Record blocked call; do not score nonexistent output as successful.'},
 review:{input:{decision:'escalated',reason:'Attempted non-allowlisted tool'},risk:'Potential unauthorized mutation',guardrail:'Require investigation before retry.'}
 },failedAt:'tool'},
 retrieval:{name:'Missing source evidence',description:'Retrieval returns no matching catalog record; the agent abstains rather than inventing metadata.',overrides:{
 retrieval:{input:'No matching catalog records returned.',risk:'Empty retrieval result',guardrail:'Abstain and surface missing evidence.'},
 tool:{input:{tool:'catalog.lookup',args:{record_id:'CATALOG-17'},result:'NOT_FOUND'},risk:'Source record unavailable',guardrail:'Do not fabricate a record.'},
 output:{input:{title:null,publication_year:null,source_id:null},risk:'No verifiable bibliographic fields',guardrail:'Preserve unknown values.'},
 evaluation:{input:{schema_valid:true,source_grounded:true,tool_allowed:true},risk:'No positive factual claim can be made',guardrail:'Verify abstention; request new evidence.'},
 review:{input:{decision:'needs_more_evidence',reason:'No catalog record found'},risk:'Missing identity evidence',guardrail:'Do not promote the candidate.'}
 },failedAt:'retrieval'}
};
export function buildTrace(id='safe'){
 const scenario=scenarios[id];if(!scenario)throw new Error('Unknown scenario');
 const events=stages.map((stage,index)=>{
  const details=scenario.overrides[stage.id]||base[stage.id];
  const failed=stage.id===scenario.failedAt;
  const blockedIndex=scenario.failedAt==='tool'?2:-1;
  return {id:stage.id,label:stage.label,sequence:index+1,status:failed?'flagged':blockedIndex>=0&&index>blockedIndex&&stage.id!=='review'?'skipped':stage.id==='review'?'review_required':'checked',...details};
 });
 return {trace_id:'DEMO-'+id.toUpperCase(),scenario:id,synthetic:true,description:scenario.description,events,final_decision:events.at(-1).input.decision};
}
