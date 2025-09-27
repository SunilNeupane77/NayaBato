import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import Issue from '@/models/Issue';
import Comment from '@/models/Comment';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const [user, issues, comments] = await Promise.all([
      User.findById(session.user.id).select('-password'),
      Issue.find({ reporter: session.user.id }),
      Comment.find({ author: session.user.id })
    ]);

    const exportData = {
      user,
      issues,
      comments,
      exportDate: new Date().toISOString()
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="nayabato-data.json"'
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
