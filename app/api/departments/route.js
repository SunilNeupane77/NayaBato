import connectDB from '@/lib/db/connect';
import Department from '@/models/Department';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
    console.error('Error fetching departments:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching departments' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Get session and verify admin permission
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to create departments' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, message: 'Department name is required' },
        { status: 400 }
      );
    }
    
    // Create department
    const department = await Department.create(body);
    
    return NextResponse.json({
      success: true,
      department
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating department:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'A department with this name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating department' },
      { status: 500 }
    );
  }
}
