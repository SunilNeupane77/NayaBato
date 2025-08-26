import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import { badRequest, forbidden, handleApiError } from '@/lib/error-handler';
import Department from '@/models/Department';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

/**
 * Get all departments or create a new one
 * @route GET|POST /api/departments
 */
export async function GET(request) {
  try {
    // Connect to database
    await connectDB();
    
    // Get query parameters
    const url = new URL(request.url);
    const isActive = url.searchParams.get('isActive');
    
    // Build query
    const query = {};
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Find departments
    const departments = await Department.find(query)
      .populate('headOfficer', 'name email')
      .sort({ name: 1 });
    
    return NextResponse.json({
      success: true,
      count: departments.length,
      departments
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    // Get session and verify admin permission
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      throw forbidden('Not authorized to create departments');
    }
    
    // Connect to database
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      throw badRequest('Department name is required');
    }
    
    // Create department
    const department = await Department.create(body);
    
    return NextResponse.json({
      success: true,
      department
    }, { status: 201 });
    
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return handleApiError(badRequest('A department with this name already exists'));
    }
    
    return handleApiError(error);
  }
}
