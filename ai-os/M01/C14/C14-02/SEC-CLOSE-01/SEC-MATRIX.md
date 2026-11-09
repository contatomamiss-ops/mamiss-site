# C14-02 SEC-CLOSE-01 - Security matrix

| Control | Implementation | Local evidence | Remaining risk |
|---|---|---|---|
| SEC-01 | GET renders confirmation form; POST atomically confirms only once; signed expiring HMAC token | GET no mutation, POST success, reuse 409, expiry rejected | No CSRF origin validation; token in URL and HTML may be exposed in browser history; require independent security review |
| SEC-02 | GET renders opt-out form; POST persists unsubscribed status; duplicate POST idempotent | Opt-out local test | No signed List-Unsubscribe header, lifecycle retention review; provider-level suppression not configured |
| SEC-03 | D1 atomic UPSERT per SHA256(email/list) and hourly slot; 5 attempts per hour, fail-closed | concurrent mock 10 calls / 5 accepted | Test with real D1 under concurrency; no independent IP/account/global abuse limit; table expiry maintenance required |
| SEC-04 | Svix HMAC SHA256 signature, five-minute timestamp tolerance, JSON validation, event dedup; transactional D1 batch for suppression | signed, tampered, expired and unsigned tests | Batch mock does not prove D1 rollback; event order and durable delivery reconciliation unresolved |
| SEC-05 | Atomic conditional confirmation; fail-closed on storage errors; preserve unknown provider outcomes without retry | mock regression | Plaintext PII retention, rate-limit table pruning, outbox, D1 schema/migration runtime and transactional guarantees require QA |

No production configuration, secrets, DNS, merge, migration, deploy or real mail operations authorized.
