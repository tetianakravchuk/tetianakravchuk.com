import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate } from '../projects/ai-agent-evaluation/evaluator.js';
import { expectedTasks, agentExamples, ragExamples } from '../assets/wph-testing.mjs';

test('homepage scenarios calculate meaningful task metrics with the existing evaluator', () => {
  const results = Object.fromEntries(Object.entries(agentExamples).map(([name, actual]) => [name, evaluate(expectedTasks, actual)]));
  assert.equal(results.match.pass, true);
  assert.equal(results.extra.precision, 2 / 3);
  assert.equal(results.extra.recall, 1);
  assert.equal(results.extra.pass, false);
  assert.equal(results.missing.precision, 1);
  assert.equal(results.missing.recall, 0.5);
  assert.equal(results.schema.schema, false);
  assert.equal(results.schema.precision, null);
});

test('missing evidence produces no fabricated citation or publication date', () => {
  assert.equal(ragExamples.missing.status, 'insufficient_evidence');
  assert.doesNotMatch(ragExamples.missing.answer, /2026|\[S1\]/);
  assert.match(ragExamples.rights.answer, /must be confirmed/);
});
