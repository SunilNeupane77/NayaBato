import React from 'react';

export default function IssueConfirmationEmail({ issueId, title, location, issueUrl }) {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
        padding: '40px 30px',
        textAlign: 'center',
        borderRadius: '12px 12px 0 0'
      }}>

        <h1 style={{
          color: '#ffffff',
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          letterSpacing: '-0.5px'
        }}>
          Issue Reported Successfully!
        </h1>
        <p style={{
          color: '#d1fae5',
          fontSize: '16px',
          margin: '0',
          opacity: '0.9'
        }}>
          Thank you for helping improve our community
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px 30px' }}>
        <div style={{
          backgroundColor: '#f0fdf4',
          padding: '24px',
          borderRadius: '8px',
          borderLeft: '4px solid #059669',
          marginBottom: '30px'
        }}>
          <h2 style={{
            color: '#065f46',
            fontSize: '18px',
            margin: '0 0 16px 0',
            fontWeight: '600'
          }}>
            Issue Details
          </h2>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#1f2937', fontSize: '14px' }}>Issue ID:</strong>
            <span style={{
              backgroundColor: '#e5e7eb',
              color: '#374151',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              marginLeft: '8px'
            }}>
              #{issueId}
            </span>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#1f2937', fontSize: '14px' }}>Title:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#374151', fontSize: '16px' }}>
              {title}
            </p>
          </div>

          <div style={{ marginBottom: '0' }}>
            <strong style={{ color: '#1f2937', fontSize: '14px' }}>Location:</strong>
            <p style={{ margin: '4px 0 0 0', color: '#374151', fontSize: '14px' }}>
              {location}
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{
            color: '#1f2937',
            fontSize: '18px',
            margin: '0 0 16px 0',
            fontWeight: '600'
          }}>
            What happens next?
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{
                backgroundColor: '#3b82f6',
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
              }}>1</span>
              <div>
                <strong style={{ color: '#1f2937' }}>Review Process</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  Our team will review your report within 24-48 hours
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{
                backgroundColor: '#f59e0b',
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
              }}>2</span>
              <div>
                <strong style={{ color: '#1f2937' }}>Assignment</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  The issue will be assigned to the appropriate department
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{
                backgroundColor: '#059669',
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
              }}>3</span>
              <div>
                <strong style={{ color: '#1f2937' }}>Resolution</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  You'll receive updates as progress is made
                </p>
              </div>
            </div>
          </div>
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
            Track your issue progress
          </p>
          <a href={issueUrl} style={{
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
            View Issue Details →
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
          Questions? Reply to this email or contact support
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
