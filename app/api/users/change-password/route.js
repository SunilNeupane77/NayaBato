import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    await connectDB();
    
    const user = await User.findById(session.user.id).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(session.user.id, { password: hashedPassword });

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
