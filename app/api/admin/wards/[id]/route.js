import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import { handleApiError, unauthorized } from '@/lib/error-handler';
import Ward from '@/models/Ward';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

/**
 * Get single ward
 * @route GET /api/admin/wards/[id]
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      throw unauthorized('Admin or official access required');
    }

    await connectDB();

    const ward = await Ward.findById(params.id)
      .populate('officerInCharge', 'name email')
      .lean();

    if (!ward) {
      return NextResponse.json(
        { success: false, message: 'Ward not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ward
    });

  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update ward
 * @route PUT /api/admin/wards/[id]
 */
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      throw unauthorized('Admin or official access required');
    }

    const body = await request.json();
    
    await connectDB();

    const ward = await Ward.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).populate('officerInCharge', 'name email');

    if (!ward) {
      return NextResponse.json(
        { success: false, message: 'Ward not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ward updated successfully',
      ward
    });

  } catch (error) {
    return handleApiError(error);
  }
}
