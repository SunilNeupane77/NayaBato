import connectDB from '@/lib/db/connect';
import { sendIssueConfirmation, sendStatusUpdate } from '@/lib/email';
import Issue from '@/models/Issue';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Send email notifications
 * @route POST /api/email
 * @body { type: string, data: object }
 */
export async function POST(request) {
  try {
    // Get session to check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Only admin and officials can send emails directly via API
    if (session.user.role !== 'admin' && session.user.role !== 'official') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to send emails' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { type, data } = body;
    
    if (!type || !data) {
      return NextResponse.json(
        { success: false, message: 'Email type and data are required' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (type) {
      case 'issue_confirmation':
        // Validate issue data
        if (!data.issueId) {
          return NextResponse.json(
            { success: false, message: 'Issue ID is required' },
            { status: 400 }
          );
        }
        
        // Find issue and user
        const issue = await Issue.findById(data.issueId).populate('reporter');
        
        if (!issue) {
          return NextResponse.json(
            { success: false, message: 'Issue not found' },
            { status: 404 }
          );
        }
        
        // Check if user has opted for email notifications
        if (!issue.reporter.notifications.email) {
          return NextResponse.json({
            success: false,
            message: 'User has opted out of email notifications'
          });
        }
        
        // Send confirmation email
        result = await sendIssueConfirmation({
          issue,
          user: issue.reporter
        });
        break;
        
      case 'status_update':
        // Validate status update data
        if (!data.issueId || !data.status) {
          return NextResponse.json(
            { success: false, message: 'Issue ID and status are required' },
            { status: 400 }
          );
        }
        
        // Find issue and user
        const updatedIssue = await Issue.findById(data.issueId).populate('reporter');
        
        if (!updatedIssue) {
          return NextResponse.json(
            { success: false, message: 'Issue not found' },
            { status: 404 }
          );
        }
        
        // Check if user has opted for email notifications
        if (!updatedIssue.reporter.notifications.email) {
          return NextResponse.json({
            success: false,
            message: 'User has opted out of email notifications'
          });
        }
        
        // Get latest status history entry for notes
        const statusNote = data.note || '';
        
        // Send status update email
        result = await sendStatusUpdate({
          issue: updatedIssue,
          user: updatedIssue.reporter,
          status: data.status,
          note: statusNote
        });
        break;
        
      case 'custom':
        // Validate custom email data
        if (!data.userId || !data.subject || !data.message) {
          return NextResponse.json(
            { success: false, message: 'User ID, subject, and message are required' },
            { status: 400 }
          );
        }
        
        // Find user
        const user = await User.findById(data.userId);
        
        if (!user) {
          return NextResponse.json(
            { success: false, message: 'User not found' },
            { status: 404 }
          );
        }
        
        // Check if user has opted for email notifications
        if (!user.notifications.email) {
          return NextResponse.json({
            success: false,
            message: 'User has opted out of email notifications'
          });
        }
        
        // Send custom email
        // Note: This is a placeholder, implement sendCustomEmail in /lib/email/index.js
        result = { success: true, message: 'Custom email sending not implemented yet' };
        break;
        
      default:
        return NextResponse.json(
          { success: false, message: 'Unsupported email type' },
          { status: 400 }
        );
    }
    
    // Return the result
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      result
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error sending email' },
      { status: 500 }
    );
  }
}
