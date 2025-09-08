// Debug script to test sync functionality
// Run this in browser console after authenticating

async function debugSync() {
  console.log('🔍 Starting sync debug test...');
  
  // Check if we're authenticated
  const { data: { user } } = await window.supabase?.auth.getUser() || { data: { user: null } };
  if (!user) {
    console.error('❌ Not authenticated! Please sign in first.');
    return;
  }
  console.log('✅ Authenticated as:', user.email);
  
  // Test direct Supabase write
  console.log('\n🧪 Testing direct Supabase write...');
  const testNotebook = {
    id: 'test-' + Date.now(),
    name: 'Debug Test Notebook',
    owner_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await window.supabase.from('notebooks').insert(testNotebook);
    if (error) {
      console.error('❌ Direct write failed:', error);
      return;
    }
    console.log('✅ Direct write successful:', data);
  } catch (err) {
    console.error('❌ Direct write exception:', err);
    return;
  }
  
  // Test note creation
  console.log('\n🧪 Testing note creation...');
  const testNote = {
    id: 'note-test-' + Date.now(),
    notebook_id: testNotebook.id,
    title: 'Debug Test Note',
    content: 'This is a test note for debugging sync',
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  try {
    const { data: noteData, error: noteError } = await window.supabase.from('notes').insert(testNote);
    if (noteError) {
      console.error('❌ Note write failed:', noteError);
    } else {
      console.log('✅ Note write successful:', noteData);
    }
  } catch (err) {
    console.error('❌ Note write exception:', err);
  }
  
  // Clean up
  setTimeout(async () => {
    console.log('\n🧹 Cleaning up test data...');
    await window.supabase.from('notes').delete().eq('notebook_id', testNotebook.id);
    await window.supabase.from('notebooks').delete().eq('id', testNotebook.id);
    console.log('✅ Cleanup complete');
  }, 5000);
}

// Make it available globally
window.debugSync = debugSync;
console.log('Debug script loaded. Run debugSync() in console after authenticating.');