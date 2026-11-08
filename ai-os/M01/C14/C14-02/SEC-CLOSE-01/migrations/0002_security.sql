ALTER TABLE leads ADD COLUMN unsubscribed_at TEXT;
CREATE TABLE IF NOT EXISTS lead_rate_limits (bucket TEXT NOT NULL, slot INTEGER NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(bucket,slot));
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
-- Retain suppression tombstones; configure lifecycle for email/name separately after privacy approval.
