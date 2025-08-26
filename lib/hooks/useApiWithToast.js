import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { showErrorToast, showSuccessToast } from '@/lib/toast-utils';

/**
 * Hook to handle API requests with consistent toast notifications
 * @returns {Object} API request handler functions with loading state
 */
export function useApiWithToast() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  /**
   * Make an API request and handle success/error toasts
   * @param {Function} requestFn - Async function that makes the request
   * @param {Object} options - Toast options
   * @param {string} options.successTitle - Title for success toast
   * @param {string} options.successMessage - Message for success toast
   * @param {string} options.errorTitle - Title for error toast
   * @param {string} options.errorMessage - Default error message
   * @param {Function} options.onSuccess - Callback on success
   * @param {Function} options.onError - Callback on error
   * @returns {Promise<any>} The result of the request
   */
  const makeRequest = async (requestFn, options = {}) => {
    const {
      successTitle = 'Success',
      successMessage,
      errorTitle = 'Error',
      errorMessage = 'Something went wrong',
      onSuccess,
      onError,
    } = options;

    setLoading(true);
    try {
      const result = await requestFn();
      
      if (successMessage) {
        showSuccessToast(toast, successTitle, successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const message = error?.message || errorMessage;
      showErrorToast(toast, errorTitle, message);
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Make a POST request with toast handling
   * @param {string} url - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} options - Toast and request options
   * @returns {Promise<any>} The response data
   */
  const post = async (url, data, options = {}) => {
    return makeRequest(async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      return response.json();
    }, options);
  };

  /**
   * Make a PUT request with toast handling
   * @param {string} url - API endpoint
   * @param {Object} data - Request payload
   * @param {Object} options - Toast and request options
   * @returns {Promise<any>} The response data
   */
  const put = async (url, data, options = {}) => {
    return makeRequest(async () => {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }

      return response.json();
    }, options);
  };

  /**
   * Make a DELETE request with toast handling
   * @param {string} url - API endpoint
   * @param {Object} options - Toast and request options
   * @returns {Promise<any>} The response data
   */
  const del = async (url, options = {}) => {
    return makeRequest(async () => {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: options.headers || {},
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      return response.json();
    }, options);
  };

  /**
   * Make a GET request with toast handling
   * @param {string} url - API endpoint
   * @param {Object} options - Toast and request options
   * @returns {Promise<any>} The response data
   */
  const get = async (url, options = {}) => {
    return makeRequest(async () => {
      const response = await fetch(url, {
        method: 'GET',
        headers: options.headers || {},
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      return response.json();
    }, options);
  };

  return {
    loading,
    post,
    put,
    del,
    get,
    makeRequest,
  };
}
