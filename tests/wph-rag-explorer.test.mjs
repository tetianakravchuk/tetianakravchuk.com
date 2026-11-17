import test from 'node:test';
import assert from 'node:assert/strict';
import { chunks } from '../projects/wph-rag-explorer/corpus.mjs';
import { retrieve, runQuery, tokenize } from '../projects/wph-rag-explorer/retrieval.mjs';

test('retrieval is calculated from query terms and changes with the query', () => {
  assert.equal(retrieve('cartographer')[0].id, 'demo-chunk-03');
  assert.equal(retrieve('Japanese edition')[0].id, 'demo-chunk-02');
  assert.deepEqual(retrieve('xyznonexistent'), []);
});
test('publication answer has matching fixture identifiers and source excerpts', () => {
  const result = runQuery('When was The Winter Atlas published?');
  assert.equal(result.status, 'answered');
  assert.match(result.answer, /March 2026/);
  assert.equal(result.sourceCount, 2);
  assert.equal(result.citations.length, 2);
  for (const citation of result.citations) {
    const chunk = chunks.find(item => item.id === citation.chunkId);
    assert.equal(citation.sourceId, chunk.sourceId);
    assert.ok(chunk.text.includes(citation.value));
  }
});
test('conflicting publication dates require review and preserve both citations', () => {
  const result = runQuery('When was The Sea Between Us published?');
  assert.equal(result.status, 'conflicting_evidence');
  assert.deepEqual(new Set(result.citations.map(item => item.value)), new Set(['May 2024', 'June 2024']));
  assert.doesNotMatch(result.answer, /was published in/);
});
test('pending source cannot support an answer even when retrieval finds it', () => {
  const result = runQuery('When was The Amber Orchard published?');
  assert.equal(result.status, 'verification_pending');
  assert.equal(result.citations.length, 0);
  assert.ok(result.reasons.some(item => item.chunkId === 'demo-chunk-06'));
  assert.doesNotMatch(result.answer, /January 2025/);
});
test('missing field is not answered using an unrelated matching title', () => {
  const result = runQuery('What is the ISBN of The Winter Atlas?');
  assert.equal(result.status, 'insufficient_evidence');
  assert.equal(result.citations.length, 0);
  assert.ok(result.ranked.length > 0);
});
test('absent corpus evidence cannot generate a publication date', () => {
  const result = runQuery('When was The Winter Atlas published?', []);
  assert.equal(result.status, 'insufficient_evidence');
  assert.deepEqual(result.citations, []);
  assert.doesNotMatch(result.answer, /2026/);
});
test('catalog absence stays scoped to this catalog, without claiming translation absence', () => {
  const result = runQuery('Is The Winter Atlas documented in Japanese?');
  assert.equal(result.status, 'answered');
  assert.match(result.answer, /not documented in this demo catalog/);
  assert.match(result.answer, /not proof that no translation exists/);
  assert.equal(result.citations[0].chunkId, 'demo-chunk-02');
  assert.equal(runQuery('Is The Winter Atlas translated into Italian?').status, 'insufficient_evidence');
});
test('rights remain unknown regardless of retrieved publication evidence', () => {
  const result = runQuery('Are Japanese translation rights available for The Winter Atlas?');
  assert.equal(result.status, 'rights_unknown');
  assert.equal(result.citations.length, 0);
  assert.match(result.answer, /Confirm rights/);
});
test('duplicate chunks do not inflate distinct sources or citations', () => {
  const copy = { ...chunks[0], id: 'duplicate-chunk' };
  const result = runQuery('When was The Winter Atlas published?', [chunks[0], copy]);
  assert.equal(result.sourceCount, 1);
  assert.equal(result.citations.length, 1);
});
test('contradictions within one source are not hidden by deduplication', () => {
  const changed = { ...chunks[0], id: 'conflicting-chunk', text: chunks[0].text.replace('March 2026', 'April 2026') };
  const result = runQuery('When was The Winter Atlas published?', [chunks[0], changed]);
  assert.equal(result.status, 'conflicting_evidence');
  assert.equal(result.sourceCount, 1);
  assert.equal(result.citations.length, 2);
});
test('source string differences remain intact and mixed scripts are disclosed', () => {
  assert.notDeepEqual(tokenize('MICHAЁLIS'), tokenize('MICHAËLIS'));
  assert.ok(runQuery('Who wrote The Winter Atlas? SOPHUS MICHAЁLIS').warning);
  assert.equal(runQuery('Who wrote The Winter Atlas? SOPHUS MICHAËLIS').warning, '');
  assert.deepEqual(tokenize('é'), tokenize('e\u0301'));
});
test('blank, ambiguous, long, and unknown-book questions require clarification', () => {
  for (const query of ['', 'x'.repeat(301), 'When was Unknown Book published?', 'When were The Winter Atlas and The Sea Between Us published?']) assert.equal(runQuery(query).status, 'clarification_needed');
});
test('author answer is extracted and changed source text changes the result', () => {
  assert.match(runQuery('Who wrote The Winter Atlas?').answer, /Mira Lund/);
  const changed = { ...chunks[0], text: chunks[0].text.replace('Mira Lund', 'Ida Moss') };
  assert.match(runQuery('Who wrote The Winter Atlas?', [changed]).answer, /Ida Moss/);
});
test('unknown source eligibility fails closed and corpus is not mutated', () => {
  const original = JSON.stringify(chunks);
  const result = runQuery('When was The Winter Atlas published?', [{ ...chunks[0], state: 'not_checked' }]);
  assert.equal(result.status, 'insufficient_evidence');
  assert.equal(result.citations.length, 0);
  runQuery('When was The Winter Atlas published?');
  assert.equal(JSON.stringify(chunks), original);
});
test('a different book in the same passage cannot supply the requested date or author', () => {
  const injected = { ...chunks[0], text: 'Another Book, by Wrong Author, was published in January 1999. The Winter Atlas follows a cartographer.' };
  assert.equal(runQuery('When was The Winter Atlas published?', [injected]).status, 'insufficient_evidence');
  assert.equal(runQuery('Who wrote The Winter Atlas?', [injected]).status, 'insufficient_evidence');
  const valid = { ...injected, text: injected.text + ' ' + chunks[0].text };
  assert.match(runQuery('When was The Winter Atlas published?', [valid]).answer, /March 2026/);
});
