// Schema for Issue Comments
import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  isInternal: {
    type: Boolean,
    default: false,
    description: 'If true, only officials can see this comment'
  },
  attachments: [{
    url: {
      type: String
    },
    publicId: {
      type: String
    },
    fileName: {
      type: String
    }
  }]
}, {
  timestamps: true
});

// Create a compound index for efficient querying
CommentSchema.index({ issue: 1, createdAt: -1 });

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
