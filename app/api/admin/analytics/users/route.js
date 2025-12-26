import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import UserSession from '@/models/UserSession';
import UserActivity from '@/models/UserActivity';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 1d, 7d, 30d, 90d

    let dateFilter = {};
    const now = new Date();
    switch (period) {
      case '1d':
        dateFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
        break;
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
    }

    // Execute all aggregations in parallel
    const [
      userTrends,
      activeUsersData,
      activityBreakdown,
      geoDistribution,
      deviceStats,
      totalUsers,
      newUsers,
      totalActiveSessions
    ] = await Promise.all([
      // User registration trends
      User.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              role: "$role"
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.date": 1 } }
      ]),

      // Active users
      UserSession.aggregate([
        { $match: { lastActivity: dateFilter } },
        {
          $group: {
            _id: "$userId",
            lastActivity: { $max: "$lastActivity" },
            sessionCount: { $sum: 1 }
          }
        }
      ]),

      // User activity breakdown
      UserActivity.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: "$action",
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: "$userId" }
          }
        },
        {
          $project: {
            action: "$_id",
            count: 1,
            uniqueUsers: { $size: "$uniqueUsers" }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Geographic distribution
      UserSession.aggregate([
        { $match: { loginTime: dateFilter } },
        {
          $group: {
            _id: {
              country: "$location.country",
              city: "$location.city"
            },
            users: { $addToSet: "$userId" },
            sessions: { $sum: 1 }
          }
        },
        {
          $project: {
            location: "$_id",
            uniqueUsers: { $size: "$users" },
            sessions: 1
          }
        },
        { $sort: { uniqueUsers: -1 } },
        { $limit: 10 }
      ]),

      // Device/Browser stats
      UserSession.aggregate([
        { $match: { loginTime: dateFilter } },
        {
          $group: {
            _id: {
              browser: "$device.browser",
              os: "$device.os",
              isMobile: "$device.isMobile"
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Summary counts
      User.countDocuments(),
      User.countDocuments({ createdAt: dateFilter }),
      UserSession.countDocuments({ isActive: true })
    ]);

    return NextResponse.json({
      userTrends,
      activeUsers: activeUsersData.length,
      activityBreakdown,
      geoDistribution,
      deviceStats,
      summary: {
        totalUsers,
        activeUsers: activeUsersData.length,
        newUsers,
        activeSessions: totalActiveSessions
      }
    });

  } catch (error) {
    console.error('User analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
