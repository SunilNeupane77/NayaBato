import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Ward from '@/models/Ward';
import User from '@/models/User';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'official')) {
      return NextResponse.json({ error: 'Admin or Official access required' }, { status: 403 });
    }

    await connectDB();

    // Get all officials without ward assignments
    const officials = await User.find({ role: 'official' });
    const wards = await Ward.find({});

    let assignmentsMade = 0;

    // Auto-assign officials to wards (round-robin style)
    for (let i = 0; i < officials.length; i++) {
      const official = officials[i];
      const wardIndex = i % wards.length; // Round-robin assignment
      const ward = wards[wardIndex];

      if (ward && !ward.assignedOfficials.includes(official._id)) {
        ward.assignedOfficials.push(official._id);
        await ward.save();
        assignmentsMade++;
      }
    }

    return NextResponse.json({ 
      message: `Auto-assignment completed. ${assignmentsMade} assignments made.`,
      assignmentsMade,
      totalOfficials: officials.length,
      totalWards: wards.length
    });

  } catch (error) {
    console.error('Auto-assignment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
