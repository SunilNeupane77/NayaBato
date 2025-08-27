import connectDB from '@/lib/db/connect';
import { sendCommentNotificationEmail } from '@/lib/email';
import Comment from '@/models/Comment';
import Issue from '@/models/Issue';
import Notification from '@/models/Notification';
import User from '@/models/User';
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
    
    // Check if the issue exists and get full details
    const issue = await Issue.findById(body.issue)
      .populate('reporter', 'name email notifications')
      .populate('assignedTo', 'name email notifications');
      
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
    
    // Get the comment author details
    const commentAuthor = await User.findById(session.user.id).select('name email');
    
    // Create comment
    const comment = await Comment.create({
      ...body,
      author: session.user.id
    });
    
    // Populate author details for response
    await comment.populate('author', 'name email role');
    
    // Collect users to notify (avoid duplicates and don't notify the comment author)
    const usersToNotify = new Set();
    
    // Add issue reporter if they're not the comment author and it's not an internal comment
    if (issue.reporter && 
        issue.reporter._id.toString() !== session.user.id && 
        !body.isInternal &&
        issue.reporter.notifications?.email) {
      usersToNotify.add(JSON.stringify({
        id: issue.reporter._id,
        name: issue.reporter.name,
        email: issue.reporter.email,
        role: 'reporter'
      }));
    }
    
    // Add assigned official if they're not the comment author and it's not an internal comment
    if (issue.assignedTo && 
        issue.assignedTo._id.toString() !== session.user.id && 
        !body.isInternal &&
        issue.assignedTo.notifications?.email) {
      usersToNotify.add(JSON.stringify({
        id: issue.assignedTo._id,
        name: issue.assignedTo.name,
        email: issue.assignedTo.email,
        role: 'assigned'
      }));
    }
    
    // Send notifications and emails
    const notificationPromises = [];
    const emailPromises = [];
    
    for (const userStr of usersToNotify) {
      const user = JSON.parse(userStr);
      
      // Create in-app notification
      notificationPromises.push(
        Notification.createNotification({
          recipient: user.id,
          title: 'New comment on issue',
          message: `${commentAuthor.name} commented on: ${issue.title}`,
          type: 'comment',
          referenceId: comment._id,
          referenceModel: 'Comment'
        })
      );
      
      // Send email notification
      emailPromises.push(
        sendCommentNotificationEmail({
          to: user.email,
          recipientName: user.name,
          commenterName: commentAuthor.name,
          issueTitle: issue.title,
          issueId: issue._id.toString(),
          comment: body.content
        }).catch(emailError => {
          console.error(`Failed to send comment notification email to ${user.email}:`, emailError);
          // Don't fail the request if email fails
        })
      );
    }
    
    // Execute all notifications and emails in parallel
    try {
      await Promise.all([...notificationPromises, ...emailPromises]);
      console.log(`Sent ${usersToNotify.size} comment notifications for issue ${issue._id}`);
    } catch (notificationError) {
      console.error('Error sending comment notifications:', notificationError);
      // Don't fail the request if notifications fail
    }
    
    return NextResponse.json({
      success: true,
      comment,
      notificationsSent: usersToNotify.size
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating comment:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating comment' },
      { status: 500 }
    );
  }
}
