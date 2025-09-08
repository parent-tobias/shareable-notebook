// Debug script to check IndexedDB operations
// Run this in browser console to manually inspect what's in the database

console.log('🔍 Starting IndexedDB debug...');

const debugIndexedDB = async () => {
  try {
    // Test 1: Open the database and check structure
    console.log('\n📋 1. Checking database structure...');
    
    const request = indexedDB.open('NotebookDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      console.log('✅ Database opened successfully');
      console.log('Object stores:', Array.from(db.objectStoreNames));
      
      // Check each object store
      ['notebooks', 'notes', 'pendingChanges'].forEach(storeName => {
        if (db.objectStoreNames.contains(storeName)) {
          console.log(`✅ Store "${storeName}" exists`);
          
          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const countRequest = store.count();
          
          countRequest.onsuccess = () => {
            console.log(`📊 ${storeName}: ${countRequest.result} records`);
            
            // Get all records from pendingChanges to see what's actually stored
            if (storeName === 'pendingChanges') {
              const getAllRequest = store.getAll();
              getAllRequest.onsuccess = () => {
                const records = getAllRequest.result;
                console.log(`📋 PendingChanges details:`, records);
                records.forEach((record, index) => {
                  console.log(`  ${index + 1}. ID: ${record.id}, Entity: ${record.entity}, Operation: ${record.operation}, Synced: ${record.synced}, EntityID: ${record.entityId}`);
                });
              };
            }
            
            // Get a sample record to check structure
            const sampleRequest = store.getAll();
            sampleRequest.onsuccess = () => {
              const records = sampleRequest.result;
              if (records.length > 0) {
                console.log(`📄 Sample ${storeName} record:`, records[0]);
              }
            };
          };
        } else {
          console.log(`❌ Store "${storeName}" missing`);
        }
      });
      
      db.close();
    };
    
    request.onerror = (event) => {
      console.error('❌ Failed to open database:', event.target.error);
    };
    
  } catch (error) {
    console.error('❌ IndexedDB debug failed:', error);
  }
};

// Test 2: Manually create a test pending change
const testPendingChange = async () => {
  console.log('\n🧪 2. Testing manual pending change creation...');
  
  try {
    const request = indexedDB.open('NotebookDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['pendingChanges'], 'readwrite');
      const store = transaction.objectStore('pendingChanges');
      
      const testChange = {
        id: 'test-' + Date.now(),
        entity: 'note',
        entityId: 'test-note-id',
        operation: 'update',
        data: { test: 'data' },
        timestamp: Date.now(),
        synced: false
      };
      
      const addRequest = store.add(testChange);
      
      addRequest.onsuccess = () => {
        console.log('✅ Test pending change added:', testChange.id);
        
        // Now try to query it
        const queryRequest = store.index ? 
          store.getAll() : // If no index, get all
          store.where('synced').equals(false); // If Dexie method available
          
        if (queryRequest.getAll) {
          queryRequest.getAll().onsuccess = (event) => {
            const results = event.target.result;
            console.log('🔍 Query results:', results.length, 'records');
            const unsynced = results.filter(r => r.synced === false);
            console.log('🔍 Unsynced records:', unsynced.length);
          };
        }
      };
      
      addRequest.onerror = (event) => {
        console.error('❌ Failed to add test change:', event.target.error);
      };
      
      db.close();
    };
  } catch (error) {
    console.error('❌ Test creation failed:', error);
  }
};

// Run the debug functions
debugIndexedDB();
setTimeout(testPendingChange, 1000); // Wait a bit for the first test to complete