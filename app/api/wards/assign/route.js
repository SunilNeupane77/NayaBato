import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/connect';
import Ward from '@/models/Ward';
import User from '@/models/User';

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { wardId, officialId } = await request.json();

    // Verify the official exists and has the right role
    const official = await User.findById(officialId);
    if (!official || official.role !== 'official') {
      return NextResponse.json({ error: 'Invalid official' }, { status: 400 });
    }

    // Update ward with new officer
    const ward = await Ward.findByIdAndUpdate(
      wardId,
      { officerInCharge: officialId },
      { new: true }
    ).populate('officerInCharge', 'name email');

    if (!ward) {
      return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
    }

    return NextResponse.json({ ward });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign ward' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const wardId = searchParams.get('wardId');

    const ward = await Ward.findByIdAndUpdate(
      wardId,
      { $unset: { officerInCharge: 1 } },
      { new: true }
    );

    if (!ward) {
      return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Ward assignment removed' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove assignment' }, { status: 500 });
  }
}
