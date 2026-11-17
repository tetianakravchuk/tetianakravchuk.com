# WPH RAG Explorer

An interactive portfolio demonstration of retrieval, source eligibility, cited answers, and abstention. Entry points: the homepage RAG section and the Projects page.

## Runtime

All work occurs in the visitor's browser. Six fictional passages are ranked by distinct query-term overlap; source strings are retained. The answer composer recognizes publication-date, author, and Japanese-catalog questions about three fictional books. It extracts supported values for the named book and links citations to visible source cards.

This is an educational, deterministic retrieval-and-answer implementation. It does not use an LLM, embeddings, vector search, WPH's backend, authenticated evidence, or production data. The page explains how this differs from standard model-based RAG. No keys, paid API requests, analytics, registry writes, reviewer decisions, or automatic approvals are introduced.

## Cases

- Supported publication date and author, with source references.
- Conflicting publication dates, retaining both passages for review.
- Pending Source Check, excluding the matching claim.
- Missing field or missing evidence, without substituting a nearby fact.
- Translation not documented in the demo catalog, without claiming global absence.
- Unknown translation rights, requiring separate confirmation.
- Duplicate source identities, mixed scripts, blank/ambiguous queries, and another book in the same passage.

Source IDs, URLs, dates, and eligibility states are fictional fixtures, not attestations. Distinct source counts are descriptive; they do not establish real source independence or verification. The downloadable JSON is labeled as a local demo execution and contains the current question, decision, citations, rankings, and exclusions.

## Validation

From the repository root:

```sh
node --test tests/wph-rag-explorer.test.mjs
node --test tests/*.test.mjs
node tests/portfolio-smoke.cjs
node tests/release-quality.cjs
```

For browser QA, submit each example, enter a new author question, open a citation, expand provenance, and download the local execution JSON. Inspect the pending and contradiction states explicitly. Check keyboard access and narrow screens separately; source tests do not establish responsive browser acceptance.
