import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {benchmark,golden} from '../projects/ai-benchmark-dashboard/benchmark-data.js';
test('golden dataset is deterministic and nonempty',()=>{assert.equal(golden.length,8);assert.equal(benchmark().synthetic,true)});
test('scores calculated from cases',()=>{const r=benchmark();assert.equal(r.v1.passed,5);assert.equal(r.v2.passed,7);assert.equal(r.v2.rate,7/8)});
test('new regression blocks release despite improved overall rate',()=>{const r=benchmark();assert.deepEqual(r.regressions,['G07']);assert.equal(r.release_allowed,false);assert.equal(r.gates.zeroNewRegressions,false)});
test('category gate detects groundedness regression',()=>{const r=benchmark();assert.equal(r.gates.grounding,false);assert.equal(r.gates.toolSafety,true)});
test('empty cases fail closed',()=>assert.throws(()=>benchmark([]),/Nonempty/));
test('UI and sitemap link to benchmark',()=>{assert.match(fs.readFileSync('pages/projects.html','utf8'),/ai-benchmark-dashboard/);assert.match(fs.readFileSync('sitemap.xml','utf8'),/ai-benchmark-dashboard/)});
