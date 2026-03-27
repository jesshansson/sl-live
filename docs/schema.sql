CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorite_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stop_id TEXT NOT NULL,
  stop_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, stop_id)
);

CREATE TABLE IF NOT EXISTS alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stop_id TEXT NOT NULL,
  line TEXT,
  notify_on_delay BOOLEAN NOT NULL DEFAULT true,
  notify_on_change BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_favorite_stops_user_id ON favorite_stops(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_preferences_user_id ON alert_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_preferences_stop_id ON alert_preferences(stop_id);
