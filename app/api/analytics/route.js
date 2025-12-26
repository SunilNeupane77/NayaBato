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

    // Run all independent queries in parallel
    const [
      totalIssues,
      totalUsers,
      pendingIssues,
      resolvedIssues,
      weeklyIssues,
      monthlyIssues,
      statusStats,
      categoryStats,
      priorityStats,
      weeklyCreatedTrend,
      weeklyResolvedTrend
    ] = await Promise.all([
      Issue.countDocuments(),
      User.countDocuments(),
      Issue.countDocuments({ status: { $nin: ['resolved', 'rejected'] } }),
      Issue.countDocuments({ status: 'resolved' }),
      Issue.countDocuments({ createdAt: { $gte: lastWeek } }),
      Issue.countDocuments({ createdAt: { $gte: lastMonth } }),
      // Aggregations
      Issue.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Issue.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Issue.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      // Weekly Created Trend
      Issue.aggregate([
        { $match: { createdAt: { $gte: lastWeek } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Weekly Resolved Trend
      Issue.aggregate([
        { $match: { updatedAt: { $gte: lastWeek }, status: 'resolved' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const resolutionRate = totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0;

    // Process weekly data to merge created and resolved
    const weeklyDataMap = new Map();

    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      weeklyDataMap.set(dateStr, { day: dayName, issues: 0, resolved: 0, date: dateStr });
    }

    weeklyCreatedTrend.forEach(item => {
      if (weeklyDataMap.has(item._id)) {
        weeklyDataMap.get(item._id).issues = item.count;
      }
    });

    weeklyResolvedTrend.forEach(item => {
      if (weeklyDataMap.has(item._id)) {
        weeklyDataMap.get(item._id).resolved = item.count;
      }
    });

    const weeklyData = Array.from(weeklyDataMap.values());

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalIssues,
          totalUsers,
          pendingIssues,
          resolvedIssues,
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
          weekly: weeklyData
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
