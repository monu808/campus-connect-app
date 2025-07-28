// Utility function for retrying Firestore operations with exponential backoff
export const withFirestoreRetry = async (operation, maxRetries = 3, operationName = 'Firestore operation') => {
  let attempt = 0;
  let lastError = null;
  
  while (attempt < maxRetries) {
    try {
      // On subsequent attempts after a failure, try to force a server refresh
      const result = await operation(attempt > 0);
      if (attempt > 0) {
        console.log(`${operationName} succeeded after ${attempt} retries`);
      }
      return result;
    } catch (error) {
      attempt++;
      lastError = error;
      
      // Log the error
      console.error(`${operationName} Error (attempt ${attempt}):`, error);
      
      // Special handling for 'unavailable' errors
      if (error.code === 'firestore/unavailable') {
        console.log(`Detected unavailable error, will try to force server refresh on next attempt`);
      }
      
      // Don't retry for non-transient errors
      if (attempt >= maxRetries || (error.code && !['firestore/unavailable', 'firestore/deadline-exceeded', 'firestore/timeout', 'firestore/cancelled'].includes(error.code))) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s for most operations
      const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.warn(`Retrying ${operationName} in ${backoff / 1000}s (attempt ${attempt} of ${maxRetries})...`);
      await new Promise(res => setTimeout(res, backoff));
    }
  }
  
  // If we get here, we've exhausted retries
  throw lastError || new Error(`${operationName} failed after ${maxRetries} attempts`);
};
