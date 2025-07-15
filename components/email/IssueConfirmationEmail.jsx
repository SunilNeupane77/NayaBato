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
  color: '#666',
  fontSize: '12px',
  marginTop: '30px',
  paddingTop: '20px',
  textAlign: 'center',
};

export default function IssueConfirmationEmail({ issueId, title, location, issueUrl }) {
  return (
    <Html>
      <Head />
      <Preview>Thank you for reporting issue #{issueId.substring(issueId.length - 6)}</Preview>
      <Body style={baseStyles}>
        <Container style={containerStyles}>
          <Section style={headerStyles}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
              width="120"
              height="40"
              alt="Nayabato Logo"
            />
            <Heading style={titleStyles}>Thank You for Your Report!</Heading>
          </Section>

          <Section>
            <Text style={bodyStyles}>
              Your issue has been successfully recorded in our system. We will review it
              and take appropriate action.
            </Text>
          </Section>

          <Section style={infoBoxStyles}>
            <Text style={subtitleStyles}>
              <strong>{title}</strong>
            </Text>
            <Text style={bodyStyles}>
              <strong>Issue ID:</strong> #{issueId.substring(issueId.length - 6)}
            </Text>
            <Text style={bodyStyles}>
              <strong>Location:</strong> {location}
            </Text>
          </Section>

          <Section style={buttonContainerStyles}>
            <Link href={issueUrl} style={buttonStyles}>
              Track Your Issue
            </Link>
          </Section>

          <Section>
            <Text style={bodyStyles}>
              You will receive notifications when there are updates to your report.
              Thank you for helping improve our community!
            </Text>
          </Section>

          <Section style={footerStyles}>
            <Text>© {new Date().getFullYear()} Nayabato. All rights reserved.</Text>
            <Text>
              If you have any questions, please <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/contact`}>contact us</Link>.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
