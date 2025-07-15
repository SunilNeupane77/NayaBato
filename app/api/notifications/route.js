import connectDB from '@/lib/db/connect';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get user notifications or mark all as read
 * @route GET|PUT /api/notifications
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
    
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const onlyUnread = url.searchParams.get('unread') === 'true';
    
    // Build query
    const query = { recipient: session.user.id };
    if (onlyUnread) {
      query.isRead = false;
    }
    
    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
    
    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      recipient: session.user.id,
      isRead: false
    });
    
    return NextResponse.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
    
  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching notifications' },
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
    
    // Mark all user's notifications as read
    await Notification.updateMany(
      { recipient: session.user.id, isRead: false },
      { isRead: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read'
    });
    
  } catch (error) {
    console.error('Error updating notifications:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating notifications' },
      { status: 500 }
    );
  }
}
