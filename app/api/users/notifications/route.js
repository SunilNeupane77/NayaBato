import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get or update user notification preferences
 * @route GET|PUT /api/users/notifications
 */
export async function GET(request) {
  try {
    // Get session to check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Get user's notification preferences
    const user = await User.findById(session.user.id)
      .select('notifications');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      notifications: user.notifications || {
        email: true,
        digest: false
      }
    });
    
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Get session to check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    const body = await request.json();
    
    // Validate notification preferences
    const allowedKeys = ['email', 'digest'];
    const notifications = {};
    
    for (const key of allowedKeys) {
      if (key in body) {
        if (typeof body[key] !== 'boolean') {
          return NextResponse.json(
            { success: false, message: `${key} must be a boolean value` },
            { status: 400 }
          );
        }
        notifications[key] = body[key];
      }
    }
    
    if (Object.keys(notifications).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid notification preferences provided' },
        { status: 400 }
      );
    }
    
    // Update user's notification preferences
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { 
        $set: Object.keys(notifications).reduce((acc, key) => {
          acc[`notifications.${key}`] = notifications[key];
          return acc;
        }, {})
      },
      { new: true, runValidators: true }
    ).select('notifications');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log(`Updated notification preferences for user ${session.user.id}:`, notifications);
    
    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      notifications: user.notifications
    });
    
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating preferences' },
      { status: 500 }
    );
  }
}
