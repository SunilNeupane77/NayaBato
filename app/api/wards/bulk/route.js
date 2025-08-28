import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Ward from '@/models/Ward';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { action, wardIds } = await request.json();

    if (!action || !wardIds || !Array.isArray(wardIds)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    let result;
    switch (action) {
      case 'activate':
        result = await Ward.updateMany(
          { _id: { $in: wardIds } },
          { isActive: true }
        );
        break;
      case 'deactivate':
        result = await Ward.updateMany(
          { _id: { $in: wardIds } },
          { isActive: false }
        );
        break;
      case 'delete':
        result = await Ward.deleteMany({ _id: { $in: wardIds } });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ 
      message: `Successfully ${action}d ${result.modifiedCount || result.deletedCount} wards` 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Bulk operation failed' }, { status: 500 });
  }
}
