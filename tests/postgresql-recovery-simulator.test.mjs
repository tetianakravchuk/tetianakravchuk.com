import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {simulate,scenarios} from '../projects/postgresql-recovery-simulator/recovery-data.js';
test('three deterministic scenarios',()=>assert.equal(Object.keys(scenarios).length,3));
test('crash rolls back before retry and commits atomically',()=>{const r=simulate('crash');assert.equal(r.events[2].state.committed,0);assert.equal(r.events[2].state.checkpoint,0);assert.equal(r.events.at(-1).state.committed,3);assert.equal(r.events.at(-1).state.checkpoint,3)});
test('concurrent writer rejected without partial state',()=>{const r=simulate('concurrent');assert.equal(r.events[2].status,'blocked');assert.deepEqual(r.events[2].state,r.events[1].state)});
test('ambiguous acknowledgment does not duplicate rows',()=>{const r=simulate('duplicate');assert.equal(r.events[1].state.committed,3);assert.equal(r.events.at(-1).state.committed,3);assert.equal(r.events.at(-1).state.attempts,2)});
test('scenario is explicitly synthetic',()=>{for(const id of Object.keys(scenarios))assert.equal(simulate(id).synthetic,true)});
test('unknown scenario fails closed',()=>assert.throws(()=>simulate('invalid'),/Unknown scenario/));
test('portfolio links and sitemap',()=>{assert.match(fs.readFileSync('pages/projects.html','utf8'),/postgresql-recovery-simulator/);assert.match(fs.readFileSync('sitemap.xml','utf8'),/postgresql-recovery-simulator/)});
