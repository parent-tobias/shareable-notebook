// Clean up old IndexedDB data with invalid user IDs
// Run this in browser console to clear the problematic pending changes

console.log('🧹 Cleaning up old data with invalid user IDs...');

const cleanupOldData = async () => {
  try {
    const request = indexedDB.open('NotebookDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['pendingChanges'], 'readwrite');
      const store = transaction.objectStore('pendingChanges');
      
      // Get all pending changes
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const allChanges = getAllRequest.result;
        console.log(`📋 Found ${allChanges.length} pending changes`);
        
        let deletedCount = 0;
        
        allChanges.forEach(change => {
          // Check if this change has invalid user data
          const hasInvalidUserId = (
            (change.entity === 'notebook' && change.data.owner_id === 'current-user') ||
            (change.entity === 'note' && (
              change.data.created_by === 'current-user' || 
              change.data.last_modified_by === 'current-user'
            ))
          );
          
          if (hasInvalidUserId) {
            console.log(`🗑️  Deleting invalid change: ${change.operation} ${change.entity} ${change.entityId}`);
            store.delete(change.id);
            deletedCount++;
          }
        });
        
        transaction.oncomplete = () => {
          console.log(`✅ Cleanup complete! Deleted ${deletedCount} problematic changes`);
          console.log(`📊 Remaining changes: ${allChanges.length - deletedCount}`);
          console.log('🔄 The sync should now work with fresh data created after the user ID fix');
        };
      };
      
      getAllRequest.onerror = (error) => {
        console.error('❌ Failed to get pending changes:', error);
      };
    };
    
    request.onerror = (error) => {
      console.error('❌ Failed to open database:', error);
    };
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

cleanupOldData();