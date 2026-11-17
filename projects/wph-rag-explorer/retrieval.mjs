import { books, chunks, corpusVersion } from './corpus.mjs?v=20261117';

const stopwords = new Set('the a an is are was were when what who which of in for to by and us it this that please tell me'.split(' '));
export const tokenize = text => [...new Set((String(text).normalize('NFC').toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).filter(word => !stopwords.has(word)))];
const sameWords = (title, query) => tokenize(title).every(word => tokenize(query).includes(word));

export function retrieve(query, corpus = chunks) {
  const terms = tokenize(query);
  return corpus.map(chunk => {
    const words = new Set(tokenize(chunk.text));
    const matchedTerms = terms.filter(term => words.has(term));
    return { ...chunk, matchedTerms, score: matchedTerms.length };
  }).filter(chunk => chunk.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

function fieldFor(query) {
  if (/\b(rights|licens\w*)\b/i.test(query)) return 'rights';
  if (/\b(japanese|japan)\b/i.test(query) && /\b(translation|translated|edition|documented|available)\b/i.test(query)) return 'japanese_catalog';
  if (/\b(isbn|price|cost|pages|born|died|award|awards|sales)\b/i.test(query)) return null;
  if (/\b(author|wrote|written|writer)\b/i.test(query)) return 'author';
  if (/\b(published|publication|released|release)\b/i.test(query) && /\b(when|date|year|month)\b/i.test(query)) return 'publication';
  return null;
}

function claimFrom(chunk, field, book) {
  if (!chunk.text.includes(book.title)) return null;
  const title = book.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (field === 'publication') return chunk.text.match(new RegExp(`${title}(?:, by [^,]+,)? was published in ([A-Z][a-z]+ \\d{4})\\.`))?.[1] || null;
  if (field === 'author') return chunk.text.match(new RegExp(`${title}, by ([^,]+), was published`))?.[1] || null;
  if (field === 'japanese_catalog' && chunk.text.includes('A Japanese-language edition is not documented in this demo catalog.')) return 'not_documented';
  return null;
}

export function runQuery(rawQuery, corpus = chunks) {
  const query = String(rawQuery).trim();
  const ranked = retrieve(query, corpus);
  const matchingBooks = books.filter(book => sameWords(book.title, query));
  const book = matchingBooks.length === 1 ? matchingBooks[0] : null;
  const field = fieldFor(query);
  const warning = /\p{Script=Latin}/u.test(query) && /\p{Script=Cyrillic}/u.test(query)
    ? 'Mixed Latin/Cyrillic characters detected. Source strings are preserved; similar-looking letters are not merged.' : '';
  const result = { demo: true, corpusVersion, query, book: book?.title || null, field, status: 'insufficient_evidence', answer: '', ranked, citations: [], warning, reasons: [], sourceCount: 0 };
  const finish = (status, answer) => ({ ...result, status, answer });
  if (!query) return finish('clarification_needed', 'Enter a question or choose an example.');
  if (query.length > 300) return finish('clarification_needed', 'Keep your question under 300 characters.');
  if (field === 'rights') return finish('rights_unknown', 'Rights availability is unknown. Publication or catalog evidence cannot establish permission to translate or publish. Confirm rights with the publisher or agency.');
  if (!book) return finish('clarification_needed', 'Name one book from this fictional collection: The Winter Atlas, The Sea Between Us, or The Amber Orchard.');
  if (!field) return finish('insufficient_evidence', 'This demo cannot support that answer. Try a publication date, author, or Japanese catalog question. A relevant passage alone is not enough.');

  const relevant = ranked.filter(chunk => chunk.bookId === book.id);
  const eligible = relevant.filter(chunk => chunk.state === 'included');
  result.reasons = relevant.filter(chunk => chunk.state !== 'included').map(chunk => ({ chunkId: chunk.id, reason: 'Excluded: source check is pending or the source is not included in this fixture.' }));
  if (!eligible.length && relevant.some(chunk => chunk.state === 'pending')) return finish('verification_pending', 'The only relevant source is pending a Source Check. Its claims are excluded from the answer.');

  const evidence = eligible.map(chunk => ({ chunk, value: claimFrom(chunk, field, book) })).filter(item => item.value);
  if (!evidence.length) return finish('insufficient_evidence', 'No eligible passage supports this specific answer. The requested information remains unknown.');
  // Repeated chunks from one source cannot inflate the distinct-source count.
  result.sourceCount = new Set(evidence.map(item => item.chunk.sourceId)).size;
  const values = new Set(evidence.map(item => item.value));
  const seen = new Set();
  result.citations = evidence.filter(item => {
    const key = `${item.chunk.sourceId}|${item.value}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).map((item, index) => ({ label: `S${index + 1}`, chunkId: item.chunk.id, sourceId: item.chunk.sourceId, value: item.value }));
  if (values.size > 1) return finish('conflicting_evidence', 'The included sources disagree. Inspect both passages and request human review before choosing an answer.');
  const value = evidence[0].value;
  if (field === 'japanese_catalog') return finish('answered', 'A Japanese-language edition is not documented in this demo catalog. That is not proof that no translation exists, and it says nothing about available rights.');
  if (field === 'author') return finish('answered', `The source names ${value} as the author of ${book.title}.`);
  return finish('answered', `The included sources place publication of ${book.title} in ${value}.`);
}
