// Test worker to isolate AsyncFunction error
console.log('🔧 Test worker starting...');

// Test basic worker functionality
self.onmessage = (event) => {
  console.log('📨 Test worker received message:', event.data);
  
  try {
    // Test basic operations
    const response = {
      type: 'test-response',
      payload: {
        received: event.data,
        timestamp: Date.now(),
        workerName: 'test-worker'
      }
    };
    
    postMessage(response);
  } catch (error) {
    console.error('🚨 Test worker error:', error);
    postMessage({
      type: 'test-error',
      payload: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
  }
};

console.log('✅ Test worker initialized');
export {};