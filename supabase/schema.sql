-- ==============================================================================
-- COGNITIVE TRAINING APP FOR SENIORS (NeuroFit / Cognity)
-- Supabase / PostgreSQL Database Schema & Security Policies
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop (for migration scripts / resets)
-- DROP TABLE IF EXISTS exercise_logs CASCADE;
-- DROP TABLE IF EXISTS daily_sessions CASCADE;
-- DROP TABLE IF EXISTS cognitive_profiles CASCADE;
-- DROP TABLE IF EXISTS accessibility_settings CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS family_groups CASCADE;

-- ------------------------------------------------------------------------------
-- 1. FAMILY GROUPS (Family leaderboards and social connection)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS family_groups (
    group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_name VARCHAR(100) NOT NULL,
    invite_code VARCHAR(16) NOT NULL UNIQUE,
    admin_user_id UUID, -- References users(user_id) once user is created
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. USERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(100) NOT NULL,
    birth_year INT CHECK (birth_year >= 1900 AND birth_year <= EXTRACT(YEAR FROM NOW())),
    total_coins INT NOT NULL DEFAULT 0 CHECK (total_coins >= 0),
    current_streak INT NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    family_group_id UUID REFERENCES family_groups(group_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint back to family_groups for admin_user_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_family_admin_user'
    ) THEN
        ALTER TABLE family_groups 
        ADD CONSTRAINT fk_family_admin_user 
        FOREIGN KEY (admin_user_id) REFERENCES users(user_id) ON DELETE SET NULL;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. ACCESSIBILITY SETTINGS
-- Instant live updates for senior-friendly ergonomics
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS accessibility_settings (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    font_size_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.25 CHECK (font_size_multiplier >= 1.00 AND font_size_multiplier <= 2.00),
    high_contrast BOOLEAN NOT NULL DEFAULT FALSE,
    reduce_animations BOOLEAN NOT NULL DEFAULT FALSE,
    sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. COGNITIVE PROFILE (Dynamic Difficulty Adjustment - DDA State)
-- Current baseline and dynamic difficulty levels (1: Gentle/Intro, 2: Standard, 3: Advanced, 4-5: Mastery)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cognitive_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    memory_level INT NOT NULL DEFAULT 1 CHECK (memory_level BETWEEN 1 AND 10),
    attention_level INT NOT NULL DEFAULT 1 CHECK (attention_level BETWEEN 1 AND 10),
    speed_level INT NOT NULL DEFAULT 1 CHECK (speed_level BETWEEN 1 AND 10),
    language_level INT NOT NULL DEFAULT 1 CHECK (language_level BETWEEN 1 AND 10),
    baseline_completed BOOLEAN NOT NULL DEFAULT FALSE,
    last_assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. DAILY SESSIONS
-- Tracks completed daily workout bundles and rewards
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    coins_earned INT NOT NULL DEFAULT 0 CHECK (coins_earned >= 0),
    duration_seconds INT NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0)
);

-- ------------------------------------------------------------------------------
-- 6. EXERCISE LOGS
-- Fine-grained metrics for real-time Dynamic Difficulty Adjustment (DDA)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exercise_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES daily_sessions(session_id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    category VARCHAR(30) NOT NULL CHECK (category IN ('memory', 'attention', 'speed', 'language')),
    level_played INT NOT NULL CHECK (level_played BETWEEN 1 AND 10),
    accuracy_score NUMERIC(5,2) NOT NULL CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
    avg_response_time_ms INT NOT NULL CHECK (avg_response_time_ms >= 0),
    played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_family_group ON users(family_group_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_category ON exercise_logs(user_id, category, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_sessions_user_date ON daily_sessions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_family_groups_invite ON family_groups(invite_code);

-- ------------------------------------------------------------------------------
-- AUTOMATIC TIMESTAMPS TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_accessibility_updated_at
BEFORE UPDATE ON accessibility_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures data privacy while enabling family group member leaderboard visibility
-- ------------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessibility_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;

-- 1. Users policies: users can read themselves, and family members can view display names & streak/coins
CREATE POLICY "Users can view self and family members"
ON users FOR SELECT
USING (
    auth.uid() = user_id 
    OR family_group_id IN (
        SELECT family_group_id FROM users WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. Accessibility settings: private to the user
CREATE POLICY "Users manage their own accessibility settings"
ON accessibility_settings FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Cognitive profiles: private to the user
CREATE POLICY "Users manage their cognitive profile"
ON cognitive_profiles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Daily sessions: private to user (with family stats readable if needed)
CREATE POLICY "Users view own sessions"
ON daily_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own sessions"
ON daily_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Exercise logs: private to user
CREATE POLICY "Users view own exercise logs"
ON exercise_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own exercise logs"
ON exercise_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 6. Family groups: accessible to members
CREATE POLICY "Members view their family group"
ON family_groups FOR SELECT
USING (
    group_id IN (
        SELECT family_group_id FROM users WHERE user_id = auth.uid()
    )
);

-- ------------------------------------------------------------------------------
-- 7. USER BADGES (Ticket G-5: Achievement Badges)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_badges (
    badge_assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    badge_id VARCHAR(50) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    icon_name VARCHAR(50) NOT NULL,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)
);

-- ------------------------------------------------------------------------------
-- 8. NOTIFICATIONS & ENCOURAGEMENTS (Ticket G-4: Micro-Interactions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    sender_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(30) NOT NULL DEFAULT 'applause',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_to_user ON notifications(to_user_id, created_at DESC);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);
CREATE POLICY "Users send notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- ==============================================================================
-- INITIAL SEED / DEMO DATA (FOR DEV & TESTING)
-- ==============================================================================
INSERT INTO family_groups (group_id, group_name, invite_code)
VALUES ('00000000-0000-0000-0000-000000000001', 'משפחת ברקאי • מועדון המוח', 'BRAIN-7788')
ON CONFLICT (group_id) DO NOTHING;

INSERT INTO users (user_id, display_name, birth_year, total_coins, current_streak, family_group_id)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'סבתא שרה', 1952, 340, 7, '00000000-0000-0000-0000-000000000001'),
    ('22222222-2222-2222-2222-222222222222', 'סבא דוד', 1948, 410, 12, '00000000-0000-0000-0000-000000000001'),
    ('33333333-3333-3333-3333-333333333333', 'יונתן (נכד)', 2004, 210, 4, '00000000-0000-0000-0000-000000000001'),
    ('44444444-4444-4444-4444-444444444444', 'רוני (בת)', 1978, 180, 3, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO accessibility_settings (user_id, font_size_multiplier, high_contrast, reduce_animations, sound_enabled)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 1.35, FALSE, FALSE, TRUE),
    ('22222222-2222-2222-2222-222222222222', 1.50, TRUE, TRUE, TRUE)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO cognitive_profiles (user_id, memory_level, attention_level, speed_level, language_level, baseline_completed)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 2, 2, 1, 3, TRUE),
    ('22222222-2222-2222-2222-222222222222', 3, 2, 2, 2, TRUE)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description, icon_name)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'early_bird', 'משכים קום', 'אימון הושלם לפני 09:00 בבוקר', 'Sun'),
    ('11111111-1111-1111-1111-111111111111', 'streak_7', 'שבוע של אלופים', 'רצף של 7 ימי אימון רצופים', 'Flame')
ON CONFLICT DO NOTHING;
