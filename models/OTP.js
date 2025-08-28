import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['signup', 'password_reset', 'email_verification'],
    required: true
  },
  userData: {
    name: String,
    password: String,
    role: String
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 300 // 5 minutes
  }
}, {
  timestamps: true
});

export default mongoose.models.OTP || mongoose.model('OTP', otpSchema);
