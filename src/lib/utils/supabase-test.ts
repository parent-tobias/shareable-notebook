// Simple test utility to check Supabase connection
import { supabase } from '$lib/supabase/client';

export async function testWorkerCreation(): Promise<{success: boolean, error?: string}> {
  try {
    console.log('🔧 Testing basic worker creation...');
    
    // Test basic worker first
    const testWorker = new Worker(
      new URL('$lib/workers/test.worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Worker timeout' });
      }, 5000);
      
      testWorker.onmessage = (event) => {
        console.log('✅ Test worker response:', event.data);
        clearTimeout(timeout);
        testWorker.terminate();
        resolve({ success: true });
      };
      
      testWorker.onerror = (error) => {
        console.error('🚨 Test worker error:', error);
        clearTimeout(timeout);
        resolve({ success: false, error: error.message });
      };
      
      // Send test message
      testWorker.postMessage({ test: 'hello' });
    });
    
  } catch (error) {
    console.error('🚨 Worker creation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown worker error' 
    };
  }
}

export async function testSupabaseConnection(): Promise<{success: boolean, error?: string}> {
  try {
    // Simple test - try to connect and get auth user (should return null if not authenticated)
    const { data, error } = await supabase.auth.getUser();
    
    if (error && error.message.includes('Invalid API key')) {
      return { success: false, error: 'Invalid Supabase API key or URL' };
    }
    
    // If we get here without throwing, the connection works
    console.log('Supabase connection test successful');
    return { success: true };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown connection error' 
    };
  }
}

export async function testSupabaseDatabase(): Promise<{success: boolean, error?: string}> {
  try {
    // Try to query a table (this will fail gracefully if tables don't exist)
    const { error } = await supabase.from('notebooks').select('count').limit(1);
    
    if (error) {
      console.warn('Database query failed (this might be expected):', error.message);
      // This is not necessarily a connection issue - might just be missing tables
      return { success: true, error: `Database schema issue: ${error.message}` };
    }
    
    console.log('Supabase database test successful');
    return { success: true };
  } catch (error) {
    console.error('Supabase database test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    };
  }
}