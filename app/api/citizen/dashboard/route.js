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

    // Get user's issues
    const myIssues = await Issue.find({ reporter: user._id })
      .populate('reporter', 'name')
      .sort({ createdAt: -1 });

    // Calculate user stats
    const resolved = myIssues.filter(issue => issue.status === 'resolved').length;
    const pending = myIssues.filter(issue => !['resolved', 'rejected'].includes(issue.status)).length;

    // Calculate impact score (resolved issues * 10 + total reports * 2)
    const impactScore = (resolved * 10) + (myIssues.length * 2);

    // Get recent issues (last 10)
    const recentIssues = myIssues.slice(0, 10);

    // Get community stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const communityStats = {
      weeklyResolved: await Issue.countDocuments({
        status: 'resolved',
        updatedAt: { $gte: weekStart }
      }),
      activeMembers: await User.countDocuments({
        role: 'citizen',
        createdAt: { $gte: weekStart }
      }),
      totalReports: await Issue.countDocuments()
    };

    // Generate achievements based on user activity
    const achievements = [];
    
    if (myIssues.length >= 1) {
      achievements.push({
        title: "First Reporter",
        description: "Submitted your first issue report"
      });
    }
    
    if (resolved >= 3) {
      achievements.push({
        title: "Problem Solver",
        description: "Helped resolve 3+ community issues"
      });
    }
    
    if (myIssues.length >= 10) {
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
      myIssues: myIssues.length,
      resolved,
      pending,
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
