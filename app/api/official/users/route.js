import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'official' && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Official or Admin authorization required' },
        { status: 403 }
      );
    }
    
    await connectDB();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const role = url.searchParams.get('role');
    const verified = url.searchParams.get('verified');
    const searchQuery = url.searchParams.get('search');
    
    // Build query filters (same as admin)
    const filter = {};
    
    if (role && role !== 'all') {
      filter.role = role;
    }
    
    if (verified !== null && verified !== undefined && verified !== 'all') {
      filter.verified = verified === 'true';
    }
    
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    const total = await User.countDocuments(filter);
    
    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .populate('ward', 'name number')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
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
