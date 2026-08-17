# WPH Interview Academy — Owner-Only Deployment

The Academy lives at `https://tetianakravchuk.com/academy/` and is intentionally **not linked from the public portfolio navigation**.

## Security requirement

Do **not** rely on JavaScript passwords, hidden URLs, robots.txt, or `noindex` for privacy. This portfolio repository is public, so browser-only password checks would not provide real access control.

The production route must be protected at the Cloudflare edge with **Cloudflare Zero Trust Access** before this branch is merged to `main`.

## Required Cloudflare Access policy

In Cloudflare Dashboard:

1. Open **Zero Trust** → **Access** → **Applications**.
2. Create **Self-hosted application**.
3. Application name: `WPH Interview Academy`.
4. Application domain/path:
   - Domain: `tetianakravchuk.com`
   - Path: `/academy/*`
5. Create one **Allow** policy named `Tetiana only`.
6. Include rule: **Emails** → your own email address only.
7. Do not add `Everyone`, country, IP-wide, or organization-wide allow rules.
8. Configure an identity provider you control. Cloudflare **One-time PIN** is sufficient if enabled for your email; Google/GitHub identity is also acceptable when restricted to your exact email identity.
9. Recommended session duration: 24 hours or less.
10. Save the application and test the route in a private/incognito browser before merging this PR.

Expected behavior:

- Logged out / another email → Cloudflare Access login or denial; Academy HTML is never served.
- Your approved identity → Academy loads normally.
- Search crawlers → blocked by Access and additionally told `noindex` by page metadata, `robots.txt`, and `X-Robots-Tag`.

## Important public-repository note

Cloudflare Access protects the **deployed website**, not files committed to a public GitHub repository. Therefore:

- Do not commit private interview notes, passwords, medical/personal information, or secret API keys to the Academy folder.
- Personal notes and mastery progress are stored in browser `localStorage` by `academy/academy.js` and are not committed to GitHub.
- If future Academy content itself must be secret, move that content to a private backend/private repository and fetch it only after authenticated requests.

## Phase 1 features

- 27-module curriculum dashboard
- Search and status filters
- Module detail dialog
- Learning loop: Learn → WPH → Code → Quiz → Interview → Mastery
- Local `Not started / Learning / Mastered` progress
- Local private study notes
- Recommended-next-module card
- Responsive mobile layout
- Anti-indexing and no-store headers for `/academy/*`

## Before merge checklist

- [ ] Cloudflare Access self-hosted application exists for `/academy/*`
- [ ] Allow policy contains only Tetiana's exact email identity
- [ ] Unapproved/incognito user cannot retrieve `/academy/`
- [ ] Approved user can retrieve `/academy/`
- [ ] No Academy link is added to public navigation
- [ ] No secrets or private notes are committed

Only after these checks pass should the feature branch be merged and deployed.
