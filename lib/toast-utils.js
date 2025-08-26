/**
 * Utility functions for consistent toast notifications
 */

/**
 * Show a success toast notification
 * @param {Object} toast - The toast function from useToast
 * @param {string} title - Title of the toast
 * @param {string} description - Description/message
 */
export function showSuccessToast(toast, title, description) {
  toast({
    title,
    description,
    duration: 3000,
  });
}

/**
 * Show an error toast notification
 * @param {Object} toast - The toast function from useToast
 * @param {string} title - Title of the toast
 * @param {string|Error} error - Error message or Error object
 */
export function showErrorToast(toast, title, error) {
  const errorMessage = error instanceof Error ? error.message : error;
  
  toast({
    variant: 'destructive',
    title,
    description: errorMessage,
    duration: 5000,
  });
}

/**
 * Show a warning toast notification
 * @param {Object} toast - The toast function from useToast
 * @param {string} title - Title of the toast
 * @param {string} description - Description/message
 */
export function showWarningToast(toast, title, description) {
  toast({
    variant: 'default',
    title,
    description,
    className: 'bg-amber-50 border-amber-200 text-amber-800',
    duration: 4000,
  });
}

/**
 * Show an informational toast notification
 * @param {Object} toast - The toast function from useToast
 * @param {string} title - Title of the toast
 * @param {string} description - Description/message
 */
export function showInfoToast(toast, title, description) {
  toast({
    title,
    description,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    duration: 3000,
  });
}

/**
 * Handle API response and show appropriate toast notification
 * @param {Object} toast - The toast function from useToast
 * @param {Object} response - The API response object
 * @param {Object} messages - Messages for success/error states
 * @param {string} messages.success - Success message
 * @param {string} messages.error - Error message
 * @returns {Object} The parsed response data
 * @throws {Error} If the response is not OK
 */
export async function handleApiResponseWithToast(toast, response, messages) {
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    const errorMessage = data.message || messages.error;
    showErrorToast(toast, 'Error', errorMessage);
    throw new Error(errorMessage);
  }
  
  if (messages.success) {
    showSuccessToast(toast, 'Success', messages.success);
  }
  
  return data;
}
