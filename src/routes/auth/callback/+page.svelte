<!-- src/routes/auth/callback/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';
  
  let loading = $state(true);
  let error = $state('');
  
  onMount(async () => {
    try {
      console.log('🔍 Auth callback: Starting OAuth callback processing...');
      console.log('🔍 Current URL:', window.location.href);
      console.log('🔍 URL hash:', window.location.hash);
      console.log('🔍 URL search:', window.location.search);

      // Add a small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Handle the OAuth callback
      const result = await authStore.handleAuthCallback();

      if (result.success) {
        console.log('✅ Auth callback: OAuth authentication successful');
        // Small delay before redirect to ensure state is updated
        setTimeout(() => {
          goto('/');
        }, 500);
      } else {
        console.error('🚨 Auth callback error:', result.error);
        error = result.error || 'Authentication failed';
        loading = false;
      }
    } catch (err) {
      console.error('🚨 Auth callback exception:', err);
      error = err instanceof Error ? err.message : 'Unexpected authentication error';
      loading = false;
    }
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
  <div class="max-w-md w-full p-8 bg-white rounded-lg shadow-xl">
    {#if loading}
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Completing authentication...</h2>
        <p class="text-gray-600">Please wait while we sign you in.</p>
      </div>
    {:else if error}
      <div class="text-center">
        <div class="text-red-500 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
        <p class="text-gray-600 mb-4">{error}</p>
        <button 
          onclick={() => goto('/auth')}
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    {/if}
  </div>
</div>