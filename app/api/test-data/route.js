import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Issue from '@/models/Issue';
import Ward from '@/models/Ward';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    const [issueCount, wardCount, userCount] = await Promise.all([
      Issue.countDocuments(),
      Ward.countDocuments(),
      User.countDocuments()
    ]);

    const sampleIssue = await Issue.findOne();
    const sampleWard = await Ward.findOne();
    const sampleUser = await User.findOne();

    return NextResponse.json({
      counts: {
        issues: issueCount,
        wards: wardCount,
        users: userCount
      },
      samples: {
        issue: sampleIssue,
        ward: sampleWard,
        user: sampleUser
      }
    });

  } catch (error) {
    console.error('Test data error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
