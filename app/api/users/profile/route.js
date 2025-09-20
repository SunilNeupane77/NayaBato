import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phoneNumber, bio, location, department } = body;

    await connectDB();
    
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        name,
        email,
        phoneNumber,
        bio,
        location,
        ...(session.user.role === 'official' && { department })
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    await User.findByIdAndDelete(session.user.id);

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
