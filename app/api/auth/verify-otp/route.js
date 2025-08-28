import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { verifyOTP } from '@/lib/otp-utils';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    const { email, otp, type } = await request.json();

    if (!email || !otp || !type) {
      return NextResponse.json({ error: 'Email, OTP and type required' }, { status: 400 });
    }

    const verification = await verifyOTP(email, otp, type);
    
    if (!verification.valid) {
      return NextResponse.json({ error: verification.message }, { status: 400 });
    }

    if (type === 'email_verification') {
      await User.findOneAndUpdate({ email }, { verified: true });
    }

    return NextResponse.json({ message: 'OTP verified successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
