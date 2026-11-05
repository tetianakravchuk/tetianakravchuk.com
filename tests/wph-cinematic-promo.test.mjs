import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const asset='assets/video/wph-cinematic-promo..mp4';
test('uploaded WPH promotional asset exists',()=>assert.ok(fs.existsSync(asset),'Missing uploaded promo'));
test('both pages use the uploaded filename',()=>{for(const p of ['index.html','projects/wph-ai-platform/index.html']){const s=read(p);assert.match(s,/wph-cinematic-promo\.\.mp4/);assert.match(s,/<video\s+controls\s+playsinline\s+preload="metadata"/);assert.match(s,/World Publishing Houses cinematic promotional film/)}});
test('technical demonstrations remain linked',()=>{const home=read('index.html');assert.match(home,/data-video="XlATAL1rO5w"/);const project=read('projects/wph-ai-platform/index.html');assert.match(project,/id="technical-deep-dives"/)});
