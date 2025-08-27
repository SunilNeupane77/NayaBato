// Test script for Nodemailer email service using ES modules
import fs from 'fs';
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

// Import Nodemailer and create test transporter
import nodemailer from 'nodemailer';

// Create test account on ethereal.email for testing
async function main() {
  console.log('Testing Nodemailer Email Service');
  console.log('================================');
  
  console.log('Environment Variables:');
  console.log(`- EMAIL_USER: ${process.env.EMAIL_USER || 'Not set'}`);
  console.log(`- EMAIL_PASS: ${process.env.EMAIL_PASS ? '******' : 'Not set'}`);
  console.log(`- EMAIL_FROM: ${process.env.EMAIL_FROM || 'Not set'}`);
  console.log(`- TEST_EMAIL: ${process.env.TEST_EMAIL || 'Not set'}`);
  console.log('');

  try {
    // Generate a test SMTP service account from ethereal.email
    console.log('Creating a test account on ethereal.email...');
    const testAccount = await nodemailer.createTestAccount();
    
    // Create a SMTP transporter object
    console.log('Creating test transporter...');
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    
    const fromEmail = process.env.EMAIL_FROM || 'notifications@sunilneupane77.com.np';
    const toEmail = process.env.TEST_EMAIL || 'sunilneupane956@gmail.com';
    
    // Send test email
    console.log(`Sending test email to ${toEmail}...`);
    const info = await transporter.sendMail({
      from: `"Nayabato App" <${fromEmail}>`, 
      to: toEmail,
      subject: "Test Email from Nayabato",
      text: "This is a test email from the Nayabato application.",
      html: "<b>This is a test email</b> from the Nayabato application.",
    });
    
    console.log(`Message sent: ${info.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    console.log('Copy the Preview URL into your browser to view the test email');
  } catch (error) {
    console.error('Error testing email service:', error);
  }
}

main().catch(console.error);
