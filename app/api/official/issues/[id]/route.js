import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Issue from '@/models/Issue';
import Ward from '@/models/Ward';
import Comment from '@/models/Comment';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'official' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    let issue;
    if (session.user.role === 'admin') {
      issue = await Issue.findById(id)
        .populate('citizen', 'name email')
        .populate('ward', 'name number')
        .populate('department', 'name');
    } else {
      // Check if official has access to this issue's ward
      const assignedWards = await Ward.find({ 
        assignedOfficials: session.user.id 
      }).select('_id');
      const wardIds = assignedWards.map(ward => ward._id);

      issue = await Issue.findOne({
        _id: id,
        $or: [
          { ward: { $in: wardIds } },
          { assignedWard: { $in: wardIds } }
        ]
      })
        .populate('citizen', 'name email')
        .populate('ward', 'name number')
        .populate('department', 'name');
    }

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found or access denied' }, { status: 404 });
    }

    // Get comments
    const comments = await Comment.find({ issue: issue._id })
      .populate('author', 'name role')
      .sort({ createdAt: 1 });

    return NextResponse.json({ issue, comments });

  } catch (error) {
    console.error('Issue detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'official' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();
    const { id } = await params;

    let issue;
    if (session.user.role === 'admin') {
      issue = await Issue.findById(id);
    } else {
      // Check if official has access to this issue's ward
      const assignedWards = await Ward.find({ 
        assignedOfficials: session.user.id 
      }).select('_id');
      const wardIds = assignedWards.map(ward => ward._id);

      issue = await Issue.findOne({
        _id: id,
        $or: [
          { ward: { $in: wardIds } },
          { assignedWard: { $in: wardIds } }
        ]
      });
    }

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found or access denied' }, { status: 404 });
    }

    // Update allowed fields
    const allowedFields = ['status', 'priority', 'assignedDepartment', 'officialNotes'];
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        issue[field] = body[field];
      }
    });

    await issue.save();
    await issue.populate(['citizen', 'ward', 'department']);

    return NextResponse.json(issue);

  } catch (error) {
    console.error('Issue update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
