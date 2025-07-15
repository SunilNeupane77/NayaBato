import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get all users - with pagination and filtering
 * Admin only endpoint
 * @route GET /api/admin/users
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
    
    // Other filters
    const role = url.searchParams.get('role');
    const verified = url.searchParams.get('verified');
    const searchQuery = url.searchParams.get('search');
    
    // Build query filters
    const filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (verified !== null && verified !== undefined) {
      filter.verified = verified === 'true';
    }
    
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    // Count total matching documents
    const total = await User.countDocuments(filter);
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Return paginated results
    return NextResponse.json({
      success: true,
      count: users.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      users
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching users' },
      { status: 500 }
    );
  }
}
