import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Issue from '@/models/Issue';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['admin', 'official'].includes(session.user.role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    // Update all issues that have 'medium' priority to have varied priorities
    const issues = await Issue.find({ priority: 'medium' });
    
    const priorities = ['low', 'medium', 'high', 'critical'];
    let updateCount = 0;

    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      // Distribute priorities based on category and age
      let newPriority = 'medium';
      
      // Critical categories get higher priority
      if (['water', 'electricity'].includes(issue.category)) {
        newPriority = Math.random() > 0.5 ? 'high' : 'critical';
      } 
      // Safety related issues
      else if (['pothole', 'streetlight'].includes(issue.category)) {
        newPriority = Math.random() > 0.3 ? 'medium' : 'high';
      }
      // Other issues
      else {
        const rand = Math.random();
        if (rand > 0.7) newPriority = 'high';
        else if (rand > 0.5) newPriority = 'medium';
        else newPriority = 'low';
      }

      await Issue.findByIdAndUpdate(issue._id, { priority: newPriority });
      updateCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updateCount} issues with varied priorities`,
      updatedCount: updateCount
    });

  } catch (error) {
    console.error('Error updating priorities:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update priorities' 
    }, { status: 500 });
  }
}
