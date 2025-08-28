import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Issue from '@/models/Issue';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { departmentId } = await request.json();
    const { id } = params;

    await Issue.findByIdAndUpdate(id, {
      assignedTo: departmentId,
      status: 'in-progress'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign issue' }, { status: 500 });
  }
}
