import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Department from '@/models/Department';
import User from '@/models/User';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const department = await Department.findById(params.id)
      .populate('staff.user', 'name email phone role')
      .populate('staff.assignedWards', 'name number');

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json({ staff: department.staff || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { userId, position, assignedWards, permissions } = await request.json();

    if (!userId || !position) {
      return NextResponse.json({ error: 'User ID and position are required' }, { status: 400 });
    }

    // Check if user exists and is an official
    const user = await User.findById(userId);
    if (!user || user.role !== 'official') {
      return NextResponse.json({ error: 'User not found or not an official' }, { status: 400 });
    }

    // Check if user is already in this department
    const department = await Department.findById(params.id);
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    const existingStaff = department.staff.find(s => s.user.toString() === userId);
    if (existingStaff) {
      return NextResponse.json({ error: 'User is already a staff member' }, { status: 400 });
    }

    // Add staff member
    const newStaff = {
      user: userId,
      position,
      assignedWards: assignedWards || [],
      permissions: permissions || ['view_issues', 'update_issues'],
      joinedAt: new Date()
    };

    department.staff.push(newStaff);
    await department.save();

    // Populate the new staff member for response
    await department.populate('staff.user', 'name email phone role');
    await department.populate('staff.assignedWards', 'name number');

    const addedStaff = department.staff[department.staff.length - 1];

    return NextResponse.json({ staff: addedStaff }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add staff member' }, { status: 500 });
  }
}
