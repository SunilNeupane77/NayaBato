import IssueConfirmationEmail from '@/components/email/IssueConfirmationEmail';
import StatusUpdateEmail from '@/components/email/StatusUpdateEmail';
import WelcomeEmail from '@/components/email/WelcomeEmail';
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
    // Validate email address
    if (!to || !to.includes('@')) {
      console.warn(`Invalid email address: "${to}". Skipping email send.`);
      return { success: false, error: 'Invalid email address' };
    }

    // Render the React component to HTML
    let html;
    try {
      html = await renderAsync(reactComponent(reactProps));
    } catch (renderError) {
      console.error('Error rendering email template:', renderError);
      return { success: false, error: 'Failed to render email template' };
    }

    // Get sender email with fallback
    const fromEmail = process.env.EMAIL_FROM || 'notifications@nayabato.org';
    
    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: `Nayabato <${fromEmail}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error from Resend API:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in sendEmail:', error);
    return { success: false, error: error.message || 'Unknown error sending email' };
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
  try {
    // Generate the issue URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const issueUrl = `${baseUrl}/issues/${issueId}`;

    // Send the email
    return await sendEmail({
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
  try {
    // Generate the issue URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const issueUrl = `${baseUrl}/issues/${issueId}`;

    // Send the email
    return await sendEmail({
      to,
      subject: `Issue Status Update: ${title}`,
      reactComponent: StatusUpdateEmail,
      reactProps: { issueId, title, status, notes, issueUrl }
    });
  } catch (error) {
    console.error('Error in sendStatusUpdateEmail:', error);
    return { success: false, error: error.message };
  }
}


export const sendStatusUpdate = sendStatusUpdateEmail;

/**
 * Send a welcome email to a newly registered user
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.name - User's name
 * @param {string} options.role - User's role (citizen or official)
 * @returns {Promise<Object>} - Response from Resend API
 */
export async function sendWelcomeEmail({ to, name, role }) {
  try {
    // Generate the dashboard URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const dashboardUrl = `${baseUrl}/dashboard`;

    // Send the email
    return await sendEmail({
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