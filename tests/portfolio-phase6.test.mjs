import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
const pages=['index.html','pages/projects.html','projects/ai-engineering-showcase/index.html','projects/wph-discovery/index.html','projects/wph-review-console/index.html','projects/ai-benchmark-dashboard/index.html','projects/ai-incident-investigation/index.html'];
const read=p=>fs.readFileSync(p,'utf8');
test('showcase and key destinations exist',()=>{for(const p of pages)assert.ok(fs.existsSync(p),p)});
test('portfolio showcase is discoverable from home and projects',()=>{for(const p of ['index.html','pages/projects.html'])assert.match(read(p),/ai-engineering-showcase/)});
test('no ChatGPT tracking parameters in authored pages',()=>{for(const p of pages)assert.doesNotMatch(read(p),/(?:utm_source=chatgpt|chatgpt\.com)/i,p)});
test('sitemap contains valid URL entries and no escaped newline artifacts',()=>{const s=read('sitemap.xml');assert.doesNotMatch(s,/\\n/);assert.match(s,/projects\/ai-engineering-showcase\//);assert.match(s,/<\/urlset>/)});
test('showcase links resolve to local files',()=>{const p='projects/ai-engineering-showcase/index.html',s=read(p);for(const [,href] of s.matchAll(/href="([^"]+)"/g)){if(/^(?:https?:|#|mailto:)/.test(href))continue;const target=href.split(/[?#]/)[0];if(!target)continue;const resolved=target.startsWith('/')?target.slice(1):path.normalize(path.join(path.dirname(p),target));const file=resolved.endsWith('/')?path.join(resolved,'index.html'):resolved;assert.ok(fs.existsSync(file),'Broken showcase link: '+href+' -> '+file)}});
test('project demo disclaimers remain visible',()=>{for(const p of ['projects/wph-discovery/index.html','projects/wph-review-console/index.html'])assert.match(read(p),/fictional/i)});
