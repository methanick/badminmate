-- ===================================
-- Badminton Management Database Schema
-- ===================================

-- Drop existing tables (for fresh start)
DROP TABLE IF EXISTS queued_matches CASCADE;
DROP TABLE IF EXISTS game_history CASCADE;
DROP TABLE IF EXISTS resting_players CASCADE;
DROP TABLE IF EXISTS courts CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS members CASCADE;

-- 1. Members (สมาชิกถาวร)
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  level VARCHAR(50) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Sessions (session การเล่นแต่ละครั้ง)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Players (ผู้เล่นใน session ปัจจุบัน)
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  member_id INT REFERENCES members(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  level VARCHAR(50) NOT NULL,
  games_played INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Courts (สนาม)
CREATE TABLE courts (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_playing BOOLEAN DEFAULT FALSE,
  team1_slot1_id UUID REFERENCES players(id) ON DELETE SET NULL,
  team1_slot2_id UUID REFERENCES players(id) ON DELETE SET NULL,
  team2_slot1_id UUID REFERENCES players(id) ON DELETE SET NULL,
  team2_slot2_id UUID REFERENCES players(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Resting Players (ผู้เล่นที่พัก)
CREATE TABLE resting_players (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, player_id)
);

-- 6. Game History (ประวัติการเล่น)
-- เก็บข้อมูล player แบบ snapshot ไม่อ้างอิง foreign key
CREATE TABLE game_history (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  court_name VARCHAR(255) NOT NULL,
  team1_player1_name VARCHAR(255),
  team1_player1_level VARCHAR(50),
  team1_player2_name VARCHAR(255),
  team1_player2_level VARCHAR(50),
  team2_player1_name VARCHAR(255),
  team2_player1_level VARCHAR(50),
  team2_player2_name VARCHAR(255),
  team2_player2_level VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- 7. Queued Matches (คิวการแข่งขัน)
CREATE TABLE queued_matches (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  team1_slot1_id UUID REFERENCES players(id) ON DELETE SET NULL,
  team1_slot2_id UUID REFERENCES players(id) ON DELETE SET NULL,
  team2_slot1_id UUID REFERENCES players(id) ON DELETE SET NULL,
  team2_slot2_id UUID REFERENCES players(id) ON DELETE SET NULL,
  court_id INT REFERENCES courts(id) ON DELETE SET NULL,
  is_playing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===================================
-- Indexes for Performance
-- ===================================
CREATE INDEX idx_members_user ON members(user_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_players_session ON players(session_id);
CREATE INDEX idx_courts_session ON courts(session_id);
CREATE INDEX idx_game_history_session ON game_history(session_id);
CREATE INDEX idx_queued_matches_session ON queued_matches(session_id);
CREATE INDEX idx_resting_players_session ON resting_players(session_id);

-- ===================================
-- Row Level Security (RLS)
-- ===================================

-- Members: แต่ละ user เห็นเฉพาะ members ของตัวเอง
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on members" ON members;
DROP POLICY IF EXISTS "Allow public insert on members" ON members;
DROP POLICY IF EXISTS "Allow public update on members" ON members;
DROP POLICY IF EXISTS "Allow public delete on members" ON members;

CREATE POLICY "Users can view own members" ON members 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own members" ON members 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own members" ON members 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own members" ON members 
  FOR DELETE USING (auth.uid() = user_id);

-- Sessions: แต่ละ user เห็นเฉพาะ sessions ของตัวเอง
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access on sessions" ON sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON sessions;
DROP POLICY IF EXISTS "Allow public read access on sessions" ON sessions;

CREATE POLICY "Users can view own sessions" ON sessions 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON sessions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON sessions 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON sessions 
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Allow public read access on sessions" ON sessions
  FOR SELECT USING (true);

-- Players: เข้าถึงได้ผ่าน session ที่เป็นเจ้าของ
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access on players" ON players;

CREATE POLICY "Users can manage players in own sessions" ON players 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = players.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Courts: เข้าถึงได้ผ่าน session ที่เป็นเจ้าของ
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access on courts" ON courts;
DROP POLICY IF EXISTS "Allow public read access on courts" ON courts;

CREATE POLICY "Users can manage courts in own sessions" ON courts 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = courts.session_id 
      AND sessions.user_id = auth.uid()
    )
  );
CREATE POLICY "Allow public read access on courts" ON courts
  FOR SELECT USING (true);

-- Resting Players: เข้าถึงได้ผ่าน session ที่เป็นเจ้าของ
ALTER TABLE resting_players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access on resting_players" ON resting_players;

CREATE POLICY "Users can manage resting players in own sessions" ON resting_players 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = resting_players.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Game History: เข้าถึงได้ผ่าน session ที่เป็นเจ้าของ
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access on game_history" ON game_history;
DROP POLICY IF EXISTS "Allow public read access on game_history" ON game_history;

CREATE POLICY "Users can manage game history in own sessions" ON game_history 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = game_history.session_id 
      AND sessions.user_id = auth.uid()
    )
  );
CREATE POLICY "Allow public read access on game_history" ON game_history
  FOR SELECT USING (true);

-- Queued Matches: เข้าถึงได้ผ่าน session ที่เป็นเจ้าของ
ALTER TABLE queued_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access on queued_matches" ON queued_matches;
DROP POLICY IF EXISTS "Allow public read access on queued_matches" ON queued_matches;

CREATE POLICY "Users can manage queued matches in own sessions" ON queued_matches 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = queued_matches.session_id 
      AND sessions.user_id = auth.uid()
    )
  );
CREATE POLICY "Allow public read access on queued_matches" ON queued_matches
  FOR SELECT USING (true);

-- ===================================
-- Auto-update updated_at trigger
-- ===================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
