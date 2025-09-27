import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).select('notifications preferences');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      preferences: {
        emailNotifications: user.notifications?.email ?? true,
        digestEmails: user.notifications?.digest ?? false,
        locationSharing: user.preferences?.locationSharing ?? true
      }
    });
  } catch (error) {
    console.error('Preferences GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const updates = await request.json();
    const updateFields = {};
    
    // Map frontend preference keys to database fields
    if ('emailNotifications' in updates) {
      updateFields['notifications.email'] = updates.emailNotifications;
    }
    if ('digestEmails' in updates) {
      updateFields['notifications.digest'] = updates.digestEmails;
    }
    if ('locationSharing' in updates) {
      updateFields['preferences.locationSharing'] = updates.locationSharing;
    }
    
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateFields },
      { new: true, upsert: false }
    ).select('notifications preferences');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      preferences: {
        emailNotifications: user.notifications?.email ?? true,
        digestEmails: user.notifications?.digest ?? false,
        locationSharing: user.preferences?.locationSharing ?? true
      }
    });
  } catch (error) {
    console.error('Preferences PUT error:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
