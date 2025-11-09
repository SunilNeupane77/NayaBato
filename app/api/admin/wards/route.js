import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import { handleApiError, unauthorized } from '@/lib/error-handler';
import Ward from '@/models/Ward';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

/**
 * Get all wards
 * @route GET /api/admin/wards
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      throw unauthorized('Admin or official access required');
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { number: parseInt(search) || 0 }
      ];
    }

    const wards = await Ward.find(filter)
      .sort({ number: 1 })
      .skip(skip)
      .limit(limit)
      .populate('officerInCharge', 'name email')
      .lean();

    const total = await Ward.countDocuments(filter);

    return NextResponse.json({
      success: true,
      wards,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Delete ward
 * @route DELETE /api/admin/wards
 */
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      throw unauthorized('Admin or official access required');
    }

    const { searchParams } = new URL(request.url);
    const wardId = searchParams.get('id');

    if (!wardId) {
      return NextResponse.json(
        { success: false, message: 'Ward ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const ward = await Ward.findByIdAndDelete(wardId);
    
    if (!ward) {
      return NextResponse.json(
        { success: false, message: 'Ward not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Ward ${ward.name} deleted successfully`
    });

  } catch (error) {
    return handleApiError(error);
  }
}
