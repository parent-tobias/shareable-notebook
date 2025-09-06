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
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      this._session = session;
      this._user = session?.user ?? null;
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          this._session = session;
          this._user = session?.user ?? null;
          
          // Send session to web worker for sync
          if (typeof window !== 'undefined' && window.Worker) {
            const worker = new Worker(
              new URL('$lib/workers/sync.worker.ts', import.meta.url),
              { type: 'module' }
            );
            worker.postMessage({ type: 'auth', payload: { session } });
          }
        }
      );
      
      // Store subscription for cleanup if needed
      (this as any)._authSubscription = subscription;
    } catch (error) {
      console.error('Failed to initialize auth:', error);
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
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

  getSupabaseClient() {
    return supabase;
  }
}

export const authStore = new AuthStore();