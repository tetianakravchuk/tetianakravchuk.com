# Post-merge P0–P2 acceptance checklist (2026-11-05)

## Implemented on this branch
- HTML resume: historical employer role date and past-tense descriptions corrected.
- English homepage metrics clarified as historical milestones, including localization.
- About, Resume and Projects social preview image URL normalized to public GitHub-hosted OG asset.
- Expanded source-level smoke checks for links, redirects, localization, assets and social image references.

## Verified evidence
- Previous PR #50 head commit `da4d8d17566795307c7b55c27e27c3c3f6354cbf` had successful `AI evaluation lab tests` run 42054138977 and `Portfolio source smoke checks` run 42054139305.
- New branch workflow runs and live deployment are not yet verified.

## Required before declaring complete
1. Replace `assets/resume/Tetiana_Kravchuk_Resume.pdf` with the updated binary resume. A revised PDF was prepared separately in the conversation, but GitHub's connected file writer accepts UTF-8 text only. Verify its wording and layout before upload.
2. Upload `Beyond_the_Prompt_LinkedIn.mp4` (20-second original from conversation) to a suitable video host or repository via a binary-capable upload path. Add the actual verified URL or asset path to homepage and Projects; do not insert a broken placeholder.
3. Run CI for this branch and inspect any failures; manually test homepage and demos at desktop and mobile sizes, keyboard and screen-reader behavior, video captions, and download links.
4. Verify Cloudflare production deployment and `/sitemap.xml` externally; validate Open Graph previews with LinkedIn Post Inspector and bot/WAF rules. The browser tool did not successfully access the live homepage.
5. Verify the historical 100-case / 774-test figures against dated test evidence before using them as current metrics.

Do not merge until items 1–5 are validated.
