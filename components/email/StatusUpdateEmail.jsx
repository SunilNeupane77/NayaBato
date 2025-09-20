import React from 'react';

export default function StatusUpdateEmail({ issueId, title, status, notes, issueUrl }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'resolved':
        return {
          emoji: '✅',
          color: '#059669',
          bgColor: '#f0fdf4',
          borderColor: '#059669',
          message: 'Great news! Your issue has been resolved.',
          gradient: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)'
        };
      case 'in-progress':
        return {
          emoji: '🔄',
          color: '#d97706',
          bgColor: '#fffbeb',
          borderColor: '#d97706',
          message: 'Your issue is being actively worked on.',
          gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
        };
      case 'under-review':
        return {
          emoji: '👀',
          color: '#2563eb',
          bgColor: '#eff6ff',
          borderColor: '#2563eb',
          message: 'Your issue is under review by our team.',
          gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
        };
      case 'rejected':
        return {
          emoji: '❌',
          color: '#dc2626',
          bgColor: '#fef2f2',
          borderColor: '#dc2626',
          message: 'Your issue could not be processed.',
          gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
        };
      default:
        return {
          emoji: '📋',
          color: '#6b7280',
          bgColor: '#f9fafb',
          borderColor: '#6b7280',
          message: 'There\'s an update on your issue.',
          gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff'
    }}>
      {/* Header */}
      <div style={{
        background: statusConfig.gradient,
        padding: '40px 30px',
        textAlign: 'center',
        borderRadius: '12px 12px 0 0'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {statusConfig.emoji}
        </div>
        <h1 style={{
          color: '#ffffff',
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          letterSpacing: '-0.5px'
        }}>
          Issue Status Update
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '16px',
          margin: '0'
        }}>
          {statusConfig.message}
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px 30px' }}>
        <div style={{
          backgroundColor: statusConfig.bgColor,
          padding: '24px',
          borderRadius: '8px',
          borderLeft: `4px solid ${statusConfig.borderColor}`,
          marginBottom: '30px'
        }}>
          <h2 style={{
            color: statusConfig.color,
            fontSize: '18px',
            margin: '0 0 16px 0',
            fontWeight: '600'
          }}>
            📋 Issue Details
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
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#1f2937', fontSize: '14px' }}>New Status:</strong>
            <span style={{
              backgroundColor: statusConfig.color,
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              marginLeft: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {status.replace('-', ' ')}
            </span>
          </div>
          
          {notes && (
            <div style={{ marginBottom: '0' }}>
              <strong style={{ color: '#1f2937', fontSize: '14px' }}>Update Notes:</strong>
              <div style={{
                backgroundColor: '#ffffff',
                padding: '12px',
                borderRadius: '6px',
                marginTop: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ margin: '0', color: '#374151', fontSize: '14px', lineHeight: '1.5' }}>
                  {notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {status === 'resolved' && (
          <div style={{
            backgroundColor: '#f0fdf4',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎉</div>
            <h3 style={{
              color: '#065f46',
              fontSize: '18px',
              margin: '0 0 8px 0',
              fontWeight: '600'
            }}>
              Thank you for your patience!
            </h3>
            <p style={{
              color: '#047857',
              fontSize: '14px',
              margin: '0'
            }}>
              Your report helped make our community better. Keep up the great work!
            </p>
          </div>
        )}

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
            View full details and timeline
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
          Questions about this update? Reply to this email
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
