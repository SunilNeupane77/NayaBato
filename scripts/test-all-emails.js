// Comprehensive test script for all Nayabato email functionality
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

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
const { 
  initializeTransporter, 
  sendWelcomeEmail,
  sendIssueConfirmation, 
  sendStatusUpdateEmail,
  sendPasswordResetEmail,
  sendCommentNotificationEmail,
  sendAssignmentNotificationEmail,
  sendWeeklyDigestEmail
} = require('../lib/email/nodemailer');

async function testAllEmailFunctionality() {
  console.log('🧪 Comprehensive Nayabato Email System Test');
  console.log('===========================================');
  
  console.log('\n📧 Environment Variables:');
  console.log(`- EMAIL_USER: ${process.env.EMAIL_USER || 'Not set'}`);
  console.log(`- EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set'}`);
  console.log(`- EMAIL_FROM: ${process.env.EMAIL_FROM || 'Not set'}`);
  console.log(`- TEST_EMAIL: ${process.env.TEST_EMAIL || 'Not set'}`);
  
  // Initialize transporter
  console.log('\n🔧 Step 1: Initializing email service...');
  const initialized = await initializeTransporter();
  
  if (!initialized) {
    console.log('\n❌ Email service initialization failed. Please check your Gmail App Password.');
    console.log('\n📖 Setup Instructions:');
    console.log('1. Enable 2-Step Verification on your Google account');
    console.log('2. Generate an App Password at: https://myaccount.google.com/apppasswords');
    console.log('3. Update EMAIL_PASS in your .env file with the 16-character App Password');
    return;
  }
  
  const testEmail = process.env.TEST_EMAIL || process.env.EMAIL_USER;
  let testCount = 0;
  let successCount = 0;
  
  // Test 1: Welcome Email
  console.log('\n📨 Test 1: Welcome Email');
  testCount++;
  try {
    const result = await sendWelcomeEmail({
      to: testEmail,
      name: 'John Doe',
      role: 'citizen'
    });
    if (result.success) {
      console.log('✅ Welcome email sent successfully');
      successCount++;
    } else {
      console.log('❌ Welcome email failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Welcome email error:', error.message);
  }
  
  // Test 2: Issue Confirmation Email
  console.log('\n📨 Test 2: Issue Confirmation Email');
  testCount++;
  try {
    const result = await sendIssueConfirmation({
      to: testEmail,
      issueId: '507f1f77bcf86cd799439011',
      title: 'Pothole on Main Street needs urgent repair',
      location: '123 Main Street, Downtown Area'
    });
    if (result.success) {
      console.log('✅ Issue confirmation email sent successfully');
      successCount++;
    } else {
      console.log('❌ Issue confirmation email failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Issue confirmation email error:', error.message);
  }
  
  // Test 3: Status Update Emails (all statuses)
  console.log('\n📨 Test 3: Status Update Emails');
  const statuses = ['reported', 'under-review', 'in-progress', 'resolved', 'rejected'];
  
  for (const status of statuses) {
    testCount++;
    try {
      const result = await sendStatusUpdateEmail({
        to: testEmail,
        issueId: '507f1f77bcf86cd799439011',
        title: 'Pothole on Main Street',
        status,
        notes: `Issue status has been updated to ${status}. ${getStatusMessage(status)}`
      });
      if (result.success) {
        console.log(`✅ Status update email (${status}) sent successfully`);
        successCount++;
      } else {
        console.log(`❌ Status update email (${status}) failed:`, result.error);
      }
    } catch (error) {
      console.log(`❌ Status update email (${status}) error:`, error.message);
    }
    
    // Small delay between emails
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test 4: Password Reset Email
  console.log('\n📨 Test 4: Password Reset Email');
  testCount++;
  try {
    const result = await sendPasswordResetEmail({
      to: testEmail,
      name: 'John Doe',
      resetUrl: 'http://localhost:3000/auth/reset-password?token=abc123def456',
      expiresIn: '1 hour'
    });
    if (result.success) {
      console.log('✅ Password reset email sent successfully');
      successCount++;
    } else {
      console.log('❌ Password reset email failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Password reset email error:', error.message);
  }
  
  // Test 5: Comment Notification Email
  console.log('\n📨 Test 5: Comment Notification Email');
  testCount++;
  try {
    const result = await sendCommentNotificationEmail({
      to: testEmail,
      recipientName: 'John Doe',
      commenterName: 'Jane Smith',
      issueTitle: 'Pothole on Main Street',
      issueId: '507f1f77bcf86cd799439011',
      comment: 'I noticed this issue has gotten worse. The pothole is now affecting traffic flow and could be dangerous for motorcycles.'
    });
    if (result.success) {
      console.log('✅ Comment notification email sent successfully');
      successCount++;
    } else {
      console.log('❌ Comment notification email failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Comment notification email error:', error.message);
  }
  
  // Test 6: Assignment Notification Email
  console.log('\n📨 Test 6: Assignment Notification Email');
  testCount++;
  try {
    const result = await sendAssignmentNotificationEmail({
      to: testEmail,
      officialName: 'Mike Johnson',
      issueTitle: 'Pothole on Main Street needs urgent repair',
      issueId: '507f1f77bcf86cd799439011',
      category: 'roads',
      priority: 'high',
      location: '123 Main Street, Downtown Area',
      description: 'Large pothole causing traffic issues and potential vehicle damage. Multiple citizens have reported this issue.',
      reporterName: 'John Doe',
      assignedBy: 'Admin User',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
    if (result.success) {
      console.log('✅ Assignment notification email sent successfully');
      successCount++;
    } else {
      console.log('❌ Assignment notification email failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Assignment notification email error:', error.message);
  }
  
  // Test 7: Weekly Digest Email
  console.log('\n📨 Test 7: Weekly Digest Email');
  testCount++;
  try {
    const weekEnd = new Date();
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const mockStats = {
      newIssues: 12,
      resolvedIssues: 8,
      inProgressIssues: 15,
      totalActiveIssues: 34
    };
    
    const mockRecentIssues = [
      {
        title: 'Pothole on Main Street',
        status: 'in-progress',
        location: { address: '123 Main Street' },
        category: 'roads',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Broken Streetlight on Oak Avenue',
        status: 'resolved',
        location: { address: '456 Oak Avenue' },
        category: 'electricity',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Illegal Dumping in Park',
        status: 'under-review',
        location: { address: 'Central Park, North Entrance' },
        category: 'sanitation',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];
    
    const result = await sendWeeklyDigestEmail({
      to: testEmail,
      userName: 'John Doe',
      weekStart,
      weekEnd,
      stats: mockStats,
      recentIssues: mockRecentIssues
    });
    if (result.success) {
      console.log('✅ Weekly digest email sent successfully');
      successCount++;
    } else {
      console.log('❌ Weekly digest email failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Weekly digest email error:', error.message);
  }
  
  // Summary
  console.log('\n🎉 Email Testing Complete!');
  console.log('========================');
  console.log(`📊 Results: ${successCount}/${testCount} emails sent successfully`);
  console.log(`📬 Check your inbox at: ${testEmail}`);
  console.log('💡 If you don\'t see the emails, check your spam folder.');
  
  if (successCount === testCount) {
    console.log('\n🎊 All email types are working perfectly!');
    console.log('Your Nayabato email system is fully functional.');
  } else {
    console.log(`\n⚠️  ${testCount - successCount} email(s) failed to send.`);
    console.log('Please check the error messages above and your email configuration.');
  }
}

function getStatusMessage(status) {
  const messages = {
    'reported': 'Your issue has been received and is awaiting review.',
    'under-review': 'Officials are currently reviewing your issue.',
    'in-progress': 'Work has begun to resolve your issue.',
    'resolved': 'Your issue has been successfully resolved. Thank you for reporting it!',
    'rejected': 'After review, this issue does not require action at this time.'
  };
  return messages[status] || 'Status updated.';
}

// Run the comprehensive test
testAllEmailFunctionality().catch(console.error);
