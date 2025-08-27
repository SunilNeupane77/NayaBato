// Standalone email test script that doesn't rely on Next.js path aliases
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

// Simple HTML email templates (without React)
const createWelcomeEmailHTML = (name, role) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to Nayabato</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="border-bottom: 1px solid #eaeaea; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #2563eb; margin: 0;">Welcome to Nayabato!</h1>
    </div>
    
    <p>Hello ${name},</p>
    
    <p>Thank you for joining Nayabato, your platform for civic engagement and community issue reporting. 
    We're excited to have you on board as a ${role === 'official' ? 'government official' : 'citizen'}.</p>
    
    <div style="background: #f4f4f7; border-radius: 4px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; font-weight: bold;">With Nayabato, you can:</p>
        <ul style="margin: 0; padding-left: 20px;">
            <li>Report civic issues in your community</li>
            <li>Track the status of reported issues</li>
            <li>Engage with local officials and other citizens</li>
            <li>Contribute to making your community better</li>
        </ul>
    </div>
    
    <p>Your account has been successfully created, and you can now log in to start using the platform.</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Go to Dashboard
        </a>
    </div>
    
    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
    
    <p>Thank you for joining our community!</p>
    
    <p>Best regards,<br>The Nayabato Team</p>
    
    <div style="border-top: 1px solid #eaeaea; padding-top: 20px; margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
        <p>© ${new Date().getFullYear()} Nayabato. All rights reserved.</p>
        <p>If you did not create this account, please contact us immediately.</p>
    </div>
</body>
</html>
`;

const createIssueConfirmationHTML = (issueId, title, location) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Issue Confirmation - ${title}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="border-bottom: 1px solid #eaeaea; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #2563eb; margin: 0;">Issue Confirmation</h1>
    </div>
    
    <p>Thank you for reporting an issue to Nayabato!</p>
    
    <div style="background: #f4f4f7; border-radius: 4px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">Issue Details:</h3>
        <p style="margin: 5px 0;"><strong>Issue ID:</strong> ${issueId}</p>
        <p style="margin: 5px 0;"><strong>Title:</strong> ${title}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> Reported</p>
    </div>
    
    <p>Your issue has been successfully submitted and assigned a unique ID. You can track the progress of your issue using this ID.</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/issues/${issueId}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Issue
        </a>
    </div>
    
    <p>We will keep you updated on the progress of your issue via email and in-app notifications.</p>
    
    <p>Thank you for helping to improve our community!</p>
    
    <p>Best regards,<br>The Nayabato Team</p>
    
    <div style="border-top: 1px solid #eaeaea; padding-top: 20px; margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
        <p>© ${new Date().getFullYear()} Nayabato. All rights reserved.</p>
    </div>
</body>
</html>
`;

const createStatusUpdateHTML = (issueId, title, status, notes) => {
  const statusColors = {
    'reported': '#6b7280',
    'under-review': '#f59e0b',
    'in-progress': '#3b82f6',
    'resolved': '#10b981',
    'rejected': '#ef4444'
  };
  
  const statusColor = statusColors[status] || '#6b7280';
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Status Update - ${title}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="border-bottom: 1px solid #eaeaea; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #2563eb; margin: 0;">Issue Status Update</h1>
    </div>
    
    <p>The status of your reported issue has been updated.</p>
    
    <div style="background: #f4f4f7; border-radius: 4px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">Issue Details:</h3>
        <p style="margin: 5px 0;"><strong>Issue ID:</strong> ${issueId}</p>
        <p style="margin: 5px 0;"><strong>Title:</strong> ${title}</p>
        <p style="margin: 5px 0;">
            <strong>New Status:</strong> 
            <span style="background-color: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">
                ${status.replace('-', ' ')}
            </span>
        </p>
        ${notes ? `<p style="margin: 10px 0 5px 0;"><strong>Notes:</strong></p><p style="margin: 5px 0; font-style: italic;">${notes}</p>` : ''}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/issues/${issueId}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Issue Details
        </a>
    </div>
    
    <p>Thank you for using Nayabato to improve our community!</p>
    
    <p>Best regards,<br>The Nayabato Team</p>
    
    <div style="border-top: 1px solid #eaeaea; padding-top: 20px; margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
        <p>© ${new Date().getFullYear()} Nayabato. All rights reserved.</p>
    </div>
</body>
</html>
`;
};

// Create transporter
let transporter;

async function initializeTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass) {
    console.error('Missing EMAIL_USER or EMAIL_PASS environment variables');
    return false;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    debug: true,
    logger: true,
  });

  try {
    await transporter.verify();
    console.log('✅ Email service initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize email service:', error.message);
    return false;
  }
}

async function sendTestEmail(type, options) {
  if (!transporter) {
    return { success: false, error: 'Email service not initialized' };
  }

  try {
    let html, subject;
    
    switch (type) {
      case 'welcome':
        html = createWelcomeEmailHTML(options.name, options.role);
        subject = 'Welcome to Nayabato!';
        break;
      case 'issue-confirmation':
        html = createIssueConfirmationHTML(options.issueId, options.title, options.location);
        subject = `Issue Confirmation: ${options.title}`;
        break;
      case 'status-update':
        html = createStatusUpdateHTML(options.issueId, options.title, options.status, options.notes);
        subject = `Issue Status Update: ${options.title}`;
        break;
      default:
        return { success: false, error: 'Unknown email type' };
    }

    const mailOptions = {
      from: `Nayabato <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject,
      html,
      replyTo: process.env.REPLY_TO_EMAIL || process.env.EMAIL_USER,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ ${type} email sent successfully. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send ${type} email:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runEmailTests() {
  console.log('🧪 Nayabato Email Service Test');
  console.log('================================');
  
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
  
  // Test welcome email
  console.log('\n📨 Step 2: Testing Welcome Email...');
  await sendTestEmail('welcome', {
    to: testEmail,
    name: 'Test User',
    role: 'citizen'
  });
  
  // Test issue confirmation
  console.log('\n📨 Step 3: Testing Issue Confirmation Email...');
  await sendTestEmail('issue-confirmation', {
    to: testEmail,
    issueId: '123456789abcdef',
    title: 'Test Pothole Report',
    location: '123 Main Street, Test City'
  });
  
  // Test status updates
  console.log('\n📨 Step 4: Testing Status Update Emails...');
  const statuses = ['reported', 'under-review', 'in-progress', 'resolved', 'rejected'];
  
  for (const status of statuses) {
    console.log(`\n  📧 Testing ${status} status...`);
    await sendTestEmail('status-update', {
      to: testEmail,
      issueId: '123456789abcdef',
      title: 'Test Pothole Report',
      status,
      notes: `This is a test note for ${status} status. The issue has been updated by the system administrator.`
    });
    
    // Add a small delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 All email tests completed!');
  console.log('\n📬 Check your inbox at:', testEmail);
  console.log('💡 If you don\'t see the emails, check your spam folder.');
}

// Run the tests
runEmailTests().catch(console.error);
