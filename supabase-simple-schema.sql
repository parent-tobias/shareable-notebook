-- Simple schema update for empty tables
-- Run these commands in your Supabase SQL Editor

-- First check current schema
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('notebooks', 'notes') 
ORDER BY table_name, ordinal_position;

-- Update notebooks table (rename name to title if needed)
ALTER TABLE notebooks 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"defaultNoteType": "markdown", "collaborators": [], "isPublic": false}'::jsonb,
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;

-- Drop name column if it exists and copy to title
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notebooks' AND column_name = 'name') THEN
        UPDATE notebooks SET title = name WHERE title IS NULL;
        ALTER TABLE notebooks DROP COLUMN name;
    END IF;
END $$;

-- Update notes table with missing columns
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'markdown' CHECK (type IN ('markdown', 'chordpro', 'plaintext', 'code')),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id), 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own notebooks" ON notebooks
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage notes in own notebooks" ON notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM notebooks 
      WHERE notebooks.id = notes.notebook_id 
      AND notebooks.owner_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notebooks_owner_id ON notebooks(owner_id);
CREATE INDEX IF NOT EXISTS idx_notes_notebook_id ON notes(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);