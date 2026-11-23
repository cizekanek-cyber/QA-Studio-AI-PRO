# QA Studio AI PRO — release gates

Updated: 2026-11-23. This is a **release checklist**, not a statement that the paid service is live.

## Available in public beta
- GitHub Pages preview and the direct `login.html` page.
- Free editor, marketing homepage, template browsing, responsive account form.
- Supabase sign-in, password recovery and session handling (production user testing still required).
- Plan catalogue: six prepaid time passes, 59 / 129 / 279 / 449 / 1099 / 2990 CZK.
- Backend credit status, owner-only reporting, and **test-only** Stripe Checkout for verified owner.
- Safe feature gates: customer checkout and external AI generation stay disabled.

## Required before enabling public sales
- [ ] Successfully sign in **and** recover a real customer account from mobile. Use a fresh email; do not repeatedly resend while rate-limited.
- [ ] Configure production SMTP, verified sender, email templates with OTP option, and allowed Supabase redirect URLs for the canonical customer domain.
- [ ] Configure and test OAuth credentials for Google/Facebook separately; do not advertise unsupported providers.
- [ ] Activate and verify the intended legal Stripe live account and payment methods (Apple Pay / Google Pay only where eligible); test complete checkout, webhook idempotency, refunds and balances.
- [ ] Implement real provider credentials, backend cost quotes, per-user quotas, credit reservations, atomic debits/refunds, provider error-handling and budget ceilings **before** enabling AI generation.
- [ ] Verify paid template files actually exist in private storage; test actual downloads and PRO expiry.
- [ ] Publish valid Terms, Privacy Policy, data deletion/account deletion, support contact and consumer information as applicable to markets served.
- [ ] Review Supabase security advisor. Enable leaked-password protection (currently not enabled), review account security and CORS origin list.
- [ ] Run release workflow green and run interactive smoke tests on at least one real mobile device and browser.
- [ ] Only then explicitly switch production launch flags after approval.

## Operational policy
No live AI inference or customer billing until automated + real-world validation. No customer-facing revenue metrics. Do not put private service keys into GitHub Pages. Show truthful 'coming soon' labels for unfinished integrations.

## Verification
`node --test tests/qa-release.test.cjs` tests syntax, key consistency, link consistency, auth success/error, recovery and safe redirects **using mocked responses**, not real user credentials. GitHub Pages success means deployment, not verified sales readiness.
