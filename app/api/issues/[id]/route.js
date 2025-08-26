import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { deleteImage } from '@/lib/cloudinary';
import { deleteWithAudit, updateWithAudit } from '@/lib/db/audit-utils';
import connectDB from '@/lib/db/connect';
import { sendStatusUpdateEmail } from '@/lib/email';
// Import models - order matters for schema registration
import Issue from '@/models/Issue';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

const ensureDB = async () => {
  await connectDB();
};

const getSessionUser = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');
  const user = await User.findOne({ email: session.user.email });
  if (!user) throw new Error('User not found');
  return { session, user };
};

export async function GET(_req, context) {
  const { params } = context;
  const id = params.id;
  await ensureDB();

  const issue = await Issue.findById(id)
    .populate('reporter', 'name email')
    .populate('assignedTo', 'name email department')
    .populate('assignedWard', 'name number location')
    .populate('statusHistory.updatedBy', 'name email role');

  if (!issue) return NextResponse.json({ success: false, message: 'Issue not found' }, { status: 404 });

  return NextResponse.json({ success: true, issue });
}

export async function PUT(request, context) {
  const { params } = context;
  const id = params.id;
  const body = await request.json();
  const { session, user } = await getSessionUser();
  const isAdmin = ['admin', 'official'].includes(session.user.role);

  await ensureDB();
  const issue = await Issue.findById(id).populate('reporter', 'email');
  if (!issue) return NextResponse.json({ success: false, message: 'Issue not found' }, { status: 404 });

  if (!isAdmin && issue.reporter._id.toString() !== session.user.id) {
    return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });
  }

  const updates = {};
  let pushHistory = null;

  if (session.user.role === 'citizen') {
    ['title', 'description'].forEach(k => body[k] && (updates[k] = body[k]));
    if (body.status) return NextResponse.json({ success: false, message: 'Citizens cannot update status' }, { status: 403 });
  } else {
    ['title', 'description', 'category', 'assignedTo', 'assignedWard'].forEach(k => body[k] && (updates[k] = body[k]));

    if (body.status && body.status !== issue.status) {
      updates.status = body.status;
      pushHistory = {
        status: body.status,
        updatedBy: user._id,
        notes: body.notes ?? '',
      };
    }
  }

  const updatedIssue = await updateWithAudit({
    model: Issue,
    id,
    updates: pushHistory ? { ...updates, $push: { statusHistory: pushHistory } } : updates,
    actor: user,
    requestInfo: {
      ip: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent'),
    },
    notify: Boolean(pushHistory),
    notifyUsers: [issue.reporter._id],
    notifyTitle: pushHistory
      ? `Status Updated: ${issue.title}`
      : `Issue Updated: ${issue.title}`,
    notifyMessage: pushHistory
      ? `Status changed to ${body.status}`
      : `Issue details updated.`,
  });

  await updatedIssue.populate('reporter', 'name email');

  if (pushHistory) {
    try {
      // Send email notification to reporter
      await sendStatusUpdateEmail({
        to: updatedIssue.reporter.email,
        issueId: updatedIssue._id.toString(),
        title: updatedIssue.title,
        status: updatedIssue.status,
        notes: pushHistory.notes,
      });
      console.log(`Status update email sent to ${updatedIssue.reporter.email}`);
    } catch (emailError) {
      // Log the error but don't fail the request
      console.error('Error sending status update email:', emailError);
      // Continue processing - don't throw the error
    }

    if (updatedIssue.assignedTo) {
      try {
        await Notification.createNotification({
          recipient: updatedIssue.assignedTo,
          title: `Issue Status Changed: ${updatedIssue.title}`,
          message: `Issue #${updatedIssue._id} is now ${updatedIssue.status}`,
          type: 'issue_update',
          referenceId: updatedIssue._id,
          referenceModel: 'Issue',
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Continue processing - don't throw the error
      }
    }
  }

  return NextResponse.json({ success: true, issue: updatedIssue });
}

export async function DELETE(request, context) {
  const { params } = context;
  const id = params.id;
  const { session, user } = await getSessionUser();

  await ensureDB();
  const issue = await Issue.findById(id);
  if (!issue) return NextResponse.json({ success: false, message: 'Issue not found' }, { status: 404 });
  
  const isAdmin = session.user.role === 'admin';
  const isOfficial = session.user.role === 'official';
  const isResolved = issue.status === 'resolved';
  
  // Only admins can delete any issue
  // Officials can only delete resolved issues
  if (!isAdmin && !isOfficial) {
    return NextResponse.json({ success: false, message: 'Not authorized to delete issues' }, { status: 403 });
  }
  
  if (!isAdmin && !isResolved) {
    return NextResponse.json({ success: false, message: 'Only resolved issues can be deleted' }, { status: 403 });
  }

  await Promise.all(
    (issue.images || [])
      .filter(img => img.publicId)
      .map(img => deleteImage(img.publicId))
  );

  await deleteWithAudit({
    model: Issue,
    id,
    actor: user,
    requestInfo: {
      ip: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent'),
    },
  });

  if (issue.assignedTo) {
    await Notification.createNotification({
      recipient: issue.assignedTo,
      title: `Issue Deleted: ${issue.title}`,
      message: `Issue #${issue._id} has been deleted.`,
      type: 'system',
      referenceModel: 'Issue',
    });
  }

  return NextResponse.json({ success: true, message: 'Issue deleted successfully' });
}
