import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Audit from '@/models/Audit';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

/**
 * Get audit logs (admin only)
 * @route GET /api/admin/audit
 */
export async function GET(request) {
  try {
    // Get session to check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Admin authorization check
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const resourceType = url.searchParams.get('resourceType');
    const resourceId = url.searchParams.get('resourceId');
    const action = url.searchParams.get('action');
    const actor = url.searchParams.get('actor');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Build query filters
    const filter = {};
    
    if (resourceType) {
      filter.resourceType = resourceType;
    }
    
    if (resourceId) {
      filter.resourceId = resourceId;
    }
    
    if (action) {
      filter.action = action;
    }
    
    if (actor) {
      filter.actor = actor;
    }
    
    // Date range filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Count total matching documents
    const total = await Audit.countDocuments(filter);
    
    // Get audit logs with pagination and populate actor field
    const logs = await Audit.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'actor',
        select: 'name email role'
      });
    
    // Return paginated results
    return NextResponse.json({
      success: true,
      count: logs.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      logs
    });
    
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching audit logs' },
      { status: 500 }
    );
  }
}

/**
 * Export audit logs as CSV (admin only)
 * @route POST /api/admin/audit
 * @body { format: 'csv', filters: {...} }
 */
export async function POST(request) {
  try {
    // Get session to check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Admin authorization check
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin authorization required' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Parse request body
    const body = await request.json();
    const { format, filters } = body;
    
    if (format !== 'csv') {
      return NextResponse.json(
        { success: false, message: 'Unsupported export format' },
        { status: 400 }
      );
    }
    
    // Build query filters
    const filter = filters || {};
    
    // Get audit logs with no pagination limit but with a reasonable cap
    const logs = await Audit.find(filter)
      .sort({ createdAt: -1 })
      .limit(10000) // Cap at 10000 records for export
      .populate({
        path: 'actor',
        select: 'name email role'
      });
    
    // Generate CSV data
    const csvHeader = 'Timestamp,Actor,Email,Role,Action,Resource Type,Resource ID,Details\n';
    
    const csvRows = logs.map(log => {
      const timestamp = new Date(log.createdAt).toISOString();
      const actorName = log.actor ? log.actor.name : 'System';
      const email = log.actor ? log.actor.email : '';
      const role = log.actor ? log.actor.role : '';
      
      // Escape details to handle commas and quotes in JSON
      const details = JSON.stringify(log.details || {}).replace(/"/g, '""');
      
      return `"${timestamp}","${actorName}","${email}","${role}","${log.action}","${log.resourceType}","${log.resourceId}","${details}"`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    // Return CSV data with appropriate headers
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
    
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error exporting audit logs' },
      { status: 500 }
    );
  }
}
