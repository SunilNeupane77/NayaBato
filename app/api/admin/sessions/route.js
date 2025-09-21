import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import UserSession from '@/models/UserSession';
import User from '@/models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status'); // 'active', 'inactive', 'all'
    const userId = searchParams.get('userId');

    let query = {};
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (userId) query.userId = userId;

    const sessions = await UserSession.find(query)
      .populate('userId', 'name email role')
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await UserSession.countDocuments(query);

    // Get session statistics
    const stats = await UserSession.aggregate([
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          activeSessions: { $sum: { $cond: ['$isActive', 1, 0] } },
          avgSessionDuration: { $avg: '$sessionDuration' }
        }
      }
    ]);

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || { totalSessions: 0, activeSessions: 0, avgSessionDuration: 0 }
    });

  } catch (error) {
    console.error('Sessions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    const newSession = new UserSession(body);
    await newSession.save();
    await newSession.populate('userId', 'name email role');

    return NextResponse.json({ session: newSession }, { status: 201 });

  } catch (error) {
    console.error('Session create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
