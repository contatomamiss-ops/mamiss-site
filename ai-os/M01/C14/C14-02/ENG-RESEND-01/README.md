# C14-02 Resend isolated engineering candidate

Status: LOCAL PROTOTYPE, NOT PRODUCTION READY. No remote writes, deploy, real credentials, or emails.

Public route `/api/lead.php` remains POST multipart with NOME, EMAIL, LGPD, LISTA, ORIGEM, UTM_* and honeypot. Resend is not Brevo DOI: confirmation tokens are HMAC-signed, expiring, with D1 state. Duplicates return 202 without re-sending. Provider 429/5xx/network failures become outcome_unknown, never automatic retry. Webhook verifies Svix signatures and deduplicates event IDs.

Run: `node --test tests/*.test.mjs`. Apply `migrations/0001_resend_leads.sql` to isolated Cloudflare D1 only after architecture approval. Bind LEADS_DB; secrets RESEND_API_KEY, RESEND_FROM, RESEND_TOKEN_SECRET, RESEND_WEBHOOK_SECRET. Never commit actual values. Do not activate until sender domain and security/compliance approval.

Known blockers: original RES-01..06 texts not independently recovered; previous C13 Resend candidate exists in Library and requires byte-level reconciliation; no production-compatible opt-out endpoint; no durable rate limit; unverified D1 runtime behavior; no transactional outbox; no real Svix signed positive test; no operational logs or monitoring; no consent-text version/retention; GET confirmation allows automated link scanner to confirm (must change to GET landing page + POST explicit confirmation); email address stored plaintext and requires privacy review; source origin uses request host and must use trusted configured public origin; token replay after confirmed currently accepted idempotently. No production activation authorized.

Migration: maintain Brevo active; validate isolated D1 and Resend sandbox, contract and security reviews; stage separate routing with explicit approval. Rollback: revert routing to unchanged Brevo deployment; preserve D1 for reconciliation; never re-send unknown outcomes automatically.
