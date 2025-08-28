import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Issue from '@/models/Issue';

export async function POST(request) {
  try {
    await connectDB();
    const { action, issueIds, targetDept } = await request.json();

    let updateData = {};

    switch (action) {
      case 'assign':
        updateData = { assignedTo: targetDept };
        break;
      case 'status-in-progress':
        updateData = { status: 'in-progress' };
        break;
      case 'status-resolved':
        updateData = { status: 'resolved', resolvedAt: new Date() };
        break;
      case 'priority-high':
        updateData = { priority: 'high' };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await Issue.updateMany(
      { _id: { $in: issueIds } },
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to perform bulk action' }, { status: 500 });
  }
}
