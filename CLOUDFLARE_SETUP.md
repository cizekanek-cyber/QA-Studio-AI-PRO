# QA Studio AI PRO — Cloudflare Pages migration

**Status:** repository prepared for Git-based Cloudflare Pages deployments. The application is **not yet deployed to Cloudflare** until the Cloudflare account owner links the GitHub repository and creates a Pages project. Keep the GitHub Pages domain operational until DNS and authentication tests succeed.

## Create project once in the Cloudflare dashboard
1. Open https://dash.cloudflare.com/ → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Authorize the official Cloudflare Workers & Pages GitHub integration for repository **`cizekanek-cyber/QA-Studio-AI-PRO`**.
3. Choose the repository and these exact settings:

| Setting | Value |
|---|---|
| Framework preset | None |
| Production branch | `main` |
| Root directory | Repository root (default) |
| Build command | `node scripts/build-cloudflare.cjs` |
| Build output directory | `dist` |
| Environment variables | None required for the static frontend |

4. **Save and Deploy**. Wait for the Cloudflare deployment marked successful, and use the **actual** project `*.pages.dev` URL shown there. Project slug is not confirmed; do not assume a Pages URL exists before deployment.
5. First verify homepage, `/login.html`, mobile layout, editor, assets, and `/register` redirect.

## BEFORE turning the new host into the public login
- Supabase project: `naxotlqvimewbfowxwmw`.
- Supabase **Authentication → URL Configuration:** add the **actual Cloudflare hostname** with `https://<actual-project>.pages.dev/login.html` as an allowed redirect URL. The user's preferred canonical domain should also have `https://qastudioaipro.com/login.html` (and `https://www.qastudioaipro.com/login.html` if used) allowed.
- The Supabase Edge Functions `qa-template`, `qa-admin`, `qa-billing`, `qa-checkout`, `qa-credits`, `qa-ai-gateway` use an **explicit CORS origin list**, currently GitHub Pages and `qastudioaipro.com`. Only allow the actual new `*.pages.dev` origin **after it has been deployed and verified**; never use a wildcard in account, credit or billing endpoints.
- Supabase Auth email delivery needs production SMTP and a tested confirmation / recovery flow; a 429 email limit is not fixed by changing the host.
- Do not change the Supabase `SITE_URL` environment secret or the domain DNS without checking the customer login return and payment success/cancel URLs. Keep the old GitHub Pages address available for rollback.

## Attach the public domain
- Cloudflare Pages → project → **Custom domains** → add `qastudioaipro.com`, if the user owns and wants to use it.
- Follow Cloudflare's DNS instructions. Do not replace a live DNS record until the new `pages.dev` deployment works.
- Once the new canonical site passes login tests, switch DNS, verify HTTPS and all payment return URLs, and keep the GitHub Pages domain as an emergency fallback.

## What this migration does *not* activate
- No customer checkout or Stripe live mode (current backend is test only).
- No external AI provider inference or charging credits (current backend intentionally fails closed).
- No user consent-less Google, Facebook or TikTok sign in.
- No guarantee that Pay via Apple Pay or Google Pay works until validated in Stripe production.

## Automated local and GitHub tests
```
node --test tests/qa-release.test.cjs
node scripts/build-cloudflare.cjs
node --test tests/qa-cloudflare.test.cjs
```
Cloudflare Pages Git integration redeploys each new `main` commit. This repository includes no third-party billing keys or OAuth secrets.

Official documentation: https://developers.cloudflare.com/pages/get-started/git-integration/

## First-production-deployment recovery (522 on pages.dev)
If `qa-studio-ai-pro.pages.dev` reports Cloudflare 522 and the Pages dashboard says **No production deployment yet**, the frontend has **not** been published successfully. A green GitHub Actions check is *not* a successful Cloudflare deployment.
1. In Cloudflare **Workers & Pages → qa-studio-ai-pro → Deployments**, inspect the production deployment and its build logs (the row for `main`).
2. Verify Git project connection and project settings: production branch `main`, framework `None`, build command `node scripts/build-cloudflare.cjs`, output directory `dist`, root directory blank.
3. A new commit to `main` triggers the Git-integrated build again. Confirm **Cloudflare** reports a *production deployment success* before opening `pages.dev`.
4. If builds complete successfully but `pages.dev` remains 522, inspect Cloudflare Pages status and project deployment details; open Cloudflare support with the Ray ID, timestamp, project name and deployment ID. Do not change DNS as a workaround.
This documentation update also intentionally triggers a harmless new deployment attempt from main.
