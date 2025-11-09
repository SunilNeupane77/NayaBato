import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Issue from '@/models/Issue';
import Ward from '@/models/Ward';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'official' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const wardId = searchParams.get('ward');
    const search = searchParams.get('search');

    let wardIds = [];
    if (session.user.role === 'admin') {
      // Admin can see all issues
      if (wardId && wardId !== 'all') {
        wardIds = [wardId];
      } else {
        const allWards = await Ward.find({}).select('_id');
        wardIds = allWards.map(ward => ward._id.toString());
      }
    } else {
      // Get wards assigned to this official
      const assignedWards = await Ward.find({ 
        assignedOfficials: session.user.id 
      }).select('_id');
      wardIds = assignedWards.map(ward => ward._id.toString());
      
      if (wardId && wardId !== 'all' && wardIds.includes(wardId)) {
        wardIds = [wardId];
      }
    }

    // Build query
    let query = {};
    
    // Add ward filter
    if (wardIds.length > 0) {
      query.assignedWard = { $in: wardIds };
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get issues with pagination
    const skip = (page - 1) * limit;
    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('reporter', 'name email')
        .populate('assignedWard', 'name number')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Issue.countDocuments(query)
    ]);

    // Format issues for frontend
    const formattedIssues = issues.map(issue => ({
      _id: issue._id,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      category: issue.category,
      createdAt: issue.createdAt,
      citizen: issue.reporter ? {
        _id: issue.reporter._id,
        name: issue.reporter.name,
        email: issue.reporter.email
      } : null,
      ward: issue.assignedWard ? {
        _id: issue.assignedWard._id,
        name: issue.assignedWard.name,
        number: issue.assignedWard.number
      } : null
    }));

    return NextResponse.json({
      success: true,
      issues: formattedIssues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Official issues error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
