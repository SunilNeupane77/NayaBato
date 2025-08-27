// API endpoint to test email service
import { 
  sendIssueConfirmation, 
  sendStatusUpdateEmail, 
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendCommentNotificationEmail,
  sendAssignmentNotificationEmail,
  sendWeeklyDigestEmail
} from '@/lib/email';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, email, data } = body;

    // Check if request is authorized (this is a simple check - enhance security as needed)
    if (process.env.NODE_ENV === 'production' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!type || !email) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail({
          to: email,
          name: data?.name || 'Test User',
          role: data?.role || 'citizen'
        });
        break;

      case 'issue-confirmation':
        result = await sendIssueConfirmation({
          to: email,
          issueId: data?.issueId || '123456789abcdef',
          title: data?.title || 'Test Issue',
          location: data?.location || 'Test Location'
        });
        break;

      case 'status-update':
        result = await sendStatusUpdateEmail({
          to: email,
          issueId: data?.issueId || '123456789abcdef',
          title: data?.title || 'Test Issue',
          status: data?.status || 'reported',
          notes: data?.notes || 'Test status update notes'
        });
        break;

      case 'password-reset':
        result = await sendPasswordResetEmail({
          to: email,
          name: data?.name || 'Test User',
          resetUrl: data?.resetUrl || 'http://localhost:3000/auth/reset-password?token=test-token',
          expiresIn: data?.expiresIn || '1 hour'
        });
        break;

      case 'comment-notification':
        result = await sendCommentNotificationEmail({
          to: email,
          recipientName: data?.recipientName || 'Test User',
          commenterName: data?.commenterName || 'John Doe',
          issueTitle: data?.issueTitle || 'Test Issue',
          issueId: data?.issueId || '123456789abcdef',
          comment: data?.comment || 'This is a test comment notification.'
        });
        break;

      case 'assignment-notification':
        result = await sendAssignmentNotificationEmail({
          to: email,
          officialName: data?.officialName || 'Test Official',
          issueTitle: data?.issueTitle || 'Test Issue Assignment',
          issueId: data?.issueId || '123456789abcdef',
          category: data?.category || 'roads',
          priority: data?.priority || 'medium',
          location: data?.location || 'Test Location',
          description: data?.description || 'This is a test issue assignment.',
          reporterName: data?.reporterName || 'Jane Smith',
          assignedBy: data?.assignedBy || 'Admin User'
        });
        break;

      case 'weekly-digest':
        const mockStats = {
          newIssues: 5,
          resolvedIssues: 3,
          inProgressIssues: 7,
          totalActiveIssues: 15
        };
        
        const mockRecentIssues = [
          {
            title: 'Pothole on Main Street',
            status: 'in-progress',
            location: { address: '123 Main Street' },
            category: 'roads',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            title: 'Broken Streetlight',
            status: 'resolved',
            location: { address: '456 Oak Avenue' },
            category: 'electricity',
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
          }
        ];

        const weekEnd = new Date();
        const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

        result = await sendWeeklyDigestEmail({
          to: email,
          userName: data?.userName || 'Test User',
          weekStart,
          weekEnd,
          stats: data?.stats || mockStats,
          recentIssues: data?.recentIssues || mockRecentIssues
        });
        break;

      default:
        return NextResponse.json(
          { success: false, message: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${type} email sent to ${email}`,
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Failed to send ${type} email`,
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in test-email API route:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error while sending email',
      error: error.message
    }, { status: 500 });
  }
}
