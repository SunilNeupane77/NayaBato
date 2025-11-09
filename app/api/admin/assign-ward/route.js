import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Ward from '@/models/Ward';
import User from '@/models/User';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { officialId, wardId } = await request.json();

    if (!officialId || !wardId) {
      return NextResponse.json({ error: 'Official ID and Ward ID are required' }, { status: 400 });
    }

    await connectDB();

    // Verify the user is an official
    const official = await User.findById(officialId);
    if (!official || official.role !== 'official') {
      return NextResponse.json({ error: 'User is not an official' }, { status: 400 });
    }

    // Find and update the ward
    const ward = await Ward.findById(wardId);
    if (!ward) {
      return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
    }

    // Add official to ward if not already assigned
    if (!ward.assignedOfficials.includes(officialId)) {
      ward.assignedOfficials.push(officialId);
      await ward.save();
    }

    return NextResponse.json({ 
      message: 'Official assigned to ward successfully',
      ward: {
        _id: ward._id,
        name: ward.name,
        number: ward.number,
        assignedOfficials: ward.assignedOfficials
      }
    });

  } catch (error) {
    console.error('Ward assignment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { officialId, wardId } = await request.json();

    await connectDB();

    const ward = await Ward.findById(wardId);
    if (!ward) {
      return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
    }

    // Remove official from ward
    ward.assignedOfficials = ward.assignedOfficials.filter(
      id => id.toString() !== officialId
    );
    await ward.save();

    return NextResponse.json({ 
      message: 'Official removed from ward successfully',
      ward: {
        _id: ward._id,
        name: ward.name,
        number: ward.number,
        assignedOfficials: ward.assignedOfficials
      }
    });

  } catch (error) {
    console.error('Ward unassignment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
