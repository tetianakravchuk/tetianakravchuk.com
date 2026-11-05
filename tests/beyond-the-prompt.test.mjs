import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
test('case study has clear provenance and claims',()=>{
 const page=read('projects/beyond-the-prompt/index.html');
 assert.match(page,/fictional|Fictional/);
 assert.match(page,/HTTP 200|200 OK/);
 assert.match(page,/source-grounding|source grounding|groundedness/i);
 assert.match(page,/not a recording of a real production failure/);
});
test('links to real interactive demonstrations',()=>{
 const page=read('projects/beyond-the-prompt/index.html');
 for(const path of ['../ai-agent-evaluation/','../agent-execution-trace/','../wph-architecture/'])assert.ok(page.includes(path));
});
test('video is optional with accessible text fallback',()=>{
 const page=read('projects/beyond-the-prompt/index.html'),script=read('projects/beyond-the-prompt/story.js');
 assert.match(page,/id="video-fallback"/);
 assert.match(page,/data-video-src/);
 assert.match(script,/response\.ok/);
 assert.match(script,/aria-label/);
});
test('portfolio entry points and sitemap include story',()=>{
 assert.match(read('index.html'),/projects\/beyond-the-prompt\//);
 assert.match(read('pages/projects.html'),/projects\/beyond-the-prompt\//);
 assert.match(read('sitemap.xml'),/projects\/beyond-the-prompt\//);
});
test('semantic landmarks and metadata are present',()=>{
 const page=read('projects/beyond-the-prompt/index.html');
 for(const pattern of [/<main id="main">/,/<h1>/,/<title>/,/<link rel="canonical"/,/<meta name="description"/])assert.match(page,pattern);
});
