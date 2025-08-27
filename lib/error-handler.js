import { NextResponse } from 'next/server';

/**
 * Standard error response format for API routes
 * 
 * @param {Error} error - The error object
 * @param {number} [status=500] - HTTP status code
 * @returns {NextResponse} Standardized error response
 */
export function handleApiError(error, status = 500) {
  console.error(`API Error (${status}):`, error);
  
  // Default error message for production (avoid exposing sensitive details)
  let message = 'An unexpected error occurred';
  
  // Use specific error message in development or for safe errors
  if (process.env.NODE_ENV !== 'production' || status < 500) {
    message = error.message || message;
  }
  
  // Ensure we have error details
  const errorDetails = {
    success: false, 
    message,
    timestamp: new Date().toISOString(),
    path: error.path || 'unknown', // Add request path if available
    // Include error details in development
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: error.stack,
      name: error.name 
    })
  };
  
  // Create standard error response
  return NextResponse.json(errorDetails, { status });
}

/**
 * Error with HTTP status code
 */
export class HttpError extends Error {
  /**
   * Create an HTTP error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

/**
 * Create a 400 Bad Request error
 * @param {string} [message='Bad request'] - Error message
 * @returns {HttpError}
 */
export function badRequest(message = 'Bad request') {
  return new HttpError(message, 400);
}

/**
 * Create a 401 Unauthorized error
 * @param {string} [message='Unauthorized'] - Error message
 * @returns {HttpError}
 */
export function unauthorized(message = 'Unauthorized') {
  return new HttpError(message, 401);
}

/**
 * Create a 403 Forbidden error
 * @param {string} [message='Forbidden'] - Error message
 * @returns {HttpError}
 */
export function forbidden(message = 'Forbidden') {
  return new HttpError(message, 403);
}

/**
 * Create a 404 Not Found error
 * @param {string} [message='Not found'] - Error message
 * @returns {HttpError}
 */
export function notFound(message = 'Not found') {
  return new HttpError(message, 404);
}

/**
 * Create a 409 Conflict error
 * @param {string} [message='Resource conflict'] - Error message
 * @returns {HttpError}
 */
export function conflict(message = 'Resource conflict') {
  return new HttpError(message, 409);
}

/**
 * Create a 422 Unprocessable Entity error
 * @param {string} [message='Validation failed'] - Error message
 * @returns {HttpError}
 */
export function validationError(message = 'Validation failed') {
  return new HttpError(message, 422);
}
