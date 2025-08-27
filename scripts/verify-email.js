// Script to verify that the email system is working properly
const { sendIssueConfirmation, sendStatusUpdateEmail } = require('../lib/email');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Use an actual email address for testing
const TEST_EMAIL = process.env.TEST_EMAIL || 'sunilneupane956@gmail.com';

async function verifyEmailSystem() {
  console.log('Starting email verification...');
  console.log(`Using test email: ${TEST_EMAIL}`);
  console.log(`Resend API Key exists: ${Boolean(process.env.RESEND_API_KEY)}`);
  console.log(`Email from address: ${process.env.EMAIL_FROM}`);
  
  try {
    // Test issue confirmation email
    console.log('\n1. Testing issue confirmation email...');
    const confirmResult = await sendIssueConfirmation({
      to: TEST_EMAIL,
      issueId: '123456789012345678901234',
      title: 'Test Issue Confirmation',
      location: '123 Test Street, Kathmandu',
    });
    
    console.log('Issue confirmation email result:', confirmResult);
    
    // Test status update email
    console.log('\n2. Testing status update email...');
    const statusTypes = ['reported', 'under-review', 'in-progress', 'resolved', 'rejected'];
    
    for (const status of statusTypes) {
      console.log(`\n   Testing status update for "${status}"...`);
      const updateResult = await sendStatusUpdateEmail({
        to: TEST_EMAIL,
        issueId: '123456789012345678901234',
        title: 'Test Status Update',
        status: status,
        notes: `This is a test note for the ${status} status.`,
      });
      
      console.log(`   Status update (${status}) email result:`, updateResult);
    }
    
    console.log('\nEmail verification complete!');
  } catch (error) {
    console.error('Error during email verification:', error);
  }
}

verifyEmailSystem();
