# Voice downloads

The voice editor keeps audio processing in the browser. The `qa-voice-access`
Edge Function receives only authenticated account metadata and a random
download request ID; it never receives the recording.

The account gets three trial downloads. The server recognizes the existing
owner and active Editor PRO / PRO / VIP entitlements without spending the
trial. A paid download limit is enforced only when the existing server reports
that customer checkout is active. While sales are disabled, later downloads
remain available free during beta, and the UI says so.

The service-only counters and idempotent claim function were installed in the
Supabase migration `20261127193202_qa_voice_trial_quota`. Its SQL is kept in
the project's Supabase migration history. Both tables have RLS enabled and no
direct anonymous or authenticated access. `qa_voice_trial_claim` is executable
only by the service role and serializes requests for each account.

An account counter controls the normal application flow; it is not DRM.
Because media processing runs in the user's browser, client code and already
accessible audio can be copied. Strong enforcement would require a separately
designed server-rendered or otherwise protected processing workflow.

Customer checkout remains disabled until the owner has a verified live Stripe
account, confirmed prices and plan descriptions, validated webhook fulfillment,
and completed the existing release conditions. Test the feature with
`node --test tests/qa-voice-access.test.cjs`.
