// Debug script to test the complete sync flow
// Paste this in browser console after authenticating

console.log('🔍 Starting complete sync flow debug...');

// Test 1: Check auth state
console.log('\n1. 📋 Checking authentication state...');
const checkAuth = async () => {
  try {
    const { authStore } = await import('./src/lib/stores/auth.svelte.js');
    console.log('Auth user:', authStore.user?.email || 'Not authenticated');
    console.log('Auth session present:', !!authStore.session);
    return authStore.session;
  } catch (err) {
    console.error('Could not check auth:', err);
    return null;
  }
};

// Test 2: Create a test note and monitor sync
const testNoteCreation = async (session) => {
  if (!session) {
    console.log('❌ Cannot test without authentication');
    return;
  }
  
  console.log('\n2. 📝 Testing note creation and sync...');
  
  try {
    const { notebookStore } = await import('./src/lib/stores/notebook.svelte.js');
    
    // Create a test notebook if none exists
    let notebook = notebookStore.currentNotebook;
    if (!notebook) {
      console.log('Creating test notebook...');
      notebook = await notebookStore.createNotebook('Debug Test Notebook');
    }
    
    console.log('Current notebook:', notebook.name);
    
    // Create a test note
    console.log('Creating test note...');
    const note = await notebookStore.createNote('text', 'Debug Test Note');
    console.log('Test note created:', note.id);
    
    // Update the note content
    await notebookStore.updateNote(note.id, { 
      content: 'This is a test note created at ' + new Date().toISOString() 
    });
    console.log('Test note updated');
    
    // Monitor sync status for 10 seconds
    console.log('Monitoring sync status for 10 seconds...');
    const startTime = Date.now();
    const checkSync = () => {
      const status = notebookStore.syncStatus;
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`[${elapsed}s] Sync status:`, {
        syncing: status.syncing,
        pending: status.pending,
        error: status.error,
        lastSynced: status.lastSynced
      });
      
      if (elapsed < 10 && !status.error) {
        setTimeout(checkSync, 1000);
      } else {
        console.log('✅ Sync monitoring complete');
        if (status.error) {
          console.error('❌ Sync error detected:', status.error);
        }
      }
    };
    setTimeout(checkSync, 1000);
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
};

// Run the tests
(async () => {
  const session = await checkAuth();
  await testNoteCreation(session);
})();