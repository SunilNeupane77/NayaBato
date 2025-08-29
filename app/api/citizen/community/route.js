import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Issue from "@/models/Issue";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    // Get date range for this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // Total community members
    const totalMembers = await User.countDocuments({ role: 'citizen' });

    // Active members this week (who reported or commented)
    const activeThisWeek = await User.countDocuments({
      role: 'citizen',
      $or: [
        { createdAt: { $gte: weekStart } },
        { updatedAt: { $gte: weekStart } }
      ]
    });

    // Total reports and resolved issues
    const totalReports = await Issue.countDocuments();
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });

    // Top categories
    const categoryAggregation = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    // Community leaderboard (top reporters)
    const leaderboardAggregation = await Issue.aggregate([
      { $group: { 
          _id: '$reporter', 
          reportCount: { $sum: 1 },
          resolvedCount: { 
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      },
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: { 'user.role': 'citizen' } },
      { $addFields: {
          impactScore: { 
            $add: [
              { $multiply: ['$resolvedCount', 10] },
              { $multiply: ['$reportCount', 2] }
            ]
          }
        }
      },
      { $sort: { impactScore: -1 } },
      { $limit: 10 },
      { $project: {
          name: '$user.name',
          reportCount: 1,
          resolvedCount: 1,
          impactScore: 1
        }
      }
    ]);

    // Recent community activity
    const recentActivity = await Issue.find()
      .populate('reporter', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title description status location createdAt reporter');

    return NextResponse.json({
      totalMembers,
      activeThisWeek,
      totalReports,
      resolvedIssues,
      topCategories: categoryAggregation,
      leaderboard: leaderboardAggregation,
      recentActivity
    });

  } catch (error) {
    console.error("Community stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
