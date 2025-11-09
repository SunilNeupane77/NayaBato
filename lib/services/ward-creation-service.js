/**
 * Advanced Ward Creation Service
 * Professional geospatial ward management with optimization
 */

import Ward from '@/models/Ward';
import Issue from '@/models/Issue';
import { 
  calculateHaversineDistance, 
  analyzeCoverage, 
  createBoundingBox,
  formatDistance 
} from '@/lib/geospatial';

export class WardCreationService {
  /**
   * Create ward with intelligent positioning
   */
  async createWard(wardData, options = {}) {
    try {
      // Validate basic ward data
      const validation = this.validateWardData(wardData);
      if (!validation.valid) {
        throw new Error(`Invalid ward data: ${validation.errors.join(', ')}`);
      }

      // Create the ward directly
      const newWard = new Ward(wardData);
      await newWard.save();

      return {
        success: true,
        ward: newWard,
        analytics: {
          message: 'Ward created successfully'
        }
      };

    } catch (error) {
      throw new Error(`Ward creation failed: ${error.message}`);
    }
  }

  /**
   * Validate ward data
   */
  validateWardData(wardData) {
    const errors = [];

    if (!wardData.name?.trim()) errors.push('Ward name is required');
    if (typeof wardData.number !== 'number') errors.push('Ward number must be a number');
    if (!wardData.location?.coordinates?.coordinates) errors.push('Ward coordinates are required');
    
    const coords = wardData.location?.coordinates?.coordinates;
    if (coords) {
      if (!Array.isArray(coords) || coords.length !== 2) {
        errors.push('Coordinates must be [longitude, latitude] array');
      } else {
        const [lng, lat] = coords;
        if (typeof lng !== 'number' || typeof lat !== 'number') {
          errors.push('Coordinates must be numeric values');
        }
        if (lng < -180 || lng > 180) errors.push('Invalid longitude');
        if (lat < -90 || lat > 90) errors.push('Invalid latitude');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const wardCreationService = new WardCreationService();
