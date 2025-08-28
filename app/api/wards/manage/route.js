import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/connect';
import Ward from '@/models/Ward';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';

    const query = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { number: parseInt(search) || 0 }
      ]
    } : {};

    const [wards, total] = await Promise.all([
      Ward.find(query)
        .populate('officerInCharge', 'name email')
        .populate('departments', 'name')
        .sort({ number: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Ward.countDocuments(query)
    ]);

    return NextResponse.json({
      wards,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wards' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const wardData = await request.json();
    
    const ward = await Ward.create(wardData);
    await ward.populate('officerInCharge', 'name email');
    
    return NextResponse.json({ ward }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ward' }, { status: 500 });
  }
}
