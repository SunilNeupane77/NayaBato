import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Issue from '@/models/Issue';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['admin', 'official'].includes(session.user.role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    // Get date ranges
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic counts
    const [totalIssues, totalUsers, weeklyIssues, monthlyIssues] = await Promise.all([
      Issue.countDocuments(),
      User.countDocuments(),
      Issue.countDocuments({ createdAt: { $gte: lastWeek } }),
      Issue.countDocuments({ createdAt: { $gte: lastMonth } })
    ]);

    // Status distribution
    const statusStats = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Category distribution
    const categoryStats = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Priority distribution
    const priorityStats = await Issue.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Weekly trend (last 7 days)
    const weeklyTrend = await Issue.aggregate([
      {
        $match: { createdAt: { $gte: lastWeek } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Resolution rate
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    const resolutionRate = totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0;

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalIssues,
          totalUsers,
          weeklyIssues,
          monthlyIssues,
          resolutionRate: parseFloat(resolutionRate)
        },
        distributions: {
          status: statusStats.map(s => ({ name: s._id, value: s.count })),
          category: categoryStats.map(c => ({ name: c._id, value: c.count })),
          priority: priorityStats.map(p => ({ name: p._id || 'medium', value: p.count }))
        },
        trends: {
          weekly: weeklyTrend.map(w => ({ date: w._id, count: w.count }))
        }
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch analytics' 
    }, { status: 500 });
  }
}
