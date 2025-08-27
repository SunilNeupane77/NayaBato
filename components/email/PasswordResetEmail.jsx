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

const alertBoxStyles = {
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '4px',
  padding: '20px',
  marginBottom: '20px',
};

const buttonContainerStyles = {
  textAlign: 'center',
  margin: '30px 0',
};

const buttonStyles = {
  backgroundColor: '#dc2626',
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

const PasswordResetEmail = ({ name, resetUrl, expiresIn = '1 hour' }) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your Nayabato password</Preview>
      <Body style={baseStyles}>
        <Container style={containerStyles}>
          <Section style={headerStyles}>
            <Heading style={titleStyles}>Password Reset Request</Heading>
          </Section>
          
          <Section style={bodyStyles}>
            <Text>Hello {name},</Text>
            
            <Text>
              We received a request to reset your password for your Nayabato account. 
              If you didn't make this request, you can safely ignore this email.
            </Text>
            
            <Section style={alertBoxStyles}>
              <Text style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#dc2626' }}>
                Security Notice:
              </Text>
              <Text style={{ margin: '5px 0' }}>
                • This reset link will expire in {expiresIn}
              </Text>
              <Text style={{ margin: '5px 0' }}>
                • Only use this link if you requested a password reset
              </Text>
              <Text style={{ margin: '5px 0' }}>
                • Never share this link with anyone
              </Text>
            </Section>
            
            <Text>
              To reset your password, click the button below:
            </Text>
            
            <Section style={buttonContainerStyles}>
              <Link href={resetUrl} style={buttonStyles}>
                Reset Password
              </Link>
            </Section>
            
            <Text>
              If the button doesn't work, you can copy and paste this link into your browser:
            </Text>
            
            <Text style={{ 
              backgroundColor: '#f4f4f7', 
              padding: '10px', 
              borderRadius: '4px',
              wordBreak: 'break-all',
              fontSize: '14px'
            }}>
              {resetUrl}
            </Text>
            
            <Text>
              If you continue to have problems, please contact our support team.
            </Text>
            
            <Text>
              Best regards,<br />
              The Nayabato Security Team
            </Text>
          </Section>
          
          <Section style={footerStyles}>
            <Text>
              © {new Date().getFullYear()} Nayabato. All rights reserved.
            </Text>
            <Text>
              This email was sent because a password reset was requested for your account.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;
