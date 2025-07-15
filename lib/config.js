/**
 * Configuration file for the Nayabato application
 * Contains constants used throughout the application
 */

// Issue categories
export const ISSUE_CATEGORIES = {
  POTHOLE: 'pothole',
  STREETLIGHT: 'streetlight',
  GARBAGE: 'garbage',
  WATER: 'water',
  ELECTRICITY: 'electricity',
  OTHER: 'other',
};

// Issue statuses
export const ISSUE_STATUSES = {
  REPORTED: 'reported',
  UNDER_REVIEW: 'under-review',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

// Category display names
export const CATEGORY_DISPLAY_NAMES = {
  [ISSUE_CATEGORIES.POTHOLE]: 'Potholes',
  [ISSUE_CATEGORIES.STREETLIGHT]: 'Streetlights',
  [ISSUE_CATEGORIES.GARBAGE]: 'Garbage',
  [ISSUE_CATEGORIES.WATER]: 'Water Issues',
  [ISSUE_CATEGORIES.ELECTRICITY]: 'Electricity',
  [ISSUE_CATEGORIES.OTHER]: 'Other Issues',
};

// Status display names
export const STATUS_DISPLAY_NAMES = {
  [ISSUE_STATUSES.REPORTED]: 'Reported',
  [ISSUE_STATUSES.UNDER_REVIEW]: 'Under Review',
  [ISSUE_STATUSES.IN_PROGRESS]: 'In Progress',
  [ISSUE_STATUSES.RESOLVED]: 'Resolved',
  [ISSUE_STATUSES.REJECTED]: 'Not Actionable',
};

// Status colors
export const STATUS_COLORS = {
  [ISSUE_STATUSES.REPORTED]: 'bg-orange-500',
  [ISSUE_STATUSES.UNDER_REVIEW]: 'bg-blue-500',
  [ISSUE_STATUSES.IN_PROGRESS]: 'bg-yellow-500',
  [ISSUE_STATUSES.RESOLVED]: 'bg-green-500',
  [ISSUE_STATUSES.REJECTED]: 'bg-red-500',
};

// User roles
export const USER_ROLES = {
  CITIZEN: 'citizen',
  OFFICIAL: 'official',
  ADMIN: 'admin',
};

// Default pagination settings
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
};

// Image upload limits
export const UPLOADS = {
  MAX_IMAGES: 3,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_SIZE_MB: 5,
};

/**
 * Format a status for display
 * @param {String} status - The raw status value
 * @returns {String} - Formatted status for display
 */
export function formatStatus(status) {
  return STATUS_DISPLAY_NAMES[status] || status;
}

/**
 * Format a category for display
 * @param {String} category - The raw category value
 * @returns {String} - Formatted category for display
 */
export function formatCategory(category) {
  return CATEGORY_DISPLAY_NAMES[category] || category;
}
