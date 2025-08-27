import connectDB from '@/lib/db/connect';
import { sendWeeklyDigestEmail } from '@/lib/email';
import Issue from '@/models/Issue';
import User from '@/models/User';
import { NextResponse } from 'next/server';

/**
 * Send weekly digest emails to users who have opted in
 * @route POST /api/email/weekly-digest
 */
export async function POST(request) {
  try {
    // Check for authorization (this should be called by a cron job or admin)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'your-cron-secret';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Calculate date range for the past week
    const weekEnd = new Date();
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    console.log(`Generating weekly digest for ${weekStart.toDateString()} to ${weekEnd.toDateString()}`);
    
    // Get users who have opted in for digest emails
    const users = await User.find({
      'notifications.digest': true,
      'notifications.email': true
    }).select('name email');
    
    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users have opted in for weekly digest emails',
        sent: 0
      });
    }
    
    // Calculate weekly statistics
    const stats = await calculateWeeklyStats(weekStart, weekEnd);
    
    // Get recent issues for the digest
    const recentIssues = await Issue.find({
      createdAt: { $gte: weekStart, $lte: weekEnd }
    })
    .select('title status location category createdAt')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
    
    // Send digest emails to all opted-in users
    const emailPromises = users.map(async (user) => {
      try {
        const result = await sendWeeklyDigestEmail({
          to: user.email,
          userName: user.name,
          weekStart,
          weekEnd,
          stats,
          recentIssues
        });
        
        if (result.success) {
          console.log(`Weekly digest sent to ${user.email}`);
          return { success: true, email: user.email };
        } else {
          console.error(`Failed to send digest to ${user.email}:`, result.error);
          return { success: false, email: user.email, error: result.error };
        }
      } catch (error) {
        console.error(`Error sending digest to ${user.email}:`, error);
        return { success: false, email: user.email, error: error.message };
      }
    });
    
    // Wait for all emails to be sent
    const results = await Promise.all(emailPromises);
    
    // Count successful sends
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Weekly digest complete: ${successful} sent, ${failed} failed`);
    
    return NextResponse.json({
      success: true,
      message: `Weekly digest sent to ${successful} users`,
      sent: successful,
      failed: failed,
      stats,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString()
    });
    
  } catch (error) {
    console.error('Error sending weekly digest:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error sending weekly digest' },
      { status: 500 }
    );
  }
}

/**
 * Calculate weekly statistics for the digest
 */
async function calculateWeeklyStats(weekStart, weekEnd) {
  try {
    // New issues this week
    const newIssues = await Issue.countDocuments({
      createdAt: { $gte: weekStart, $lte: weekEnd }
    });
    
    // Issues resolved this week
    const resolvedIssues = await Issue.countDocuments({
      status: 'resolved',
      updatedAt: { $gte: weekStart, $lte: weekEnd }
    });
    
    // Issues currently in progress
    const inProgressIssues = await Issue.countDocuments({
      status: 'in-progress'
    });
    
    // Total active issues (not resolved or rejected)
    const totalActiveIssues = await Issue.countDocuments({
      status: { $nin: ['resolved', 'rejected'] }
    });
    
    return {
      newIssues,
      resolvedIssues,
      inProgressIssues,
      totalActiveIssues
    };
  } catch (error) {
    console.error('Error calculating weekly stats:', error);
    return {
      newIssues: 0,
      resolvedIssues: 0,
      inProgressIssues: 0,
      totalActiveIssues: 0
    };
  }
}

/**
 * Get weekly digest preview (for testing)
 * @route GET /api/email/weekly-digest
 */
export async function GET(request) {
  try {
    // Connect to database
    await connectDB();
    
    // Calculate date range for the past week
    const weekEnd = new Date();
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Calculate weekly statistics
    const stats = await calculateWeeklyStats(weekStart, weekEnd);
    
    // Get recent issues for the digest
    const recentIssues = await Issue.find({
      createdAt: { $gte: weekStart, $lte: weekEnd }
    })
    .select('title status location category createdAt')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
    
    // Count users who would receive the digest
    const subscribedUsers = await User.countDocuments({
      'notifications.digest': true,
      'notifications.email': true
    });
    
    return NextResponse.json({
      success: true,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      stats,
      recentIssues,
      subscribedUsers,
      message: `Preview for weekly digest that would be sent to ${subscribedUsers} users`
    });
    
  } catch (error) {
    console.error('Error generating weekly digest preview:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error generating preview' },
      { status: 500 }
    );
  }
}
