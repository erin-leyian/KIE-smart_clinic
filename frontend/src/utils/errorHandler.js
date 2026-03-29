/**
 * Centralized Error Handler for Data Fetching
 * Handles errors consistently across the application
 */

export class DataFetchError extends Error {
  constructor(message, statusCode = null, originalError = null) {
    super(message);
    this.name = 'DataFetchError';
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date();
  }
}

/**
 * Safely fetch data from mock or API sources
 * @param {Function} fetchFn - Async function that fetches data
 * @param {string} errorMessage - Custom error message
 * @param {Function} setError - State setter for error
 * @param {Function} setLoading - State setter for loading
 * @returns {Promise<any>} - Fetched data or null on error
 */
export const safeFetch = async (fetchFn, errorMessage = 'Failed to fetch data', setError, setLoading) => {
  try {
    if (setLoading) setLoading(true);
    if (setError) setError('');

    const result = await fetchFn();

    if (!result) {
      throw new DataFetchError('No data returned from fetch');
    }

    return result;
  } catch (err) {
    const errorMsg = err.message || errorMessage;
    console.error(`[DataFetchError] ${errorMsg}`, err);

    if (setError) setError(errorMsg);
    return null;
  } finally {
    if (setLoading) setLoading(false);
  }
};

/**
 * Fetch with retry logic
 * @param {Function} fetchFn - Async function that fetches data
 * @param {number} retries - Number of retry attempts
 * @param {number} delay - Delay between retries (ms)
 * @returns {Promise<any>} - Fetched data or null
 */
export const fetchWithRetry = async (fetchFn, retries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fetchFn();
    } catch (err) {
      lastError = err;
      console.warn(`[Retry ${i + 1}/${retries}] Fetch failed:`, err.message);
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw new DataFetchError(
    `Failed after ${retries} attempts: ${lastError?.message}`,
    null,
    lastError
  );
};

/**
 * Format error message for UI display
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';

  if (error instanceof DataFetchError) {
    if (error.statusCode === 404) {
      return 'Resource not found. Please try again.';
    }
    if (error.statusCode === 500) {
      return 'Server error. Please try again later.';
    }
    return error.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

/**
 * Validate data structure
 * @param {any} data - Data to validate
 * @param {Array<string>} requiredFields - Required field names
 * @returns {boolean} - True if valid
 */
export const validateData = (data, requiredFields = []) => {
  if (!data) return false;

  if (Array.isArray(data)) {
    return data.length > 0 && data.every(item => {
      if (typeof item !== 'object') return false;
      return requiredFields.every(field => field in item);
    });
  }

  if (typeof data === 'object') {
    return requiredFields.every(field => field in data);
  }

  return false;
};

/**
 * Create mock data loader with error handling
 * @param {Function} getMockData - Function returning mock data
 * @param {string} errorMessage - Custom error message
 * @returns {Promise<any>}
 */
export const loadMockData = async (getMockData, errorMessage = 'Failed to load data') => {
  return fetchWithRetry(async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const data = getMockData();
    if (!data) {
      throw new Error('Mock data is empty');
    }
    
    return data;
  }, 2, 500);
};
