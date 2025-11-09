import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Issue from '@/models/Issue';
import Ward from '@/models/Ward';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'official' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get all data first, then filter if needed
    const [allIssues, allWards, allUsers] = await Promise.all([
      Issue.find({})
        .populate('reporter', 'name email')
        .populate('assignedWard', 'name number')
        .sort({ createdAt: -1 }),
      Ward.find({}).select('name number assignedOfficials'),
      User.find({ role: 'citizen' }).select('name email ward')
    ]);

    let assignedWards = [];
    let filteredIssues = allIssues;
    let filteredUsers = allUsers;

    if (session.user.role === 'official') {
      // Filter for official's assigned wards
      assignedWards = allWards.filter(ward => 
        ward.assignedOfficials && ward.assignedOfficials.includes(session.user.id)
      );
      
      if (assignedWards.length > 0) {
        const wardIds = assignedWards.map(ward => ward._id.toString());
        filteredIssues = allIssues.filter(issue => 
          issue.assignedWard && wardIds.includes(issue.assignedWard._id.toString())
        );
        filteredUsers = allUsers.filter(user => 
          user.ward && wardIds.includes(user.ward.toString())
        );
      }
    } else {
      // Admin sees all
      assignedWards = allWards;
    }

    // Calculate statistics
    const totalIssues = filteredIssues.length;
    const pendingIssues = filteredIssues.filter(i => i.status === 'pending' || i.status === 'reported').length;
    const inProgressIssues = filteredIssues.filter(i => i.status === 'in_progress' || i.status === 'in-progress' || i.status === 'under-review').length;
    const resolvedIssues = filteredIssues.filter(i => i.status === 'resolved').length;
    
    // Count all citizens (not filtered by ward since users aren't assigned to wards yet)
    const citizensCount = await User.countDocuments({ role: 'citizen' });

    // Get recent issues (last 10) and format them properly
    const recentIssues = filteredIssues.slice(0, 10).map(issue => ({
      _id: issue._id,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      category: issue.category,
      createdAt: issue.createdAt,
      images: issue.images || [],
      user: issue.reporter ? {
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
      stats: {
        totalIssues,
        pendingIssues,
        inProgressIssues,
        resolvedIssues,
        activeWards: assignedWards.length,
        citizensCount
      },
      assignedWards: assignedWards.map(ward => ({
        _id: ward._id,
        name: ward.name,
        number: ward.number
      })),
      recentIssues,
      allIssues: filteredIssues,
      allUsers: filteredUsers
    });

  } catch (error) {
    console.error('Official dashboard error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      stats: {
        totalIssues: 0,
        pendingIssues: 0,
        inProgressIssues: 0,
        resolvedIssues: 0,
        activeWards: 0,
        citizensCount: 0
      },
      assignedWards: [],
      recentIssues: [],
      allIssues: [],
      allUsers: []
    }, { status: 500 });
  }
}
