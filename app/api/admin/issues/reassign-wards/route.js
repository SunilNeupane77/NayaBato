import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import { handleApiError, unauthorized } from '@/lib/error-handler';
import { assignWardToIssue } from '@/lib/ward-assignment';
import Issue from '@/models/Issue';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

/**
 * Bulk reassign wards to existing issues using Haversine algorithm
 * @route POST /api/admin/issues/reassign-wards
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      throw unauthorized('Admin access required');
    }
    
    const { onlyUnassigned = true, limit = 100 } = await request.json();
    
    await connectDB();
    
    // Build query filter
    const filter = {};
    if (onlyUnassigned) {
      filter.assignedWard = null;
    }
    
    // Get issues to reassign
    const issues = await Issue.find(filter)
      .limit(limit)
      .select('_id title location assignedWard')
      .lean();
    
    if (issues.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No issues found to reassign',
        results: {
          total: 0,
          assigned: 0,
          failed: 0,
          details: []
        }
      });
    }
    
    const results = {
      total: issues.length,
      assigned: 0,
      failed: 0,
      details: []
    };
    
    // Process each issue
    for (const issue of issues) {
      try {
        if (issue.location?.coordinates?.coordinates) {
          const assignmentResult = await assignWardToIssue(issue.location.coordinates.coordinates);
          
          if (assignmentResult.success) {
            // Update the issue with the assigned ward
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
              method: assignmentResult.method
            });
          } else {
            results.failed++;
            results.details.push({
              issueId: issue._id,
              title: issue.title,
              success: false,
              error: assignmentResult.message
            });
          }
        } else {
          results.failed++;
          results.details.push({
            issueId: issue._id,
            title: issue.title,
            success: false,
            error: 'Invalid location coordinates'
          });
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          issueId: issue._id,
          title: issue.title,
          success: false,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Reassignment completed: ${results.assigned} assigned, ${results.failed} failed`,
      results
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}
