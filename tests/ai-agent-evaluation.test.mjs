import test from 'node:test';import assert from 'node:assert/strict';import {evaluate} from '../projects/ai-agent-evaluation/evaluator.js';
const expected={tasks:[{action:'schedule_meeting',client_id:'a'},{action:'send_report',client_id:'a'}]};
test('missing task has 100% precision and 50% recall',()=>{const r=evaluate(expected,JSON.stringify({tasks:[expected.tasks[0]]}));assert.equal(r.precision,1);assert.equal(r.recall,.5);assert.equal(r.f1,2/3);assert.equal(r.pass,false)});
test('perfect extraction passes',()=>{const r=evaluate(expected,JSON.stringify(expected));assert.equal(r.pass,true);assert.equal(r.f1,1)});
test('hallucinated task lowers precision',()=>{const r=evaluate(expected,JSON.stringify({tasks:[...expected.tasks,{action:'transfer_funds',client_id:'a'}]}));assert.equal(r.precision,2/3);assert.equal(r.recall,1);assert.equal(r.fp,1)});
test('wrong client counts as false positive and false negative',()=>{const r=evaluate(expected,JSON.stringify({tasks:[{action:'schedule_meeting',client_id:'b'},expected.tasks[1]]}));assert.equal(r.tp,1);assert.equal(r.fp,1);assert.equal(r.fn,1)});
test('malformed JSON does not receive misleading numeric metrics',()=>{const r=evaluate(expected,'{broken');assert.equal(r.schema,false);assert.equal(r.precision,null);assert.equal(r.pass,false)});
test('duplicate predicted task is a false positive',()=>{const r=evaluate(expected,JSON.stringify({tasks:[expected.tasks[0],expected.tasks[0],expected.tasks[1]]}));assert.equal(r.tp,2);assert.equal(r.fp,1)});
