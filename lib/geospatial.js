/**
 * Professional Geospatial Utilities using Haversine Formula
 * Optimized for real-world civic engagement applications
 */

// Earth's radius in meters (mean radius)
const EARTH_RADIUS_M = 6371000;

// Default search radius for ward assignment (5km)
const DEFAULT_SEARCH_RADIUS = 5000;

// Maximum reasonable search radius (50km)
const MAX_SEARCH_RADIUS = 50000;

/**
 * Validates coordinate pair
 * @param {Array|Object} coords - Coordinates in [lng, lat] format or {lng, lat}
 * @returns {Array} - Normalized [longitude, latitude] array
 * @throws {Error} - If coordinates are invalid
 */
function validateCoordinates(coords) {
  let lng, lat;
  
  if (Array.isArray(coords)) {
    [lng, lat] = coords;
  } else if (coords && typeof coords === 'object') {
    lng = coords.lng || coords.longitude;
    lat = coords.lat || coords.latitude;
  } else {
    throw new Error('Invalid coordinate format');
  }
  
  if (typeof lng !== 'number' || typeof lat !== 'number') {
    throw new Error('Coordinates must be numbers');
  }
  
  if (lng < -180 || lng > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }
  
  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }
  
  return [lng, lat];
}

/**
 * Calculate distance between two points using Haversine formula
 * Optimized for accuracy and performance
 * @param {Array} point1 - [longitude, latitude]
 * @param {Array} point2 - [longitude, latitude]
 * @returns {number} - Distance in meters
 */
export function calculateHaversineDistance(point1, point2) {
  try {
    const [lng1, lat1] = validateCoordinates(point1);
    const [lng2, lat2] = validateCoordinates(point2);
    
    // Convert to radians
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    
    // Haversine formula
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return EARTH_RADIUS_M * c;
  } catch (error) {
    throw new Error(`Distance calculation failed: ${error.message}`);
  }
}

/**
 * Find nearest ward using optimized Haversine calculation
 * @param {Array} targetCoords - [longitude, latitude] of target location
 * @param {Array} wards - Array of ward objects with location data
 * @param {Object} options - Search options
 * @returns {Object|null} - Nearest ward result or null
 */
export async function findNearestWard(targetCoords, wards, options = {}) {
  const {
    maxDistance = DEFAULT_SEARCH_RADIUS,
    includeInactive = false,
    sortByDistance = true
  } = options;
  
  try {
    validateCoordinates(targetCoords);
    
    if (!Array.isArray(wards) || wards.length === 0) {
      return null;
    }
    
    const candidates = [];
    
    for (const ward of wards) {
      // Skip inactive wards unless explicitly included
      if (!includeInactive && ward.isActive === false) {
        continue;
      }
      
      // Validate ward has location data
      if (!ward.location?.coordinates?.coordinates) {
        continue;
      }
      
      try {
        const wardCoords = ward.location.coordinates.coordinates;
        const distance = calculateHaversineDistance(targetCoords, wardCoords);
        
        // Only include wards within max distance
        if (distance <= maxDistance) {
          candidates.push({
            ward,
            distance: Math.round(distance),
            coordinates: wardCoords
          });
        }
      } catch (error) {
        console.warn(`Skipping ward ${ward.name}: ${error.message}`);
        continue;
      }
    }
    
    if (candidates.length === 0) {
      return null;
    }
    
    // Sort by distance if requested
    if (sortByDistance) {
      candidates.sort((a, b) => a.distance - b.distance);
    }
    
    return {
      nearest: candidates[0],
      alternatives: candidates.slice(1, 3), // Include up to 2 alternatives
      totalFound: candidates.length,
      searchRadius: maxDistance
    };
    
  } catch (error) {
    throw new Error(`Ward search failed: ${error.message}`);
  }
}

/**
 * Batch process multiple locations for ward assignment
 * Optimized for bulk operations
 * @param {Array} locations - Array of coordinate pairs
 * @param {Array} wards - Array of ward objects
 * @param {Object} options - Processing options
 * @returns {Array} - Array of assignment results
 */
