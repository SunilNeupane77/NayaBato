# Nodemailer Email Configuration Guide for Nayabato

This guide explains how to set up the Nodemailer email service for the Nayabato application.

## Setting Up Gmail for Nodemailer

The application uses Gmail as the email provider. To use Gmail securely, you'll need to create an App Password:

### Step 1: Enable 2-Step Verification

1. Go to your [Google Account Security](https://myaccount.google.com/security)
2. Under "How you sign in to Google", select **2-Step Verification**
3. Follow the prompts to set up 2-Step Verification if not already enabled

### Step 2: Create an App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. You may need to sign in again
3. At the bottom, click **Select app** and choose **Mail**
4. Click **Select device** and choose **Other (custom name)**
5. Enter "Nayabato App" as the custom name
6. Click **Generate**
7. Copy the 16-character password that appears (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update your .env file

Replace the current EMAIL_PASS with your App Password:

```env
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=abcdefghijklmnop  # Your 16-character App Password (no spaces)
EMAIL_FROM=your-gmail-address@gmail.com
REPLY_TO_EMAIL=your-support-email@example.com
TEST_EMAIL=your-test-email@gmail.com
```

**Important Notes:**
- Use the App Password, not your regular Gmail password
- Remove any spaces from the App Password when adding to .env
- The App Password should be exactly 16 characters

## Testing the Email Configuration

### Option 1: Using the Next.js Development Server

```bash
# Start the development server
npm run dev

# In another terminal, test via API endpoint
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "email": "your-test-email@gmail.com",
    "data": {
      "name": "Test User",
      "role": "citizen"
    }
  }'
```

### Option 2: Using the Test Script (requires proper setup)

```bash
# Run the Nodemailer test script
node scripts/test-nodemailer.js
```

## Email Types Supported

The email service supports the following email types:

### 1. Welcome Email
Sent when a new user registers:
```javascript
await sendWelcomeEmail({
  to: user.email,
  name: user.name,
  role: user.role
});
```

### 2. Issue Confirmation Email
Sent when a user reports a new issue:
```javascript
await sendIssueConfirmation({
  to: user.email,
  issueId: issue._id,
  title: issue.title,
  location: issue.location.address
});
```

### 3. Status Update Email
Sent when an issue status changes:
```javascript
await sendStatusUpdateEmail({
  to: user.email,
  issueId: issue._id,
  title: issue.title,
  status: issue.status,
  notes: 'Optional notes about the update'
});
```

## Troubleshooting

### Common Issues and Solutions

1. **"Invalid login" Error**
   - Make sure you're using an App Password, not your regular Gmail password
   - Ensure 2-Step Verification is enabled on your Google account
   - Check that the App Password is exactly 16 characters with no spaces

2. **"Module not found" Error in Test Scripts**
   - Test scripts should be run within the Next.js context
   - Use the API endpoint testing method instead
   - Or run tests through the development server

3. **Emails Not Being Received**
   - Check your spam/junk folder
   - Verify the recipient email address is correct
   - Check the application logs for error messages

4. **Rate Limiting**
   - Gmail has sending limits (500 emails per day for free accounts)
   - Consider using a dedicated email service for production

### Checking Email Service Status

You can check if the email service is properly initialized by looking at the application logs when starting the server:

```
[Email] Nodemailer email service initialized successfully
```

If you see an error message instead, check your Gmail App Password configuration.

## Production Considerations

For production deployment:

1. **Use Environment Variables**: Never commit email credentials to version control
2. **Consider Email Services**: For high-volume applications, consider services like SendGrid, Mailgun, or AWS SES
3. **Monitor Sending Limits**: Gmail has daily sending limits that may not be suitable for large applications
4. **Implement Retry Logic**: Add retry mechanisms for failed email sends
5. **Email Templates**: Ensure email templates are mobile-responsive and accessible

## Security Best Practices

1. **App Passwords**: Always use App Passwords, never regular passwords
2. **Environment Variables**: Store all credentials in environment variables
3. **Access Control**: Limit who can send emails through your API endpoints
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Logging**: Log email sending attempts for monitoring and debugging
