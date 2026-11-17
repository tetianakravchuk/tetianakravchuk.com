import { examples, corpusVersion } from './corpus.mjs?v=20261117';
import { runQuery } from './retrieval.mjs?v=20261117';

const $ = selector => document.querySelector(selector);
const reasons = {
  answered: 'The answer is composed from eligible passages for this exact book and question. Follow a citation to inspect its source. Source counts describe this fictional corpus only.',
  conflicting_evidence: 'Both conflicting values remain visible in the evidence. Retrieval rank does not decide which source is correct.',
  verification_pending: 'A relevant match was found, but its pending source state prevents it from supporting the answer.',
  insufficient_evidence: 'The retrieved context does not support the requested claim. The demo does not fill that gap with a guess.',
  rights_unknown: 'A catalog entry or publication date cannot grant rights or permission. Rights questions require separate confirmation.',
  clarification_needed: 'This small demonstration answers one supported question about one of its three fictional books at a time.',
};
const labels = { answered: 'Supported by included sources', conflicting_evidence: 'Conflicting evidence · review needed', verification_pending: 'Verification pending', insufficient_evidence: 'Insufficient evidence', rights_unknown: 'Rights availability unknown', clarification_needed: 'Question needs clarification' };
let currentTrace;
let execution = 0;

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function render(query) {
  const result = runQuery(query);
  execution += 1;
  $('#rag-outcome').textContent = labels[result.status];
  $('#rag-outcome').dataset.state = result.status;
  $('#rag-answer').textContent = result.answer;
  $('#rag-reason').textContent = reasons[result.status];
  $('#retrieval-count').textContent = `${result.ranked.length} passages`;
  $('#unicode-warning').hidden = !result.warning;
  $('#unicode-warning').textContent = result.warning;
  $('#source-summary').textContent = result.citations.length ? `${result.citations.length} cited ${result.citations.length === 1 ? 'passage' : 'passages'} · ${result.sourceCount} distinct fictional ${result.sourceCount === 1 ? 'source' : 'sources'}. Multiple passages from one source do not increase this count.` : 'No passage is cited as support for an answer.';

  const sources = $('#rag-sources'); sources.replaceChildren();
  for (const [index, chunk] of result.ranked.entries()) {
    const citation = result.citations.find(item => item.chunkId === chunk.id);
    const card = el('article', undefined, 'rag-source');
    card.id = chunk.id; card.tabIndex = -1; card.dataset.state = chunk.state; card.dataset.used = String(Boolean(citation));
    const badge = el('div', undefined, 'rag-source-label');
    badge.append(el('span', `#${index + 1} · ${chunk.score} matching ${chunk.score === 1 ? 'term' : 'terms'}`), el('strong', citation ? `[${citation.label}] Cited evidence` : chunk.state === 'pending' ? 'Pending · excluded' : 'Retrieved · not cited'));
    card.append(badge, el('h3', chunk.source), el('blockquote', chunk.text));
    const details = el('details'); details.append(el('summary', 'Inspect source provenance'));
    const list = el('dl');
    for (const [label, value] of Object.entries({ 'Document / chunk': `${chunk.documentId} / ${chunk.id}`, 'Source identity': chunk.sourceId, 'Fictional source URL': chunk.url, 'Fixture capture date': chunk.captured, 'Fixture eligibility': chunk.state === 'included' ? 'Included in this synthetic example' : 'Pending source check · excluded', 'Matched terms': chunk.matchedTerms.join(', ') })) list.append(el('dt', label), el('dd', value));
    details.append(list); card.append(details); sources.append(card);
  }
  if (!result.ranked.length) sources.append(el('p', 'No passage matches this query. Try one of the example questions.', 'card'));
  const citations = $('#rag-citations'); citations.replaceChildren();
  for (const citation of result.citations) {
    const link = el('a', `[${citation.label}] Open source`); link.href = `#${citation.chunkId}`;
    link.addEventListener('click', () => document.getElementById(citation.chunkId).focus({ preventScroll: true }));
    citations.append(link);
  }
  currentTrace = { demo: true, executionLabel: `Local demo execution ${execution}`, corpusVersion, query: result.query, retrievalMethod: 'distinct-keyword-overlap', scoreMeaning: 'Matching terms, not confidence', decision: result.status, answer: result.answer, citations: result.citations, distinctFixtureSources: result.sourceCount, exclusions: result.reasons, rankedChunks: result.ranked.map(chunk => ({ chunkId: chunk.id, documentId: chunk.documentId, sourceId: chunk.sourceId, score: chunk.score, state: chunk.state })) };
  $('#rag-trace').textContent = JSON.stringify(currentTrace, null, 2);
  $('#query-announcement').textContent = `${labels[result.status]}. ${result.ranked.length} passages retrieved. ${result.answer}`;
  for (const button of $('#rag-examples').children) button.setAttribute('aria-pressed', String(button.dataset.question === result.query));
}

for (const example of examples) {
  const button = el('button', example.label); button.type = 'button'; button.dataset.question = example.question; button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => { $('#rag-question').value = example.question; render(example.question); });
  $('#rag-examples').append(button);
}
$('#rag-form').addEventListener('submit', event => { event.preventDefault(); render($('#rag-question').value); });
$('#download-trace').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(currentTrace, null, 2)], { type: 'application/json' }));
  const link = el('a'); link.href = url; link.download = 'wph-rag-demo-execution.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
render($('#rag-question').value);
