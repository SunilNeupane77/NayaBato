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

    let issueQuery = {};
    let assignedWards = [];

    if (session.user.role === 'official') {
      // Find wards assigned to this official
      // Assuming 'assignedOfficials' in Ward model contains user IDs
      assignedWards = await Ward.find({ assignedOfficials: session.user.id })
        .select('name number assignedOfficials');

      if (assignedWards.length > 0) {
        const wardIds = assignedWards.map(ward => ward._id);
        issueQuery = { assignedWard: { $in: wardIds } };
      } else {
        // If no wards assigned, maybe they shouldn't see any issues? 
        // Or maybe they see unassigned ones? Let's assume they see none for now or all if that's the policy.
        // But usually officials are tied to wards.
        // For now, if no wards, let's keep query empty (all issues) OR strict (no issues).
        // Based on previous code: "if (assignedWards.length > 0) ... filteredIssues = allIssues.filter..."
        // implying if no wards, they might see all or none. 
        // Let's assume strict: if official has no wards, they see nothing.
        issueQuery = { _id: { $exists: false } }; // Return nothing
      }
    } else {
      // Admin sees all
      assignedWards = await Ward.find({}).select('name number assignedOfficials');
    }

    // Run queries in parallel
    const [
      totalIssues,
      pendingIssues,
      inProgressIssues,
      resolvedIssues,
      citizensCount,
      recentIssues
    ] = await Promise.all([
      Issue.countDocuments(issueQuery),
      Issue.countDocuments({ ...issueQuery, status: { $in: ['pending', 'reported'] } }),
      Issue.countDocuments({ ...issueQuery, status: { $in: ['in_progress', 'in-progress', 'under-review'] } }),
      Issue.countDocuments({ ...issueQuery, status: 'resolved' }),
      User.countDocuments({ role: 'citizen' }),
      Issue.find(issueQuery)
        .populate('reporter', 'name email')
        .populate('assignedWard', 'name number')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const formattedRecentIssues = recentIssues.map(issue => ({
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
      recentIssues: formattedRecentIssues
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
      recentIssues: []
    }, { status: 500 });
  }
}
