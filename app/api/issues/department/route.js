
import { NextResponse } from 'next/server';
import Issue from '@/models/Issue';
import connectDB from '@/lib/db/connect';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get('department');

  if (!department) {
    return NextResponse.json({ error: 'Department is required' }, { status: 400 });
  }

  try {
    await connectDB();
    const issues = await Issue.find({ department });
    return NextResponse.json({ issues });
  } catch (error) {
    console.error('Error fetching issues by department:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
