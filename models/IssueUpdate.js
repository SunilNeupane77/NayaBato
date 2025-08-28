import mongoose from 'mongoose';

const IssueUpdateSchema = new mongoose.Schema({
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  updateType: {
    type: String,
    enum: ['status_change', 'progress_update', 'completion_photo', 'delay_notice'],
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Update message cannot exceed 500 characters']
  },
  images: [{
    url: String,
    publicId: String
  }],
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  estimatedCompletion: Date,
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.IssueUpdate || mongoose.model('IssueUpdate', IssueUpdateSchema);
