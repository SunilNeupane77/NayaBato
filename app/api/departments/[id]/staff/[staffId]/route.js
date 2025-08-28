import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Department from '@/models/Department';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { position, assignedWards, permissions } = await request.json();

    const department = await Department.findById(params.id);
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    const staffIndex = department.staff.findIndex(s => s._id.toString() === params.staffId);
    if (staffIndex === -1) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    // Update staff member
    if (position) department.staff[staffIndex].position = position;
    if (assignedWards) department.staff[staffIndex].assignedWards = assignedWards;
    if (permissions) department.staff[staffIndex].permissions = permissions;

    await department.save();

    // Populate for response
    await department.populate('staff.user', 'name email phone role');
    await department.populate('staff.assignedWards', 'name number');

    return NextResponse.json({ staff: department.staff[staffIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const department = await Department.findById(params.id);
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    const staffIndex = department.staff.findIndex(s => s._id.toString() === params.staffId);
    if (staffIndex === -1) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    // Remove staff member
    department.staff.splice(staffIndex, 1);
    await department.save();

    return NextResponse.json({ message: 'Staff member removed successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove staff member' }, { status: 500 });
  }
}
