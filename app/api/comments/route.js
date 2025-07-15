import connectDB from '@/lib/db/connect';
import Comment from '@/models/Comment';
import Issue from '@/models/Issue';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get comments for an issue or create a new comment
 * @route GET|POST /api/comments
 */
export async function GET(request) {
  try {
    // Connect to database
    await connectDB();
    
    // Get query parameters
    const url = new URL(request.url);
    const issueId = url.searchParams.get('issue');
    
    if (!issueId) {
      return NextResponse.json(
        { success: false, message: 'Issue ID is required' },
        { status: 400 }
      );
    }
    
    // Get session for role-based filtering
    const session = await getServerSession(authOptions);
    const isOfficial = session?.user && ['admin', 'official'].includes(session.user.role);
    
    // Build query
    const query = { issue: issueId };
    if (!isOfficial) {
      // Non-officials can only see public comments
      query.isInternal = false;
    }
    
    // Find comments
    const comments = await Comment.find(query)
      .populate('author', 'name email role')
      .sort({ createdAt: 1 });
    
    return NextResponse.json({
      success: true,
      count: comments.length,
      comments
    });
    
  } catch (error) {
    console.error('Error fetching comments:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching comments' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Get session to check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.issue || !body.content) {
      return NextResponse.json(
        { success: false, message: 'Issue ID and content are required' },
        { status: 400 }
      );
    }
    
    // Check if the issue exists
    const issue = await Issue.findById(body.issue).populate('reporter', 'email _id');
    if (!issue) {
      return NextResponse.json(
        { success: false, message: 'Issue not found' },
        { status: 404 }
      );
    }
    
    // If it's an internal comment, verify user is an official
    if (body.isInternal && !['admin', 'official'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to create internal comments' },
        { status: 403 }
      );
    }
    
    // Create comment
    const comment = await Comment.create({
      ...body,
      author: session.user.id
    });
    
    // Populate author details for response
    await comment.populate('author', 'name email role');
    
    // Create notification for issue reporter (if not the comment author)
    if (issue.reporter._id.toString() !== session.user.id && !body.isInternal) {
      await Notification.createNotification({
        recipient: issue.reporter._id,
        title: 'New comment on your issue',
        message: `There's a new comment on your issue: ${issue.title}`,
        type: 'comment',
        referenceId: comment._id,
        referenceModel: 'Comment'
      });
    }
    
    return NextResponse.json({
      success: true,
      comment
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating comment:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating comment' },
      { status: 500 }
    );
  }
}
