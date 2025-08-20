import IssueConfirmationEmail from '@/components/email/IssueConfirmationEmail';
import StatusUpdateEmail from '@/components/email/StatusUpdateEmail';
import { renderAsync } from '@react-email/components';
import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {React.Component} options.reactComponent - React component to render as email
 * @param {Object} options.reactProps - Props to pass to the React component
 * @returns {Promise<Object>} - Response from Resend API
 */
async function sendEmail({ to, subject, reactComponent, reactProps }) {
  try {
    // Render the React component to HTML
    const html = await renderAsync(reactComponent(reactProps));

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: `Nayabato <${process.env.EMAIL_FROM || 'notifications@nayabato.org'}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send an issue confirmation email to a user
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.issueId - ID of the reported issue
 * @param {string} options.title - Issue title
 * @param {string} options.location - Issue location
 * @returns {Promise<Object>} - Response from Resend API
 */
export async function sendIssueConfirmation({ to, issueId, title, location }) {
  // Generate the issue URL
  const issueUrl = `${process.env.NEXT_PUBLIC_APP_URL}/issues/${issueId}`;

  // Send the email
  return sendEmail({
    to,
    subject: `Issue Confirmation: ${title}`,
    reactComponent: IssueConfirmationEmail,
    reactProps: { issueId, title, location, issueUrl }
  });
}

/**
 * Send a status update email to a user
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.issueId - ID of the updated issue
 * @param {string} options.title - Issue title
 * @param {string} options.status - New issue status
 * @param {string} [options.notes] - Additional notes about the status update
 * @returns {Promise<Object>} - Response from Resend API
 */
export async function sendStatusUpdateEmail({ to, issueId, title, status, notes }) {
  // Generate the issue URL
  const issueUrl = `${process.env.NEXT_PUBLIC_APP_URL}/issues/${issueId}`;

  // Send the email
  return sendEmail({
    to,
    subject: `Issue Status Update: ${title}`,
    reactComponent: StatusUpdateEmail,
    reactProps: { issueId, title, status, notes, issueUrl }
  });
}

/**
 * Send a status update email to a user - alias for backward compatibility
 * @deprecated Use sendStatusUpdateEmail instead
 */
export const sendStatusUpdate = sendStatusUpdateEmail;