// Schema for User Notifications
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['issue_update', 'comment', 'assignment', 'system', 'other'],
    default: 'other'
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    description: 'Reference to related document (issue, comment, etc.)'
  },
  referenceModel: {
    type: String,
    enum: ['Issue', 'Comment', 'User'],
    description: 'Model name of the referenced document'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indices for efficient querying
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });

// Mark notification as read
NotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  return this.save();
};

// Static method to create notification and send if appropriate
NotificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = await this.create(data);
    
    // Additional logic could be added here for push notifications
    // or real-time notifications via WebSockets
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
