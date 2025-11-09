import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Ward from '@/models/Ward';
import Issue from '@/models/Issue';
import User from '@/models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'official' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { number: parseInt(search) || 0 }
      ];
    }

    // For officials, only show assigned wards
    if (session.user.role === 'official') {
      filter.assignedOfficials = session.user.id;
    }

    const wards = await Ward.find(filter)
      .sort({ number: 1 })
      .skip(skip)
      .limit(limit)
      .populate('officerInCharge', 'name email')
      .populate('assignedOfficials', 'name email')
      .lean();

    const total = await Ward.countDocuments(filter);

    // Get issue statistics for each ward
    const wardsWithStats = await Promise.all(
      wards.map(async (ward) => {
        const [totalIssues, pendingIssues, resolvedIssues, inProgressIssues, highPriorityIssues, citizenCount] = await Promise.all([
          Issue.countDocuments({ assignedWard: ward._id }),
          Issue.countDocuments({ assignedWard: ward._id, status: { $in: ['pending', 'reported'] } }),
          Issue.countDocuments({ assignedWard: ward._id, status: 'resolved' }),
          Issue.countDocuments({ assignedWard: ward._id, status: { $in: ['in_progress', 'in-progress', 'under-review'] } }),
          Issue.countDocuments({ assignedWard: ward._id, priority: 'high', status: { $ne: 'resolved' } }),
          User.countDocuments({ role: 'citizen', ward: ward._id })
        ]);

        return {
          ...ward,
          issueStats: {
            total: totalIssues,
            pending: pendingIssues,
            resolved: resolvedIssues,
            inProgress: inProgressIssues,
            highPriority: highPriorityIssues
          },
          citizenCount
        };
      })
    );

    return NextResponse.json({
      success: true,
      wards: wardsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Official wards error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
