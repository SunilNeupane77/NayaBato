import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { deleteImage } from '@/lib/cloudinary';
import { deleteWithAudit, updateWithAudit } from '@/lib/db/audit-utils';
import connectDB from '@/lib/db/connect';
import { sendAssignmentNotificationEmail, sendStatusUpdateEmail } from '@/lib/email';
// Import models - order matters for schema registration
// Import models in dependency order
import Issue from '@/models/Issue';
import Notification from '@/models/Notification';
import User from '@/models/User'; // User is referenced by Ward
import Ward from '@/models/Ward'; // Ward is referenced by Issue
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

const ensureDB = async () => {
  await connectDB();
};

const getSessionUser = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');
  const user = await User.findById(session.user.id);
  if (!user) throw new Error('User not found');
  return { session, user };
};

export async function GET(_req, context) {
  // Properly await and destructure the context to get params
  const { params } = await context;
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
  const { params } = await context;
  const { id } = params;
  const body = await request.json();
  const { session, user } = await getSessionUser();
  const isAdmin = ['admin', 'official'].includes(session.user.role);

  await ensureDB();
  const issue = await Issue.findById(id)
    .populate('reporter', 'name email notifications')
    .populate('assignedTo', 'name email notifications');
    
  if (!issue) return NextResponse.json({ success: false, message: 'Issue not found' }, { status: 404 });

  // Log reporter details to debug
  console.log('Found issue with reporter:', 
    issue.reporter ? 
    `ID: ${issue.reporter._id}, Email: ${issue.reporter.email}` : 
    'No reporter found');

  if (!isAdmin && issue.reporter && issue.reporter._id && issue.reporter._id.toString() !== session.user.id) {
    return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });
  }

  const updates = {};
  let pushHistory = null;
  let wasAssigned = false;
  let previousAssignedTo = issue.assignedTo;

  if (session.user.role === 'citizen') {
    ['title', 'description'].forEach(k => body[k] && (updates[k] = body[k]));
    if (body.status) return NextResponse.json({ success: false, message: 'Citizens cannot update status' }, { status: 403 });
  } else {
    ['title', 'description', 'category', 'assignedWard', 'priority'].forEach(k => body[k] && (updates[k] = body[k]));

    // Handle assignment changes
    if (body.assignedTo && body.assignedTo !== issue.assignedTo?.toString()) {
      updates.assignedTo = body.assignedTo;
      wasAssigned = true;
    }

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
    notify: Boolean(pushHistory || wasAssigned),
    notifyUsers: [issue.reporter._id],
    notifyTitle: pushHistory
      ? `Status Updated: ${issue.title}`
      : wasAssigned
      ? `Issue Assigned: ${issue.title}`
      : `Issue Updated: ${issue.title}`,
    notifyMessage: pushHistory
      ? `Status changed to ${body.status}`
      : wasAssigned
      ? `Issue has been assigned to an official`
      : `Issue details updated.`,
  });
  
  // Ensure we have all the required details populated for sending emails
  if (!updatedIssue.populated('reporter') || !updatedIssue.populated('assignedTo')) {
    await updatedIssue.populate([
      { path: 'reporter', select: 'name email notifications' },
      { path: 'assignedTo', select: 'name email notifications department' }
    ]);
  }

  // Send assignment notification email if issue was assigned to someone new
  if (wasAssigned && updatedIssue.assignedTo) {
    try {
      const assignedOfficial = await User.findById(updatedIssue.assignedTo._id || updatedIssue.assignedTo)
        .select('name email notifications');
      
      if (assignedOfficial && assignedOfficial.notifications?.email) {
        await sendAssignmentNotificationEmail({
          to: assignedOfficial.email,
          officialName: assignedOfficial.name,
          issueTitle: updatedIssue.title,
          issueId: updatedIssue._id.toString(),
          category: updatedIssue.category,
          priority: updatedIssue.priority || 'medium',
          location: updatedIssue.location?.address || 'Location not specified',
          description: updatedIssue.description,
          reporterName: updatedIssue.reporter?.name || 'Anonymous',
          assignedBy: user.name
        });
        
        console.log(`Assignment notification email sent to ${assignedOfficial.email}`);
      }
    } catch (assignmentEmailError) {
      console.error('Error sending assignment notification email:', assignmentEmailError);
    }
  }

  // Send status update emails if status changed
  if (pushHistory) {
    try {
      // Ensure reporter is properly populated before sending email
      console.log('Reporter details:', JSON.stringify(updatedIssue.reporter));
      
      if (!updatedIssue.reporter || !updatedIssue.reporter.email) {
        console.error('Reporter email missing, re-fetching issue with populated reporter...');
        
        // Try to fetch the full reporter information directly
        try {
          const reporterId = updatedIssue.reporter?._id || updatedIssue.reporter;
          if (reporterId) {
            const reporter = await User.findById(reporterId).select('name email notifications');
            if (reporter && reporter.email) {
              console.log(`Found reporter directly: ${reporter.name} (${reporter.email})`);
              // Update the reporter in our local variable
              updatedIssue.reporter = reporter;
            }
          }
        } catch (reporterFetchError) {
          console.error('Error fetching reporter directly:', reporterFetchError);
        }
        
        // If still no reporter, try to re-populate
        if (!updatedIssue.reporter?.email) {
          await updatedIssue.populate('reporter', 'name email notifications');
          console.log('After population, reporter details:', JSON.stringify(updatedIssue.reporter));
        }
      }

      // Send email to reporter if they have email notifications enabled
      if (updatedIssue.reporter && 
          updatedIssue.reporter.email && 
          updatedIssue.reporter.notifications?.email) {
        await sendStatusUpdateEmail({
          to: updatedIssue.reporter.email,
          issueId: updatedIssue._id.toString(),
          title: updatedIssue.title,
          status: updatedIssue.status,
          notes: pushHistory.notes,
        });
        console.log(`Status update email sent to reporter: ${updatedIssue.reporter.email}`);
      } else {
        console.log('Skipping reporter email: no email or notifications disabled');
      }
      
      // If there are any additional stakeholders who should receive the email,
      // we'll send them notifications too (e.g., department officials)
      const additionalRecipients = [];
      
      // If assigned to a specific official, notify them as well
      if (updatedIssue.assignedTo && 
          updatedIssue.assignedTo.email && 
          updatedIssue.assignedTo.notifications?.email) {
        try {
          await sendStatusUpdateEmail({
            to: updatedIssue.assignedTo.email,
            issueId: updatedIssue._id.toString(),
            title: updatedIssue.title,
            status: updatedIssue.status,
            notes: pushHistory.notes,
          });
          console.log(`Status update email sent to assignee ${updatedIssue.assignedTo.email}`);
          additionalRecipients.push(updatedIssue.assignedTo.email);
        } catch (assigneeEmailError) {
          console.error('Error sending status update email to assignee:', assigneeEmailError);
        }
      }
      
      // Notify department officials for specific status transitions
      // For example, when an issue is reported or when it's resolved
      if (['reported', 'resolved'].includes(updatedIssue.status)) {
        try {
          // Find department officials responsible for this category
          const departmentName = updatedIssue.category === 'other' ? 'general' : updatedIssue.category;
          const departmentOfficials = await User.find({ 
            role: 'official', 
            department: departmentName,
            email: { $ne: updatedIssue.assignedTo?.email }, // Don't duplicate emails
            'notifications.email': true
          }).select('email name');
          
          // Send emails to each official
          for (const official of departmentOfficials) {
            if (official.email && !additionalRecipients.includes(official.email)) {
              await sendStatusUpdateEmail({
                to: official.email,
                issueId: updatedIssue._id.toString(),
                title: updatedIssue.title,
                status: updatedIssue.status,
                notes: pushHistory.notes,
              });
              console.log(`Status update email sent to department official ${official.email}`);
              additionalRecipients.push(official.email);
            }
          }
        } catch (deptEmailError) {
          console.error('Error sending status update emails to department officials:', deptEmailError);
        }
        
        // Also notify the ward officer if the issue is assigned to a ward
        try {
          if (updatedIssue.assignedWard) {
            // Get the ward details including the officer in charge
            const ward = await Ward.findById(updatedIssue.assignedWard)
              .populate('officerInCharge', 'name email notifications');
            
            if (ward && 
                ward.officerInCharge && 
                ward.officerInCharge.email &&
                ward.officerInCharge.notifications?.email &&
                !additionalRecipients.includes(ward.officerInCharge.email)) {
              await sendStatusUpdateEmail({
                to: ward.officerInCharge.email,
                issueId: updatedIssue._id.toString(),
                title: updatedIssue.title,
                status: updatedIssue.status,
                notes: `${pushHistory.notes}\n\nThis issue is in your ward (Ward ${ward.number}: ${ward.name}).`,
              });
              console.log(`Status update email sent to ward officer ${ward.officerInCharge.email}`);
              additionalRecipients.push(ward.officerInCharge.email);
            }
          }
        } catch (wardEmailError) {
          console.error('Error sending status update email to ward officer:', wardEmailError);
        }
      }
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
  // Properly await and destructure the context to get params
  const { params } = await context;
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
