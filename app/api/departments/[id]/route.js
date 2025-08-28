import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Department from '@/models/Department';
import Issue from '@/models/Issue';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const department = await Department.findById(params.id)
      .populate('headOfficer', 'name email phone')
      .populate('staff.user', 'name email phone')
      .populate('serviceAreas', 'name number population');

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Get comprehensive statistics
    const [
      totalIssues,
      resolvedIssues,
      pendingIssues,
      inProgressIssues,
      recentIssues,
      monthlyStats
    ] = await Promise.all([
      Issue.countDocuments({ category: { $in: department.categories } }),
      Issue.countDocuments({ category: { $in: department.categories }, status: 'resolved' }),
      Issue.countDocuments({ category: { $in: department.categories }, status: { $in: ['reported', 'under-review'] } }),
      Issue.countDocuments({ category: { $in: department.categories }, status: 'in-progress' }),
      Issue.find({ category: { $in: department.categories } })
        .populate('reporter', 'name')
        .populate('assignedWard', 'name number')
        .sort({ createdAt: -1 })
        .limit(10),
      Issue.aggregate([
        { $match: { category: { $in: department.categories } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    const stats = {
      totalIssues,
      resolvedIssues,
      pendingIssues,
      inProgressIssues,
      resolutionRate: totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0,
      monthlyStats
    };

    return NextResponse.json({
      department,
      stats,
      recentIssues
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch department details' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    const department = await Department.findByIdAndUpdate(
      params.id,
      data,
      { new: true }
    ).populate('headOfficer', 'name email');

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json({ department });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Soft delete - deactivate instead of removing
    const department = await Department.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Department deactivated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
