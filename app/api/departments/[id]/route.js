import connectDB from '@/lib/db/connect';
import Audit from '@/models/Audit';
import Department from '@/models/Department';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get, update or delete a specific department by ID
 * @route GET|PUT|DELETE /api/departments/[id]
 */
export async function GET(request, { params }) {
  try {
    // Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Connect to database
    await connectDB();
    
    // Find the department
    const department = await Department.findById(id)
      .populate('headOfficer', 'name email');
    
    if (!department) {
      return NextResponse.json(
        { success: false, message: 'Department not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      department
    });
    
  } catch (error) {
    console.error(`Error fetching department ${params.id}:`, error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching department' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    
    // Get session and verify permission
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update departments' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find and update the department
    const department = await Department.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).populate('headOfficer', 'name email');
    
    if (!department) {
      return NextResponse.json(
        { success: false, message: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Log this action
    await Audit.log({
      actor: session.user.id,
      action: 'update',
      resourceType: 'Department',
      resourceId: department._id,
      details: { updates: body }
    });
    
    return NextResponse.json({
      success: true,
      department
    });
    
  } catch (error) {
    console.error(`Error updating department ${params.id}:`, error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating department' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Get session and verify permission
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete departments' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find the department
    const department = await Department.findById(id);
    
    if (!department) {
      return NextResponse.json(
        { success: false, message: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Instead of hard delete, set isActive to false
    department.isActive = false;
    await department.save();
    
    // Log this action
    await Audit.log({
      actor: session.user.id,
      action: 'delete',
      resourceType: 'Department',
      resourceId: department._id,
      details: { name: department.name }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Department deactivated successfully'
    });
    
  } catch (error) {
    console.error(`Error deleting department ${params.id}:`, error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error deleting department' },
      { status: 500 }
    );
  }
}
