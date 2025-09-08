<!-- src/routes/notebook/[id]/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { notebookStore } from '$lib/stores/notebook.svelte';
  import { getAvailableRenderers, getRendererConfig } from '$lib/renderers';
  import NoteEditor from '$lib/components/NoteEditor.svelte';
  import type { Note, NoteType } from '$lib/types';

   // In your notebook page component
  import { testSupabaseConnection } from '$lib/utils/supabase-test';

  onMount(async () => {
    console.log('🔍 Environment check:', {
      hasWorker: typeof Worker !== 'undefined',
      hasIndexedDB: typeof indexedDB !== 'undefined',
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.slice(0, 20) + '...',
      nodeEnv: import.meta.env.MODE
    });
    
    // Test basic worker creation first
    console.log('🧪 Testing worker creation...');
    try {
      const testWorker = new Worker(
        new URL('$lib/workers/test.worker.ts', import.meta.url),
        { type: 'module' }
      );
      testWorker.onmessage = (event) => {
        console.log('✅ Test worker response:', event.data);
        testWorker.terminate();
      };
      testWorker.onerror = (error) => {
        console.error('🚨 Test worker error:', error);
      };
      testWorker.postMessage({ test: 'hello' });
    } catch (error) {
      console.error('🚨 Worker creation failed:', error);
    }
    
    // Test Supabase connection
    console.log('🧪 Testing Supabase connection...');
    const supabaseResult = await testSupabaseConnection();
    console.log('Supabase connection:', supabaseResult);
  });


  $effect(() => {
    if ($page.params.id) {
      notebookStore.selectNotebook($page.params.id);
    }
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
    
    const note = await notebookStore.createNote(noteType, noteTitle);
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
  <aside class="w-64 border-r bg-gray-50 dark:bg-gray-800 dark:border-gray-600 p-4 flex flex-col">
    <div class="mb-4">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{notebook?.title}</h2>
      <div class="text-sm text-gray-500 dark:text-gray-400">
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
              class="p-2 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 flex flex-col items-center text-gray-900 dark:text-white"
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
          class="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
          class="w-full px-4 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Quick Create →
        </button>
      {/if}
    </div>
    
    <div class="flex-1 overflow-y-auto space-y-2">
      {#each notes as note}
        <div class="w-full p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 group relative" class:bg-blue-100={selectedNote?.id === note.id} class:dark:bg-blue-900={selectedNote?.id === note.id}>
          <button
            onclick={() => selectNote(note)}
            class="w-full text-left"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0 pr-6">
                <div class="font-medium text-gray-900 dark:text-white truncate">{note.title}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span class="inline-block px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300">
                    {getRendererConfig(note.type).name}
                  </span>
                </div>
              </div>
            </div>
          </button>
          <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1">
            <button
              onclick={(e) => { 
                e.stopPropagation(); 
                notebookStore.manualSyncNote(note.id); 
              }}
              class="p-1 hover:bg-blue-100 rounded disabled:opacity-50"
              class:animate-spin={syncStatus.syncing}
              disabled={syncStatus.syncing}
              aria-label="Sync note: {note.title}"
              title="Sync this note"
            >
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
            <button
              onclick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
              class="p-1 hover:bg-red-100 rounded"
              aria-label="Delete note: {note.title}"
            >
              <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      {/each}
    </div>
  </aside>
  
  <!-- Main content -->
  <main class="flex-1 flex flex-col overflow-hidden">
    {#if selectedNote}
      <NoteEditor 
        note={selectedNote}
        onUpdate={(updates) => selectedNote && notebookStore.updateNote(selectedNote.id, updates)}
        onDelete={() => selectedNote && deleteNote(selectedNote.id)}
      />
    {:else}
      <div class="flex items-center justify-center h-full text-gray-400">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="mt-2 text-gray-500 dark:text-gray-400">Select a note or create a new one</p>
        </div>
      </div>
    {/if}
  </main>
</div>

<!-- Create Note Modal -->
{#if showCreateNoteModal}
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Note</h2>
      
      <div class="space-y-4">
        <div>
          <label for="noteTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            id="noteTitle"
            type="text"
            bind:value={newNoteTitle}
            placeholder="Enter note title..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        
        <div>
          <label for="noteType" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Note Type
          </label>
          <div class="space-y-2">
            {#each availableRenderers as { type, config }}
              <label class="flex items-start p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-800"
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
                  <div class="font-medium text-gray-900 dark:text-white">
                    {config.name}
                    {#if config.fileExtension}
                      <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">({config.fileExtension})</span>
                    {/if}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{config.description}</div>
                </div>
              </label>
            {/each}
          </div>
        </div>
        
        {#if getRendererConfig(newNoteType).defaultContent}
          <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Preview:</div>
            <pre class="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-mono">
              {getRendererConfig(newNoteType).defaultContent?.slice(0, 100)}...
            </pre>
          </div>
        {/if}
      </div>
      
      <div class="mt-6 flex justify-end space-x-3">
        <button
          onclick={() => showCreateNoteModal = false}
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
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