import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db/connect";
import Issue from "@/models/Issue";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get current user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // Run queries in parallel
    const [
      myIssuesCount,
      resolvedCount,
      pendingCount,
      recentIssues,
      weeklyResolvedCommunity,
      activeMembersCommunity,
      totalReportsCommunity
    ] = await Promise.all([
      Issue.countDocuments({ reporter: user._id }),
      Issue.countDocuments({ reporter: user._id, status: 'resolved' }),
      Issue.countDocuments({ reporter: user._id, status: { $nin: ['resolved', 'rejected'] } }),
      Issue.find({ reporter: user._id })
        .populate('reporter', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      Issue.countDocuments({ status: 'resolved', updatedAt: { $gte: weekStart } }),
      User.countDocuments({ role: 'citizen', createdAt: { $gte: weekStart } }),
      Issue.countDocuments()
    ]);

    // Calculate impact score (resolved issues * 10 + total reports * 2)
    const impactScore = (resolvedCount * 10) + (myIssuesCount * 2);

    const communityStats = {
      weeklyResolved: weeklyResolvedCommunity,
      activeMembers: activeMembersCommunity,
      totalReports: totalReportsCommunity
    };

    // Generate achievements based on user activity
    const achievements = [];

    if (myIssuesCount >= 1) {
      achievements.push({
        title: "First Reporter",
        description: "Submitted your first issue report"
      });
    }

    if (resolvedCount >= 3) {
      achievements.push({
        title: "Problem Solver",
        description: "Helped resolve 3+ community issues"
      });
    }

    if (myIssuesCount >= 10) {
      achievements.push({
        title: "Community Champion",
        description: "Submitted 10+ issue reports"
      });
    }

    if (impactScore >= 50) {
      achievements.push({
        title: "High Impact Citizen",
        description: "Achieved 50+ impact points"
      });
    }

    return NextResponse.json({
      myIssues: myIssuesCount,
      resolved: resolvedCount,
      pending: pendingCount,
      impactScore,
      recentIssues,
      communityStats,
      achievements
    });

  } catch (error) {
    console.error("Citizen dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
