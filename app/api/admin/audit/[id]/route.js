import connectDB from '@/lib/db/connect';
import Audit from '@/models/Audit';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get a single audit log entry by ID (admin only)
 * @route GET /api/admin/audit/:id
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
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
    
    // Find the audit log entry by ID and populate actor
    const log = await Audit.findById(id).populate({
      path: 'actor',
      select: 'name email role'
    });
    
    if (!log) {
      return NextResponse.json(
        { success: false, message: 'Audit log entry not found' },
        { status: 404 }
      );
    }
    
    // Get related resource details if available
    let relatedResource = null;
    if (log.resourceType && log.resourceId) {
      try {
        const Model = mongoose.model(log.resourceType);
        relatedResource = await Model.findById(log.resourceId);
      } catch (error) {
        console.error(`Error fetching related resource: ${error.message}`);
        // Continue execution even if related resource can't be fetched
      }
    }
    
    return NextResponse.json({
      success: true,
      log,
      relatedResource
    });
    
  } catch (error) {
    console.error('Error fetching audit log entry:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching audit log entry' },
      { status: 500 }
    );
  }
}
