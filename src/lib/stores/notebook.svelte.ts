// src/lib/stores/notebook.svelte.ts
import { db } from '$lib/db/local';
import { settingsStore } from './settings.svelte';
import type { Note, Notebook, NoteType, SyncStatus } from '$lib/types';

class NotebookStore {
  private _notebooks = $state<Notebook[]>([]);
  private _currentNotebook = $state<Notebook | null>(null);
  private _notes = $state<Note[]>([]);
  private _currentNote = $state<Note | null>(null);
  private _syncStatus = $state<SyncStatus>({
    lastSynced: null,
    pending: 0,
    syncing: false,
    error: null
  });
  private syncWorker: Worker | null = null;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  sortedNotes = $derived(this._notes.slice().sort((a, b) => a.position - b.position));

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWorker();
      this.loadLocalData();
      this.setupAutoSync();
    }
  }

  // Getters using $derived
  get notebooks() {
    return this._notebooks;
  }

  get currentNotebook() {
    return this._currentNotebook;
  }

  get notes() {
    return this._notes;
  }

  get currentNote() {
    return this._currentNote;
  }

  get syncStatus() {
    return this._syncStatus;
  }



  private initializeWorker() {
    try {
      console.log('🔧 Initializing sync worker...');
      this.syncWorker = new Worker(
        new URL('$lib/workers/sync.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.syncWorker.onmessage = (event) => {
        console.log('📨 Worker message received:', event.data);
        const { type, payload } = event.data;
        
        switch (type) {
          case 'sync-status':
            this._syncStatus = payload;
            break;
          case 'notes-updated':
            this.handleRemoteNotesUpdate(payload);
            break;
          case 'sync-error':
            console.error('🚨 Sync worker error:', payload.error);
            this._syncStatus.error = payload.error;
            this._syncStatus.syncing = false;
            break;
        }
      };

      this.syncWorker.onerror = (error) => {
        console.error('🚨 Sync worker error:', error);
        this._syncStatus.error = 'Worker initialization failed';
        this._syncStatus.syncing = false;
      };

      this.syncWorker.onmessageerror = (error) => {
        console.error('🚨 Sync worker message error:', error);
      };

      console.log('✅ Sync worker initialized successfully');
      
      // Try to get initial auth session and send to worker
      setTimeout(async () => {
        try {
          const { authStore } = await import('./auth.svelte');
          if (authStore.session) {
            console.log('🔐 Sending initial auth session to sync worker');
            this.updateAuthSession(authStore.session);
          }
        } catch (error) {
          console.warn('⚠️  Could not get initial auth session:', error);
        }
      }, 100); // Small delay to ensure auth store is initialized
      
    } catch (error) {
      console.error('🚨 Failed to initialize sync worker:', error);
      this._syncStatus.error = 'Failed to initialize sync worker';
    }
  }

  async loadLocalData() {
    try {
      this._notebooks = await db.notebooks.toArray();
      if (this._currentNotebook) {
        this._notes = await db.notes
          .where('notebook_id')
          .equals(this._currentNotebook.id)
          .toArray();
      }
    } catch (error) {
      console.error('Failed to load local data:', error);
    }
  }

  async selectNotebook(notebookId: string) {
    const notebook = await db.notebooks.get(notebookId);
    if (notebook) {
      this._currentNotebook = notebook;
      this._notes = await db.notes
        .where('notebook_id')
        .equals(notebookId)
        .toArray();
    }
  }

  async createNotebook(data: { title: string; description?: string }) {
    // Get actual user ID from auth store
    let userId: string;
    try {
      const { authStore } = await import('./auth.svelte');
      userId = authStore.user?.id || 'unknown-user';
      if (userId === 'unknown-user') {
        throw new Error('User not authenticated');
      }
    } catch (error) {
      console.error('❌ Cannot create notebook: user not authenticated');
      throw new Error('User authentication required');
    }

    const notebook: Notebook = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      owner_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      settings: {
        defaultNoteType: 'markdown',
        collaborators: [],
        isPublic: false
      }
    };

    // Save to local database
    await db.notebooks.put(notebook);
    
    // Add to pending changes for sync
    await db.pendingChanges.add({
      id: crypto.randomUUID(),
      entity: 'notebook',
      entityId: notebook.id,
      operation: 'create',
      data: notebook,
      timestamp: Date.now(),
      synced: false
    });

    // Update local state
    this._notebooks = [...this._notebooks, notebook];
    
    // Trigger sync
    this.requestSync();
    
    return notebook;
  }

  async updateNotebook(notebookId: string, updates: Partial<Notebook>) {
    const notebook = this._notebooks.find(n => n.id === notebookId);
    if (!notebook) return null;

    const updatedNotebook = {
      ...JSON.parse(JSON.stringify(notebook)),
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Save to local database
    await db.notebooks.put(updatedNotebook);
    
    // Add to pending changes
    await db.pendingChanges.add({
      id: crypto.randomUUID(),
      entity: 'notebook',
      entityId: notebookId,
      operation: 'update',
      data: updatedNotebook,
      timestamp: Date.now(),
      synced: false
    });

    // Update local state
    const index = this._notebooks.findIndex(n => n.id === notebookId);
    if (index >= 0) {
      this._notebooks[index] = updatedNotebook;
    }
    
    if (this._currentNotebook?.id === notebookId) {
      this._currentNotebook = updatedNotebook;
    }
    
    this.requestSync();
    
    return updatedNotebook;
  }

  async deleteNotebook(notebookId: string) {
    // Mark as deleted (soft delete for sync)
    const notebook = this._notebooks.find(n => n.id === notebookId);
    if (!notebook) return;

    const deletedNotebook = {
      ...JSON.parse(JSON.stringify(notebook)),
      deleted: true,
      updated_at: new Date().toISOString()
    };

    // Update in local database
    await db.notebooks.put(deletedNotebook);
    
    // Add to pending changes
    await db.pendingChanges.add({
      id: crypto.randomUUID(),
      entity: 'notebook',
      entityId: notebookId,
      operation: 'delete',
      data: { id: notebookId, deleted: true },
      timestamp: Date.now(),
      synced: false
    });

    // Remove from local state
    this._notebooks = this._notebooks.filter(n => n.id !== notebookId);
    
    // Also delete all notes in this notebook
    await db.notes.where('notebook_id').equals(notebookId).delete();
    
    if (this._currentNotebook?.id === notebookId) {
      this._currentNotebook = null;
      this._notes = [];
    }
    
    this.requestSync();
  }

  async createNote(type: NoteType, title: string = 'Untitled') {
    if (!this._currentNotebook) return null;

    // Get actual user ID from auth store
    let userId: string;
    try {
      const { authStore } = await import('./auth.svelte');
      userId = authStore.user?.id || 'unknown-user';
      if (userId === 'unknown-user') {
        throw new Error('User not authenticated');
      }
    } catch (error) {
      console.error('❌ Cannot create note: user not authenticated');
      throw new Error('User authentication required');
    }

    const note: Note = {
      id: crypto.randomUUID(),
      notebook_id: this._currentNotebook.id,
      type,
      title,
      content: '',
      position: this._notes.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: userId,
      last_modified_by: userId,
      version: 1
    };

    // Save to local database
    await db.notes.put(note);

    // Add to pending changes for sync (as 'create' operation)
    await db.pendingChanges.add({
      id: crypto.randomUUID(),
      entity: 'note',
      entityId: note.id,
      operation: 'create',
      data: note,
      timestamp: Date.now(),
      synced: false
    });

    this._notes = [...this._notes, note];
    this._currentNote = note;

    // Trigger sync
    this.requestSync();
    
    return note;
  }

  async updateNote(noteId: string, updates: Partial<Note>) {
    const noteIndex = this._notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) return;

    const updatedNote = {
      ...JSON.parse(JSON.stringify(this._notes[noteIndex])),
      ...updates,
      updated_at: new Date().toISOString(),
      version: this._notes[noteIndex].version + 1
    };

    // Save to local database
    await db.notes.put(updatedNote);

    // Add to pending changes for sync
    await db.pendingChanges.add({
      id: crypto.randomUUID(),
      entity: 'note',
      entityId: noteId,
      operation: 'update',
      data: updatedNote,
      timestamp: Date.now(),
      synced: false
    });

    this._notes[noteIndex] = updatedNote;

    if (this._currentNote?.id === noteId) {
      this._currentNote = updatedNote;
    }

    this.requestSync();
  }

  async deleteNote(noteId: string) {
    const noteIndex = this._notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) return;

    const note = this._notes[noteIndex];
    const deletedNote = {
      ...JSON.parse(JSON.stringify(note)),
      deleted: true,
      updated_at: new Date().toISOString(),
      version: note.version + 1
    };

    // Update in local database (soft delete)
    await db.notes.put(deletedNote);
    
    // Add to pending changes
    await db.pendingChanges.add({
      id: crypto.randomUUID(),
      entity: 'note',
      entityId: noteId,
      operation: 'delete',
      data: { id: noteId, deleted: true },
      timestamp: Date.now(),
      synced: false
    });

    // Remove from local state
    this._notes = this._notes.filter(n => n.id !== noteId);
    
    if (this._currentNote?.id === noteId) {
      this._currentNote = null;
    }
    
    this.requestSync();
  }

  private requestSync() {
    if (this.syncWorker && !this._syncStatus.syncing) {
      this.syncWorker.postMessage({ type: 'sync' });
    }
  }

  // Method to update auth session in the sync worker
  updateAuthSession(session: any) {
    console.log('🔐 Notebook store: Updating auth session in sync worker');
    if (this.syncWorker) {
      this.syncWorker.postMessage({ type: 'auth', payload: { session } });
    }
  }

  // Manual sync methods for different levels
  async manualSyncAll() {
    console.log('🔄 Manual sync all requested');
    this.requestSync();
  }

  async manualSyncNotebook(notebookId?: string) {
    const targetId = notebookId || this._currentNotebook?.id;
    if (!targetId) {
      console.warn('⚠️ No notebook ID provided for manual sync');
      return;
    }
    
    console.log('🔄 Manual sync notebook requested:', targetId);
    if (this.syncWorker && !this._syncStatus.syncing) {
      this.syncWorker.postMessage({ 
        type: 'sync',
        filter: { type: 'notebook', id: targetId }
      });
    }
  }

  async manualSyncNote(noteId?: string) {
    const targetId = noteId || this._currentNote?.id;
    if (!targetId) {
      console.warn('⚠️ No note ID provided for manual sync');
      return;
    }
    
    console.log('🔄 Manual sync note requested:', targetId);
    if (this.syncWorker && !this._syncStatus.syncing) {
      this.syncWorker.postMessage({ 
        type: 'sync',
        filter: { type: 'note', id: targetId }
      });
    }
  }

  private async handleRemoteNotesUpdate(notes: Note[]) {
    // Merge remote changes with local data
    for (const remoteNote of notes) {
      const localNote = this._notes.find(n => n.id === remoteNote.id);
      
      if (!localNote || remoteNote.version > localNote.version) {
        await db.notes.put(remoteNote);
        const index = this._notes.findIndex(n => n.id === remoteNote.id);
        if (index >= 0) {
          this._notes[index] = remoteNote;
        } else {
          this._notes = [...this._notes, remoteNote];
        }
      }
    }
  }

  private setupAutoSync() {
    const settings = settingsStore.settings;
    
    // Set up initial auto-sync based on current settings
    this.updateAutoSync(settings.autoSync, settings.syncInterval);
  }
  
  // Method to manually update auto-sync settings (called from settings changes)
  updateAutoSyncSettings() {
    const settings = settingsStore.settings;
    this.updateAutoSync(settings.autoSync, settings.syncInterval);
  }
  
  private updateAutoSync(enabled: boolean, interval: number) {
    // Clear existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    // Set up new interval if enabled
    if (enabled && interval > 0) {
      this.syncInterval = setInterval(() => {
        if (!this._syncStatus.syncing) {
          this.requestSync();
        }
      }, interval * 1000);
      
      console.log(`📅 Auto-sync updated: every ${interval} seconds`);
    } else {
      console.log('📅 Auto-sync disabled');
    }
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncWorker?.terminate();
  }
}

export const notebookStore = new NotebookStore();