export async function batchAssignWards(locations, wards, options = {}) {
  const {
    maxDistance = DEFAULT_SEARCH_RADIUS,
    concurrency = 10,
    onProgress = null
  } = options;
  
  if (!Array.isArray(locations) || locations.length === 0) {
    return [];
  }
  
  const results = [];
  const batches = [];
  
  // Split into batches for concurrent processing
  for (let i = 0; i < locations.length; i += concurrency) {
    batches.push(locations.slice(i, i + concurrency));
  }
  
  let processed = 0;
  
  for (const batch of batches) {
    const batchPromises = batch.map(async (location, index) => {
      try {
        const result = await findNearestWard(location.coordinates, wards, {
          maxDistance,
          includeInactive: false
        });
        
        return {
          id: location.id,
          coordinates: location.coordinates,
          assignment: result,
          success: result !== null,
          error: null
        };
      } catch (error) {
        return {
          id: location.id,
          coordinates: location.coordinates,
          assignment: null,
          success: false,
          error: error.message
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    processed += batch.length;
    
    // Report progress if callback provided
    if (onProgress) {
      onProgress({
        processed,
        total: locations.length,
        percentage: Math.round((processed / locations.length) * 100)
      });
    }
  }
  
  return results;
}

/**
 * Calculate coverage area statistics
 * @param {Array} wards - Array of ward objects
 * @param {Object} options - Analysis options
 * @returns {Object} - Coverage statistics
 */
export function analyzeCoverage(wards, options = {}) {
  const { samplePoints = 100, bounds = null } = options;
  
  if (!Array.isArray(wards) || wards.length === 0) {
    return null;
  }
  
  // Calculate ward centroids and coverage
  const wardStats = wards.map(ward => {
    if (!ward.location?.coordinates?.coordinates) {
      return null;
    }
    
    return {
      id: ward._id,
      name: ward.name,
      number: ward.number,
      coordinates: ward.location.coordinates.coordinates,
      isActive: ward.isActive !== false
    };
  }).filter(Boolean);
  
  // Calculate average distance between wards
  let totalDistance = 0;
  let comparisons = 0;
  
  for (let i = 0; i < wardStats.length; i++) {
    for (let j = i + 1; j < wardStats.length; j++) {
      const distance = calculateHaversineDistance(
        wardStats[i].coordinates,
        wardStats[j].coordinates
      );
      totalDistance += distance;
      comparisons++;
    }
  }
  
  const avgWardDistance = comparisons > 0 ? totalDistance / comparisons : 0;
  
  return {
    totalWards: wardStats.length,
    activeWards: wardStats.filter(w => w.isActive).length,
    averageWardDistance: Math.round(avgWardDistance),
    recommendedSearchRadius: Math.round(avgWardDistance * 0.6), // 60% of avg distance
    coverage: {
      excellent: avgWardDistance < 2000, // < 2km
      good: avgWardDistance < 5000,      // < 5km
      fair: avgWardDistance < 10000,     // < 10km
      poor: avgWardDistance >= 10000     // >= 10km
    }
  };
}

/**
 * Validate and optimize ward location data
 * @param {Array} wards - Array of ward objects
 * @returns {Object} - Validation results
 */
export function validateWardData(wards) {
  if (!Array.isArray(wards)) {
    return { valid: false, error: 'Wards must be an array' };
  }
  
  const results = {
    total: wards.length,
    valid: 0,
    invalid: 0,
    issues: []
  };
  
  wards.forEach((ward, index) => {
    const wardIssues = [];
    
    // Check basic structure
    if (!ward.name) wardIssues.push('Missing name');
    if (typeof ward.number !== 'number') wardIssues.push('Invalid ward number');
    
    // Check location data
    if (!ward.location) {
      wardIssues.push('Missing location data');
    } else if (!ward.location.coordinates) {
      wardIssues.push('Missing coordinates');
    } else if (!ward.location.coordinates.coordinates) {
      wardIssues.push('Missing coordinate values');
    } else {
      try {
        validateCoordinates(ward.location.coordinates.coordinates);
      } catch (error) {
        wardIssues.push(`Invalid coordinates: ${error.message}`);
      }
    }
    
    if (wardIssues.length === 0) {
      results.valid++;
    } else {
      results.invalid++;
      results.issues.push({
        index,
        ward: ward.name || `Ward ${index}`,
        issues: wardIssues
      });
    }
  });
  
  return results;
}

/**
 * Format distance for human-readable display
 * @param {number} distance - Distance in meters
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted distance string
 */
export function formatDistance(distance, options = {}) {
  const { precision = 1, units = 'auto' } = options;
  
  if (typeof distance !== 'number' || distance < 0) {
    return 'Unknown';
  }
  
  if (units === 'km' || (units === 'auto' && distance >= 1000)) {
    return `${(distance / 1000).toFixed(precision)}km`;
  } else {
    return `${Math.round(distance)}m`;
  }
}

/**
 * Create bounding box around coordinates
 * @param {Array} coordinates - [longitude, latitude]
 * @param {number} radiusMeters - Radius in meters
 * @returns {Object} - Bounding box coordinates
 */
export function createBoundingBox(coordinates, radiusMeters) {
  const [lng, lat] = validateCoordinates(coordinates);
  
  // Approximate degrees per meter (varies by latitude)
  const latDegreePerMeter = 1 / 111320;
  const lngDegreePerMeter = 1 / (111320 * Math.cos(lat * Math.PI / 180));
  
  const latOffset = radiusMeters * latDegreePerMeter;
  const lngOffset = radiusMeters * lngDegreePerMeter;
  
  return {
    north: lat + latOffset,
    south: lat - latOffset,
    east: lng + lngOffset,
    west: lng - lngOffset,
    center: [lng, lat],
    radius: radiusMeters
  };
}
