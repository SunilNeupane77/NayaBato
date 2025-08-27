// Simple email test script using the Resend API directly
require('dotenv').config();
const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('Testing email sending with Resend API');
  console.log('Environment variables:');
  console.log(`- RESEND_API_KEY exists: ${Boolean(process.env.RESEND_API_KEY)}`);
  console.log(`- EMAIL_FROM: ${process.env.EMAIL_FROM || 'not set'}`);
  
  const to = process.env.TEST_EMAIL || 'sunilneupane956@gmail.com';
  const fromEmail = process.env.EMAIL_FROM || 'notifications@nayabato.org';
  
  try {
    console.log(`Sending test email to ${to} from ${fromEmail}...`);
    
    const { data, error } = await resend.emails.send({
      from: `Nayabato Test <${fromEmail}>`,
      to: [to],
      subject: 'Email Notification System Test',
      html: `
        <h1>Email System Test</h1>
        <p>This is a test email to verify that the Nayabato email notification system is working properly.</p>
        <p>If you received this email, the system is functioning correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    });
    
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent successfully:', data);
    }
  } catch (err) {
    console.error('Exception while sending email:', err);
  }
}

testEmail();
