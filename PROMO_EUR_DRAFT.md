# QA Studio launch offer — draft

This branch stages the proposed non-renewing Editor PRO price display in EUR.
It does not change Stripe, the database, the live checkout, or the live site.
The customer purchase button is explicitly disabled while this draft is in use.

| Access | Price |
| --- | ---: |
| 1 day | €1.00 |
| 7 days | €2.99 |
| 14 days | €4.99 |
| 30 days | €7.99 |
| 90 days | €17.99 |
| 365 days | €49.99 |

The current editor checkout and webhook use CZK, while the grant schema stores
CZK. An EUR rollout requires an audited server and database change, matching
Stripe price configuration, reliable paid-event processing, refund handling,
and real test-mode end-to-end verification. The admin-only legacy checkout
continues to use its original CZK test prices.

The paid external-AI integration, costs, quotas, and inclusion in the offer
remain unverified. Do not describe the planned offer as including AI credits
until they are implemented and their costs and limits are confirmed.

Do not enable public checkout or merge a release that enables sales until the
payment, license activation, product claims, and consumer information are
verified. Keep user-uploaded assets and unrelated application behavior intact.
