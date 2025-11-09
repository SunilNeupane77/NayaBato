import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import { handleApiError, unauthorized } from '@/lib/error-handler';
import { assignWardToIssue, getWardAssignmentStats } from '@/lib/ward-assignment';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

/**
 * Test ward assignment for given coordinates
 * @route POST /api/wards/assignment
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      throw unauthorized('Admin or official access required');
    }
    
    const { coordinates } = await request.json();
    
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return NextResponse.json(
        { success: false, message: 'Invalid coordinates format. Expected [longitude, latitude]' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const result = await assignWardToIssue(coordinates);
    
    return NextResponse.json({
      success: true,
      assignment: result
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Get ward assignment statistics
 * @route GET /api/wards/assignment
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      throw unauthorized('Admin or official access required');
    }
    
    await connectDB();
    
    const stats = await getWardAssignmentStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}
