import connectDB from '@/lib/db/connect';
import { sendWelcomeEmail } from '@/lib/email';
import OTP from '@/models/OTP';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, otp, type } = await request.json();
    
    if (!email || !otp || !type) {
      return NextResponse.json(
        { success: false, message: 'Email, OTP, and type are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find and verify OTP
    const otpRecord = await OTP.findOne({ email, otp, type });
    
    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Handle different OTP types
    if (type === 'signup') {
      const { name, password, role } = otpRecord.userData;
      
      // Create user
      const user = await User.create({
        name,
        email,
        password,
        role: role || 'citizen',
        verified: true
      });

      // Send welcome email
      try {
        await sendWelcomeEmail({
          to: user.email,
          name: user.name,
          role: user.role
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      // Delete OTP
      await OTP.deleteOne({ _id: otpRecord._id });

      return NextResponse.json({
        success: true,
        message: 'Account created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    if (type === 'password_reset') {
      // Delete OTP and return success (password will be reset in next step)
      await OTP.deleteOne({ _id: otpRecord._id });
      
      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully'
      });
    }

    if (type === 'email_verification') {
      // Update user verification status
      await User.findOneAndUpdate(
        { email },
        { verified: true }
      );

      // Delete OTP
      await OTP.deleteOne({ _id: otpRecord._id });

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully'
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid OTP type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
