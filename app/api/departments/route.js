import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Department from '@/models/Department';
import Issue from '@/models/Issue';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || '';

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== 'all') {
      query.isActive = status === 'active';
    }
    if (category && category !== 'all-categories') {
      query.categories = category;
    }

    const [departments, total] = await Promise.all([
      Department.find(query)
        .populate('headOfficer', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Department.countDocuments(query)
    ]);

    // Get issue counts for each department
    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        try {
          const issueCount = await Issue.countDocuments({ 
            category: { $in: dept.categories } 
          });
          const resolvedCount = await Issue.countDocuments({ 
            category: { $in: dept.categories },
            status: 'resolved'
          });
          
          return {
            ...dept.toObject(),
            issueCount,
            resolvedCount,
            resolutionRate: issueCount > 0 ? ((resolvedCount / issueCount) * 100).toFixed(1) : 0
          };
        } catch (err) {
          // If issue stats fail, return department without stats
          return {
            ...dept.toObject(),
            issueCount: 0,
            resolvedCount: 0,
            resolutionRate: 0
          };
        }
      })
    );

    return NextResponse.json({
      departments: departmentsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Departments API error:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.categories || data.categories.length === 0) {
      return NextResponse.json({ 
        error: 'Name and at least one category are required' 
      }, { status: 400 });
    }

    // Check if department name already exists
    const existingDept = await Department.findOne({ name: data.name });
    if (existingDept) {
      return NextResponse.json({ 
        error: 'Department with this name already exists' 
      }, { status: 400 });
    }

    const department = await Department.create({
      ...data,
      workingHours: data.workingHours || {
        start: '09:00',
        end: '17:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }
    });

    await department.populate('headOfficer', 'name email');
    
    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
