// src/lib/db/local.ts
import Dexie, { type Table } from 'dexie';
import type { Note, Notebook } from '$lib/types';

interface PendingChange {
  id: string;
  entity: 'note' | 'notebook';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}

class LocalDatabase extends Dexie {
  notebooks!: Table<Notebook>;
  notes!: Table<Note>;
  pendingChanges!: Table<PendingChange>;

  constructor() {
    super('NotebookDB');
    this.version(1).stores({
      notebooks: 'id, owner_id, updated_at',
      notes: 'id, notebook_id, position, updated_at',
      pendingChanges: 'id, entityId, timestamp, synced'
    });
  }

  async saveNote(note: Note) {
    console.log('💾 Local DB: Saving note:', note.id, note.title);
    await this.transaction('rw', this.notes, this.pendingChanges, async () => {
      await this.notes.put(note);
      const changeId = crypto.randomUUID();
      await this.pendingChanges.add({
        id: changeId,
        entity: 'note',
        entityId: note.id,
        operation: 'update',
        data: note,
        timestamp: Date.now(),
        synced: false
      });
      console.log('💾 Local DB: Added pending change:', changeId, 'for note:', note.id);
    });
  }

  async getUnsyncedChanges() {
    return await this.pendingChanges.where('synced').equals(false).toArray();
  }

  async markChangesSynced(ids: string[]) {
    await this.pendingChanges.where('id').anyOf(ids).modify({ synced: true });
  }
}

export const db = new LocalDatabase();