import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

/**
 * Handle password reset confirmation
 * @route POST /api/auth/reset-password
 */
export async function POST(request) {
  try {
    const { token, password, confirmPassword } = await request.json();
    
    // Validate input
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }
    
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Hash the token to match what's stored in database
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    // Set new password (will be hashed by pre-save hook)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    console.log(`Password reset successful for user: ${user.email}`);
    
    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.'
    });
    
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
