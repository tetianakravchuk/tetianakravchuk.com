# Phase 4: Beyond the Prompt media publishing

## Implemented
- New case study at `/projects/beyond-the-prompt/` with a factual, synthetic example and links to existing AI Evaluation Lab, execution trace, and WPH architecture.
- Homepage, Projects, and AI Evaluation & Observability links.
- Accessible textual fallback if video is not deployed.
- Optional native MP4 playback is enabled only if a same-origin video resource exists and responds with a video MIME type.

## Remaining media upload
The user-created combined 20-second video is currently an attachment in the conversation, **not a GitHub repository asset**. It must not be represented as deployed.

Upload the approved file to:
`assets/video/beyond-the-prompt.mp4`

The page expects this exact relative path and will automatically display the video after deployment. GitHub web UI: open repository → Add file → Upload files, choose target folder or upload via a local git checkout. Commit to this feature branch, not main. If using a local checkout:

```sh
git switch feature/beyond-prompt-case-study-video-2026-11
mkdir -p assets/video
cp /path/to/Beyond_the_Prompt_LinkedIn.mp4 assets/video/beyond-the-prompt.mp4
git add assets/video/beyond-the-prompt.mp4
git commit -m "Add approved Beyond the Prompt video"
git push
```

Before merge, confirm media copyright/rights, text legibility, playback, keyboard controls, muted mobile behavior, file size, and page layout.

## Acceptance
- Run `node --test tests/beyond-the-prompt.test.mjs`.
- Verify page and links in Cloudflare preview; confirm no broken media request or console error.
- Verify the video actually loads after upload, or keep the accessible fallback.
- Check mobile widths, keyboard navigation, Lighthouse accessibility, SEO and preview metadata.
- Do not claim that fictional catalog examples are live WPH production results.
