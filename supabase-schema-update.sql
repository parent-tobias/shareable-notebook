-- Updated Supabase Schema to match actual app data structure
-- Run these commands in your Supabase SQL Editor

-- IMPORTANT: First run this query to see your current schema:
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('notebooks', 'notes') 
ORDER BY table_name, ordinal_position;

-- Based on the failed sync data, we need these exact fields:

-- Update notebooks table to match Notebook interface
ALTER TABLE notebooks 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"defaultNoteType": "markdown", "collaborators": [], "isPublic": false}'::jsonb,
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;

-- Update the name column to title if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notebooks' AND column_name = 'name') THEN
        -- Copy name to title, then drop name column
        UPDATE notebooks SET title = name WHERE title IS NULL;
        ALTER TABLE notebooks DROP COLUMN name;
    END IF;
END $$;

-- Update notes table to match Note interface  
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'markdown' CHECK (type IN ('markdown', 'chordpro', 'plaintext', 'code')),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id), 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;

-- Set default values for existing notes (separate UPDATE statements to avoid syntax issues)
UPDATE notes SET type = 'markdown' WHERE type IS NULL;

UPDATE notes SET created_by = (
    SELECT notebooks.owner_id 
    FROM notebooks 
    WHERE notebooks.id = notes.notebook_id
) WHERE created_by IS NULL;

UPDATE notes SET last_modified_by = (
    SELECT notebooks.owner_id 
    FROM notebooks 
    WHERE notebooks.id = notes.notebook_id  
) WHERE last_modified_by IS NULL;

UPDATE notes SET version = 1 WHERE version IS NULL;

-- Make sure required fields are NOT NULL
ALTER TABLE notebooks 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN owner_id SET NOT NULL,
ALTER COLUMN created_at SET NOT NULL,
ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE notes
ALTER COLUMN notebook_id SET NOT NULL,
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN content SET DEFAULT '',
ALTER COLUMN position SET NOT NULL,
ALTER COLUMN type SET NOT NULL,
ALTER COLUMN created_at SET NOT NULL,
ALTER COLUMN updated_at SET NOT NULL;

-- Update RLS policies to use the correct column names
DROP POLICY IF EXISTS "Users can view own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can insert own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can update own notebooks" ON notebooks; 
DROP POLICY IF EXISTS "Users can delete own notebooks" ON notebooks;

CREATE POLICY "Users can view own notebooks" ON notebooks
  FOR SELECT USING (auth.uid() = owner_id AND (deleted IS NULL OR deleted = false));

CREATE POLICY "Users can insert own notebooks" ON notebooks  
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own notebooks" ON notebooks
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own notebooks" ON notebooks
  FOR DELETE USING (auth.uid() = owner_id);

-- Update note policies
DROP POLICY IF EXISTS "Users can view notes in own notebooks" ON notes;
DROP POLICY IF EXISTS "Users can insert notes in own notebooks" ON notes;
DROP POLICY IF EXISTS "Users can update notes in own notebooks" ON notes;
DROP POLICY IF EXISTS "Users can delete notes in own notebooks" ON notes;

CREATE POLICY "Users can view notes in own notebooks" ON notes
  FOR SELECT USING (
    (deleted IS NULL OR deleted = false) AND
    EXISTS (
      SELECT 1 FROM notebooks 
      WHERE notebooks.id = notes.notebook_id 
      AND notebooks.owner_id = auth.uid()
      AND (notebooks.deleted IS NULL OR notebooks.deleted = false)
    )
  );

CREATE POLICY "Users can insert notes in own notebooks" ON notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM notebooks 
      WHERE notebooks.id = notes.notebook_id 
      AND notebooks.owner_id = auth.uid()
      AND (notebooks.deleted IS NULL OR notebooks.deleted = false)
    )
  );

CREATE POLICY "Users can update notes in own notebooks" ON notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM notebooks 
      WHERE notebooks.id = notes.notebook_id 
      AND notebooks.owner_id = auth.uid()
      AND (notebooks.deleted IS NULL OR notebooks.deleted = false)
    )
  );

CREATE POLICY "Users can delete notes in own notebooks" ON notes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM notebooks 
      WHERE notebooks.id = notes.notebook_id 
      AND notebooks.owner_id = auth.uid()
      AND (notebooks.deleted IS NULL OR notebooks.deleted = false)
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notebooks_owner_id ON notebooks(owner_id) WHERE deleted IS NULL OR deleted = false;
CREATE INDEX IF NOT EXISTS idx_notes_notebook_id ON notes(notebook_id) WHERE deleted IS NULL OR deleted = false;
CREATE INDEX IF NOT EXISTS idx_notes_position ON notes(notebook_id, position) WHERE deleted IS NULL OR deleted = false;
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);
CREATE INDEX IF NOT EXISTS idx_notebooks_updated_at ON notebooks(updated_at);