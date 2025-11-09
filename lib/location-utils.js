/**
 * Utility functions for location-based calculations
 */

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param {Array} coords1 - First coordinate pair [longitude, latitude]
 * @param {Array} coords2 - Second coordinate pair [longitude, latitude]
 * @returns {number} - Distance in meters
 */
export function haversineDistance(coords1, coords2) {
  // Radius of the Earth in meters
  const R = 6371000;
  
  // Convert coordinates from [longitude, latitude] to [latitude, longitude]
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  
  // Convert latitude and longitude from degrees to radians
  const radLat1 = (Math.PI * lat1) / 180;
  const radLat2 = (Math.PI * lat2) / 180;
  const radDeltaLat = (Math.PI * (lat2 - lat1)) / 180;
  const radDeltaLon = (Math.PI * (lon2 - lon1)) / 180;
  
  // Haversine formula
  const a = 
    Math.sin(radDeltaLat / 2) * Math.sin(radDeltaLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * 
    Math.sin(radDeltaLon / 2) * Math.sin(radDeltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Find the nearest ward to a given coordinate
 * @param {Array} coordinates - [longitude, latitude] coordinates
 * @param {Array} wards - Array of ward objects with location.coordinates
 * @returns {Object|null} - Nearest ward or null if no wards provided
 */
export function findNearestWard(coordinates, wards) {
  if (!wards || wards.length === 0) {
    return null;
  }
  
  let nearestWard = null;
  let minDistance = Infinity;
  
  for (const ward of wards) {
    if (ward.location && ward.location.coordinates) {
      const distance = haversineDistance(coordinates, ward.location.coordinates);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestWard = ward;
      }
    }
  }
  
  return {
    ward: nearestWard,
    distance: minDistance
  };
}

/**
 * Find all wards within a specified radius
 * @param {Array} coordinates - [longitude, latitude] coordinates
 * @param {Array} wards - Array of ward objects with location.coordinates
 * @param {number} radius - Radius in meters
 * @returns {Array} - Array of wards within radius with distances
 */
export function findWardsWithinRadius(coordinates, wards, radius) {
  if (!wards || wards.length === 0) {
    return [];
  }
  
  const wardsWithinRadius = [];
  
  for (const ward of wards) {
    if (ward.location && ward.location.coordinates) {
      const distance = haversineDistance(coordinates, ward.location.coordinates);
      
      if (distance <= radius) {
        wardsWithinRadius.push({
          ward,
          distance: Math.round(distance)
        });
      }
    }
  }
  
  // Sort by distance (nearest first)
  return wardsWithinRadius.sort((a, b) => a.distance - b.distance);
}

/**
 * Calculate the center point (centroid) of multiple coordinates
 * @param {Array} coordinatesArray - Array of [longitude, latitude] pairs
 * @returns {Array|null} - Center coordinates [longitude, latitude] or null
 */
export function calculateCentroid(coordinatesArray) {
  if (!coordinatesArray || coordinatesArray.length === 0) {
    return null;
  }
  
  let totalLat = 0;
  let totalLon = 0;
  
  for (const [lon, lat] of coordinatesArray) {
    totalLon += lon;
    totalLat += lat;
  }
  
  return [
    totalLon / coordinatesArray.length,
    totalLat / coordinatesArray.length
  ];
}

/**
 * Check if a point is within a polygon (basic point-in-polygon test)
 * @param {Array} point - [longitude, latitude] coordinates
 * @param {Array} polygon - Array of [longitude, latitude] coordinates forming polygon
 * @returns {boolean} - True if point is inside polygon
 */
export function isPointInPolygon(point, polygon) {
  if (!point || !polygon || polygon.length < 3) {
    return false;
  }
  
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

/**
 * Format distance for display
 * @param {number} distance - Distance in meters
 * @returns {string} - Formatted distance string
 */
export function formatDistance(distance) {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
}
