import { renderAsync } from '@react-email/components';
import nodemailer from 'nodemailer';

// Create Nodemailer transporter
let transporter;

export function initializeTransporter() {
  // Check for required environment variables
  const emailUser = process.env.EMAIL_USER || 'sunilneupane957@gmail.com'; 
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailPass) {
    console.warn('[Nodemailer] Missing EMAIL_PASS environment variable. Email functionality may not work correctly.');
  }

  // Use a mock transporter in test environment if no password is available
  if (process.env.NODE_ENV === 'test' && !emailPass) {
    console.log('[Nodemailer] Using mock transporter for test environment');
    transporter = {
      sendMail: async (options) => {
        console.log('[Nodemailer Mock] Would send email:', options);
        return { messageId: 'mock-message-id' };
      },
      verify: async () => true
    };
    return Promise.resolve(true);
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    // Enable debugging in development
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
  });

  // Verify transporter configuration
  return transporter.verify()
    .then(() => {
      console.log('[Nodemailer] Email service initialized successfully');
      return true;
    })
    .catch(error => {
      console.error('[Nodemailer] Failed to initialize email service:', error);
      return false;
    });
}

export async function sendEmailWithNodemailer({ to, subject, reactComponent, reactProps }) {
  console.log(`[Nodemailer] Attempting to send email to ${to} with subject "${subject}"`);
  
  try {
    // Validate email address
    if (!to || !to.includes('@')) {
      console.warn(`[Nodemailer] Invalid email address: "${to}". Skipping email send.`);
      return { success: false, error: 'Invalid email address' };
    }

    // Ensure transporter is initialized
    if (!transporter) {
      await initializeTransporter();
      if (!transporter) {
        return { success: false, error: 'Email service not available' };
      }
    }

    console.log(`[Nodemailer] Rendering email template for ${to}`);
    
    // Render the React component to HTML
    let html;
    try {
      html = await renderAsync(reactComponent(reactProps));
      console.log(`[Nodemailer] Successfully rendered email template (${html.length} bytes)`);
    } catch (renderError) {
      console.error('[Nodemailer] Error rendering email template:', renderError);
      return { success: false, error: 'Failed to render email template' };
    }

    // Get sender email with fallback
    const fromEmail = process.env.EMAIL_FROM || 'notifications@sunilneupane77.com.np';
    const fromName = "Nayabato";
    
    // Send the email using Nodemailer
    console.log(`[Nodemailer] Sending email via Nodemailer from ${process.env.EMAIL_USER || 'sunilneupane957@gmail.com'}`);
    
    const mailOptions = {
      from: `${fromName} <${process.env.EMAIL_USER || 'sunilneupane957@gmail.com'}>`,
      to,
      subject,
      html,
      replyTo: process.env.REPLY_TO_EMAIL || 'support@sunilneupane77.com.np',
    };
    
    const info = await transporter.sendMail(mailOptions);

    console.log(`[Nodemailer] Successfully sent email to ${to}. Message ID: ${info.messageId}`);
    return { success: true, data: { id: info.messageId } };
  } catch (error) {
    console.error('[Nodemailer] Unexpected error in sendEmail:', error);
    return { success: false, error: error.message || 'Unknown error sending email' };
  }
}

export async function sendWelcomeEmail({ to, name, role }) {
  try {
    const WelcomeEmail = await import('@/components/email/WelcomeEmail').then(mod => mod.default);
    
    // Generate the dashboard URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const dashboardUrl = `${baseUrl}/dashboard`;

    // Send the email
    return await sendEmailWithNodemailer({
      to,
      subject: `Welcome to Nayabato!`,
      reactComponent: WelcomeEmail,
      reactProps: { name, dashboardUrl, role }
    });
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
    return { success: false, error: error.message };
  }
}

export async function sendIssueConfirmation({ to, issueId, title, location }) {
  try {
    const IssueConfirmationEmail = await import('@/components/email/IssueConfirmationEmail').then(mod => mod.default);
    
    // Generate the issue URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const issueUrl = `${baseUrl}/issues/${issueId}`;

    // Send the email
    return await sendEmailWithNodemailer({
      to,
      subject: `Issue Confirmation: ${title}`,
      reactComponent: IssueConfirmationEmail,
      reactProps: { issueId, title, location, issueUrl }
    });
  } catch (error) {
    console.error('Error in sendIssueConfirmation:', error);
    return { success: false, error: error.message };
  }
}

