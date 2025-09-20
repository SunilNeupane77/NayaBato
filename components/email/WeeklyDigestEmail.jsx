import React from 'react';

export default function WeeklyDigestEmail({ 
  userName, 
  weekStart, 
  weekEnd, 
  stats, 
  recentIssues, 
  dashboardUrl 
}) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return '#059669';
      case 'in-progress': return '#d97706';
      case 'under-review': return '#2563eb';
      default: return '#6b7280';
    }
  };

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
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h1 style={{
          color: '#ffffff',
          fontSize: '28px',
          fontWeight: 'bold',
          margin: '0 0 10px 0',
          letterSpacing: '-0.5px'
        }}>
          Weekly Community Report
        </h1>
        <p style={{
          color: '#e6fffa',
          fontSize: '16px',
          margin: '0',
          opacity: '0.9'
        }}>
          {formatDate(weekStart)} - {formatDate(weekEnd)}
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px 30px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            color: '#1f2937',
            fontSize: '20px',
            margin: '0 0 12px 0',
            fontWeight: '600'
          }}>
            Hello {userName}! 👋
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            lineHeight: '1.6',
            margin: '0'
          }}>
            Here's what happened in your community this week.
          </p>
        </div>

        {/* Statistics */}
        <div style={{
          backgroundColor: '#f0fdfa',
          padding: '24px',
          borderRadius: '8px',
          borderLeft: '4px solid #0d9488',
          marginBottom: '30px'
        }}>
          <h3 style={{
            color: '#0f766e',
            fontSize: '18px',
            margin: '0 0 16px 0',
            fontWeight: '600'
          }}>
            📈 Weekly Summary
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#0d9488',
                marginBottom: '4px'
              }}>
                {stats.totalReported}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>New Reports</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#059669',
                marginBottom: '4px'
              }}>
                {stats.totalResolved}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Resolved</div>
            </div>
          </div>

          <div style={{ 
            marginTop: '20px', 
            paddingTop: '16px', 
            borderTop: '1px solid #d1fae5' 
          }}>
            <div style={{ fontSize: '14px', color: '#047857', marginBottom: '8px' }}>
              <strong>Current Status:</strong>
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              • In Progress: {stats.inProgress} issues<br/>
              • Under Review: {stats.underReview} issues
            </div>
          </div>
        </div>

        {/* Categories */}
        {Object.keys(stats.categories).length > 0 && (
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <h3 style={{
              color: '#1f2937',
              fontSize: '16px',
              margin: '0 0 12px 0',
              fontWeight: '600'
            }}>
              📋 Top Categories This Week
            </h3>
            {Object.entries(stats.categories).map(([category, count]) => (
              <div key={category} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span style={{ color: '#374151', fontSize: '14px', textTransform: 'capitalize' }}>
                  {category.replace('-', ' ')}
                </span>
                <span style={{
                  backgroundColor: '#0d9488',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Recent Issues */}
        {recentIssues && recentIssues.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{
              color: '#1f2937',
              fontSize: '18px',
              margin: '0 0 16px 0',
              fontWeight: '600'
            }}>
              🔥 Recent Activity
            </h3>
            
            {recentIssues.slice(0, 3).map((issue, index) => (
              <div key={issue.id} style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <h4 style={{
                    color: '#1f2937',
                    fontSize: '14px',
                    fontWeight: '600',
                    margin: '0',
                    flex: '1'
                  }}>
                    {issue.title}
                  </h4>
                  <span style={{
                    backgroundColor: getStatusColor(issue.status),
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    marginLeft: '8px'
                  }}>
                    {issue.status.replace('-', ' ')}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  📍 {issue.location} • By {issue.reportedBy}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
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
            Want to see more details?
          </p>
          <a href={dashboardUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`} style={{
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
            View Dashboard →
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
          You're receiving this because you subscribed to weekly updates
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
