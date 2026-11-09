# C14-02-SEC-CLOSE-01 - Isolated corrective increment

Parent baseline: contatomamiss-ops/mamiss-site branch eng/c14-02-eng-resend-01-20261108 commit b5200c2cfce56158404343143d447833d300b766.

This is a standalone corrective overlay of the original prototype. Keep the 11 original files untouched in ENG-RESEND-01 and publish this increment only to ai-os/M01/C14/C14-02/SEC-CLOSE-01/ on a branch forked from the original commit, after specific write authorization.

Run `node --test tests/*.test.mjs` in this directory. The 10 original test cases have been copied into original-regression.test.mjs and adjusted only for the intentional SEC-01 GET semantics and the added D1 rate-limit mock. Original 10-test file remains intact in the parent commit. Additional security tests cover explicit POST, token expiry/reuse, opt-out, concurrent rate limits and Svix signature verification.

Configuration: RESEND_API_KEY, RESEND_FROM, RESEND_TOKEN_SECRET, RESEND_WEBHOOK_SECRET, LEADS_DB D1, PUBLIC_ORIGIN (fixed HTTPS origin). No real credentials committed. Run 0001 then 0002 SQL only on isolated D1 after approval. Production deploy remains prohibited.

Known limitations: see SEC-MATRIX.md. No independent QA review. No operational approval. Do not merge or deploy.
