// src/lib/workers/sync.worker.ts
import { createClient } from '@supabase/supabase-js';
import type { Note, Notebook } from '$lib/types';
import { db } from '$lib/db/local';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface WorkerMessage {
  type: 'sync' | 'auth' | 'subscribe';
  payload?: any;
}

let syncInterval: ReturnType<typeof setInterval> | undefined;
let realtimeChannel: any;

async function syncChanges() {
  postMessage({ 
    type: 'sync-status', 
    payload: { syncing: true, error: null } 
  });

  try {
    // Get pending changes from IndexedDB
    const pendingChanges = await db.getUnsyncedChanges();
    
    // Upload changes to Supabase
    for (const change of pendingChanges) {
      if (change.entity === 'note') {
        if (change.operation === 'delete') {
          await supabase
            .from('notes')
            .delete()
            .eq('id', change.entityId);
        } else {
          await supabase
            .from('notes')
            .upsert(change.data);
        }
      } else if (change.entity === 'notebook') {
        if (change.operation === 'delete') {
          await supabase
            .from('notebooks')
            .delete()
            .eq('id', change.entityId);
        } else {
          await supabase
            .from('notebooks')
            .upsert(change.data);
        }
      }
    }

    // Mark changes as synced
    await db.markChangesSynced(pendingChanges.map(c => c.id));

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
      // Handle auth token refresh
      supabase.auth.setSession(payload.session);
      break;
  }
};

// Periodic sync every 30 seconds
syncInterval = setInterval(() => {
  syncChanges();
}, 30000);

// Helper functions to interact with IndexedDB from worker
async function getPendingChanges() {
  // Implementation to read from IndexedDB
  return [];
}

async function markChangesSynced(ids: string[]) {
  // Implementation to update IndexedDB
}