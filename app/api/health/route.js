import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Docker and monitoring services
 * Returns basic application status and version information
 * @route GET /api/health
 */
export async function GET() {
  try {
    // Basic connectivity check for MongoDB
    let dbStatus = 'unknown';
    try {
      // Simple check without actually connecting (to avoid overhead)
      dbStatus = process.env.MONGODB_URI ? 'configured' : 'not_configured';
    } catch (error) {
      dbStatus = 'error';
    }
    
    // Return health status with basic system information
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || 'unknown',
      environment: process.env.NODE_ENV,
      database: {
        status: dbStatus
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message || 'Unknown error during health check',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
