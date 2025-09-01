import mongoose from 'mongoose';

const UserSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  ipAddress: String,
  userAgent: String,
  device: {
    type: String,
    browser: String,
    os: String,
    isMobile: Boolean
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  logoutTime: Date,
  sessionDuration: Number, // in minutes
  isActive: {
    type: Boolean,
    default: true
  },
  location: {
    country: String,
    city: String,
    region: String,
    timezone: String
  },
  activities: [{
    action: String,
    page: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  loginMethod: {
    type: String,
    enum: ['email', 'social', 'otp'],
    default: 'email'
  }
}, {
  timestamps: true
});

UserSessionSchema.index({ userId: 1, isActive: 1 });
UserSessionSchema.index({ sessionId: 1 });
UserSessionSchema.index({ loginTime: -1 });

export default mongoose.models.UserSession || mongoose.model('UserSession', UserSessionSchema);
