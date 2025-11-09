import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import { handleApiError, unauthorized } from '@/lib/error-handler';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

/**
 * Verify user account
 * @route POST /api/admin/verify-user
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      throw unauthorized('Admin access required');
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOneAndUpdate(
      { email },
      { verified: true },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${user.name} has been verified`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}
