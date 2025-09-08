-- Supabase RLS Setup for Notebook App
-- Run these commands in your Supabase SQL Editor

-- First, ensure RLS is enabled on both tables
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (optional - only run if you have conflicting policies)
-- DROP POLICY IF EXISTS "Users can view own notebooks" ON notebooks;
-- DROP POLICY IF EXISTS "Users can insert own notebooks" ON notebooks;
-- DROP POLICY IF EXISTS "Users can update own notebooks" ON notebooks;
-- DROP POLICY IF EXISTS "Users can delete own notebooks" ON notebooks;
-- DROP POLICY IF EXISTS "Users can view notes in own notebooks" ON notes;
-- DROP POLICY IF EXISTS "Users can insert notes in own notebooks" ON notes;
-- DROP POLICY IF EXISTS "Users can update notes in own notebooks" ON notes;
-- DROP POLICY IF EXISTS "Users can delete notes in own notebooks" ON notes;

-- Notebook policies
CREATE POLICY "Users can view own notebooks" ON notebooks
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own notebooks" ON notebooks
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own notebooks" ON notebooks
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own notebooks" ON notebooks
  FOR DELETE USING (auth.uid() = owner_id);

-- Note policies
CREATE POLICY "Users can view notes in own notebooks" ON notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM notebooks 
      WHERE notebooks.id = notes.notebook_id 
      AND notebooks.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert notes in own notebooks" ON notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM notebooks 
      WHERE notebooks.id = notes.notebook_id 
      AND notebooks.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notes in own notebooks" ON notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM notebooks 
      WHERE notebooks.id = notes.notebook_id 
      AND notebooks.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete notes in own notebooks" ON notes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM notebooks 
      WHERE notebooks.id = notes.notebook_id 
      AND notebooks.owner_id = auth.uid()
    )
  );

-- Optional: Create indexes for better performance
CREATE INDEX IF NOT EXISTS notebooks_owner_id_idx ON notebooks(owner_id);
CREATE INDEX IF NOT EXISTS notes_notebook_id_idx ON notes(notebook_id);
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON notes(updated_at);
CREATE INDEX IF NOT EXISTS notebooks_updated_at_idx ON notebooks(updated_at);