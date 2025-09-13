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

    // Version 1 - original schema
    this.version(1).stores({
      notebooks: 'id, owner_id, updated_at',
      notes: 'id, notebook_id, position, updated_at',
      pendingChanges: 'id, entityId, timestamp, synced'
    });

    // Version 2 - fix synced field data type from number to boolean
    this.version(2).stores({
      notebooks: 'id, owner_id, updated_at',
      notes: 'id, notebook_id, position, updated_at',
      pendingChanges: 'id, entityId, timestamp, synced'
    }).upgrade(tx => {
      // Convert existing numeric synced values to boolean
      return tx.pendingChanges.toCollection().modify(change => {
        if (typeof change.synced === 'number') {
          change.synced = change.synced === 1;
        }
      });
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