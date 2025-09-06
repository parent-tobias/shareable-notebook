// src/lib/types/index.ts
export type NoteType = 'markdown' | 'chordpro' | 'plaintext' | 'code';

export interface Note {
  id: string;
  notebook_id: string;
  type: NoteType;
  title: string;
  content: string;
  position: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  last_modified_by: string;
  version: number;
  deleted?: boolean;
}

export interface Notebook {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  settings: NotebookSettings;
  deleted?: boolean;
}

export interface NotebookSettings {
  defaultNoteType: NoteType;
  collaborators: string[];
  isPublic: boolean;
  theme?: string;
}

export interface SyncStatus {
  lastSynced: Date | null;
  pending: number;
  syncing: boolean;
  error: string | null;
}