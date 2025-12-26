import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

const baseStyles = {
  fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  color: '#333',
};

const containerStyles = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
};

const headerStyles = {
  borderBottom: '1px solid #eaeaea',
  paddingBottom: '20px',
  marginBottom: '20px',
};

const titleStyles = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '12px 0',
};

const bodyStyles = {
  lineHeight: 1.6,
};

const commentBoxStyles = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderLeft: '4px solid #3b82f6',
  borderRadius: '4px',
  padding: '20px',
  marginBottom: '20px',
};

const buttonContainerStyles = {
  textAlign: 'center',
  margin: '30px 0',
};

const buttonStyles = {
  backgroundColor: '#3b82f6',
  borderRadius: '4px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '12px 24px',
  textDecoration: 'none',
};

const footerStyles = {
  borderTop: '1px solid #eaeaea',
  paddingTop: '20px',
  marginTop: '20px',
  fontSize: '12px',
  color: '#666',
  textAlign: 'center',
};

const CommentNotificationEmail = ({
  recipientName,
  commenterName,
  issueTitle,
  issueId,
  comment,
  issueUrl
}) => {
  return (
    <Html>
      <Head />
      <Preview>New comment on your issue: {issueTitle}</Preview>
      <Body style={baseStyles}>
        <Container style={containerStyles}>
          <Section style={headerStyles}>
            <Heading style={titleStyles}>New Comment on Your Issue</Heading>
          </Section>

          <Section style={bodyStyles}>
            <Text>Hello {recipientName},</Text>

            <Text>
              <strong>{commenterName}</strong> has added a new comment to your issue:
            </Text>

            <Text style={{ fontWeight: 'bold', fontSize: '18px', color: '#1f2937' }}>
              "{issueTitle}"
            </Text>

            <Section style={commentBoxStyles}>
              <Text style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#3b82f6' }}>
                New Comment:
              </Text>
              <Text style={{
                margin: '0',
                fontStyle: 'italic',
                backgroundColor: '#ffffff',
                padding: '15px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0'
              }}>
                "{comment}"
              </Text>
              <Text style={{
                margin: '10px 0 0 0',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                — {commenterName}
              </Text>
            </Section>

            <Text>
              You can view the full conversation and respond by clicking the button below:
            </Text>

            <Section style={buttonContainerStyles}>
              <Link href={issueUrl} style={buttonStyles}>
                View Issue & Reply
              </Link>
            </Section>

            <Text style={{ fontSize: '14px', color: '#6b7280' }}>
              Issue ID: {issueId}
            </Text>

            <Text>
              Stay engaged with your community and help resolve local issues together!
            </Text>

            <Text>
              Best regards,<br />
              Nayabato Platform
            </Text>
          </Section>

          <Section style={footerStyles}>
            <Text>
              © {new Date().getFullYear()} Nayabato. All rights reserved.
            </Text>
            <Text>
              You received this email because you reported this issue.
              You can manage your notification preferences in your account settings.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default CommentNotificationEmail;
