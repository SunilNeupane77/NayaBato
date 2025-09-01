import mongoose from 'mongoose';

const UserActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: String,
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 'page_view', 'issue_created', 'issue_updated', 
      'issue_voted', 'comment_added', 'profile_updated', 'search_performed',
      'file_uploaded', 'notification_read', 'settings_changed'
    ]
  },
  resource: {
    type: String, // e.g., 'issue', 'comment', 'profile'
    resourceId: String // ID of the resource
  },
  page: String,
  method: String, // GET, POST, PUT, DELETE
  ipAddress: String,
  userAgent: String,
  referrer: String,
  responseTime: Number, // in milliseconds
  statusCode: Number,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

UserActivitySchema.index({ userId: 1, createdAt: -1 });
UserActivitySchema.index({ action: 1, createdAt: -1 });
UserActivitySchema.index({ sessionId: 1 });

export default mongoose.models.UserActivity || mongoose.model('UserActivity', UserActivitySchema);
