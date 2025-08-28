import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Ward from '@/models/Ward';
import Issue from '@/models/Issue';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const ward = await Ward.findById(params.id)
      .populate('officerInCharge', 'name email phone')
      .populate('departments', 'name categories');

    if (!ward) {
      return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
    }

    // Build issue query
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    const issueQuery = { assignedWard: params.id };
    if (status) issueQuery.status = status;
    if (category) issueQuery.category = category;
    if (priority) issueQuery.priority = priority;

    const [issues, totalIssues, issueStats, performanceMetrics] = await Promise.all([
      Issue.find(issueQuery)
        .populate('reporter', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Issue.countDocuments(issueQuery),
      ward.getIssueStats(),
      ward.getPerformanceMetrics()
    ]);

    return NextResponse.json({
      ward,
      issues,
      pagination: {
        page,
        limit,
        total: totalIssues,
        pages: Math.ceil(totalIssues / limit)
      },
      issueStats,
      performanceMetrics
    });
  } catch (error) {
    console.error('Ward API error:', error);
    return NextResponse.json({ error: 'Failed to fetch ward details' }, { status: 500 });
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
    
    const ward = await Ward.findByIdAndUpdate(
      params.id,
      data,
      { new: true }
    ).populate('officerInCharge', 'name email');

    if (!ward) {
      return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
    }

    return NextResponse.json({ ward });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ward' }, { status: 500 });
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
    const ward = await Ward.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!ward) {
      return NextResponse.json({ error: 'Ward not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Ward deactivated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete ward' }, { status: 500 });
  }
}
