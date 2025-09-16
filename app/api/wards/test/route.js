import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Ward from '@/models/Ward';

export async function GET() {
  try {
    await connectDB();
    
    const wardCount = await Ward.countDocuments();
    const sampleWard = await Ward.findOne().lean();
    
    return NextResponse.json({
      success: true,
      wardCount,
      sampleWard,
      message: 'Ward API is working'
    });
  } catch (error) {
    console.error('Ward test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
