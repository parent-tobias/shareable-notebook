<!-- src/routes/auth/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';
  
  let mode = $state<'signin' | 'signup' | 'reset'>('signin');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let fullName = $state('');
  let error = $state('');
  let success = $state('');
  let loading = $state(false);
  
  const user = $derived(authStore.user);
  
  // Redirect if already authenticated
  $effect(() => {
    if (user) {
      goto('/');
    }
  });
  
  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';
    success = '';
    
    if (mode === 'signup' && password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }
    
    loading = true;
    
    try {
      let result;
      
      switch (mode) {
        case 'signin':
          result = await authStore.signIn(email, password);
          if (result.success) {
            goto('/');
          } else {
            error = result.error || 'Failed to sign in';
          }
          break;
          
        case 'signup':
          result = await authStore.signUp(email, password, { full_name: fullName });
          if (result.success) {
            if (result.requiresEmailConfirmation) {
              success = 'Please check your email to confirm your account';
              mode = 'signin';
            } else {
              goto('/');
            }
          } else {
            error = result.error || 'Failed to sign up';
          }
          break;
          
        case 'reset':
          result = await authStore.resetPassword(email);
          if (result.success) {
            success = 'Password reset email sent. Please check your inbox.';
            mode = 'signin';
          } else {
            error = result.error || 'Failed to send reset email';
          }
          break;
      }
    } finally {
      loading = false;
    }
  }
  
  async function handleOAuthSignIn(provider: 'google' | 'github') {
    loading = true;
    const result = await authStore.signInWithProvider(provider);
    if (!result.success) {
      error = result.error || `Failed to sign in with ${provider}`;
    }
    loading = false;
  }
  
  function switchMode(newMode: 'signin' | 'signup' | 'reset') {
    mode = newMode;
    error = '';
    success = '';
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <div class="flex justify-center">
        <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {#if mode === 'signin'}
          Sign in to your account
        {:else if mode === 'signup'}
          Create your account
        {:else}
          Reset your password
        {/if}
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        {#if mode === 'signin'}
          Or
          <button onclick={() => switchMode('signup')} class="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </button>
        {:else if mode === 'signup'}
          Or
          <button onclick={() => switchMode('signin')} class="font-medium text-blue-600 hover:text-blue-500">
            sign in to existing account
          </button>
        {:else}
          Or
          <button onclick={() => switchMode('signin')} class="font-medium text-blue-600 hover:text-blue-500">
            back to sign in
          </button>
        {/if}
      </p>
    </div>
    
    <div class="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
      {#if error}
        <div class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      {/if}
      
      {#if success}
        <div class="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {success}
        </div>
      {/if}
      
      <form class="space-y-6" onsubmit={handleSubmit}>
        {#if mode === 'signup'}
          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div class="mt-1">
              <input
                id="fullName"
                name="fullName"
                type="text"
                bind:value={fullName}
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="John Doe"
              />
            </div>
          </div>
        {/if}
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div class="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              bind:value={email}
              required
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
        </div>
        
        {#if mode !== 'reset'}
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                bind:value={password}
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
        {/if}
        
        {#if mode === 'signup'}
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                bind:value={confirmPassword}
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
        {/if}
        
        {#if mode === 'signin'}
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            
            <div class="text-sm">
              <button type="button" onclick={() => switchMode('reset')} class="font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </button>
            </div>
          </div>
        {/if}
        
        <div>
          <button
            type="submit"
            disabled={loading}
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if loading}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            {:else if mode === 'signin'}
              Sign in
            {:else if mode === 'signup'}
              Sign up
            {:else}
              Send reset email
            {/if}
          </button>
        </div>
      </form>
      
      {#if mode !== 'reset'}
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onclick={() => handleOAuthSignIn('google')}
              disabled={loading}
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="ml-2">Google</span>
            </button>
            
            <button
              type="button"
              onclick={() => handleOAuthSignIn('github')}
              disabled={loading}
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"/>
              </svg>
              <span class="ml-2">GitHub</span>
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>