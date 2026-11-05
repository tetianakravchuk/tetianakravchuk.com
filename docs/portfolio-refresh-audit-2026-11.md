# Portfolio refresh — November 2026

## Scope
Single branch for P0–P2 changes: correct historical employer dates, promote existing interactive engineering demonstrations, improve recruiter navigation, normalize selected social preview URLs, and maintain the sitemap.

## Accuracy boundaries
- Advisor360° employment ends October 2026. Professional employer experience remains distinct from independent WPH engineering.
- AI Agent Evaluation Lab uses synthetic deterministic fixtures, not live LLM inference.
- WPH architecture demo is conceptual; concurrency animation does not execute PostgreSQL.
- Homepage numeric metrics refer to historical milestones and require links to dated CI/test evidence before being presented as current production statistics.

## Outstanding before merge
- **PDF resume:** The existing binary PDF cannot be safely rewritten using the GitHub UTF-8 file connector. Replace it with an approved October 2026 version and verify content and rendering; the HTML resume is updated.
- **Beyond the Prompt MP4:** Video is a conversation attachment, not a committed repository asset. Upload an optimized captioned video to the repository or approved video host, then embed/link it. Do not invent a video URL.
- Verify live Cloudflare Pages preview, navigation, keyboard interaction, mobile responsiveness, social scraper behavior, and browser console.
- Confirm recent GitHub Actions results and compare homepage metric claims to dated evidence.
- Confirm homepage translation strings do not override new headline or badge.
- Verify the employer dates and wording across downloadable resume and any localized content.

## Test
Run `node tests/portfolio-smoke.cjs` from repository root.
