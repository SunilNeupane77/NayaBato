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

    // Get user's issues with populated data
    const issues = await Issue.find({ reporter: user._id })
      .populate('reporter', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ issues });

  } catch (error) {
    console.error("My reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
