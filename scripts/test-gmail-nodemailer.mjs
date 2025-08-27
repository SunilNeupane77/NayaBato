// Simple script to test Gmail email sending with Nodemailer
import fs from 'fs';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

// Read environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');
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

async function testGmailSending() {
  console.log('Testing Gmail Email Sending with Nodemailer');
  console.log('=========================================');
  
  // Check for required environment variables
  const emailUser = process.env.EMAIL_USER || 'sunilneupane957@gmail.com';
  const emailPass = process.env.EMAIL_PASS;
  const testEmail = process.env.TEST_EMAIL || 'sunilneupane956@gmail.com';
  
  console.log(`Using email account: ${emailUser}`);
  console.log(`Sending test to: ${testEmail}`);
  
  if (!emailPass) {
    console.error('ERROR: EMAIL_PASS environment variable is not set. Please add it to your .env file.');
    console.error('See EMAIL_CONFIG.md for instructions on creating a Gmail App Password.');
    process.exit(1);
  }

  try {
    // Create transporter
    console.log('\nCreating Gmail transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Verify connection
    console.log('Verifying connection to Gmail...');
    await transporter.verify();
    console.log('✅ Connection to Gmail SMTP server successful!');

    // Send test email
    console.log(`\nSending test email to ${testEmail}...`);
    const info = await transporter.sendMail({
      from: `"Nayabato App" <${emailUser}>`,
      to: testEmail,
      subject: "Test Email from Nayabato",
      text: "This is a test email sent from the Nayabato application using Nodemailer and Gmail.",
      html: `
        <h1>Nayabato Test Email</h1>
        <p>This is a test email sent from the Nayabato application using Nodemailer and Gmail.</p>
        <p>If you received this email, your email configuration is working correctly!</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`\nCheck your inbox at ${testEmail} for the test email.`);
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    if (error.code === 'EAUTH') {
      console.error('\nAuthentication failed. Please check your EMAIL_USER and EMAIL_PASS values.');
      console.error('If you\'re using Gmail, make sure you\'ve set up an App Password (not your regular password).');
      console.error('See EMAIL_CONFIG.md for instructions on creating a Gmail App Password.');
    } else if (error.code === 'ESOCKET') {
      console.error('\nNetwork error. Please check your internet connection.');
    }
  }
}

testGmailSending();
