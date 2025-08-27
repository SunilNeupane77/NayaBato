import connectDB from '@/lib/db/connect';
import { sendPasswordResetEmail } from '@/lib/email';
import User from '@/models/User';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

/**
 * Handle password reset request
 * @route POST /api/auth/forgot-password
 */
export async function POST(request) {
  try {
    const { email } = await request.json();
    
    // Validate input
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set expiry (1 hour)
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    const resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Save reset token to user
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();
    
    // Create reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;
    
    // Send password reset email
    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
        expiresIn: '1 hour'
      });
      
      console.log(`Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      // Clear reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      
      return NextResponse.json(
        { success: false, message: 'Failed to send password reset email. Please try again.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Password reset link has been sent to your email address.'
    });
    
  } catch (error) {
    console.error('Password reset error:', error);
    
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
