<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth.svelte';
  import '../app.css'; // Assuming you have global styles/Tailwind here
  
  let { children } = $props();
  
  const user = $derived(authStore.user);
  const loading = $derived(authStore.loading);
  const isAuthPage = $derived($page.route.id === '/auth');
  
  onMount(() => {
    authStore.initialize();
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
  <div class="min-h-screen bg-gray-50">
    {#if user}
      <!-- Navigation Header -->
      <header class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-8">
              <!-- Logo/Brand -->
              <a href="/" class="flex items-center space-x-2">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <span class="text-xl font-semibold">Notebooks</span>
              </a>
              
              <!-- Main Navigation -->
              <nav class="hidden md:flex space-x-4">
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
              <!-- Search -->
              <button class="p-2 text-gray-500 hover:text-gray-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
              
              <!-- User Menu -->
              <div class="relative group">
                <button class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
                  <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <!-- Dropdown -->
                <div class="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div class="py-1">
                    <div class="px-4 py-2 text-sm text-gray-700 border-b">
                      {user.email}
                    </div>
                    <a href="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings
                    </a>
                    <button onclick={signOut} class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
    <main>
      {@render children()}
    </main>
  </div>
{/if}
