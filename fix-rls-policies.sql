-- Fix RLS policies to debug the sync issue
-- Run this in your Supabase SQL Editor

-- First, let's temporarily disable RLS to test if that's the issue
ALTER TABLE notebooks DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- Check what data gets inserted without RLS, then we can re-enable with better policies
-- After testing, you can re-enable RLS with:
-- ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Then create better policies:
-- DROP POLICY IF EXISTS "Users can manage own notebooks" ON notebooks;
-- DROP POLICY IF EXISTS "Users can manage notes in own notebooks" ON notes;

-- CREATE POLICY "Users can manage own notebooks" ON notebooks
--   FOR ALL USING (auth.uid() = owner_id);

-- CREATE POLICY "Users can manage notes in own notebooks" ON notes
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM notebooks 
--       WHERE notebooks.id = notes.notebook_id 
--       AND notebooks.owner_id = auth.uid()
--       AND (notebooks.deleted IS NULL OR notebooks.deleted = false)
--     )
--   );