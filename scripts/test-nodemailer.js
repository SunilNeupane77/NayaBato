// Test script for Nodemailer email service
// Import environment variables directly (Next.js loads them automatically)
// For testing outside of Next.js, we need to manually get the variables
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

// Read environment variables from .env file
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse the .env file content
const envVars = envContent.split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=/#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    acc[key] = value;
  }
  return acc;
}, {});

// Set environment variables
Object.entries(envVars).forEach(([key, value]) => {
  process.env[key] = value;
});

// Import the email functions
const { initializeTransporter, sendIssueConfirmation, sendStatusUpdateEmail, sendWelcomeEmail } = require('../lib/email/nodemailer');

async function testNodemailerEmailService() {
  console.log('Testing Nodemailer Email Service');
  console.log('================================');
  
  console.log('Environment Variables:');
  console.log(`- EMAIL_USER: ${process.env.EMAIL_USER || 'Not set'}`);
  console.log(`- EMAIL_PASS: ${process.env.EMAIL_PASS ? '******' : 'Not set'}`);
  console.log(`- EMAIL_FROM: ${process.env.EMAIL_FROM || 'Not set'}`);
  console.log(`- TEST_EMAIL: ${process.env.TEST_EMAIL || 'Not set'}`);
  console.log('');

  try {
    // Initialize the transporter
    console.log('Step 1: Initializing Nodemailer transporter...');
    const initResult = await initializeTransporter();
    console.log(`Transporter initialized: ${initResult}`);
    console.log('');
    
    // Set recipient email address
    const testEmail = process.env.TEST_EMAIL || 'sunilneupane956@gmail.com';
    
    // Test welcome email
    console.log('Step 2: Testing Welcome Email...');
    const welcomeResult = await sendWelcomeEmail({
      to: testEmail,
      name: 'Test User',
      role: 'citizen'
    });
    console.log('Welcome email result:', welcomeResult);
    console.log('');
    
    // Test issue confirmation email
    console.log('Step 3: Testing Issue Confirmation Email...');
    const confirmResult = await sendIssueConfirmation({
      to: testEmail,
      issueId: '123456789abcdef',
      title: 'Test Issue Confirmation',
      location: '123 Test Street, Test City'
    });
    console.log('Issue confirmation result:', confirmResult);
    console.log('');
    
    // Test status update email for different statuses
    console.log('Step 4: Testing Status Update Emails...');
    const statuses = ['reported', 'under-review', 'in-progress', 'resolved', 'rejected'];
    
    for (const status of statuses) {
      console.log(`\n  Testing status: ${status}`);
      const updateResult = await sendStatusUpdateEmail({
        to: testEmail,
        issueId: '123456789abcdef',
        title: 'Test Status Update',
        status,
        notes: `This is a test note for status: ${status}`
      });
      console.log(`  Status update (${status}) result:`, updateResult);
    }
    
    console.log('\nAll email tests completed!');
  } catch (error) {
    console.error('Error testing email service:', error);
  }
}

testNodemailerEmailService();
