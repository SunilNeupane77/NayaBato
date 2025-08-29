import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/models/User";
import Newsletter from "@/models/Newsletter";
import Issue from "@/models/Issue";
import { sendWeeklyDigestEmail } from "@/lib/email/nodemailer";

export async function POST() {
  console.log("=== Weekly Digest API Called ===");
  
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected successfully");

    // Get date range for the past week
    const weekEnd = new Date();
    const weekStart = new Date();
    weekStart.setDate(weekEnd.getDate() - 7);
    console.log("Date range:", { weekStart, weekEnd });

    // Get users who want weekly digest
    console.log("Fetching users with weekly digest preference...");
    const users = await User.find({
      $or: [
        { "preferences.weeklyDigest": true },
        { isNewsletterOnly: true }
      ]
    });
    console.log("Found users:", users.length);

    // Get newsletter subscribers
    console.log("Fetching newsletter subscribers...");
    const newsletterSubscribers = await Newsletter.find({ subscribed: true });
    console.log("Found newsletter subscribers:", newsletterSubscribers.length);

    // Combine all email addresses
    const allEmails = [
      ...users.map(user => ({ email: user.email, name: user.name })),
      ...newsletterSubscribers.map(sub => ({ email: sub.email, name: "Community Member" }))
    ];

    // Remove duplicates
    const uniqueEmails = allEmails.filter((item, index, self) => 
      index === self.findIndex(t => t.email === item.email)
    );
    console.log("Unique subscribers:", uniqueEmails.length);

    if (uniqueEmails.length === 0) {
      console.log("No subscribers found");
      return NextResponse.json({ message: "No subscribers found" });
    }

    // Get weekly statistics
    console.log("Fetching weekly statistics...");
    const issues = await Issue.find({
      createdAt: { $gte: weekStart, $lte: weekEnd }
    }).populate('reporter', 'name').sort({ createdAt: -1 });
    console.log("Issues found:", issues.length);

    const resolvedIssues = await Issue.find({
      updatedAt: { $gte: weekStart, $lte: weekEnd },
      status: 'resolved'
    }).populate('reporter', 'name');
    console.log("Resolved issues:", resolvedIssues.length);

    // Calculate stats
    const stats = {
      totalReported: issues.length,
      totalResolved: resolvedIssues.length,
      inProgress: await Issue.countDocuments({ status: 'in-progress' }),
      underReview: await Issue.countDocuments({ status: 'under-review' }),
      categories: {}
    };

    // Group by categories
    issues.forEach(issue => {
      stats.categories[issue.category] = (stats.categories[issue.category] || 0) + 1;
    });
    console.log("Stats calculated:", stats);

    // Get recent issues for the digest
    const recentIssues = issues.slice(0, 5).map(issue => ({
      id: issue._id,
      title: issue.title,
      category: issue.category,
      status: issue.status,
      location: issue.location?.address || 'Unknown location',
      reportedBy: issue.reporter?.name || 'Anonymous',
      createdAt: issue.createdAt
    }));
    console.log("Recent issues prepared:", recentIssues.length);

    // Send emails to all subscribers
    console.log("Sending emails to all subscribers...");
    let successCount = 0;
    let failCount = 0;

    for (const subscriber of uniqueEmails) {
      try {
        const result = await sendWeeklyDigestEmail({
          to: subscriber.email,
          userName: subscriber.name,
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
          stats,
          recentIssues
        });

        if (result.success) {
          successCount++;
          console.log(`✅ Sent to ${subscriber.email}`);
        } else {
          failCount++;
          console.error(`❌ Failed to send to ${subscriber.email}:`, result.error);
        }
      } catch (error) {
        failCount++;
        console.error(`❌ Error sending to ${subscriber.email}:`, error.message);
      }
    }

    return NextResponse.json({
      message: `Weekly digest sent! Success: ${successCount}, Failed: ${failCount}`,
      details: {
        totalSubscribers: uniqueEmails.length,
        successCount,
        failCount,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        stats
      }
    });

  } catch (error) {
    console.error("=== Weekly digest error ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return NextResponse.json(
      { error: "Failed to send weekly digest", details: error.message },
      { status: 500 }
    );
  }
}
