-- ===================================
-- Add Public Read Access to RLS Policies
-- Run this to allow anonymous users to view match data
-- ===================================

-- Sessions: Add public read access
DROP POLICY IF EXISTS "Allow public read access on sessions" ON sessions;
CREATE POLICY "Allow public read access on sessions" ON sessions
  FOR SELECT USING (true);

-- Courts: Add public read access  
DROP POLICY IF EXISTS "Allow public read access on courts" ON courts;
CREATE POLICY "Allow public read access on courts" ON courts
  FOR SELECT USING (true);

-- Game History: Add public read access
DROP POLICY IF EXISTS "Allow public read access on game_history" ON game_history;
CREATE POLICY "Allow public read access on game_history" ON game_history
  FOR SELECT USING (true);

-- Queued Matches: Add public read access
DROP POLICY IF EXISTS "Allow public read access on queued_matches" ON queued_matches;
CREATE POLICY "Allow public read access on queued_matches" ON queued_matches
  FOR SELECT USING (true);
