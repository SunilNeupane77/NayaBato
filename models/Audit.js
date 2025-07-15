// Schema for Audit Logs
import mongoose from 'mongoose';

const AuditSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'create', 
      'update', 
      'delete', 
      'login', 
      'logout', 
      'status_change', 
      'assignment',
      'comment',
      'other'
    ]
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['Issue', 'User', 'Comment', 'Department', 'System']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  details: {
    type: Object
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Create index for efficient querying
AuditSchema.index({ resourceType: 1, resourceId: 1 });
AuditSchema.index({ actor: 1 });
AuditSchema.index({ action: 1 });
AuditSchema.index({ createdAt: -1 });

// Static method to log an audit entry
AuditSchema.statics.log = async function(data) {
  try {
    return await this.create(data);
  } catch (error) {
    console.error('Error logging audit entry:', error);
    // Don't throw error to prevent disrupting main operations
    return null;
  }
};

export default mongoose.models.Audit || mongoose.model('Audit', AuditSchema);
