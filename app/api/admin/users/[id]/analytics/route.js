import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import UserSession from '@/models/UserSession';
import UserActivity from '@/models/UserActivity';
import User from '@/models/User';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user sessions
    const sessions = await UserSession.find({ userId: params.id })
      .sort({ loginTime: -1 })
      .limit(10);

    // Get user activities
    const activities = await UserActivity.find({ userId: params.id })
      .sort({ createdAt: -1 })
      .limit(50);

    // Activity summary
    const activitySummary = await UserActivity.aggregate([
      { $match: { userId: params.id } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          lastActivity: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Session statistics
    const sessionStats = await UserSession.aggregate([
      { $match: { userId: params.id } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalDuration: { $sum: '$sessionDuration' },
          avgDuration: { $avg: '$sessionDuration' },
          lastLogin: { $max: '$loginTime' }
        }
      }
    ]);

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      sessions,
      activities,
      activitySummary,
      sessionStats: sessionStats[0] || {}
    });

  } catch (error) {
    console.error('User analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
