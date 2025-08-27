/**
 * Enhanced utility functions for consistent and visible toast notifications
 */

/**
 * Show a success toast notification
 * @param {Function} toast - The toast function from useToast
 * @param {string} title - Title of the toast
 * @param {string} description - Description/message
 * @param {Object} options - Additional options
 */
export function showSuccessToast(toast, title, description, options = {}) {
  return toast({
    variant: 'success',
    title,
    description,
    duration: options.duration || 4000,
    ...options,
  });
}

/**
 * Show an error toast notification
 * @param {Function} toast - The toast function from useToast
 * @param {string} title - Title of the toast
 * @param {string|Error} error - Error message or Error object
 * @param {Object} options - Additional options
 */
export function showErrorToast(toast, title, error, options = {}) {
  const errorMessage = error instanceof Error ? error.message : error;
  
  return toast({
    variant: 'destructive',
    title,
    description: errorMessage,
    duration: options.duration || 6000, // Longer duration for errors
    ...options,
  });
}

/**
 * Show a warning toast notification
 * @param {Function} toast - The toast function from useToast
 * @param {string} title - Title of the toast
 * @param {string} description - Description/message
 * @param {Object} options - Additional options
 */
export function showWarningToast(toast, title, description, options = {}) {
  return toast({
    variant: 'warning',
    title,
    description,
    duration: options.duration || 5000,
    ...options,
  });
}

/**
 * Show an informational toast notification
 * @param {Function} toast - The toast function from useToast
 * @param {string} title - Title of the toast
 * @param {string} description - Description/message
 * @param {Object} options - Additional options
 */
export function showInfoToast(toast, title, description, options = {}) {
  return toast({
    variant: 'info',
    title,
    description,
    duration: options.duration || 4000,
    ...options,
  });
}

/**
 * Show a loading toast notification
 * @param {Function} toast - The toast function from useToast
 * @param {string} title - Title of the toast
 * @param {string} description - Description/message
 * @returns {Object} Toast object with dismiss method
 */
export function showLoadingToast(toast, title, description = 'Please wait...') {
  return toast({
    variant: 'info',
    title,
    description,
    duration: Infinity, // Don't auto-dismiss loading toasts
  });
}

/**
 * Handle API response and show appropriate toast notification
 * @param {Function} toast - The toast function from useToast
 * @param {Object} response - The API response object
 * @param {Object} messages - Messages for success/error states
 * @param {string} messages.success - Success message
 * @param {string} messages.error - Error message
 * @param {string} messages.loading - Loading message (optional)
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

/**
 * Show a toast with action button
 * @param {Function} toast - The toast function from useToast
 * @param {Object} options - Toast options
 * @param {string} options.variant - Toast variant
 * @param {string} options.title - Toast title
 * @param {string} options.description - Toast description
 * @param {string} options.actionLabel - Action button label
 * @param {Function} options.onAction - Action button click handler
 */
export function showActionToast(toast, options) {
  const { variant = 'default', title, description, actionLabel, onAction, ...rest } = options;
  
  return toast({
    variant,
    title,
    description,
    action: actionLabel && onAction ? {
      altText: actionLabel,
      onClick: onAction,
      children: actionLabel,
    } : undefined,
    duration: 8000, // Longer duration for action toasts
    ...rest,
  });
}

/**
 * Show a confirmation toast with undo functionality
 * @param {Function} toast - The toast function from useToast
 * @param {string} title - Toast title
 * @param {string} description - Toast description
 * @param {Function} onUndo - Undo action handler
 * @param {Object} options - Additional options
 */
export function showUndoToast(toast, title, description, onUndo, options = {}) {
  return showActionToast(toast, {
    variant: 'success',
    title,
    description,
    actionLabel: 'Undo',
    onAction: onUndo,
    duration: 8000,
    ...options,
  });
}

/**
 * Utility to create a toast manager for forms
 * @param {Function} toast - The toast function from useToast
 * @returns {Object} Form toast utilities
 */
export function createFormToastManager(toast) {
  return {
    success: (message) => showSuccessToast(toast, 'Success', message),
    error: (message) => showErrorToast(toast, 'Error', message),
    warning: (message) => showWarningToast(toast, 'Warning', message),
    info: (message) => showInfoToast(toast, 'Info', message),
    loading: (message) => showLoadingToast(toast, 'Loading', message),
    
    // Form-specific helpers
    saved: () => showSuccessToast(toast, 'Saved', 'Your changes have been saved successfully'),
    deleted: () => showSuccessToast(toast, 'Deleted', 'Item has been deleted successfully'),
    updated: () => showSuccessToast(toast, 'Updated', 'Item has been updated successfully'),
    created: () => showSuccessToast(toast, 'Created', 'Item has been created successfully'),
    
    // Validation errors
    validationError: (message = 'Please check your input and try again') => 
      showErrorToast(toast, 'Validation Error', message),
    
    // Network errors
    networkError: () => showErrorToast(toast, 'Network Error', 'Please check your connection and try again'),
    
    // Permission errors
    permissionError: () => showErrorToast(toast, 'Permission Denied', 'You do not have permission to perform this action'),
  };
}

/**
 * Batch toast operations
 */
export const toastBatch = {
  /**
   * Show multiple toasts in sequence
   * @param {Function} toast - The toast function
   * @param {Array} toasts - Array of toast configurations
   * @param {number} delay - Delay between toasts in ms
   */
  sequence: async (toast, toasts, delay = 500) => {
    for (const toastConfig of toasts) {
      const { type, title, description, ...options } = toastConfig;
      
      switch (type) {
        case 'success':
          showSuccessToast(toast, title, description, options);
          break;
        case 'error':
          showErrorToast(toast, title, description, options);
          break;
        case 'warning':
          showWarningToast(toast, title, description, options);
          break;
        case 'info':
          showInfoToast(toast, title, description, options);
          break;
        default:
          toast({ title, description, ...options });
      }
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },
  
  /**
   * Clear all toasts
   * @param {Function} dismiss - The dismiss function from useToast
   */
  clear: (dismiss) => {
    dismiss();
  }
};
