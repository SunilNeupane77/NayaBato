import mongoose from 'mongoose';

const IssueVoteSchema = new mongoose.Schema({
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  voteType: {
    type: String,
    enum: ['upvote', 'urgent'],
    required: true
  }
}, {
  timestamps: true
});

IssueVoteSchema.index({ issue: 1, user: 1 }, { unique: true });

export default mongoose.models.IssueVote || mongoose.model('IssueVote', IssueVoteSchema);
