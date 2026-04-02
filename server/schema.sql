-- ============================================
-- Cazyno - PostgreSQL Schema
-- Run: psql -U cazyno -d cazyno -f schema.sql
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── users (auth) ───
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── user_profiles ───
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL UNIQUE,
  user_name TEXT,
  credits NUMERIC(12,2) DEFAULT 1000,
  xp NUMERIC(14,2) DEFAULT 0,
  rakeback NUMERIC(12,2) DEFAULT 0,
  total_wagered NUMERIC(14,2) DEFAULT 0,
  total_won NUMERIC(14,2) DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  transactions JSONB DEFAULT '[]'::jsonb,
  grade_rewards JSONB DEFAULT '[]'::jsonb,
  daily_stats JSONB DEFAULT '{}'::jsonb,
  daily_reward_claimed TEXT DEFAULT '',
  wallet JSONB DEFAULT '{"btc":0,"eth":0,"usdt":0,"sol":0}'::jsonb,
  is_banned BOOLEAN DEFAULT false,
  is_frozen BOOLEAN DEFAULT false,
  admin_notes TEXT DEFAULT '',
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(user_email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user ON user_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated ON user_profiles(updated_at DESC);

-- ─── game_rounds ───
CREATE TABLE IF NOT EXISTS game_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  bet NUMERIC(12,2) NOT NULL,
  result TEXT NOT NULL,
  profit NUMERIC(12,2) NOT NULL,
  created_date TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_rounds_date ON game_rounds(created_date DESC);

-- ─── support_tickets ───
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  user_name TEXT,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'high')),
  messages JSONB DEFAULT '[]'::jsonb,
  created_date TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_email ON support_tickets(user_email);
CREATE INDEX IF NOT EXISTS idx_support_tickets_date ON support_tickets(created_date DESC);

-- ─── auto-update updated_at ───
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_profiles_updated ON user_profiles;
CREATE TRIGGER trg_user_profiles_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_support_tickets_updated ON support_tickets;
CREATE TRIGGER trg_support_tickets_updated
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Provably Fair seeds ───
CREATE TABLE IF NOT EXISTS seeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  server_seed TEXT NOT NULL,
  server_seed_hash TEXT NOT NULL,
  client_seed TEXT DEFAULT 'cazyno',
  nonce INTEGER DEFAULT 0,
  revealed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seeds_user ON seeds(user_id);

-- ─── audit_logs ───
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id),
  actor_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);

-- ─── affiliates ───
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  tier TEXT DEFAULT 'starter',
  total_referred INTEGER DEFAULT 0,
  total_ngr NUMERIC(14,2) DEFAULT 0,
  total_commission NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliates_user ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(code);

-- ─── referrals ───
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id),
  referred_user_id UUID REFERENCES users(id),
  ngr NUMERIC(14,2) DEFAULT 0,
  commission_paid NUMERIC(14,2) DEFAULT 0,
  deposits_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_affiliate ON referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_user ON referrals(referred_user_id);
