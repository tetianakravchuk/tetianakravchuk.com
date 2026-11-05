# Phase 5 — Portfolio release acceptance

## Automated source checks
The `Portfolio Phase 5 release quality` workflow runs portfolio smoke tests,
AI evaluation tests, agent trace tests, Beyond the Prompt tests and source
release-quality checks. These validate repository content only.

## Manual production acceptance (not established by CI)
- [ ] Cloudflare Pages deployment matches the reviewed main commit.
- [ ] Test home, projects, resume, AI Evaluation Lab, execution trace and Beyond the Prompt in desktop and mobile browsers.
- [ ] Verify keyboard navigation, focus visibility and screen-reader landmarks.
- [ ] Run Lighthouse on mobile and desktop; record actual scores and URLs.
- [ ] Verify canonical URLs, redirects, sitemap and security headers against deployed responses.
- [ ] Test LinkedIn/social previews using the live URL and crawler debugger.
- [ ] Verify Phase 4 optional MP4 exists and actually loads; do not claim video deployment from source tests alone.
- [ ] Confirm resume and employment dates reflect the site owner's approved public wording.

## Release rule
Do not equate green GitHub CI with Cloudflare deployment or accessibility certification.
Do not publish claims of live acceptance without captured browser/network evidence.
