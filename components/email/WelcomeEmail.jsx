import React from 'react';

export default function WelcomeEmail({ name, dashboardUrl, role }) {
  const isOfficial = role === 'official' || role === 'admin';

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
        padding: '40px 30px',
        textAlign: 'center',
        borderRadius: '12px 12px 0 0'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          {isOfficial ? '' : ''}
        </div>
        <h1 style={{
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          letterSpacing: '-0.5px'
        }}>
          Welcome to Nayabato, {name}!
        </h1>
        <p style={{
          color: '#e6fffa',
          fontSize: '16px',
          margin: '0',
          opacity: '0.9'
        }}>
          {isOfficial ? 'Ready to serve your community' : 'Your voice matters in building a better community'}
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px 30px' }}>
        <div style={{
          backgroundColor: '#f0fdfa',
          padding: '24px',
          borderRadius: '8px',
          borderLeft: '4px solid #0d9488',
          marginBottom: '30px'
        }}>
          <h2 style={{
            color: '#0f766e',
            fontSize: '20px',
            margin: '0 0 12px 0',
            fontWeight: '600'
          }}>
            Account Created Successfully!
          </h2>
          <p style={{
            color: '#134e4a',
            fontSize: '16px',
            lineHeight: '1.6',
            margin: '0'
          }}>
            You're now part of a community working together to make positive changes.
            {isOfficial ? ' As an official, you can manage and resolve community issues.' : ' Start reporting issues and tracking their progress.'}
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{
            color: '#1f2937',
            fontSize: '18px',
            margin: '0 0 20px 0',
            fontWeight: '600'
          }}>
            {isOfficial ? 'Your responsibilities:' : 'What you can do:'}
          </h3>

          {isOfficial ? (
            <>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start' }}>
                <span style={{
                  backgroundColor: '#0d9488',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  marginRight: '12px',
                  flexShrink: '0'
                }}></span>
                <div>
                  <strong style={{ color: '#1f2937' }}>Review Issues</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                    Assess and prioritize community reports
                  </p>
                </div>
              </div>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start' }}>
                <span style={{
                  backgroundColor: '#0d9488',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  marginRight: '12px',
                  flexShrink: '0'
                }}></span>
                <div>
                  <strong style={{ color: '#1f2937' }}>Take Action</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                    Update status and coordinate resolutions
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start' }}>
                <span style={{
                  backgroundColor: '#0d9488',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  marginRight: '12px',
                  flexShrink: '0'
                }}></span>
                <div>
                  <strong style={{ color: '#1f2937' }}>Report Issues</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                    Share photos and details of community problems
                  </p>
                </div>
              </div>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start' }}>
                <span style={{
                  backgroundColor: '#0d9488',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  marginRight: '12px',
                  flexShrink: '0'
                }}></span>
                <div>
                  <strong style={{ color: '#1f2937' }}>Track Progress</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                    Follow up on your reports and see resolutions
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{
          backgroundColor: '#f9fafb',
          padding: '24px',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <p style={{
            color: '#374151',
            fontSize: '16px',
            margin: '0 0 16px 0',
            fontWeight: '500'
          }}>
            Ready to get started?
          </p>
          <a href={dashboardUrl} style={{
            backgroundColor: '#0d9488',
            color: '#ffffff',
            padding: '14px 28px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            display: 'inline-block',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            Go to Dashboard →
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#f3f4f6',
        padding: '30px',
        textAlign: 'center',
        borderRadius: '0 0 12px 12px'
      }}>
        <p style={{
          color: '#6b7280',
          fontSize: '12px',
          margin: '0 0 8px 0'
        }}>
          Need help? Contact us at sunilneupane957@gmail.com
        </p>
        <p style={{
          color: '#9ca3af',
          fontSize: '11px',
          margin: '0'
        }}>
          © {new Date().getFullYear()} Nayabato. Building stronger communities together.
        </p>
      </div>
    </div>
  );
}
