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
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
    <p class="text-gray-600">You have {notebooks.length} notebook{notebooks.length !== 1 ? 's' : ''}</p>
  </div>
  
  <!-- Quick Actions -->
  {#if recentNotebooks.length > 0}
    <div class="mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Notebooks</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each recentNotebooks as notebook}
          <button
            onclick={() => openNotebook(notebook)}
            class="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="font-medium text-gray-900 truncate">{notebook.title}</h3>
                <p class="text-sm text-gray-500 mt-1">Updated {formatDate(notebook.updated_at)}</p>
              </div>
              <svg class="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Main Notebooks Section -->
  <div class="mb-6 flex flex-col sm:flex-row gap-4">
    <!-- Search -->
    <div class="flex-1 relative">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search notebooks..."
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
    </div>
    
    <!-- View Toggle -->
    <div class="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg p-1">
      <button
        onclick={() => viewMode = 'grid'}
        class="p-1.5 rounded"
        class:bg-gray-100={viewMode === 'grid'}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
        </svg>
      </button>
      <button
        onclick={() => viewMode = 'list'}
        class="p-1.5 rounded"
        class:bg-gray-100={viewMode === 'list'}
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>
    
    <!-- Create Button -->
    <button
      onclick={() => showCreateModal = true}
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
      <span>New Notebook</span>
    </button>
  </div>
  
  <!-- Notebooks Grid/List -->
  {#if filteredNotebooks.length === 0}
    <div class="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No notebooks</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new notebook.</p>
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
        <div
          onclick={() => openNotebook(notebook)}
          class="bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 truncate flex-1">{notebook.title}</h3>
              <button
                onclick={(e) => deleteNotebook(e, notebook.id)}
                class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
              >
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
            {#if notebook.description}
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">{notebook.description}</p>
            {/if}
            <div class="flex items-center text-xs text-gray-500">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {formatDate(notebook.updated_at)}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
            <th class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each filteredNotebooks as notebook}
            <tr 
              onclick={() => openNotebook(notebook)}
              class="hover:bg-gray-50 cursor-pointer"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{notebook.title}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500 truncate max-w-xs">{notebook.description || '—'}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(notebook.updated_at)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onclick={(e) => deleteNotebook(e, notebook.id)}
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- Create Notebook Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <h2 class="text-lg font-semibold mb-4">Create New Notebook</h2>
      
      <div class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            bind:value={newNotebookTitle}
            placeholder="My Notebook"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            autofocus
          />
        </div>
        
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            bind:value={newNotebookDescription}
            placeholder="What's this notebook about?"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div class="mt-6 flex justify-end space-x-3">
        <button
          onclick={() => showCreateModal = false}
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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