import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Department from '@/models/Department';
import Issue from '@/models/Issue';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

/**
 * Get statistics for a specific department
 * @route GET /api/departments/:id/stats
 */
export async function GET(request, { params }) {
  try {
    // Connect to database
    await connectDB();
    
    // Get department id from params - ensure we await params to resolve correctly
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Get session and verify permissions
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to view department statistics' },
        { status: 403 }
      );
    }
    
    // Find department
    const department = await Department.findById(id);
    
    if (!department) {
      return NextResponse.json(
        { success: false, message: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Get issue statistics for this department
    const issueStats = await Issue.aggregate([
      {
        $match: { category: { $in: department.categories } }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format statistics into a more readable structure
    const formattedStats = {
      total: 0,
      reported: 0,
      'under-review': 0,
      'in-progress': 0,
      resolved: 0,
      rejected: 0,
    };
    
    // Populate statistics
    issueStats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });
    
    // Get recent issues for this department (optional)
    const recentIssues = await Issue.find({ 
      category: { $in: department.categories } 
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title status updatedAt');
      
    // Return formatted statistics
    return NextResponse.json({
      success: true,
      stats: formattedStats,
      recentIssues
    });
    
  } catch (error) {
    console.error('Error fetching department statistics:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching department statistics' },
      { status: 500 }
    );
  }
}
