import React from 'react';

export default function NewsletterSubscriptionEmail({ email }) {
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
        <h1 style={{
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          letterSpacing: '-0.5px'
        }}>
          🎉 Welcome to Nayabato!
        </h1>
        <p style={{
          color: '#e6fffa',
          fontSize: '16px',
          margin: '0',
          opacity: '0.9'
        }}>
          Your weekly community digest awaits
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
            📧 You're all set!
          </h2>
          <p style={{
            color: '#134e4a',
            fontSize: '16px',
            lineHeight: '1.6',
            margin: '0'
          }}>
            Thank you for subscribing to our weekly digest. You'll receive curated updates about community issues and their resolutions.
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{
            color: '#1f2937',
            fontSize: '18px',
            margin: '0 0 16px 0',
            fontWeight: '600'
          }}>
            What to expect:
          </h3>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '12px'
            }}>
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
              }}>
                📊
              </span>
              <div>
                <strong style={{ color: '#1f2937' }}>Weekly Statistics</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  Track community progress and resolution rates
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '12px'
            }}>
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
              }}>
                🏘️
              </span>
              <div>
                <strong style={{ color: '#1f2937' }}>Local Updates</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  Stay informed about issues in your area
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '12px'
            }}>
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
              }}>
                ✅
              </span>
              <div>
                <strong style={{ color: '#1f2937' }}>Success Stories</strong>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  Celebrate resolved issues and community wins
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <p style={{
            color: '#374151',
            fontSize: '14px',
            margin: '0 0 12px 0'
          }}>
            Ready to make a difference in your community?
          </p>
          <a href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/issues/report`} style={{
            backgroundColor: '#0d9488',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            display: 'inline-block'
          }}>
            Report an Issue
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
          This email was sent to <strong>{email}</strong>
        </p>
        <p style={{
          color: '#9ca3af',
          fontSize: '11px',
          margin: '0'
        }}>
          © 2024 Nayabato. Building stronger communities together.
        </p>
      </div>
    </div>
  );
}
