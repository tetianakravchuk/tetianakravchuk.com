// Production smoke audit; run after deploy with: node scripts/audit-production.mjs
// Tests HTTP content, route fallbacks and essential assets; not a substitute for visual browser QA.
const base=(process.env.PORTFOLIO_BASE_URL||'https://tetianakravchuk.com').replace(/\/$/,'');
const pages=[
['/','Beyond the Prompt'],
['/pages/projects','Projects'],
['/projects/ai-benchmark-dashboard/','AI Evaluation Benchmark Dashboard'],
['/projects/ai-incident-investigation/','AI Incident Investigation Lab'],
['/projects/agent-execution-trace/','AI Agent Execution Trace'],
['/projects/wph-discovery/','WPH Book Discovery Experience'],
['/projects/wph-review-console/','WPH Human Review Console'],
['/projects/postgresql-recovery-simulator/','PostgreSQL Recovery Simulator'],
['/projects/wph-architecture/','WPH'],
['/projects/beyond-the-prompt/','Beyond the Prompt'],
['/projects/wph-ai-platform/','World Publishing Houses']
];
let failures=0;
async function check(path,expected,contentType='text/html'){
 try{const res=await fetch(base+path,{signal:AbortSignal.timeout(15000),redirect:'follow'});const text=await res.text();const ok=res.ok&&(contentType==='script' ? /(?:javascript|ecmascript)/.test(res.headers.get('content-type')||'') : res.headers.get('content-type')?.includes(contentType))&&text.includes(expected);const status=ok?'PASS':'FAIL';console.log(status,res.status,path,ok?'':'Missing expected page marker or content type');if(!ok)failures++;}
 catch(err){failures++;console.log('FAIL',path,err.message)}
}
for(const [p,marker] of pages)await check(p,marker);
for(const [p,marker] of [['/assets/styles.css','{'],['/projects/postgresql-recovery-simulator/recovery.js','simulate'],['/projects/ai-benchmark-dashboard/dashboard.js','benchmark'],['/projects/wph-discovery/discovery.js','filterRecords']])await check(p,marker,p.endsWith('.js')?'script':'text/css');
console.log('Production smoke results:',pages.length+4-failures,'passed,',failures,'failed');
if(failures)process.exitCode=1;
