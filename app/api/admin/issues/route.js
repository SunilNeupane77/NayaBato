import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Issue from '@/models/Issue';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const department = searchParams.get('department');
    const search = searchParams.get('search');

    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (department && department !== 'all') {
      query.assignedTo = department;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const issues = await Issue.find(query)
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ issues });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}
