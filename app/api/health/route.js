import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';

/**
 * Health check endpoint for monitoring application status
 * Verifies database connectivity and application health
 */
export async function GET() {
  try {
    // Check database connection
    await connectDB();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected'
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'disconnected'
    };

    return NextResponse.json(errorStatus, { status: 503 });
  }
}
