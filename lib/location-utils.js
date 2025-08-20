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
