<!-- src/routes/notebook/[id]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { notebookStore } from '$lib/stores/notebook.svelte';
  import { getAvailableRenderers, getRendererConfig, getDefaultContent } from '$lib/renderers';
  import NoteEditor from '$lib/components/NoteEditor.svelte';
  import type { Note, NoteType } from '$lib/types';
  
  $effect(() => {
    notebookStore.selectNotebook($page.params.id);
  });
  
  const notebook = $derived(notebookStore.currentNotebook);
  const notes = $derived(notebookStore.sortedNotes);
  const syncStatus = $derived(notebookStore.syncStatus);
  const availableRenderers = getAvailableRenderers();
  
  let selectedNote = $state<Note | null>(null);
  let showCreateNoteModal = $state(false);
  let newNoteType = $state<NoteType>('markdown');
  let newNoteTitle = $state('');
  let showQuickCreate = $state(false);
  
  async function createNote(type?: NoteType, title?: string) {
    const noteType = type || newNoteType;
    const noteTitle = title || newNoteTitle || `Untitled ${getRendererConfig(noteType).name}`;
    const defaultContent = getDefaultContent(noteType);
    
    const note = await notebookStore.createNote(noteType, noteTitle, defaultContent);
    selectedNote = note;
    
    // Reset modal state
    showCreateNoteModal = false;
    newNoteTitle = '';
    newNoteType = notebook?.settings.defaultNoteType || 'markdown';
  }
  
  function openCreateNoteModal() {
    newNoteType = notebook?.settings.defaultNoteType || 'markdown';
    newNoteTitle = '';
    showCreateNoteModal = true;
  }
  
  function selectNote(note: Note) {
    selectedNote = note;
  }
  
  async function updateNoteContent(noteId: string, content: string) {
    await notebookStore.updateNote(noteId, { content });
  }
  
  async function deleteNote(noteId: string) {
    if (confirm('Are you sure you want to delete this note?')) {
      await notebookStore.deleteNote(noteId);
      if (selectedNote?.id === noteId) {
        selectedNote = null;
      }
    }
  }
</script>

<div class="flex h-screen">
  <!-- Sidebar -->
  <aside class="w-64 border-r bg-gray-50 p-4 flex flex-col">
    <div class="mb-4">
      <h2 class="text-lg font-semibold">{notebook?.title}</h2>
      <div class="text-sm text-gray-500">
        {#if syncStatus.syncing}
          Syncing...
        {:else if syncStatus.lastSynced}
          Last synced: {syncStatus.lastSynced.toLocaleTimeString()}
        {:else}
          Not synced
        {/if}
      </div>
    </div>
    
    <!-- Create Note Section -->
    <div class="mb-4 space-y-2">
      {#if showQuickCreate}
        <!-- Quick create buttons for each type -->
        <div class="grid grid-cols-2 gap-2">
          {#each availableRenderers as { type, config }}
            <button
              onclick={() => createNote(type)}
              class="p-2 text-xs bg-white border rounded hover:bg-gray-100 flex flex-col items-center"
              title={config.description}
            >
              <span class="text-lg mb-1">
                {#if config.icon === 'markdown'}📝
                {:else if config.icon === 'music'}🎵
                {:else if config.icon === 'code'}💻
                {:else}📄{/if}
              </span>
              <span>{config.name}</span>
            </button>
          {/each}
        </div>
        <button
          onclick={() => showQuickCreate = false}
          class="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      {:else}
        <button 
          onclick={openCreateNoteModal}
          class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Note
        </button>
        <button 
          onclick={() => showQuickCreate = true}
          class="w-full px-4 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          Quick Create →
        </button>
      {/if}
    </div>
    
    <div class="flex-1 overflow-y-auto space-y-2">
      {#each notes as note}
        <button
          onclick={() => selectNote(note)}
          class="w-full text-left p-2 rounded hover:bg-gray-100 group relative"
          class:bg-blue-100={selectedNote?.id === note.id}
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{note.title}</div>
              <div class="text-xs text-gray-500 flex items-center gap-1">
                <span class="inline-block px-1.5 py-0.5 bg-gray-200 rounded text-xs">
                  {getRendererConfig(note.type).name}
                </span>
              </div>
            </div>
            <div
              onclick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
              class="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
              title="Delete note"
            >
              <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
          </div>
        </button>
      {/each}
    </div>
  </aside>
  
  <!-- Main content -->
  <main class="flex-1 flex flex-col overflow-hidden">
    {#if selectedNote}
      <NoteEditor 
        note={selectedNote}
        onUpdate={(updates) => notebookStore.updateNote(selectedNote.id, updates)}
        onDelete={() => deleteNote(selectedNote.id)}
      />
    {:else}
      <div class="flex items-center justify-center h-full text-gray-400">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="mt-2">Select a note or create a new one</p>
        </div>
      </div>
    {/if}
  </main>
</div>

<!-- Create Note Modal -->
{#if showCreateNoteModal}
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <h2 class="text-lg font-semibold mb-4">Create New Note</h2>
      
      <div class="space-y-4">
        <div>
          <label for="noteTitle" class="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="noteTitle"
            type="text"
            bind:value={newNoteTitle}
            placeholder="Enter note title..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            autofocus
          />
        </div>
        
        <div>
          <label for="noteType" class="block text-sm font-medium text-gray-700 mb-1">
            Note Type
          </label>
          <div class="space-y-2">
            {#each availableRenderers as { type, config }}
              <label class="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                class:border-blue-500={newNoteType === type}
                class:bg-blue-50={newNoteType === type}
              >
                <input
                  type="radio"
                  name="noteType"
                  value={type}
                  bind:group={newNoteType}
                  class="mt-1 mr-3"
                />
                <div class="flex-1">
                  <div class="font-medium text-gray-900">
                    {config.name}
                    {#if config.fileExtension}
                      <span class="text-xs text-gray-500 ml-1">({config.fileExtension})</span>
                    {/if}
                  </div>
                  <div class="text-sm text-gray-600 mt-0.5">{config.description}</div>
                </div>
              </label>
            {/each}
          </div>
        </div>
        
        {#if getRendererConfig(newNoteType).defaultContent}
          <div class="p-3 bg-gray-50 rounded-lg">
            <div class="text-xs font-medium text-gray-500 mb-1">Preview:</div>
            <pre class="text-xs text-gray-600 whitespace-pre-wrap font-mono">
              {getRendererConfig(newNoteType).defaultContent?.slice(0, 100)}...
            </pre>
          </div>
        {/if}
      </div>
      
      <div class="mt-6 flex justify-end space-x-3">
        <button
          onclick={() => showCreateNoteModal = false}
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onclick={() => createNote()}
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Note
        </button>
      </div>
    </div>
  </div>
{/if}