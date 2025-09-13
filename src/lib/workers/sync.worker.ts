// src/lib/workers/sync.worker.ts
import { createClient } from '@supabase/supabase-js';
import type { Note, Notebook } from '$lib/types';
import Dexie, { type Table } from 'dexie';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

let currentSession: any = null;

interface PendingChange {
  id: string;
  entity: 'note' | 'notebook';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}

interface WorkerMessage {
  type: 'sync' | 'auth' | 'subscribe';
  payload?: any;
}

// Database instance for the worker - must match the main thread schema exactly
class WorkerDatabase extends Dexie {
  notebooks!: Table<Notebook>;
  notes!: Table<Note>;
  pendingChanges!: Table<PendingChange>;

  constructor() {
    super('NotebookDB'); // Same database name as main thread

    // Version 1 - original schema
    this.version(1).stores({
      notebooks: 'id, owner_id, updated_at',
      notes: 'id, notebook_id, position, updated_at',
      pendingChanges: 'id, entityId, timestamp, synced' // Make sure synced is indexed
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
    try {
      console.log('🔍 Worker DB: Starting query for unsynced changes...');
      
      // First try to get all records to see if basic access works
      const allChanges = await this.pendingChanges.toArray();
      console.log('🔍 Worker DB: Total changes in DB:', allChanges.length);
      
      if (allChanges.length === 0) {
        console.log('🔍 Worker DB: No changes found in database');
        return [];
      }
      
      // Log structure of first record to debug
      console.log('🔍 Worker DB: Sample record structure:', allChanges[0]);
      
      // Filter manually instead of using Dexie query
      const unsyncedChanges = allChanges.filter(change => {
        console.log(`  Checking change ${change.id}: synced=${change.synced} (type: ${typeof change.synced})`);
        return change.synced === false;
      });
      
      console.log('🔍 Worker DB: Found unsynced changes:', unsyncedChanges.length);
      
      unsyncedChanges.forEach((change, index) => {
        console.log(`  ${index + 1}. ${change.operation} ${change.entity} ${change.entityId}`);
      });
      
      return unsyncedChanges;
    } catch (error) {
      console.error('❌ Worker DB: Failed to get unsynced changes:', error);
      throw error; // Re-throw to see the full error in console
    }
  }

  async markChangesSynced(ids: string[]) {
    await this.pendingChanges.where('id').anyOf(ids).modify({ synced: true });
  }
}

const workerDb = new WorkerDatabase();

// Test database connectivity on worker start
workerDb.open().then(() => {
  console.log('✅ Worker DB: Database opened successfully');
}).catch((error) => {
  console.error('❌ Worker DB: Failed to open database:', error);
});

let syncInterval: ReturnType<typeof setInterval> | undefined;
let realtimeChannel: any;

async function syncChanges() {
  postMessage({ 
    type: 'sync-status', 
    payload: { syncing: true, error: null } 
  });

  try {
    // Check if we have a valid session
    if (!currentSession) {
      console.warn('⚠️  Sync worker: No auth session, skipping sync');
      postMessage({ 
        type: 'sync-status', 
        payload: { syncing: false, error: 'No authentication session' } 
      });
      return;
    }

    // Ensure the session is set in supabase client
    await supabase.auth.setSession(currentSession);

    // Get pending changes from IndexedDB
    const pendingChanges = await workerDb.getUnsyncedChanges();
    
    console.log('🔄 Sync worker: Found', pendingChanges.length, 'pending changes');
    
    // Upload changes to Supabase - process notebooks first, then notes
    const notebookChanges = pendingChanges.filter(c => c.entity === 'notebook');
    const noteChanges = pendingChanges.filter(c => c.entity === 'note');
    
    console.log('🔄 Processing changes: notebooks first, then notes');
    console.log(`   Notebooks to sync: ${notebookChanges.length}`);
    console.log(`   Notes to sync: ${noteChanges.length}`);
    
    const orderedChanges = [...notebookChanges, ...noteChanges];
    
    for (const change of orderedChanges) {
      console.log('🔄 Processing change:', change.operation, change.entity, change.entityId);
      
      try {
        if (change.entity === 'note') {
          if (change.operation === 'delete') {
            const { error } = await supabase
              .from('notes')
              .delete()
              .eq('id', change.entityId);
            if (error) {
              console.error('❌ Note delete failed:', error);
              console.error('❌ Delete data:', { entityId: change.entityId });
              throw error;
            }
          } else {
            console.log('🔄 Attempting note upsert with data:', JSON.stringify(change.data, null, 2));
            const { data, error } = await supabase
              .from('notes')
              .upsert(change.data);
            if (error) {
              console.error('❌ Note upsert failed - Full error details:');
              console.error('   Error code:', error.code);
              console.error('   Error message:', error.message);
              console.error('   Error hint:', error.hint);
              console.error('   Error details:', error.details);
              console.error('❌ Failed data:', JSON.stringify(change.data, null, 2));
              throw error;
            }
            console.log('✅ Note upsert successful:', data);
          }
        } else if (change.entity === 'notebook') {
          if (change.operation === 'delete') {
            const { error } = await supabase
              .from('notebooks')
              .delete()
              .eq('id', change.entityId);
            if (error) {
              console.error('❌ Notebook delete failed:', error);
              throw error;
            }
          } else {
            console.log('🔄 Attempting notebook upsert with data:', JSON.stringify(change.data, null, 2));
            const { data, error } = await supabase
              .from('notebooks')
              .upsert(change.data);
            if (error) {
              console.error('❌ Notebook upsert failed:', error);
              console.error('❌ Failed data:', JSON.stringify(change.data, null, 2));
              throw error;
            }
            console.log('✅ Notebook upsert successful:', data);
          }
        }
        console.log('✅ Successfully synced:', change.operation, change.entity, change.entityId);
      } catch (error) {
        console.error('❌ Failed to sync change:', error);
        throw error; // This will cause the entire sync to fail and retry later
      }
    }

    // Mark changes as synced
    await workerDb.markChangesSynced(pendingChanges.map(c => c.id));

    // Fetch latest changes from Supabase
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    postMessage({ 
      type: 'notes-updated', 
      payload: notes 
    });

    postMessage({ 
      type: 'sync-status', 
      payload: { 
        syncing: false, 
        lastSynced: new Date(), 
        pending: 0,
        error: null 
      } 
    });
  } catch (error) {
    console.error('Sync error:', error);
    postMessage({ 
      type: 'sync-error', 
      payload: { error: error instanceof Error ? error.message : 'Unknown sync error' } 
    });
  }
}

function subscribeToRealtimeChanges(notebookId: string) {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }

  realtimeChannel = supabase
    .channel(`notebook:${notebookId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notes',
        filter: `notebook_id=eq.${notebookId}`
      },
      (payload) => {
        postMessage({ 
          type: 'realtime-update', 
          payload 
        });
      }
    )
    .subscribe();
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'sync':
      await syncChanges();
      break;
    case 'subscribe':
      subscribeToRealtimeChanges(payload.notebookId);
      break;
    case 'auth':
      // Handle auth session update
      console.log('🔐 Sync worker: Received auth session');
      currentSession = payload.session;
      if (currentSession) {
        await supabase.auth.setSession(currentSession);
        console.log('✅ Sync worker: Auth session set');
      } else {
        console.warn('⚠️  Sync worker: Received null session');
      }
      break;
  }
};

// Periodic sync every 30 seconds
syncInterval = setInterval(() => {
  syncChanges();
}, 30000);

// Helper functions are now implemented in the WorkerDatabase class above