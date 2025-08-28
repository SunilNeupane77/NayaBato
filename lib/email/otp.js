import nodemailer from 'nodemailer';

// Create transporter (reuse from main email config)
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER || process.env.EMAIL_SERVER_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_SERVER_PASSWORD;
  const emailHost = process.env.EMAIL_HOST || process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com';
  const emailPort = process.env.EMAIL_PORT || process.env.EMAIL_SERVER_PORT || 587;

  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

export async function sendOTPEmail({ to, otp, type, name = 'User' }) {
  const subjects = {
    signup: 'Verify Your Email - Nayabato',
    password_reset: 'Reset Your Password - Nayabato',
    email_verification: 'Verify Your Email - Nayabato'
  };

  const htmlMessages = {
    signup: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Welcome to Nayabato!</h2>
        <p>Hi ${name},</p>
        <p>Please verify your email address with the OTP below:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
        </div>
        <p>This code expires in 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    password_reset: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Password Reset - Nayabato</h2>
        <p>Hi ${name},</p>
        <p>Your password reset OTP is:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
        </div>
        <p>This code expires in 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    email_verification: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Email Verification - Nayabato</h2>
        <p>Hi ${name},</p>
        <p>Your email verification OTP is:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
        </div>
        <p>This code expires in 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.EMAIL_SERVER_USER,
      to,
      subject: subjects[type],
      html: htmlMessages[type]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${to}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw error;
  }
}
