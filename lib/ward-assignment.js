/**
 * Ward Assignment Utility using Haversine Algorithm
 * Automatically assigns issues to the nearest ward based on location
 */

import Ward from '@/models/Ward';
import { haversineDistance } from './location-utils';

/**
 * Find the nearest ward using Haversine algorithm
 * @param {Array} coordinates - [longitude, latitude] coordinates of the issue
 * @param {number} maxDistance - Maximum distance in meters (default: 10000m = 10km)
 * @returns {Object|null} - Nearest ward with distance or null if none found
 */
export async function findNearestWardHaversine(coordinates, maxDistance = 10000) {
  try {
    // Get all active wards
    const wards = await Ward.find({ isActive: true }).lean();
    
    if (!wards || wards.length === 0) {
      return null;
    }
    
    let nearestWard = null;
    let minDistance = Infinity;
    
    // Calculate distance to each ward using Haversine formula
    for (const ward of wards) {
      if (ward.location?.coordinates?.coordinates) {
        const distance = haversineDistance(coordinates, ward.location.coordinates.coordinates);
        
        if (distance < minDistance && distance <= maxDistance) {
          minDistance = distance;
          nearestWard = ward;
        }
      }
    }
    
    return nearestWard ? {
      ward: nearestWard,
      distance: Math.round(minDistance)
    } : null;
    
  } catch (error) {
    console.error('Error in findNearestWardHaversine:', error);
    return null;
  }
}

/**
 * Assign ward to issue using multiple strategies
 * 1. Haversine algorithm (primary)
 * 2. MongoDB geospatial query (fallback)
 * @param {Array} coordinates - [longitude, latitude] coordinates
 * @returns {Object} - Assignment result with ward and method used
 */
export async function assignWardToIssue(coordinates) {
  try {
    // Strategy 1: Use Haversine algorithm
    const haversineResult = await findNearestWardHaversine(coordinates);
    
    if (haversineResult) {
      return {
        success: true,
        ward: haversineResult.ward,
        distance: haversineResult.distance,
        method: 'haversine',
        message: `Ward assigned using Haversine algorithm (${haversineResult.distance}m away)`
      };
    }
    
    // Strategy 2: Fallback to MongoDB geospatial query
    const nearestWards = await Ward.findNearest(coordinates, 15000); // 15km max
    
    if (nearestWards && nearestWards.length > 0) {
      return {
        success: true,
        ward: nearestWards[0],
        distance: null,
        method: 'mongodb_geo',
        message: 'Ward assigned using MongoDB geospatial query'
      };
    }
    
    // No ward found within reasonable distance
    return {
      success: false,
      ward: null,
      distance: null,
      method: 'none',
      message: 'No ward found within reasonable distance'
    };
    
  } catch (error) {
    console.error('Error in assignWardToIssue:', error);
    return {
      success: false,
      ward: null,
      distance: null,
      method: 'error',
      message: `Error assigning ward: ${error.message}`
    };
  }
}

/**
 * Get ward assignment statistics
 * @returns {Object} - Statistics about ward assignments
 */
export async function getWardAssignmentStats() {
  try {
    const Issue = await import('@/models/Issue').then(m => m.default);
    
    const stats = await Issue.aggregate([
      {
        $group: {
          _id: {
            hasWard: { $cond: [{ $ne: ['$assignedWard', null] }, 'assigned', 'unassigned'] }
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const wardStats = await Ward.aggregate([
      {
        $lookup: {
          from: 'issues',
          localField: '_id',
          foreignField: 'assignedWard',
          as: 'issues'
        }
      },
      {
        $project: {
          name: 1,
          number: 1,
          issueCount: { $size: '$issues' },
          isActive: 1
        }
      },
      { $sort: { issueCount: -1 } }
    ]);
    
    return {
      assignmentStats: stats,
      wardStats: wardStats
    };
    
  } catch (error) {
    console.error('Error getting ward assignment stats:', error);
    return null;
  }
}
