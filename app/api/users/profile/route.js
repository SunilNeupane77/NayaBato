import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';

export async function PUT(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { name, phoneNumber } = await request.json();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { name, phoneNumber },
      { new: true }
    ).select('-password');

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
