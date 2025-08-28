import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Department from '@/models/Department';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const originalDept = await Department.findById(params.id);
    if (!originalDept) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Create duplicate with modified name
    const duplicateData = {
      ...originalDept.toObject(),
      name: `${originalDept.name} (Copy)`,
      headOfficer: null, // Don't duplicate officer assignment
      isActive: false // Start as inactive
    };
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;

    const duplicate = await Department.create(duplicateData);
    await duplicate.populate('headOfficer', 'name email');

    return NextResponse.json({ department: duplicate }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to duplicate department' }, { status: 500 });
  }
}
