import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const exists=p=>fs.existsSync(path.join(root,p));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const publicPages=['index.html','pages/about.html','pages/resume.html','pages/projects.html','pages/contact.html','pages/data-science.html','pages/qa-impact.html','projects/ai-agent-evaluation/index.html','projects/agent-execution-trace/index.html','projects/wph-architecture/index.html','projects/ai-evaluation-observability/index.html','projects/wph-ai-platform/index.html'];
const walk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const htmlFiles=[...walk('pages'),...walk('projects'),'index.html'].filter(p=>p.endsWith('.html')&&!p.includes('/academy/'));
test('all key pages exist and have document semantics',()=>{
 for(const p of publicPages){assert.ok(exists(p),'Missing '+p);const s=read(p);assert.match(s,/<html\b/i,p);assert.match(s,/<title>[^<]+<\/title>/i,p);assert.match(s,/<meta\s+name="viewport"/i,p);assert.match(s,/<h1\b/i,p);assert.match(s,/<main\b/i,p);assert.match(s,/<a\s+class="skip-link"/i,p);}
});
test('all canonical URLs are unique and HTTPS',()=>{
 const urls=new Map();
 for(const p of publicPages){const s=read(p),m=s.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);assert.ok(m,'Missing canonical '+p);assert.ok(m[1].startsWith('https://tetianakravchuk.com/'));assert.ok(!urls.has(m[1]),'Duplicate canonical '+m[1]);urls.set(m[1],p);}
});
test('sitemap contains each public canonical and no duplicate URLs',()=>{
 const sitemap=read('sitemap.xml'),locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.equal(new Set(locs).size,locs.length,'Duplicate sitemap URLs');
 for(const p of publicPages){const canonical=read(p).match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];assert.ok(locs.includes(canonical),'Missing sitemap '+canonical);}
 assert.match(read('robots.txt'),/Sitemap:\s+https:\/\/tetianakravchuk.com\/sitemap.xml/);
});
test('internal href and local stylesheet/script references resolve',()=>{
 const broken=[];
 for(const file of htmlFiles){
  const s=read(file);
  for(const m of s.matchAll(/\b(?:href|src)="([^"]+)"/g)){
   const url=m[1];if(/^(?:https?:|mailto:|tel:|data:|javascript:|#|\/\/)/i.test(url))continue;
   const clean=url.split(/[?#]/)[0];if(!clean)continue;
   const target=clean.startsWith('/')?clean.slice(1):path.normalize(path.join(path.dirname(file),clean));
   if(!exists(target)&&!exists(path.join(target,'index.html'))&&!exists(target+'.html'))broken.push(file+' → '+url);
  }
 }
 assert.deepEqual(broken,[],'Broken local links');
});
test('image accessibility and responsive media baseline',()=>{
 for(const p of publicPages){const s=read(p);for(const m of s.matchAll(/<img\b[^>]*>/gi))assert.match(m[0],/\balt=/i,'Missing image alt in '+p);}
 const trace=read('projects/agent-execution-trace/index.html');
 assert.match(trace,/aria-label/);assert.match(trace,/type="button"/);
});
test('no mixed-content references in public pages',()=>{
 for(const p of publicPages)assert.doesNotMatch(read(p),/(?:src|href)="http:\/\//i,'Mixed content '+p);
});
test('security headers and academy indexing exclusions are present',()=>{
 const headers=read('_headers');assert.match(headers,/Content-Security-Policy/);assert.match(headers,/X-Content-Type-Options/);assert.match(headers,/X-Robots-Tag: noindex/);assert.match(read('robots.txt'),/Disallow:\s*\/academy\//);
});
