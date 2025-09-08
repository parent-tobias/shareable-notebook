<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { notebookStore } from '$lib/stores/notebook.svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import type { Notebook } from '$lib/types';

 
  
  const notebooks = $derived(notebookStore.notebooks);
  const user = $derived(authStore.user);
  
  let showCreateModal = $state(false);
  let newNotebookTitle = $state('');
  let newNotebookDescription = $state('');
  let searchQuery = $state('');
  let viewMode = $state<'grid' | 'list'>('grid');
  let modalElement = $state<HTMLDivElement | undefined>();
  
  const filteredNotebooks = $derived(
    notebooks.filter(nb => 
      nb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nb.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const recentNotebooks = $derived(
    [...notebooks]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3)
  );
  
  onMount(() => {
    notebookStore.loadLocalData();
  });
  
  async function createNotebook() {
    if (!newNotebookTitle.trim()) return;
    
    const notebook = await notebookStore.createNotebook({
      title: newNotebookTitle,
      description: newNotebookDescription
    });
    
    if (notebook) {
      showCreateModal = false;
      newNotebookTitle = '';
      newNotebookDescription = '';
      goto(`/notebook/${notebook.id}`);
    }
  }
  
  function openNotebook(notebook: Notebook) {
    goto(`/notebook/${notebook.id}`);
  }
  
  async function deleteNotebook(e: Event, notebookId: string) {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this notebook? This action cannot be undone.')) {
      await notebookStore.deleteNotebook(notebookId);
    }
  }
  
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function handleKeyDown(e: KeyboardEvent) {
    // Escape key to close modal
    if (e.key === 'Escape' && showCreateModal) {
      showCreateModal = false;
    }
  }

  // Focus management for modal
  $effect(() => {
    if (showCreateModal) {
      // Focus the title input when modal opens
      const titleInput = modalElement?.querySelector('#title') as HTMLInputElement;
      if (titleInput) {
        setTimeout(() => titleInput.focus(), 0);
      }
    }
  });
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h1>
    <p class="text-gray-600 dark:text-gray-300">You have {notebooks.length} notebook{notebooks.length !== 1 ? 's' : ''}</p>
  </div>
  
  <!-- Quick Actions -->
  {#if recentNotebooks.length > 0}
    <section class="mb-8" aria-labelledby="recent-notebooks">
      <h2 id="recent-notebooks" class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Notebooks</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each recentNotebooks as notebook}
          <button
            onclick={() => openNotebook(notebook)}
            class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:shadow-md transition-all text-left"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900 dark:text-white truncate">{notebook.title}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Updated {formatDate(notebook.updated_at)}</p>
              </div>
              <svg class="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </button>
        {/each}
      </div>
    </section>
  {/if}
  
  <!-- Main Notebooks Section -->
  <section class="mb-6 flex flex-col sm:flex-row gap-4" aria-label="Notebook management">
    <!-- Search -->
    <div class="flex-1 relative">
      <label for="search-notebooks" class="sr-only">Search notebooks</label>
      <input
        id="search-notebooks"
        type="text"
        bind:value={searchQuery}
        placeholder="Search notebooks..."
        class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
      />
      <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
    </div>
    
    <!-- View Toggle -->
    <div class="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
      <button
        onclick={() => viewMode = 'grid'}
        class="p-1.5 rounded"
        class:bg-gray-100={viewMode === 'grid'}
        class:dark:bg-gray-700={viewMode === 'grid'}
        aria-label="Switch to grid view"
        aria-pressed={viewMode === 'grid'}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
        </svg>
      </button>
      <button
        onclick={() => viewMode = 'list'}
        class="p-1.5 rounded"
        class:bg-gray-100={viewMode === 'list'}
        class:dark:bg-gray-700={viewMode === 'list'}
        aria-label="Switch to list view"
        aria-pressed={viewMode === 'list'}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>
    
    <!-- Create Button -->
    <button
      onclick={() => showCreateModal = true}
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
      <span>New Notebook</span>
    </button>
  </section>
  
  <!-- Notebooks Grid/List -->
  <main aria-label="Notebooks list">
  {#if filteredNotebooks.length === 0}
    <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notebooks</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new notebook.</p>
      <div class="mt-6">
        <button
          onclick={() => showCreateModal = true}
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Create your first notebook
        </button>
      </div>
    </div>
  {:else if viewMode === 'grid'}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filteredNotebooks as notebook}
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:shadow-lg transition-all group relative">
          <button
            onclick={() => openNotebook(notebook)}
            class="w-full text-left p-6 rounded-lg"
          >
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1 pr-8">{notebook.title}</h3>
            </div>
            {#if notebook.description}
              <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{notebook.description}</p>
            {/if}
            <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {formatDate(notebook.updated_at)}
            </div>
          </button>
          <button
            onclick={(e) => deleteNotebook(e, notebook.id)}
            class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-label="Delete notebook: {notebook.title}"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      {/each}
    </div>
  {:else}
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200" aria-label="Notebooks list">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" scope="col">Title</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" scope="col">Description</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" scope="col">Last Updated</th>
            <th class="relative px-6 py-3" scope="col"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
          {#each filteredNotebooks as notebook}
            <tr 
              onclick={() => openNotebook(notebook)}
              class="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">{notebook.title}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{notebook.description || '—'}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formatDate(notebook.updated_at)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    onclick={(e) => {
                      e.stopPropagation();
                      notebookStore.manualSyncNotebook(notebook.id);
                    }}
                    class="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                    class:animate-spin={notebookStore.syncStatus.syncing}
                    disabled={notebookStore.syncStatus.syncing}
                    aria-label="Sync notebook: {notebook.title}"
                    title="Sync this notebook"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </button>
                  <button
                    onclick={(e) => deleteNotebook(e, notebook.id)}
                    class="text-red-600 hover:text-red-900"
                    aria-label="Delete notebook: {notebook.title}"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
  </main>
</div>

<!-- Create Notebook Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50" role="dialog" aria-labelledby="create-modal-title" aria-modal="true">
    <div bind:this={modalElement} class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
      <h2 id="create-modal-title" class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Notebook</h2>
      
      <div class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            bind:value={newNotebookTitle}
            placeholder="My Notebook"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            bind:value={newNotebookDescription}
            placeholder="What's this notebook about?"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          ></textarea>
        </div>
      </div>
      
      <div class="mt-6 flex justify-end space-x-3">
        <button
          onclick={() => showCreateModal = false}
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
        >
          Cancel
        </button>
        <button
          onclick={createNotebook}
          disabled={!newNotebookTitle.trim()}
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create
        </button>
      </div>
    </div>
  </div>
{/if}