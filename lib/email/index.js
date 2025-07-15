import IssueConfirmationEmail from '@/components/email/IssueConfirmationEmail';
import StatusUpdateEmail from '@/components/email/StatusUpdateEmail';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an issue confirmation email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.issueId - The ID of the reported issue
 * @param {String} options.title - The title of the issue
 * @param {String} options.location - Location of the issue
 */
export async function sendIssueConfirmation({ to, issueId, title, location }) {
  try {
    const data = await resend.emails.send({
      from: `Nayabato <${process.env.EMAIL_FROM || 'noreply@nayabato.com'}>`,
      to,
      subject: `Issue Reported: ${title} - #${issueId}`,
      react: IssueConfirmationEmail({ 
        issueId, 
        title, 
        location,
        issueUrl: `${process.env.NEXT_PUBLIC_APP_URL}/issues/${issueId}`
      }),
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send issue confirmation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a status update email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.issueId - The ID of the updated issue
 * @param {String} options.title - The title of the issue
 * @param {String} options.status - The new status
 * @param {String} options.notes - Optional notes about the update
 */
export async function sendStatusUpdateEmail({ to, issueId, title, status, notes }) {
  try {
    const data = await resend.emails.send({
      from: `Nayabato <${process.env.EMAIL_FROM || 'noreply@nayabato.com'}>`,
      to,
      subject: `Status Update: Your Issue #${issueId} is now ${formatStatus(status)}`,
      react: StatusUpdateEmail({ 
        issueId, 
        title, 
        status: formatStatus(status),
        notes,
        issueUrl: `${process.env.NEXT_PUBLIC_APP_URL}/issues/${issueId}`
      }),
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send status update email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Format status text for display
 * @param {String} status - Raw status from database
 * @returns {String} - Formatted status
 */
function formatStatus(status) {
  const statusMap = {
    'reported': 'Reported',
    'under-review': 'Under Review',
    'in-progress': 'In Progress',
    'resolved': 'Resolved',
    'rejected': 'Not Actionable'
  };
  
  return statusMap[status] || status;
}

/**
 * Send a custom email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.message - Email message (HTML content)
 * @param {String} options.name - Recipient name
 */
export async function sendCustomEmail({ to, subject, message, name }) {
  try {
    const data = await resend.emails.send({
      from: `Nayabato <${process.env.EMAIL_FROM || 'noreply@nayabato.com'}>`,
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${subject}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #3b82f6;
              padding: 20px;
              color: white;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 20px;
              border-radius: 0 0 5px 5px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Nayabato</h2>
          </div>
          <div class="content">
            <p>Hello ${name || 'there'},</p>
            ${message}
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Visit Nayabato</a>
            </p>
            <p>Thank you,<br>The Nayabato Team</p>
          </div>
          <div class="footer">
            <p>
              This email was sent by Nayabato. If you didn't request this email,
              please ignore it or contact support.
            </p>
            <p>
              © ${new Date().getFullYear()} Nayabato. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send custom email:', error);
    return { success: false, error: error.message };
  }
}
