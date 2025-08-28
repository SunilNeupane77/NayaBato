import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).select('notifications');
    
    return NextResponse.json({ preferences: user.notifications });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const updates = await request.json();
    
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { [`notifications.${Object.keys(updates)[0]}`]: Object.values(updates)[0] } },
      { new: true }
    ).select('notifications');

    return NextResponse.json({ preferences: user.notifications });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
