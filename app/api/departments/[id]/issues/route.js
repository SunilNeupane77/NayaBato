import connectDB from '@/lib/db/connect';
// Import models in dependency order
import Department from '@/models/Department';
import Issue from '@/models/Issue';
import { NextResponse } from 'next/server';

/**
 * Get issues assigned to a specific department
 * @route GET /api/departments/[id]/issues
 */
export async function GET(request, { params }) {
  try {
    // Connect to database
    await connectDB();
    
    // Get department ID from params - no need to await params directly
    const { id } = params;
    
    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    
    const skip = (page - 1) * limit;
    
    // Find the department to get its categories
    const department = await Department.findById(id);
    
    if (!department) {
      return NextResponse.json(
        { success: false, message: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Build query for issues
    const query = {
      category: { $in: department.categories }
    };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Count total matching issues
    const total = await Issue.countDocuments(query);
    
    // Find issues with pagination
    const issues = await Issue.find(query)
      .populate('reporter', 'name email')
      .populate('assignedTo', 'name email')
      .populate('assignedWard', 'name number')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return NextResponse.json({
      success: true,
      count: issues.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      issues
    });
    
  } catch (error) {
    console.error(`Error fetching department issues ${params.id}:`, error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching department issues' },
      { status: 500 }
    );
  }
}
