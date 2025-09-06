import { P as derived } from "./index2.js";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient("https://toftoeuhrikfzfwczlyf.supabase.co", "sb_publishable_RsTIpcpqTLV2kEzjRYYWAA_DFXpVS7M");
class AuthStore {
  _user = null;
  _session = null;
  _loading = true;
  _initialized = false;
  #isAuthenticated = derived(() => !!this._user);
  get isAuthenticated() {
    return this.#isAuthenticated();
  }
  set isAuthenticated($$value) {
    return this.#isAuthenticated($$value);
  }
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
      const { data: { session } } = await supabase.auth.getSession();
      this._session = session;
      this._user = session?.user ?? null;
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session2) => {
        this._session = session2;
        this._user = session2?.user ?? null;
        if (typeof window !== "undefined" && window.Worker) {
          const worker = new Worker(new URL("$lib/workers/sync.worker.ts", import.meta.url), { type: "module" });
          worker.postMessage({ type: "auth", payload: { session: session2 } });
        }
      });
      this._authSubscription = subscription;
    } catch (error) {
      console.error("Failed to initialize auth:", error);
    } finally {
      this._loading = false;
    }
  }
  async signIn(email, password) {
    this._loading = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      this._session = data.session;
      this._user = data.user;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Failed to sign in" };
    } finally {
      this._loading = false;
    }
  }
  async signUp(email, password, metadata) {
    this._loading = true;
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
      if (error) throw error;
      if (data.user && !data.session) {
        return { success: true, requiresEmailConfirmation: true };
      }
      this._session = data.session;
      this._user = data.user;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Failed to sign up" };
    } finally {
      this._loading = false;
    }
  }
  async signInWithProvider(provider) {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to sign in with provider"
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
      console.error("Failed to sign out:", error);
    } finally {
      this._loading = false;
    }
  }
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to send reset email"
      };
    }
  }
  getSupabaseClient() {
    return supabase;
  }
}
const authStore = new AuthStore();
export {
  authStore as a
};
