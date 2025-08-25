import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
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

const subtitleStyles = {
  fontSize: '18px',
  fontWeight: 'normal',
  margin: '12px 0',
};

const bodyStyles = {
  lineHeight: 1.6,
};

const infoBoxStyles = {
  background: '#f4f4f7',
  borderRadius: '4px',
  padding: '20px',
  marginBottom: '20px',
};

const buttonContainerStyles = {
  textAlign: 'center',
  margin: '30px 0',
};

const buttonStyles = {
  backgroundColor: '#2563eb',
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

const WelcomeEmail = ({ name, dashboardUrl, role }) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Nayabato - Your Civic Issue Reporting Platform</Preview>
      <Body style={baseStyles}>
        <Container style={containerStyles}>
          <Section style={headerStyles}>
            <Img
              src={`https://nayabato.org/logo.png`}
              width="120"
              height="auto"
              alt="Nayabato Logo"
            />
            <Heading style={titleStyles}>Welcome to Nayabato!</Heading>
          </Section>
          
          <Section style={bodyStyles}>
            <Text>Hello {name},</Text>
            
            <Text>
              Thank you for joining Nayabato, your platform for civic engagement and community issue reporting.
              We're excited to have you on board as a {role === 'official' ? 'government official' : 'citizen'}.
            </Text>
            
            <Section style={infoBoxStyles}>
              <Text style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                With Nayabato, you can:
              </Text>
              <Text style={{ margin: '5px 0' }}>
                • Report civic issues in your community
              </Text>
              <Text style={{ margin: '5px 0' }}>
                • Track the status of reported issues
              </Text>
              <Text style={{ margin: '5px 0' }}>
                • Engage with local officials and other citizens
              </Text>
              <Text style={{ margin: '5px 0' }}>
                • Contribute to making your community better
              </Text>
            </Section>
            
            <Text>
              Your account has been successfully created, and you can now log in to start using the platform.
            </Text>
            
            <Section style={buttonContainerStyles}>
              <Link href={dashboardUrl} style={buttonStyles}>
                Go to Dashboard
              </Link>
            </Section>
            
            <Text>
              If you have any questions or need assistance, please don't hesitate to contact our support team at support@nayabato.org.
            </Text>
            
            <Text>
              Thank you for joining our community!
            </Text>
            
            <Text>
              Best regards,<br />
              The Nayabato Team
            </Text>
          </Section>
          
          <Section style={footerStyles}>
            <Text>
              © {new Date().getFullYear()} Nayabato. All rights reserved.
            </Text>
            <Text>
              If you did not create this account, please contact us immediately.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;
