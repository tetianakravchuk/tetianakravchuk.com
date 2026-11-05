# Portfolio Phase 5 — release verification

## Automated checks
- `node tests/portfolio-smoke.cjs`: portfolio copy, resume asset, redirects and feature links.
- `node --test tests/portfolio-release-quality.test.mjs`: canonical URLs, sitemap coverage, local links, document semantics, image-alt baseline, mixed-content and security headers.
- `node --test tests/ai-agent-evaluation.test.mjs tests/ai-evaluation-advanced.test.mjs`: AI evaluation.
- `node --test tests/agent-execution-trace.test.mjs`: trace explorer.
- `node --test tests/beyond-the-prompt.test.mjs`: technical story.
- CI: `.github/workflows/portfolio-release-quality.yml`.

## Browser acceptance (must be checked on deployment preview)
1. At 375px, 768px, 1280px: no horizontal overflow, text clipping, or obstructed controls.
2. Keyboard-only: skip link, navigation menu, lab scenarios, trace navigation, JSON download, and native video controls.
3. Screen reader: one main landmark per page, heading order, form labels, status announcements, and meaningful alternative text.
4. Test both video states: MP4 present and missing. Missing media must leave the full textual case study usable.
5. Open each Projects card and verify case study, resume PDF, GitHub links, and download behaviors.
6. Inspect browser console and Network for failed assets, CSP violations, and unexpected requests.

## Performance
- Run Lighthouse on homepage, Projects, AI Evaluation Lab, Agent Trace, and Beyond the Prompt (mobile + desktop).
- Review LCP, CLS, INP, image/video weight, third-party requests and render-blocking assets.
- Record baseline measurements before declaring performance acceptance. Do not invent Lighthouse scores.

## SEO / social
- Verify production canonical URLs, sitemap and robots.txt.
- Check HTTP 200 on key pages and intended 301 redirects.
- Inspect Open Graph/Twitter preview images with LinkedIn Post Inspector and crawler-access logs.
- Confirm that internal pages' OG image URL resolves for crawlers.
- The public academy must remain excluded from indexing and access controlled.

## Release policy
Source-level checks do not replace browser testing, real deployment checks, or third-party crawler validation. Do not merge until required checks pass and outstanding findings are resolved. PR #54 media upload is separate and remains a dependency for full video acceptance.
