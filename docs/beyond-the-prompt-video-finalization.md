# Beyond the Prompt — media publication acceptance

The site already contains a dedicated technical story at `/projects/beyond-the-prompt/`. This branch improves the native HTML5 player to wait for real MP4 metadata and keep the accessible fallback if media is missing.

## Required binary asset
Upload the approved optimized MP4 from the conversation to:
`assets/video/beyond-the-prompt.mp4`

Upload **to this feature branch**, not directly to main. Use GitHub's web upload or a local Git checkout. Do not rename the asset: the page references this exact path.

## Acceptance
1. Confirm the MP4 is committed on the branch, is served as `video/mp4`, and plays on desktop and mobile.
2. Check keyboard access to native video controls and readable content with playback disabled.
3. Confirm fallback remains visible when MP4 is missing or corrupt.
4. Run `node --test tests/beyond-the-prompt.test.mjs` and the combined portfolio CI workflow.
5. Check Cloudflare preview, console errors, video weight, and mobile layout.
6. Confirm no claim of actual production incident: the illustrated catalog example is synthetic.

No autoplay, no external player, no user-tracking changes.
