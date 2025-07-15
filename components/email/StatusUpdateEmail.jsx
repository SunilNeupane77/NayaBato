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

const statusBoxStyles = (status) => {
  const colorMap = {
    'Reported': '#f97316',
    'Under Review': '#3b82f6',
    'In Progress': '#eab308',
    'Resolved': '#22c55e',
    'Not Actionable': '#ef4444',
  };
  
  return {
    background: colorMap[status] || '#f4f4f7',
    color: 'white',
    fontWeight: 'bold',
    padding: '8px 16px',
    borderRadius: '4px',
    display: 'inline-block',
    marginBottom: '10px',
  };
};

const notesStyles = {
  backgroundColor: 'white',
  border: '1px solid #eaeaea',
  borderRadius: '4px',
  padding: '15px',
  marginTop: '15px',
  fontSize: '14px',
  lineHeight: 1.5,
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

export default function StatusUpdateEmail({ issueId, title, status, notes, issueUrl }) {
  return (
    <Html>
      <Head />
      <Preview>Your issue #{issueId.substring(issueId.length - 6)} has been updated to {status}</Preview>
      <Body style={baseStyles}>
        <Container style={containerStyles}>
          <Section style={headerStyles}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
              width="120"
              height="40"
              alt="Nayabato Logo"
            />
            <Heading style={titleStyles}>Your Issue Has Been Updated</Heading>
          </Section>

          <Section>
            <Text style={bodyStyles}>
              We're writing to inform you that your reported issue has been updated in our system.
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
              <strong>New Status:</strong> <span style={statusBoxStyles(status)}>{status}</span>
            </Text>
            
            {notes && (
              <div style={notesStyles}>
                <Text style={{ margin: 0 }}>
                  <strong>Notes from the update:</strong>
                </Text>
                <Text style={{ marginBottom: 0 }}>{notes}</Text>
              </div>
            )}
          </Section>

          <Section style={buttonContainerStyles}>
            <Link href={issueUrl} style={buttonStyles}>
              View Issue Details
            </Link>
          </Section>

          <Section>
            <Text style={bodyStyles}>
              Thank you for your contribution to making our community better. If you have any questions,
              please don't hesitate to contact us.
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
