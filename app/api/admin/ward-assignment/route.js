import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import { handleApiError, unauthorized, badRequest } from '@/lib/error-handler';
import { wardAssignmentService } from '@/lib/services/ward-assignment-service';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

/**
 * Get ward assignment analytics and statistics
 * @route GET /api/admin/ward-assignment
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      throw unauthorized('Admin or official access required');
    }
    
    await connectDB();
    
    const analytics = await wardAssignmentService.getAssignmentAnalytics();
    
    return NextResponse.json({
      success: true,
      analytics
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Test ward assignment for coordinates or bulk reassign issues
 * @route POST /api/admin/ward-assignment
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      throw unauthorized('Admin access required');
    }
    
    const body = await request.json();
    const { action, ...options } = body;
    
    await connectDB();
    
    switch (action) {
      case 'test': {
        const { coordinates } = options;
        
        if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
          throw badRequest('Invalid coordinates format. Expected [longitude, latitude]');
        }
        
        const result = await wardAssignmentService.assignWard(coordinates, {
          maxDistance: options.maxDistance || 10000,
          fallbackToNearest: true,
          includeAlternatives: true
        });
        
        return NextResponse.json({
          success: true,
          test: result
        });
      }
      
      case 'bulk_reassign': {
        const {
          onlyUnassigned = true,
          limit = 100,
          maxDistance = 10000
        } = options;
        
        const result = await wardAssignmentService.bulkReassignIssues({
          onlyUnassigned,
          limit,
          maxDistance,
          onProgress: null // Could implement WebSocket for real-time progress
        });
        
        return NextResponse.json({
          success: true,
          bulkReassignment: result
        });
      }
      
      case 'clear_cache': {
        wardAssignmentService.clearCache();
        
        return NextResponse.json({
          success: true,
          message: 'Ward assignment cache cleared'
        });
      }
      
      default:
        throw badRequest('Invalid action. Supported actions: test, bulk_reassign, clear_cache');
    }
    
  } catch (error) {
    return handleApiError(error);
  }
}
