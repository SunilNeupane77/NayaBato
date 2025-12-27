import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/connect';
import Issue from '@/models/Issue';
import mongoose from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Convert string ID to ObjectId for MongoDB query
    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    const stats = await Issue.aggregate([
      { $match: { reporter: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalIssues = await Issue.countDocuments({ reporter: userId });
    const resolvedIssues = stats.find(s => s._id === 'resolved')?.count || 0;
    const inProgressIssues = stats.find(s => s._id === 'in-progress')?.count || 0;
    const pendingIssues = stats.find(s => ['reported', 'under-review', 'pending'].includes(s._id))?.count || 0;

    return NextResponse.json({
      totalIssues,
      resolvedIssues,
      inProgressIssues,
      pendingIssues,
      stats
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
