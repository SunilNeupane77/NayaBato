import { updateWithAudit } from '@/lib/db/audit-utils';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get user profile of currently logged in user
 * @route GET /api/users/profile
 */
export async function GET(request) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Get user profile
    const user = await User.findById(session.user.id)
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
    console.error('Error fetching user profile:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching user profile' },
      { status: 500 }
    );
  }
}

/**
 * Update user profile
 * @route PUT /api/users/profile
 */
export async function PUT(request) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Get request body
    const body = await request.json();
    
    // Find user to update
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prepare update object
    const updateData = {};
    
    // Only allow updating these fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber;
    
    // Handle password update
    if (body.currentPassword && body.newPassword) {
      // Get user with password
      const userWithPassword = await User.findById(session.user.id).select('+password');
      
      // Check current password
      const isMatch = await userWithPassword.matchPassword(body.currentPassword);
      
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }
      
      // Set new password
      updateData.password = body.newPassword;
    }
    
    // Handle notification preferences
    if (body.notifications) {
      updateData.notifications = {
        email: body.notifications.email !== undefined ? body.notifications.email : user.notifications.email,
        digest: body.notifications.digest !== undefined ? body.notifications.digest : user.notifications.digest
      };
    }
    
    // Update user with audit trail
    const updatedUser = await updateWithAudit({
      model: User,
      id: session.user.id,
      updates: updateData,
      actor: user,
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
      message: 'Profile updated successfully',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating user profile' },
      { status: 500 }
    );
  }
}
