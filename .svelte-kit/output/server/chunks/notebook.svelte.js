import { P as derived } from "./index2.js";
import Dexie from "dexie";
class LocalDatabase extends Dexie {
  notebooks;
  notes;
  pendingChanges;
  constructor() {
    super("NotebookDB");
    this.version(1).stores({
      notebooks: "id, owner_id, updated_at",
      notes: "id, notebook_id, position, updated_at",
      pendingChanges: "id, entityId, timestamp, synced"
    });
  }
  async saveNote(note) {
    await this.transaction("rw", this.notes, this.pendingChanges, async () => {
      await this.notes.put(note);
      await this.pendingChanges.add({
        id: crypto.randomUUID(),
        entity: "note",
        entityId: note.id,
        operation: "update",
        data: note,
        timestamp: Date.now(),
        synced: false
      });
    });
  }
  async getUnsyncedChanges() {
    return await this.pendingChanges.where("synced").equals(0).toArray();
  }
  async markChangesSynced(ids) {
    await this.pendingChanges.where("id").anyOf(ids).modify({ synced: true });
  }
}
const db = new LocalDatabase();
class NotebookStore {
  _notebooks = [];
  _currentNotebook = null;
  _notes = [];
  _currentNote = null;
  _syncStatus = { lastSynced: null, pending: 0, syncing: false, error: null };
  syncWorker = null;
  #sortedNotes = derived(() => this._notes.slice().sort((a, b) => a.position - b.position));
  get sortedNotes() {
    return this.#sortedNotes();
  }
  set sortedNotes($$value) {
    return this.#sortedNotes($$value);
  }
  constructor() {
    if (typeof window !== "undefined") {
      this.initializeWorker();
      this.loadLocalData();
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
  initializeWorker() {
    this.syncWorker = new Worker(new URL("$lib/workers/sync.worker.ts", import.meta.url), { type: "module" });
    this.syncWorker.onmessage = (event) => {
      const { type, payload } = event.data;
      switch (type) {
        case "sync-status":
          this._syncStatus = payload;
          break;
        case "notes-updated":
          this.handleRemoteNotesUpdate(payload);
          break;
        case "sync-error":
          this._syncStatus.error = payload.error;
          this._syncStatus.syncing = false;
          break;
      }
    };
  }
  async loadLocalData() {
    try {
      this._notebooks = await db.notebooks.toArray();
      if (this._currentNotebook) {
        this._notes = await db.notes.where("notebook_id").equals(this._currentNotebook.id).toArray();
      }
    } catch (error) {
      console.error("Failed to load local data:", error);
    }
  }
  async selectNotebook(notebookId) {
    const notebook = await db.notebooks.get(notebookId);
    if (notebook) {
      this._currentNotebook = notebook;
      this._notes = await db.notes.where("notebook_id").equals(notebookId).toArray();
    }
  }
  async createNotebook(data) {
    const notebook = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      owner_id: "current-user",
      // Should come from authStore.user.id
      created_at: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
      settings: {
        defaultNoteType: "markdown",
        collaborators: [],
        isPublic: false
      }
    };
    await db.notebooks.put(notebook);
    await db.pendingChanges.add({
      id: crypto.randomUUID(),
      entity: "notebook",
      entityId: notebook.id,
      operation: "create",
      data: notebook,
      timestamp: Date.now(),
      synced: false
    });
    this._notebooks = [...this._notebooks, notebook];
    this.requestSync();
    return notebook;
  }
  async updateNotebook(notebookId, updates) {
    const notebook = this._notebooks.find((n) => n.id === notebookId);
    if (!notebook) return null;
    const updatedNotebook = {
      ...notebook,
      ...updates,
      updated_at: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
    };
    await db.notebooks.put(updatedNotebook);
    await db.pendingChanges.add({
      id: crypto.randomUUID(),
      entity: "notebook",
      entityId: notebookId,
      operation: "update",
      data: updatedNotebook,
      timestamp: Date.now(),
      synced: false
    });
    const index = this._notebooks.findIndex((n) => n.id === notebookId);
    if (index >= 0) {
      this._notebooks[index] = updatedNotebook;
    }
    if (this._currentNotebook?.id === notebookId) {
      this._currentNotebook = updatedNotebook;
    }
    this.requestSync();
    return updatedNotebook;
  }
  async deleteNotebook(notebookId) {
    const notebook = this._notebooks.find((n) => n.id === notebookId);
    if (!notebook) return;
    const deletedNotebook = {
      ...notebook,
      deleted: true,
      updated_at: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
    };
    await db.notebooks.put(deletedNotebook);
    await db.pendingChanges.add({
      id: crypto.randomUUID(),
      entity: "notebook",
      entityId: notebookId,
      operation: "delete",
      data: { id: notebookId, deleted: true },
      timestamp: Date.now(),
      synced: false
    });
    this._notebooks = this._notebooks.filter((n) => n.id !== notebookId);
    await db.notes.where("notebook_id").equals(notebookId).delete();
    if (this._currentNotebook?.id === notebookId) {
      this._currentNotebook = null;
      this._notes = [];
    }
    this.requestSync();
  }
  async createNote(type, title = "Untitled") {
    if (!this._currentNotebook) return null;
    const note = {
      id: crypto.randomUUID(),
      notebook_id: this._currentNotebook.id,
      type,
      title,
      content: "",
      position: this._notes.length,
      created_at: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
      created_by: "current-user",
      // Will be replaced with actual user ID
      last_modified_by: "current-user",
      version: 1
    };
    await db.saveNote(note);
    this._notes = [...this._notes, note];
    this._currentNote = note;
    this.requestSync();
    return note;
  }
  async updateNote(noteId, updates) {
    const noteIndex = this._notes.findIndex((n) => n.id === noteId);
    if (noteIndex === -1) return;
    const updatedNote = {
      ...this._notes[noteIndex],
      ...updates,
      updated_at: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString(),
      version: this._notes[noteIndex].version + 1
    };
    await db.saveNote(updatedNote);
    this._notes[noteIndex] = updatedNote;
    if (this._currentNote?.id === noteId) {
      this._currentNote = updatedNote;
    }
    this.requestSync();
  }
  requestSync() {
    if (this.syncWorker && !this._syncStatus.syncing) {
      this.syncWorker.postMessage({ type: "sync" });
    }
  }
  async handleRemoteNotesUpdate(notes) {
    for (const remoteNote of notes) {
      const localNote = this._notes.find((n) => n.id === remoteNote.id);
      if (!localNote || remoteNote.version > localNote.version) {
        await db.notes.put(remoteNote);
        const index = this._notes.findIndex((n) => n.id === remoteNote.id);
        if (index >= 0) {
          this._notes[index] = remoteNote;
        } else {
          this._notes = [...this._notes, remoteNote];
        }
      }
    }
  }
  destroy() {
    this.syncWorker?.terminate();
  }
}
const notebookStore = new NotebookStore();
export {
  notebookStore as n
};
