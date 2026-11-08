CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY,email TEXT NOT NULL,email_hash TEXT NOT NULL,name TEXT NOT NULL,list_name TEXT NOT NULL,consent_at TEXT NOT NULL,confirmed_at TEXT,status TEXT NOT NULL,provider_id TEXT,last_error TEXT,origin TEXT,utm_source TEXT,utm_medium TEXT,utm_campaign TEXT);
CREATE UNIQUE INDEX IF NOT EXISTS leads_email_list ON leads(email_hash,list_name);
CREATE TABLE IF NOT EXISTS resend_events(event_id TEXT PRIMARY KEY,event_type TEXT NOT NULL,received_at TEXT NOT NULL);
