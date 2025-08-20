import { sendIssueConfirmation, sendStatusUpdateEmail } from '../lib/email';

async function testEmails() {
  try {
    console.log('Testing issue confirmation email...');
    const confirmResult = await sendIssueConfirmation({
      to: 'test@example.com',
      issueId: '123456789012345678901234',
      title: 'Test Issue',
      location: '123 Test Street, Testville',
    });
    console.log('Issue confirmation email sent:', confirmResult);

    console.log('\nTesting status update email...');
    const updateResult = await sendStatusUpdateEmail({
      to: 'test@example.com',
      issueId: '123456789012345678901234',
      title: 'Test Issue',
      status: 'In Progress',
      notes: 'Working on this issue now.',
    });
    console.log('Status update email sent:', updateResult);
  } catch (error) {
    console.error('Error testing emails:', error);
  }
}

testEmails();
