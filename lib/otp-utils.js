import OTP from '@/models/OTP';

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOTP(email, type) {
  await OTP.deleteMany({ email, type });
  
  const otp = generateOTP();
  await OTP.create({ email, otp, type });
  
  return otp;
}

export async function verifyOTP(email, otp, type) {
  const otpRecord = await OTP.findOne({ email, otp, type });
  
  if (!otpRecord) {
    return { valid: false, message: 'Invalid or expired OTP' };
  }
  
  await OTP.deleteOne({ _id: otpRecord._id });
  return { valid: true };
}
