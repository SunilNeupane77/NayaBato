import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import { sendWeeklyDigestEmail } from '@/lib/email';
import Issue from '@/models/Issue';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    // Get users who have digest emails enabled
    const users = await User.find({ 'notifications.digest': true }).select('name email');
    
    if (users.length === 0) {
      return NextResponse.json({ success: true, message: 'No users subscribed to digest' });
    }

    // Get weekly stats
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const [newIssues, resolvedIssues, totalIssues] = await Promise.all([
      Issue.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      Issue.countDocuments({ status: 'resolved', updatedAt: { $gte: oneWeekAgo } }),
      Issue.countDocuments()
    ]);

    const recentIssues = await Issue.find({ createdAt: { $gte: oneWeekAgo } })
      .select('title category status location.address createdAt')
      .limit(5)
      .sort({ createdAt: -1 });

    // Send digest to all subscribed users
    let sentCount = 0;
    for (const user of users) {
      try {
        await sendWeeklyDigestEmail({
          to: user.email,
          userName: user.name,
          stats: {
            newIssues,
            resolvedIssues,
            totalIssues
          },
          recentIssues
        });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send digest to ${user.email}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Weekly digest sent to ${sentCount} users` 
    });

  } catch (error) {
    console.error('Weekly digest error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to send weekly digest' 
    }, { status: 500 });
  }
}
