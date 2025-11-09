import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          users: { $push: { name: '$name', email: '$email', _id: '$_id' } }
        }
      }
    ]);

    return NextResponse.json({ usersByRole });

  } catch (error) {
    console.error('Test users error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
