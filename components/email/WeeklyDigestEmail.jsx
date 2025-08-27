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

const statsBoxStyles = {
  background: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const statItemStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: '1px solid #e0f2fe',
};

const issueItemStyles = {
  background: '#fafafa',
  border: '1px solid #e5e5e5',
  borderRadius: '6px',
  padding: '15px',
  marginBottom: '15px',
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

const WeeklyDigestEmail = ({ 
  userName, 
  weekStart, 
  weekEnd, 
  stats, 
  recentIssues, 
  dashboardUrl 
}) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'reported': '#6b7280',
      'under-review': '#f59e0b',
      'in-progress': '#3b82f6',
      'resolved': '#10b981',
      'rejected': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <Html>
      <Head />
      <Preview>Your weekly Nayabato community update</Preview>
      <Body style={baseStyles}>
        <Container style={containerStyles}>
          <Section style={headerStyles}>
            <Heading style={titleStyles}>Weekly Community Digest</Heading>
            <Text style={{ color: '#6b7280', margin: '0' }}>
              {formatDate(weekStart)} - {formatDate(weekEnd)}
            </Text>
          </Section>
          
          <Section style={bodyStyles}>
            <Text>Hello {userName},</Text>
            
            <Text>
              Here's your weekly summary of community activity on Nayabato. 
              Stay informed about what's happening in your area!
            </Text>
            
            <Section style={statsBoxStyles}>
              <Heading style={{ fontSize: '18px', margin: '0 0 15px 0', color: '#0369a1' }}>
                📊 This Week's Activity
              </Heading>
              
              <div style={statItemStyles}>
                <Text style={{ margin: '0', fontWeight: 'bold' }}>New Issues Reported</Text>
                <Text style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#dc2626' }}>
                  {stats.newIssues || 0}
                </Text>
              </div>
              
              <div style={statItemStyles}>
                <Text style={{ margin: '0', fontWeight: 'bold' }}>Issues Resolved</Text>
                <Text style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>
                  {stats.resolvedIssues || 0}
                </Text>
              </div>
              
              <div style={statItemStyles}>
                <Text style={{ margin: '0', fontWeight: 'bold' }}>Issues In Progress</Text>
                <Text style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>
                  {stats.inProgressIssues || 0}
                </Text>
              </div>
              
              <div style={{ ...statItemStyles, borderBottom: 'none' }}>
                <Text style={{ margin: '0', fontWeight: 'bold' }}>Total Active Issues</Text>
                <Text style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#7c3aed' }}>
                  {stats.totalActiveIssues || 0}
                </Text>
              </div>
            </Section>

            {recentIssues && recentIssues.length > 0 && (
              <>
                <Heading style={{ fontSize: '18px', margin: '30px 0 15px 0' }}>
                  🔥 Recent Issues in Your Area
                </Heading>
                
                {recentIssues.slice(0, 5).map((issue, index) => (
                  <div key={index} style={issueItemStyles}>
                    <Text style={{ 
                      margin: '0 0 8px 0', 
                      fontWeight: 'bold', 
                      fontSize: '16px' 
                    }}>
                      {issue.title}
                    </Text>
                    
                    <Text style={{ 
                      margin: '0 0 8px 0', 
                      color: '#6b7280',
                      fontSize: '14px'
                    }}>
                      📍 {issue.location?.address || 'Location not specified'}
                    </Text>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <span style={{
                        backgroundColor: getStatusColor(issue.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        fontWeight: 'bold'
                      }}>
                        {issue.status.replace('-', ' ')}
                      </span>
                      
                      <Text style={{ 
                        margin: '0', 
                        fontSize: '12px', 
                        color: '#9ca3af' 
                      }}>
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                ))}
              </>
            )}
            
            <Section style={buttonContainerStyles}>
              <Link href={dashboardUrl} style={buttonStyles}>
                View Full Dashboard
              </Link>
            </Section>
            
            <Text>
              Thank you for being an active member of your community! 
              Together, we're making our neighborhoods better places to live.
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
              You're receiving this digest because you opted in to weekly updates. 
              You can change your email preferences in your account settings.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WeeklyDigestEmail;
