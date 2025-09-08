// Debug script to check Supabase schema and test operations
// Run this in your browser console after authenticating

console.log('🔍 Starting Supabase schema and operations debug...');

const debugSupabaseSchema = async () => {
  try {
    // Get auth state
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ Not authenticated!');
      return;
    }
    console.log('✅ Authenticated as:', user.email, 'ID:', user.id);
    
    // Test 1: Check tables exist and structure
    console.log('\n📋 1. Testing table access...');
    
    // Check notebooks table
    console.log('Checking notebooks table...');
    const { data: notebooks, error: notebooksError } = await supabase
      .from('notebooks')
      .select('*')
      .limit(1);
    
    if (notebooksError) {
      console.error('❌ Notebooks table error:', notebooksError);
    } else {
      console.log('✅ Notebooks table accessible, sample:', notebooks);
    }
    
    // Check notes table  
    console.log('Checking notes table...');
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .limit(1);
      
    if (notesError) {
      console.error('❌ Notes table error:', notesError);
    } else {
      console.log('✅ Notes table accessible, sample:', notes);
    }
    
    // Test 2: Try to create a minimal notebook
    console.log('\n📝 2. Testing notebook creation...');
    const testNotebook = {
      id: 'debug-notebook-' + Date.now(),
      name: 'Debug Test Notebook',
      owner_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Attempting to create notebook:', testNotebook);
    const { data: createdNotebook, error: createError } = await supabase
      .from('notebooks')
      .insert(testNotebook)
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Notebook creation failed:', createError);
      console.error('❌ Attempted data:', testNotebook);
      return;
    }
    console.log('✅ Notebook created successfully:', createdNotebook);
    
    // Test 3: Try to create a minimal note
    console.log('\n📝 3. Testing note creation...');
    const testNote = {
      id: 'debug-note-' + Date.now(),
      notebook_id: testNotebook.id,
      title: 'Debug Test Note',
      content: 'This is a debug test note',
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Attempting to create note:', testNote);
    const { data: createdNote, error: noteError } = await supabase
      .from('notes')
      .insert(testNote)
      .select()
      .single();
    
    if (noteError) {
      console.error('❌ Note creation failed:', noteError);
      console.error('❌ Attempted data:', testNote);
    } else {
      console.log('✅ Note created successfully:', createdNote);
    }
    
    // Test 4: Test upsert operation (this is what's failing)
    console.log('\n🔄 4. Testing upsert operation...');
    const upsertNote = {
      ...testNote,
      content: 'Updated content at ' + new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Attempting to upsert note:', upsertNote);
    const { data: upsertedNote, error: upsertError } = await supabase
      .from('notes')
      .upsert(upsertNote)
      .select()
      .single();
    
    if (upsertError) {
      console.error('❌ Note upsert failed:', upsertError);
      console.error('❌ Upsert data:', upsertNote);
    } else {
      console.log('✅ Note upsert successful:', upsertedNote);
    }
    
    // Cleanup
    console.log('\n🧹 5. Cleaning up test data...');
    await supabase.from('notes').delete().eq('notebook_id', testNotebook.id);
    await supabase.from('notebooks').delete().eq('id', testNotebook.id);
    console.log('✅ Cleanup complete');
    
  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
};

// Also check what data is actually being sent by the sync worker
const checkPendingChanges = async () => {
  console.log('\n💾 Checking what data is in IndexedDB...');
  try {
    // Open IndexedDB directly
    const request = indexedDB.open('NotebookDB', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['pendingChanges'], 'readonly');
      const store = transaction.objectStore('pendingChanges');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const pendingChanges = getAllRequest.result;
        console.log('📋 Pending changes in IndexedDB:', pendingChanges.length);
        pendingChanges.forEach((change, index) => {
          console.log(`Change ${index + 1}:`, {
            entity: change.entity,
            operation: change.operation,
            entityId: change.entityId,
            data: change.data,
            synced: change.synced
          });
        });
      };
    };
  } catch (error) {
    console.error('❌ Could not check IndexedDB:', error);
  }
};

// Run the tests
debugSupabaseSchema();
checkPendingChanges();