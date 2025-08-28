import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/connect';
import IssueUpdate from '@/models/IssueUpdate';
import Issue from '@/models/Issue';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const updates = await IssueUpdate.find({ issue: params.id })
      .populate('updatedBy', 'name role')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ updates });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch updates' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    
    const update = await IssueUpdate.create({
      ...body,
      issue: params.id,
      updatedBy: session.user.id
    });

    await update.populate('updatedBy', 'name role');
    
    return NextResponse.json({ update }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create update' }, { status: 500 });
  }
}
