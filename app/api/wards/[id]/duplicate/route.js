import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Ward from '@/models/Ward';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const originalWard = await Ward.findById(params.id);
    if (!originalWard) {
      return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
    }

    // Find next available ward number
    const maxWard = await Ward.findOne().sort({ number: -1 });
    const nextNumber = maxWard ? (parseInt(maxWard.number) + 1).toString() : '1';

    // Create duplicate with modified name and number
    const duplicateData = {
      ...originalWard.toObject(),
      name: `${originalWard.name} (Copy)`,
      number: nextNumber,
      officerInCharge: null, // Don't duplicate officer assignment
      isActive: false // Start as inactive
    };
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;

    const duplicate = await Ward.create(duplicateData);
    await duplicate.populate('officerInCharge', 'name email');

    return NextResponse.json({ ward: duplicate }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to duplicate ward' }, { status: 500 });
  }
}
