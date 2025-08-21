import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateWithAudit } from '@/lib/db/audit-utils';
import connectDB from '@/lib/db/connect';
import Audit from '@/models/Audit';
import Ward from '@/models/Ward';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

/**
 * Get, update or delete a specific ward by ID
 * @route GET|PUT|DELETE /api/wards/[id]
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Connect to database
    await connectDB();
    
    // Find the ward
    const ward = await Ward.findById(id)
      .populate('officerInCharge', 'name email');
    
    if (!ward) {
      return NextResponse.json(
        { success: false, message: 'Ward not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      ward
    });
    
  } catch (error) {
    console.error(`Error fetching ward ${params.id}:`, error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching ward' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Get session and verify permission
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update wards' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Get user for audit
    const user = await import('@/models/User').then(module => module.default.findById(session.user.id));
    
    // Update the ward with audit trail
    const ward = await updateWithAudit({
      model: Ward,
      id,
      updates: body,
      actor: user,
      requestInfo: {
        ip: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent')
      }
    });
    
    if (!ward) {
      return NextResponse.json(
        { success: false, message: 'Ward not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      ward
    });
    
  } catch (error) {
    console.error('Error updating ward:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating ward' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Get session and verify permission
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete wards' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find the ward
    const ward = await Ward.findById(id);
    
    if (!ward) {
      return NextResponse.json(
        { success: false, message: 'Ward not found' },
        { status: 404 }
      );
    }
    
    // Instead of hard delete, set isActive to false
    ward.isActive = false;
    await ward.save();
    
    // Log this action
    await Audit.log({
      actor: session.user.id,
      action: 'delete',
      resourceType: 'Ward',
      resourceId: id,
      details: { wardName: ward.name, wardNumber: ward.number }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Ward deactivated successfully'
    });
    
  } catch (error) {
    console.error('Error deactivating ward:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error deactivating ward' },
      { status: 500 }
    );
  }
}
