import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Department from '@/models/Department';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { action, departmentIds } = await request.json();

    if (!action || !departmentIds || !Array.isArray(departmentIds)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    let result;
    switch (action) {
      case 'activate':
        result = await Department.updateMany(
          { _id: { $in: departmentIds } },
          { isActive: true }
        );
        break;
      case 'deactivate':
        result = await Department.updateMany(
          { _id: { $in: departmentIds } },
          { isActive: false }
        );
        break;
      case 'delete':
        result = await Department.deleteMany({ _id: { $in: departmentIds } });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ 
      message: `Successfully ${action}d ${result.modifiedCount || result.deletedCount} departments` 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Bulk operation failed' }, { status: 500 });
  }
}
