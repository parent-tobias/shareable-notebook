// src/lib/stores/auth.svelte.ts

import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

class AuthStore {
  private _user = $state<User | null>(null);
  private _session = $state<Session | null>(null);
  private _loading = $state(true);
  private _initialized = false;

  isAuthenticated = $derived(!!this._user);

  get user() {
    return this._user;
  }

  get session() {
    return this._session;
  }

  get loading() {
    return this._loading;
  }

  async initialize() {
    if (this._initialized) return;
    this._initialized = true;

    try {
      console.log('🔧 Initializing auth store...');

      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('🚨 Error getting initial session:', error);
      }

      console.log('🔍 Initial session:', session ? 'Found' : 'None');

      this._session = session;
      this._user = session?.user ?? null;

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔄 Auth state change:', event, session ? 'Session present' : 'No session');

          this._session = session;
          this._user = session?.user ?? null;

          // Send session to notebook store's sync worker
          if (typeof window !== 'undefined') {
            try {
              console.log('🔧 Sending auth session to notebook store...');
              // Use dynamic import to avoid circular dependency
              import('./notebook.svelte').then(({ notebookStore }) => {
                notebookStore.updateAuthSession(session);
                console.log('✅ Auth session sent to notebook store');
              });
            } catch (error) {
              console.error('🚨 Failed to send auth session:', error);
            }
          }
        }
      );

      console.log('✅ Auth store initialized successfully');

      // Store subscription for cleanup if needed
      (this as any)._authSubscription = subscription;
    } catch (error) {
      console.error('🚨 Failed to initialize auth:', error);
    } finally {
      this._loading = false;
    }
  }

  async signIn(email: string, password: string) {
    this._loading = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      this._session = data.session;
      this._user = data.user;
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to sign in' 
      };
    } finally {
      this._loading = false;
    }
  }

  async signUp(email: string, password: string, metadata?: { full_name?: string }) {
    this._loading = true;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        return { 
          success: true, 
          requiresEmailConfirmation: true 
        };
      }
      
      this._session = data.session;
      this._user = data.user;
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to sign up' 
      };
    } finally {
      this._loading = false;
    }
  }

  async signInWithProvider(provider: 'google' | 'github') {
    try {
      console.log('🔐 Initiating OAuth sign-in with', provider);

      // Try to open OAuth in the same window to avoid protocol handler issues
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `http://localhost:5173/auth/callback`  // Use explicit http:// protocol
        }
      });

      if (error) {
        console.error('🚨 OAuth initiation error:', error);
        throw error;
      }

      console.log('✅ OAuth initiation successful');
      return { success: true };
    } catch (error: any) {
      console.error('🚨 OAuth sign-in failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in with provider'
      };
    }
  }

  async signOut() {
    this._loading = true;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      this._session = null;
      this._user = null;
    } catch (error) {
      console.error('Failed to sign out:', error);
    } finally {
      this._loading = false;
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to send reset email' 
      };
    }
  }

  async handleAuthCallback() {
    try {
      console.log('🔍 Handling auth callback...');
      console.log('🔍 Current URL:', window.location.href);

      // Check if we have OAuth parameters in the URL hash
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (accessToken && type === 'recovery') {
        // Handle password recovery
        console.log('🔄 Handling password recovery callback...');
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: accessToken,
          type: 'recovery'
        });

        if (error) throw error;

        this._session = data.session;
        this._user = data.user;

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);

        return { success: true };
      }

      if (accessToken) {
        // Handle OAuth callback with access token
        console.log('🔍 Found access token in URL, setting session...');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });

        if (error) {
          console.error('🚨 Failed to set session from tokens:', error);
          throw error;
        }

        if (data.session) {
          console.log('✅ Auth callback: Session set from URL tokens');
          this._session = data.session;
          this._user = data.session.user;

          // Clean up URL hash
          window.history.replaceState({}, document.title, window.location.pathname);

          return { success: true };
        }
      }

      // If no tokens in URL, try to get existing session
      console.log('🔄 No OAuth tokens found, checking existing session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('🚨 Session check error:', sessionError);
        throw sessionError;
      }

      if (sessionData.session) {
        console.log('✅ Auth callback: Found existing session');
        this._session = sessionData.session;
        this._user = sessionData.session.user;
        return { success: true };
      } else {
        console.warn('⚠️  Auth callback: No session found');
        return {
          success: false,
          error: 'No authentication session found'
        };
      }
    } catch (error: any) {
      console.error('🚨 Auth callback exception:', error);
      return {
        success: false,
        error: error.message || 'Failed to process authentication callback'
      };
    }
  }

  getSupabaseClient() {
    return supabase;
  }
}

export const authStore = new AuthStore();