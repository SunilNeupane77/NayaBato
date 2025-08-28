import connectDB from '@/lib/db/connect';
import { sendOTPEmail } from '@/lib/email/otp';
import OTP from '@/models/OTP';
import User from '@/models/User';
import { NextResponse } from 'next/server';

/**
 * Handle password reset request (redirects to OTP system)
 * @route POST /api/auth/forgot-password
 */
export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No account found with this email' },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete existing OTPs for this email and type
    await OTP.deleteMany({ email: email.toLowerCase(), type: 'password_reset' });

    // Create new OTP
    await OTP.create({
      email: email.toLowerCase(),
      otp,
      type: 'password_reset'
    });

    // Send OTP email
    await sendOTPEmail({
      to: email,
      otp,
      type: 'password_reset',
      name: user.name
    });

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
