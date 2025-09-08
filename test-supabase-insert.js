// Test script to verify what data structure Supabase expects
// Run this in browser console after authenticating

console.log('🧪 Testing Supabase insert with actual data...');

const testSupabaseInsert = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ Not authenticated!');
      return;
    }
    
    console.log('✅ Authenticated as:', user.email);
    
    // First test: Try inserting with minimal fields (what we know should work)
    console.log('\n🧪 Test 1: Minimal note structure...');
    const minimalNote = {
      id: 'test-minimal-' + Date.now(),
      notebook_id: 'test-notebook-id',
      title: 'Test Note',
      content: 'Test content',
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Attempting minimal insert:', minimalNote);
    const { data: minimalData, error: minimalError } = await supabase
      .from('notes')
      .insert(minimalNote)
      .select()
      .single();
    
    if (minimalError) {
      console.error('❌ Minimal insert failed:', minimalError);
      console.error('   This tells us what fields are missing or wrong in the schema');
    } else {
      console.log('✅ Minimal insert successful:', minimalData);
      // Clean up
      await supabase.from('notes').delete().eq('id', minimalNote.id);
    }
    
    // Second test: Try with the exact data structure from your app
    console.log('\n🧪 Test 2: Full app data structure...');
    const fullNote = {
      "id": "test-full-" + Date.now(),
      "notebook_id": "test-notebook-id",
      "type": "chordpro",
      "title": "Test ChordPro",
      "content": "[D7]Test [G]content",
      "position": 1,
      "created_at": new Date().toISOString(),
      "updated_at": new Date().toISOString(),
      "created_by": user.id,
      "last_modified_by": user.id,
      "version": 1
    };
    
    console.log('Attempting full structure insert:', fullNote);
    const { data: fullData, error: fullError } = await supabase
      .from('notes')
      .insert(fullNote)
      .select()
      .single();
    
    if (fullError) {
      console.error('❌ Full insert failed:', fullError);
      console.error('   This shows which additional fields need to be added to schema');
      
      // Try to identify which specific fields are problematic
      const problematicFields = [];
      if (fullError.message.includes('column') && fullError.message.includes('does not exist')) {
        console.log('🔍 Schema issue detected - fields missing from database table');
      }
    } else {
      console.log('✅ Full insert successful:', fullData);
      // Clean up
      await supabase.from('notes').delete().eq('id', fullNote.id);
    }
    
    // Test 3: Check what the actual table structure returns
    console.log('\n🧪 Test 3: Checking actual table structure...');
    const { data: existingNotes, error: selectError } = await supabase
      .from('notes')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('❌ Select failed:', selectError);
    } else if (existingNotes && existingNotes.length > 0) {
      console.log('📋 Existing note structure in DB:', Object.keys(existingNotes[0]));
      console.log('📋 Sample data:', existingNotes[0]);
    } else {
      console.log('📋 No existing notes found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testSupabaseInsert();