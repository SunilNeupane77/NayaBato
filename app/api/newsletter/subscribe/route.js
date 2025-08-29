import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Newsletter from "@/models/Newsletter";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      existing.subscribed = true;
      await existing.save();
    } else {
      await Newsletter.create({ email });
    }

    // Send confirmation email
    try {
      const { sendEmailWithNodemailer } = await import("@/lib/email/nodemailer");
      const NewsletterSubscriptionEmail = await import('@/components/email/NewsletterSubscriptionEmail').then(mod => mod.default);
      
      await sendEmailWithNodemailer({
        to: email,
        subject: "Welcome to Nayabato Weekly Digest!",
        reactComponent: NewsletterSubscriptionEmail,
        reactProps: { email }
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
    }

    return NextResponse.json({ message: "Successfully subscribed" });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
