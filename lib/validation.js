import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

/**
 * Input validation and sanitization utilities
 */

// Common validation patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  mongoId: /^[0-9a-fA-F]{24}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  coordinates: /^-?([1-8]?[0-9](\.[0-9]+)?|90(\.0+)?),\s*-?((1[0-7][0-9])|([0-9]?[0-9]))(\.[0-9]+)?$/
};

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(input) {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitize and validate text input
 */
export function sanitizeText(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags and trim
  let sanitized = validator.stripLow(input.trim());
  sanitized = validator.escape(sanitized);
  
  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Validate email address
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return validator.isEmail(email) && patterns.email.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true, message: 'Password is strong' };
}

/**
 * Validate MongoDB ObjectId
 */
export function validateMongoId(id) {
  if (!id || typeof id !== 'string') return false;
  return patterns.mongoId.test(id);
}

/**
 * Validate phone number
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  return validator.isMobilePhone(phone) || patterns.phone.test(phone);
}

/**
 * Validate coordinates
 */
export function validateCoordinates(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Validate file upload
 */
export function validateFile(file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'], maxSize = 5 * 1024 * 1024) {
  if (!file || !(file instanceof File)) {
    return { valid: false, message: 'Invalid file' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }
  
  if (file.size > maxSize) {
    return { valid: false, message: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB` };
  }
  
  return { valid: true, message: 'File is valid' };
}

/**
 * Validate issue data
 */
export function validateIssueData(data) {
  const errors = {};
  
  // Title validation
  if (!data.title || typeof data.title !== 'string') {
    errors.title = 'Title is required';
  } else if (data.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters long';
  } else if (data.title.trim().length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }
  
  // Description validation
  if (!data.description || typeof data.description !== 'string') {
    errors.description = 'Description is required';
  } else if (data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters long';
  } else if (data.description.trim().length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }
  
  // Category validation
  const validCategories = ['pothole', 'streetlight', 'garbage', 'water', 'electricity', 'other'];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.category = 'Valid category is required';
  }
  
  // Location validation
  if (!data.location || typeof data.location !== 'object') {
    errors.location = 'Location is required';
  } else {
    if (!data.location.coordinates || !data.location.coordinates.coordinates) {
      errors.location = 'Location coordinates are required';
    } else {
      const [lng, lat] = data.location.coordinates.coordinates;
      if (!validateCoordinates(lat, lng)) {
        errors.location = 'Invalid coordinates';
      }
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate user registration data
 */
export function validateUserData(data) {
  const errors = {};
  
  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  } else if (data.name.trim().length > 50) {
    errors.name = 'Name must be less than 50 characters';
  }
  
  // Email validation
  if (!validateEmail(data.email)) {
    errors.email = 'Valid email is required';
  }
  
  // Password validation
  if (data.password) {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.message;
    }
  }
  
  // Phone validation (optional)
  if (data.phoneNumber && !validatePhone(data.phoneNumber)) {
    errors.phoneNumber = 'Invalid phone number format';
  }
  
  // Role validation
  const validRoles = ['citizen', 'official', 'admin'];
  if (data.role && !validRoles.includes(data.role)) {
    errors.role = 'Invalid role specified';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj, maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth || obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, maxDepth, currentDepth + 1));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, maxDepth, currentDepth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
