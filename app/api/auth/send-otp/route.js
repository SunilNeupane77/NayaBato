import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { createOTP } from '@/lib/otp-utils';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();
    const { email, type } = await request.json();

    if (!email || !type) {
      return NextResponse.json({ error: 'Email and type required' }, { status: 400 });
    }

    const otp = await createOTP(email, type);
    
    const subject = type === 'email_verification' ? 'Email Verification OTP' : 'Password Reset OTP';
    const html = `
      <h2>Your OTP Code</h2>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `;

    await sendEmail(email, subject, html);

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
