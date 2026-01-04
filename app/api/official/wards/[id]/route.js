import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Ward from '@/models/Ward';
import Issue from '@/models/Issue';
import User from '@/models/User';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'official' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    // Get ward details
    const ward = await Ward.findById(id)
      .populate('assignedOfficials', 'name email')
      .populate('officerInCharge', 'name email');

    if (!ward) {
      return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
    }

    // Get all issues for this ward
    const issues = await Issue.find({ assignedWard: id })
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalIssues: issues.length,
      pendingIssues: issues.filter(i => i.status === 'pending' || i.status === 'reported').length,
      inProgressIssues: issues.filter(i => i.status === 'in_progress' || i.status === 'in-progress' || i.status === 'under-review').length,
      resolvedIssues: issues.filter(i => i.status === 'resolved').length,
      citizensCount: await User.countDocuments({ role: 'citizen' })
    };

    return NextResponse.json({
      ward,
      issues,
      stats
    });

  } catch (error) {
    console.error('Ward detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'official' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const { name, number, description } = await request.json();

    const updatedWard = await Ward.findByIdAndUpdate(
      id,
      { name, number, description },
      { new: true }
    );

    if (!updatedWard) {
      return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Ward updated successfully',
      ward: updatedWard 
    });

  } catch (error) {
    console.error('Ward update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'official' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const deletedWard = await Ward.findByIdAndDelete(id);

    if (!deletedWard) {
      return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Ward deleted successfully' 
    });

  } catch (error) {
    console.error('Ward delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
