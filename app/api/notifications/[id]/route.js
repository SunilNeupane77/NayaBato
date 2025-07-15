import connectDB from '@/lib/db/connect';
import Notification from '@/models/Notification';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get a single notification by ID
 * @route GET /api/notifications/:id
 */
export async function GET(request, { params }) {
  try {
    // Await params before destructuring
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
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
    
    // Find notification and check ownership
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }
    
    // Make sure the user can only access their own notifications
    if (notification.recipient.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to access this notification' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      notification
    });
    
  } catch (error) {
    console.error('Error fetching notification:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching notification' },
      { status: 500 }
    );
  }
}

/**
 * Mark a notification as read
 * @route PATCH /api/notifications/:id
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    
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
    
    // Find notification and check ownership
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }
    
    // Make sure the user can only update their own notifications
    if (notification.recipient.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to modify this notification' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Mark notification as read
    if (body.isRead !== undefined) {
      notification.isRead = body.isRead;
      await notification.save();
    }
    
    return NextResponse.json({
      success: true,
      notification
    });
    
  } catch (error) {
    console.error('Error updating notification:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating notification' },
      { status: 500 }
    );
  }
}

/**
 * Delete a notification
 * @route DELETE /api/notifications/:id
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
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
    
    // Find notification and check ownership
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }
    
    // Make sure the user can only delete their own notifications
    if (notification.recipient.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this notification' },
        { status: 403 }
      );
    }
    
    // Delete the notification
    await notification.deleteOne();
    
    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting notification:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error deleting notification' },
      { status: 500 }
    );
  }
}
