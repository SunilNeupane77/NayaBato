// filepath: /home/neupane/Desktop/nayabato/nayabato/lib/email/index.js
import {
  initializeTransporter,
  sendEmailWithNodemailer,
  sendIssueConfirmation,
  sendStatusUpdate,
  sendStatusUpdateEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendCommentNotificationEmail,
  sendAssignmentNotificationEmail,
  sendWeeklyDigestEmail
} from './nodemailer';

// Initialize the email transporter
initializeTransporter()
  .then(success => {
    if (success) {
      console.log('[Email] Nodemailer email service initialized successfully');
    } else {
      console.error('[Email] Failed to initialize Nodemailer email service');
    }
  })
  .catch(err => {
    console.error('[Email] Error initializing Nodemailer:', err);
  });

// Re-export functions for use throughout the application
export {
  sendEmailWithNodemailer as sendEmail,
  sendIssueConfirmation, 
  sendStatusUpdate, 
  sendStatusUpdateEmail, 
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendCommentNotificationEmail,
  sendAssignmentNotificationEmail,
  sendWeeklyDigestEmail
};

