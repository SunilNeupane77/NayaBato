import connectDB from '@/lib/db/connect';
import { sendOTPEmail } from '@/lib/email/otp';
import OTP from '@/models/OTP';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, type, userData } = await request.json();
    
    if (!email || !type) {
      return NextResponse.json(
        { success: false, message: 'Email and type are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // For signup, check if user already exists
    if (type === 'signup') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email already registered' },
          { status: 400 }
        );
      }
    }

    // For password reset, check if user exists
    if (type === 'password_reset') {
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'No account found with this email' },
          { status: 404 }
        );
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete existing OTPs for this email and type
    await OTP.deleteMany({ email, type });

    // Create new OTP
    await OTP.create({
      email,
      otp,
      type,
      userData: userData || {}
    });

    // Send OTP email
    await sendOTPEmail({
      to: email,
      otp,
      type,
      name: userData?.name || 'User'
    });

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
