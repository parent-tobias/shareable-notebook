// Enhanced error tracking and debugging utilities

export function setupGlobalErrorHandling() {
  if (typeof window === 'undefined') return;

  // Track all unhandled errors
  window.addEventListener('error', (event) => {
    console.error('🚨 Global Error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      stack: event.error?.stack
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled Promise Rejection:', {
      reason: event.reason,
      promise: event.promise,
      stack: event.reason?.stack
    });
  });

  // Track worker errors
  const originalWorker = window.Worker;
  if (originalWorker) {
    window.Worker = class extends originalWorker {
      constructor(scriptURL: string | URL, options?: WorkerOptions) {
        console.log('🔧 Creating Worker:', { scriptURL, options });
        super(scriptURL, options);
        
        // Enhanced error handling for workers
        this.addEventListener('error', (event) => {
          console.error('🚨 Worker Error:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error,
            stack: event.error?.stack
          });
        });

        this.addEventListener('messageerror', (event) => {
          console.error('🚨 Worker Message Error:', event);
        });
      }
    };
  }
}

// Function to safely wrap async operations
export function safeAsync<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T | null> {
  return operation().catch((error) => {
    console.error(`🚨 Async Error in ${context}:`, {
      error,
      stack: error?.stack,
      context
    });
    return null;
  });
}

// Enhanced console logging with stack traces
export function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🐛 [DEBUG] ${message}`, data);
    console.trace('Stack trace:');
  }
}