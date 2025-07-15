import { updateWithAudit } from '@/lib/db/audit-utils';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get, update or delete a user by ID
 * Admin only endpoint
 * @route GET|PUT|DELETE /api/admin/users/[id]
 */
export async function GET(request, { params }) {
  try {
    // Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
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
    
    // Find the user
    const user = await User.findById(id)
      .select('-password -resetPasswordToken -resetPasswordExpire');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching user' },
      { status: 500 }
    );
  }
}

/**
 * Update user details - including approval/verification status
 * @route PUT /api/admin/users/[id]
 */
export async function PUT(request, { params }) {
  try {
    // Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    
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
    
    // Find the user to update
    const userToUpdate = await User.findById(id);
    
    if (!userToUpdate) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prepare update object with allowed fields
    const updateData = {};
    
    // Fields admins can update
    if (body.name !== undefined) updateData.name = body.name;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.verified !== undefined) updateData.verified = body.verified;
    if (body.department !== undefined) updateData.department = body.department;
    
    // Get admin user for audit
    const admin = await User.findById(session.user.id);
    
    // Update user with audit trail
    const updatedUser = await updateWithAudit({
      model: User,
      id,
      updates: updateData,
      actor: admin,
      requestInfo: {
        ip: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent')
      }
    });
    
    // Remove sensitive data
    updatedUser.password = undefined;
    updatedUser.resetPasswordToken = undefined;
    updatedUser.resetPasswordExpire = undefined;
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating user' },
      { status: 500 }
    );
  }
}

/**
 * Delete user
 * @route DELETE /api/admin/users/[id]
 */
export async function DELETE(request, { params }) {
  try {
    // Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
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
    
    // Find the user to delete
    const userToDelete = await User.findById(id);
    
    if (!userToDelete) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prevent deleting yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    // Get admin user for audit
    const admin = await User.findById(session.user.id);
    
    await User.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error deleting user' },
      { status: 500 }
    );
  }
}
