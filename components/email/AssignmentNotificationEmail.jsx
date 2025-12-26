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

const assignmentBoxStyles = {
  background: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const issueDetailsStyles = {
  background: '#f4f4f7',
  borderRadius: '4px',
  padding: '20px',
  marginBottom: '20px',
};

const priorityStyles = {
  high: { backgroundColor: '#dc2626', color: 'white' },
  medium: { backgroundColor: '#f59e0b', color: 'white' },
  low: { backgroundColor: '#10b981', color: 'white' },
};

const buttonContainerStyles = {
  textAlign: 'center',
  margin: '30px 0',
};

const buttonStyles = {
  backgroundColor: '#7c3aed',
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

const AssignmentNotificationEmail = ({
  officialName,
  issueTitle,
  issueId,
  category,
  priority = 'medium',
  location,
  description,
  reporterName,
  assignedBy,
  issueUrl,
  dueDate
}) => {
  const getPriorityStyle = (priority) => {
    return {
      ...priorityStyles[priority] || priorityStyles.medium,
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      display: 'inline-block'
    };
  };

  return (
    <Html>
      <Head />
      <Preview>New issue assigned to you: {issueTitle}</Preview>
      <Body style={baseStyles}>
        <Container style={containerStyles}>
          <Section style={headerStyles}>
            <Heading style={titleStyles}>New Issue Assignment</Heading>
          </Section>

          <Section style={bodyStyles}>
            <Text>Hello {officialName},</Text>

            <Section style={assignmentBoxStyles}>
              <Text style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#92400e' }}>
                You have been assigned a new issue to handle:
              </Text>
              <Text style={{
                margin: '0',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1f2937'
              }}>
                "{issueTitle}"
              </Text>
            </Section>

            <Section style={issueDetailsStyles}>
              <Heading style={{ fontSize: '16px', margin: '0 0 15px 0' }}>
                Issue Details
              </Heading>

              <Text style={{ margin: '8px 0' }}>
                <strong>Issue ID:</strong> {issueId}
              </Text>

              <Text style={{ margin: '8px 0' }}>
                <strong>Category:</strong> {category}
              </Text>

              <Text style={{ margin: '8px 0' }}>
                <strong>Priority:</strong>{' '}
                <span style={getPriorityStyle(priority)}>
                  {priority}
                </span>
              </Text>

              <Text style={{ margin: '8px 0' }}>
                <strong>Location:</strong> {location}
              </Text>

              <Text style={{ margin: '8px 0' }}>
                <strong>Reported by:</strong> {reporterName}
              </Text>

              <Text style={{ margin: '8px 0' }}>
                <strong>Assigned by:</strong> {assignedBy}
              </Text>

              {dueDate && (
                <Text style={{ margin: '8px 0' }}>
                  <strong>Due Date:</strong> {new Date(dueDate).toLocaleDateString()}
                </Text>
              )}

              <Text style={{ margin: '15px 0 8px 0', fontWeight: 'bold' }}>
                Description:
              </Text>
              <Text style={{
                margin: '0',
                backgroundColor: '#ffffff',
                padding: '15px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                fontStyle: 'italic'
              }}>
                {description}
              </Text>
            </Section>

            <Text>
              As the assigned official, you are now responsible for:
            </Text>

            <Text style={{ marginLeft: '20px' }}>
              • Reviewing the issue details thoroughly<br />
              • Updating the issue status as you work on it<br />
              • Communicating with the reporter if needed<br />
              • Resolving the issue in a timely manner
            </Text>

            <Section style={buttonContainerStyles}>
              <Link href={issueUrl} style={buttonStyles}>
                View & Manage Issue
              </Link>
            </Section>

            <Text style={{
              backgroundColor: '#dbeafe',
              padding: '15px',
              borderRadius: '4px',
              border: '1px solid #93c5fd'
            }}>
              <strong>Tip:</strong> Keep the community informed by updating the issue status
              and adding comments about your progress. This builds trust and transparency.
            </Text>

            <Text>
              Thank you for your service to the community!
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
              You received this email because you are a registered official on Nayabato.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AssignmentNotificationEmail;
