import connectDB from '@/lib/db/connect';
import Issue from '@/models/Issue';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get statistics for admin dashboard
 * @route GET /api/admin/stats
 */
export async function GET(request) {
  try {
    // Check if user is authorized
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Get statistics
    const [
      totalIssues,
      issuesByStatus,
      issuesByCategory,
      recentIssues,
      issueResolutionTime
    ] = await Promise.all([
      // Total issues count
      Issue.countDocuments(),
      
      // Issues grouped by status
      Issue.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            status: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]),
      
      // Issues grouped by category
      Issue.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            category: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]),
      
      // Recent issues
      Issue.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('reporter', 'name')
        .lean(),
      
      // Average resolution time
      Issue.aggregate([
        {
          $match: { 
            status: 'resolved'
          }
        },
        {
          $lookup: {
            from: 'issues',
            localField: '_id',
            foreignField: '_id',
            as: 'statusHistory'
          }
        },
        {
          $unwind: '$statusHistory'
        },
        {
          $match: {
            'statusHistory.status': 'resolved'
          }
        },
        {
          $project: {
            resolutionTime: {
              $subtract: [
                '$statusHistory.updatedAt',
                '$createdAt'
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            averageTime: { $avg: '$resolutionTime' }
          }
        },
        {
          $project: {
            _id: 0,
            averageTimeInDays: { $divide: ['$averageTime', 1000 * 60 * 60 * 24] }
          }
        }
      ])
    ]);
    
    // Format the status data for chart display
    const statusData = [
      { status: 'reported', count: 0 },
      { status: 'under-review', count: 0 },
      { status: 'in-progress', count: 0 },
      { status: 'resolved', count: 0 },
      { status: 'rejected', count: 0 }
    ];
    
    // Fill in actual counts
    issuesByStatus.forEach(item => {
      const existingItem = statusData.find(s => s.status === item.status);
      if (existingItem) {
        existingItem.count = item.count;
      }
    });
    
    // Get resolution time in days (or null if no resolved issues)
    const averageResolutionTimeInDays = issueResolutionTime.length > 0
      ? issueResolutionTime[0].averageTimeInDays
      : null;
    
    return NextResponse.json({
      success: true,
      stats: {
        totalIssues,
        issuesByStatus,
        issuesByCategory,
        recentIssues,
        averageResolutionTimeInDays
      }
    });
    
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching statistics' },
      { status: 500 }
    );
  }
}
