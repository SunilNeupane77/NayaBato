import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Issue from '@/models/Issue';

export async function GET() {
  try {
    await connectDB();

    const totalIssues = await Issue.countDocuments();
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    const pendingIssues = await Issue.countDocuments({ status: { $ne: 'resolved' } });
    
    const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
    
    const resolvedWithTime = await Issue.aggregate([
      { $match: { status: 'resolved', resolvedAt: { $exists: true } } },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' }
        }
      }
    ]);

    const avgResolutionTime = resolvedWithTime.length > 0 
      ? Math.round(resolvedWithTime[0].avgResolutionTime) 
      : 0;

    return NextResponse.json({
      totalIssues,
      resolvedIssues,
      pendingIssues,
      resolutionRate,
      avgResolutionTime
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