export async function sendStatusUpdateEmail({ to, issueId, title, status, notes }) {
  try {
    const StatusUpdateEmail = await import('@/components/email/StatusUpdateEmail').then(mod => mod.default);
    
    console.log(`[Nodemailer StatusUpdate] Preparing email to ${to} for issue ${issueId} with status ${status}`);
    
    // Validate email address
    if (!to || !to.includes('@')) {
      console.warn(`[Nodemailer StatusUpdate] Invalid email address: "${to}". Skipping email send.`);
      return { success: false, error: 'Invalid email address' };
    }
    
    // Generate the issue URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const issueUrl = `${baseUrl}/issues/${issueId}`;
    
    // Create more informative subject lines based on status
    let subject;
    switch (status) {
      case 'resolved':
        subject = `Issue Resolved: ${title}`;
        break;
      case 'in-progress':
        subject = `Issue In Progress: ${title}`;
        break;
      case 'under-review':
        subject = `Issue Under Review: ${title}`;
        break;
      case 'rejected':
        subject = `Issue Not Actionable: ${title}`;
        break;
      default:
        subject = `Issue Status Update: ${title}`;
    }

    // Send the email
    const result = await sendEmailWithNodemailer({
      to,
      subject,
      reactComponent: StatusUpdateEmail,
      reactProps: { issueId, title, status, notes, issueUrl }
    });
    
    // Log the result
    if (result.success) {
      console.log(`[Nodemailer StatusUpdate] Successfully sent status update email to ${to}`);
    } else {
      console.error(`[Nodemailer StatusUpdate] Failed to send email to ${to}: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error in sendStatusUpdateEmail:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPasswordResetEmail({ to, name, resetUrl, expiresIn = '1 hour' }) {
  try {
    const PasswordResetEmail = await import('@/components/email/PasswordResetEmail').then(mod => mod.default);

    return await sendEmailWithNodemailer({
      to,
      subject: 'Reset Your Nayabato Password',
      reactComponent: PasswordResetEmail,
      reactProps: { name, resetUrl, expiresIn }
    });
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a comment notification email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.recipientName - Name of the recipient
 * @param {string} options.commenterName - Name of the person who commented
 * @param {string} options.issueTitle - Title of the issue
 * @param {string} options.issueId - ID of the issue
 * @param {string} options.comment - The comment text
 * @returns {Promise<Object>} - Response with success/failure info
 */
export async function sendCommentNotificationEmail({ 
  to, 
  recipientName, 
  commenterName, 
  issueTitle, 
  issueId, 
  comment 
}) {
  try {
    const CommentNotificationEmail = await import('@/components/email/CommentNotificationEmail').then(mod => mod.default);
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const issueUrl = `${baseUrl}/issues/${issueId}`;

    return await sendEmailWithNodemailer({
      to,
      subject: `New comment on: ${issueTitle}`,
      reactComponent: CommentNotificationEmail,
      reactProps: { 
        recipientName, 
        commenterName, 
        issueTitle, 
        issueId, 
        comment, 
        issueUrl 
      }
    });
  } catch (error) {
    console.error('Error in sendCommentNotificationEmail:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send an assignment notification email to an official
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.officialName - Name of the official
 * @param {string} options.issueTitle - Title of the issue
 * @param {string} options.issueId - ID of the issue
 * @param {string} options.category - Issue category
 * @param {string} options.priority - Issue priority
 * @param {string} options.location - Issue location
 * @param {string} options.description - Issue description
 * @param {string} options.reporterName - Name of the reporter
 * @param {string} options.assignedBy - Name of who assigned the issue
 * @param {Date} [options.dueDate] - Due date for the issue
 * @returns {Promise<Object>} - Response with success/failure info
 */
export async function sendAssignmentNotificationEmail({ 
  to, 
  officialName, 
  issueTitle, 
  issueId, 
  category, 
  priority = 'medium',
  location, 
  description,
  reporterName,
  assignedBy,
  dueDate 
}) {
  try {
    const AssignmentNotificationEmail = await import('@/components/email/AssignmentNotificationEmail').then(mod => mod.default);
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const issueUrl = `${baseUrl}/issues/${issueId}`;

    return await sendEmailWithNodemailer({
      to,
      subject: `New Assignment: ${issueTitle}`,
      reactComponent: AssignmentNotificationEmail,
      reactProps: { 
        officialName, 
        issueTitle, 
        issueId, 
        category, 
        priority,
        location, 
        description,
        reporterName,
        assignedBy,
        issueUrl,
        dueDate 
      }
    });
  } catch (error) {
    console.error('Error in sendAssignmentNotificationEmail:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a weekly digest email to a user
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.userName - Name of the user
 * @param {Date} options.weekStart - Start of the week
 * @param {Date} options.weekEnd - End of the week
 * @param {Object} options.stats - Weekly statistics
 * @param {Array} options.recentIssues - Recent issues in the area
 * @returns {Promise<Object>} - Response with success/failure info
 */
export async function sendWeeklyDigestEmail({ 
  to, 
  userName, 
  weekStart, 
  weekEnd, 
  stats, 
  recentIssues 
}) {
  try {
    const WeeklyDigestEmail = await import('@/components/email/WeeklyDigestEmail').then(mod => mod.default);
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const dashboardUrl = `${baseUrl}/dashboard`;

    return await sendEmailWithNodemailer({
      to,
      subject: `Your Weekly Nayabato Digest - ${new Date(weekStart).toLocaleDateString()}`,
      reactComponent: WeeklyDigestEmail,
      reactProps: { 
        userName, 
        weekStart, 
        weekEnd, 
        stats, 
        recentIssues, 
        dashboardUrl 
      }
    });
  } catch (error) {
    console.error('Error in sendWeeklyDigestEmail:', error);
    return { success: false, error: error.message };
  }
}

// Legacy exports for backward compatibility
export const sendStatusUpdate = sendStatusUpdateEmail;
