import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/connect';
import IssueVote from '@/models/IssueVote';
import Issue from '@/models/Issue';
import mongoose from 'mongoose';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { voteType } = await request.json();
    
    const existingVote = await IssueVote.findOne({
      issue: params.id,
      user: session.user.id
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await IssueVote.deleteOne({ _id: existingVote._id });
        await updateVoteCounts(params.id);
        return NextResponse.json({ message: 'Vote removed' });
      } else {
        existingVote.voteType = voteType;
        await existingVote.save();
      }
    } else {
      await IssueVote.create({
        issue: params.id,
        user: session.user.id,
        voteType
      });
    }

    await updateVoteCounts(params.id);
    return NextResponse.json({ message: 'Vote recorded' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}

async function updateVoteCounts(issueId) {
  const votes = await IssueVote.aggregate([
    { $match: { issue: new mongoose.Types.ObjectId(issueId) } },
    { $group: { _id: '$voteType', count: { $sum: 1 } } }
  ]);

  const voteCounts = { upvotes: 0, urgent: 0 };
  votes.forEach(vote => {
    voteCounts[vote._id] = vote.count;
  });

  await Issue.findByIdAndUpdate(issueId, { votes: voteCounts });
}
