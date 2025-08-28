import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Department from '@/models/Department';

export async function GET() {
  try {
    await connectDB();
    
    const departments = await Department.find({}).sort({ name: 1 });

    return NextResponse.json({ departments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}
