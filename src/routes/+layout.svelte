<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth.svelte';
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { notebookStore } from '$lib/stores/notebook.svelte';
  import { setupGlobalErrorHandling } from '$lib/utils/error-tracker';
  import Settings from '$lib/components/Settings.svelte';
  import '../app.css';
  
  let { children } = $props();
  
  const user = $derived(authStore.user);
  const loading = $derived(authStore.loading);
  const isAuthPage = $derived($page.route.id === '/auth');
  const isDarkMode = $derived(settingsStore.isDarkMode);
  
  let showSettings = $state(false);
  
  onMount(() => {
    // Set up global error handling for better debugging
    setupGlobalErrorHandling();
    authStore.initialize();
    
    // Ensure settings are applied (in case constructor didn't run)
    if (settingsStore.settings) {
      console.log('🔧 Re-applying settings in layout onMount');
      settingsStore.updateSettings({}); // This will re-apply all settings
    }
  });
  
  // Set up reactive auto-sync when settings change
  $effect(() => {
    if (user && settingsStore.settings) {
      // Update auto-sync when settings change
      notebookStore.updateAutoSyncSettings();
    }
  });
  
  async function signOut() {
    await authStore.signOut();
    goto('/auth');
  }
  
  // Redirect to auth if not logged in (except on auth page)
  $effect(() => {
    if (!loading && !user && !isAuthPage) {
      goto('/auth');
    }
  });
</script>

{#if loading}
  <!-- Loading state -->
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
{:else if !user && !isAuthPage}
  <!-- Redirecting to auth -->
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <p class="text-gray-600">Redirecting to login...</p>
  </div>
{:else}
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    {#if user}
      <!-- Skip to main content link -->
      <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50">
        Skip to main content
      </a>
      <!-- Navigation Header -->
      <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-8">
              <!-- Logo/Brand -->
              <a href="/" class="flex items-center space-x-2" aria-label="Go to home page">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <span class="text-xl font-semibold dark:text-white">Notebooks</span>
              </a>
              
              <!-- Main Navigation -->
              <nav class="hidden md:flex space-x-4" aria-label="Main navigation">
                <a 
                  href="/" 
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  class:bg-gray-100={$page.url.pathname === '/'}
                  class:text-gray-900={$page.url.pathname === '/'}
                  class:text-gray-700={$page.url.pathname !== '/'}
                  class:hover:text-gray-900={$page.url.pathname !== '/'}
                >
                  My Notebooks
                </a>
                <a 
                  href="/shared" 
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  class:bg-gray-100={$page.url.pathname === '/shared'}
                  class:text-gray-900={$page.url.pathname === '/shared'}
                  class:text-gray-700={$page.url.pathname !== '/shared'}
                  class:hover:text-gray-900={$page.url.pathname !== '/shared'}
                >
                  Shared with Me
                </a>
                <a 
                  href="/explore" 
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  class:bg-gray-100={$page.url.pathname === '/explore'}
                  class:text-gray-900={$page.url.pathname === '/explore'}
                  class:text-gray-700={$page.url.pathname !== '/explore'}
                  class:hover:text-gray-900={$page.url.pathname !== '/explore'}
                >
                  Explore Public
                </a>
              </nav>
            </div>
            
            <!-- Right side -->
            <div class="flex items-center space-x-4">
              <!-- Theme Toggle -->
              <button 
                onclick={() => settingsStore.toggleTheme()}
                class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {#if isDarkMode}
                  <!-- Sun icon for light mode -->
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                {:else}
                  <!-- Moon icon for dark mode -->
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                  </svg>
                {/if}
              </button>
              
              <!-- Settings -->
              <button 
                onclick={() => showSettings = true}
                class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
                aria-label="Settings"
                title="Settings"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
              
              <!-- Search -->
              <button class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Search">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
              
              <!-- Manual Sync -->
              <button 
                onclick={() => notebookStore.manualSyncAll()}
                class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                class:animate-spin={notebookStore.syncStatus.syncing}
                disabled={notebookStore.syncStatus.syncing}
                aria-label="Manual sync all"
                title="Sync all notebooks and notes"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
              
              <!-- User Menu -->
              <div class="relative group">
                <button class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100" aria-label="User menu" aria-expanded="false" aria-haspopup="true">
                  <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <!-- Dropdown -->
                <div class="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" role="menu" aria-orientation="vertical">
                  <div class="py-1">
                    <div class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-600">
                      {user.email}
                    </div>
                    <button 
                      onclick={() => showSettings = true}
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Settings
                    </button>
                    <button 
                      onclick={signOut} 
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    {/if}
    
    <!-- Main Content -->
    <main id="main-content">
      {@render children()}
    </main>
    
    <!-- Settings Modal -->
    <Settings 
      isOpen={showSettings} 
      onClose={() => showSettings = false} 
    />
  </div>
{/if}
