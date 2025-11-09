/**
 * Professional Ward Assignment Service
 * Handles automatic ward assignment for issues using Haversine algorithm
 */

import Ward from '@/models/Ward';
import Issue from '@/models/Issue';
import { 
  calculateHaversineDistance, 
  findNearestWard, 
  batchAssignWards,
  analyzeCoverage,
  validateWardData,
  formatDistance 
} from '@/lib/geospatial';

/**
 * Ward Assignment Service Class
 */
export class WardAssignmentService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cached wards or fetch from database
   * @returns {Array} - Array of active wards
   */
  async getActiveWards() {
    const cacheKey = 'active_wards';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    try {
      const wards = await Ward.find({ isActive: true })
        .select('name number location isActive population area')
        .lean();
      
      // Validate ward data
      const validation = validateWardData(wards);
      if (validation.invalid > 0) {
        console.warn(`Ward data validation: ${validation.invalid} invalid wards found`);
      }
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: wards,
        timestamp: Date.now()
      });
      
      return wards;
    } catch (error) {
      console.error('Error fetching active wards:', error);
      throw new Error('Failed to fetch ward data');
    }
  }

  /**
   * Assign ward to a single issue location
   * @param {Array} coordinates - [longitude, latitude]
   * @param {Object} options - Assignment options
   * @returns {Object} - Assignment result
   */
  async assignWard(coordinates, options = {}) {
    const {
      maxDistance = 10000, // 10km default
      fallbackToNearest = true,
      includeAlternatives = false
    } = options;

    try {
      const wards = await this.getActiveWards();
      
      if (wards.length === 0) {
        return {
          success: false,
          error: 'No active wards available',
          ward: null,
          distance: null,
          method: 'none'
        };
      }

      // Primary assignment using Haversine
      const result = await findNearestWard(coordinates, wards, {
        maxDistance,
        includeInactive: false,
        sortByDistance: true
      });

      if (result && result.nearest) {
        return {
          success: true,
          ward: result.nearest.ward,
          distance: result.nearest.distance,
          method: 'haversine',
          alternatives: includeAlternatives ? result.alternatives : undefined,
          searchRadius: maxDistance,
          message: `Ward assigned: ${result.nearest.ward.name} (${formatDistance(result.nearest.distance)} away)`
        };
      }

      // Fallback: try with larger radius
      if (fallbackToNearest && maxDistance < 25000) {
        const fallbackResult = await findNearestWard(coordinates, wards, {
          maxDistance: 25000,
          includeInactive: false,
          sortByDistance: true
        });

        if (fallbackResult && fallbackResult.nearest) {
          return {
            success: true,
            ward: fallbackResult.nearest.ward,
            distance: fallbackResult.nearest.distance,
            method: 'haversine_fallback',
            searchRadius: 25000,
            message: `Ward assigned with extended search: ${fallbackResult.nearest.ward.name} (${formatDistance(fallbackResult.nearest.distance)} away)`
          };
        }
      }

      return {
        success: false,
        error: 'No ward found within reasonable distance',
        ward: null,
        distance: null,
        method: 'none',
        searchRadius: maxDistance
      };

    } catch (error) {
      console.error('Ward assignment error:', error);
      return {
        success: false,
        error: error.message,
        ward: null,
        distance: null,
        method: 'error'
      };
    }
  }

  /**
   * Bulk reassign wards to existing issues
   * @param {Object} options - Reassignment options
   * @returns {Object} - Bulk assignment results
   */
  async bulkReassignIssues(options = {}) {
    const {
      onlyUnassigned = true,
      limit = 100,
      maxDistance = 10000,
      onProgress = null
    } = options;

    try {
      // Build query filter
      const filter = {};
      if (onlyUnassigned) {
        filter.assignedWard = null;
      }

      // Get issues to process
      const issues = await Issue.find(filter)
        .limit(limit)
        .select('_id title location assignedWard')
        .lean();

      if (issues.length === 0) {
        return {
          success: true,
          message: 'No issues found to reassign',
          stats: {
            total: 0,
            assigned: 0,
            failed: 0,
            skipped: 0
          },
          details: []
        };
      }

      const wards = await this.getActiveWards();
      const results = {
        total: issues.length,
        assigned: 0,
        failed: 0,
        skipped: 0,
        details: []
      };

      // Process issues in batches
      for (let i = 0; i < issues.length; i++) {
        const issue = issues[i];
        
        try {
          // Skip if no valid coordinates
          if (!issue.location?.coordinates?.coordinates) {
            results.skipped++;
            results.details.push({
              issueId: issue._id,
              title: issue.title,
              success: false,
              error: 'Invalid location coordinates',
              action: 'skipped'
            });
            continue;
          }

          const assignmentResult = await this.assignWard(
            issue.location.coordinates.coordinates,
            { maxDistance, fallbackToNearest: true }
          );

          if (assignmentResult.success) {
            // Update the issue
            await Issue.findByIdAndUpdate(issue._id, {
              assignedWard: assignmentResult.ward._id
            });

            results.assigned++;
            results.details.push({
              issueId: issue._id,
              title: issue.title,
              success: true,
              wardName: assignmentResult.ward.name,
              wardNumber: assignmentResult.ward.number,
              distance: assignmentResult.distance,
              method: assignmentResult.method,
              action: 'assigned'
            });
          } else {
            results.failed++;
            results.details.push({
              issueId: issue._id,
              title: issue.title,
              success: false,
              error: assignmentResult.error,
              action: 'failed'
            });
          }

          // Report progress
          if (onProgress && (i + 1) % 10 === 0) {
            onProgress({
              processed: i + 1,
              total: issues.length,
              assigned: results.assigned,
              failed: results.failed,
              skipped: results.skipped
            });
          }

        } catch (error) {
          results.failed++;
          results.details.push({
            issueId: issue._id,
            title: issue.title,
            success: false,
            error: error.message,
            action: 'error'
          });
        }
      }

      return {
        success: true,
        message: `Bulk reassignment completed: ${results.assigned} assigned, ${results.failed} failed, ${results.skipped} skipped`,
        stats: results
      };

    } catch (error) {
      console.error('Bulk reassignment error:', error);
      return {
        success: false,
        error: error.message,
        stats: null
      };
    }
  }

  /**
   * Get ward assignment statistics and analytics
   * @returns {Object} - Comprehensive statistics
   */
  async getAssignmentAnalytics() {
    try {
      const wards = await this.getActiveWards();
      
      // Get issue assignment statistics
      const issueStats = await Issue.aggregate([
        {
          $group: {
            _id: {
              hasWard: { $cond: [{ $ne: ['$assignedWard', null] }, 'assigned', 'unassigned'] }
            },
            count: { $sum: 1 }
          }
        }
      ]);

      // Get ward-wise issue distribution
      const wardDistribution = await Issue.aggregate([
        {
          $match: { assignedWard: { $ne: null } }
        },
        {
          $group: {
            _id: '$assignedWard',
            issueCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'wards',
            localField: '_id',
            foreignField: '_id',
            as: 'ward'
          }
        },
        {
          $unwind: '$ward'
        },
        {
          $project: {
            wardName: '$ward.name',
            wardNumber: '$ward.number',
            issueCount: 1
          }
        },
        {
          $sort: { issueCount: -1 }
        }
      ]);

      // Analyze coverage
      const coverage = analyzeCoverage(wards);

      // Calculate assignment efficiency
      const totalIssues = issueStats.reduce((sum, stat) => sum + stat.count, 0);
      const assignedIssues = issueStats.find(s => s._id.hasWard === 'assigned')?.count || 0;
      const assignmentRate = totalIssues > 0 ? (assignedIssues / totalIssues * 100) : 0;

      return {
        overview: {
          totalWards: wards.length,
          totalIssues,
          assignedIssues,
          unassignedIssues: totalIssues - assignedIssues,
          assignmentRate: Math.round(assignmentRate * 100) / 100
        },
        wardDistribution,
        coverage,
        recommendations: this.generateRecommendations(coverage, assignmentRate, wardDistribution)
      };

    } catch (error) {
      console.error('Error getting assignment analytics:', error);
      throw new Error('Failed to generate analytics');
    }
  }

  /**
   * Generate recommendations based on analytics
   * @param {Object} coverage - Coverage analysis
   * @param {number} assignmentRate - Assignment success rate
   * @param {Array} distribution - Ward distribution data
   * @returns {Array} - Array of recommendations
   */
  generateRecommendations(coverage, assignmentRate, distribution) {
    const recommendations = [];

    // Coverage recommendations
    if (coverage && coverage.averageWardDistance > 10000) {
      recommendations.push({
        type: 'coverage',
        priority: 'high',
        title: 'Poor Ward Coverage',
        description: 'Average distance between wards is too high. Consider adding more wards.',
        action: 'Add intermediate wards in underserved areas'
      });
    }

    // Assignment rate recommendations
    if (assignmentRate < 80) {
      recommendations.push({
        type: 'assignment',
        priority: 'medium',
        title: 'Low Assignment Rate',
        description: `Only ${assignmentRate.toFixed(1)}% of issues are assigned to wards.`,
        action: 'Review unassigned issues and expand search radius or add wards'
      });
    }

    // Load balancing recommendations
    if (distribution.length > 0) {
      const maxIssues = distribution[0].issueCount;
      const avgIssues = distribution.reduce((sum, w) => sum + w.issueCount, 0) / distribution.length;
      
      if (maxIssues > avgIssues * 3) {
        recommendations.push({
          type: 'load_balancing',
          priority: 'medium',
          title: 'Uneven Issue Distribution',
          description: `Ward "${distribution[0].wardName}" has ${maxIssues} issues, much higher than average.`,
          action: 'Consider subdividing high-load wards or redistributing boundaries'
        });
      }
    }

    return recommendations;
  }

  /**
   * Clear service cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const wardAssignmentService = new WardAssignmentService();
