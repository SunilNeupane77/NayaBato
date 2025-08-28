import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Issue from '@/models/Issue';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    
    const dateFilter = getDateFilter(timeframe);
    
    const [
      statusStats,
      categoryStats,
      resolutionTimes,
      trendData
    ] = await Promise.all([
      getStatusStats(dateFilter),
      getCategoryStats(dateFilter),
      getResolutionTimes(dateFilter),
      getTrendData(timeframe)
    ]);

    return NextResponse.json({
      statusStats,
      categoryStats,
      resolutionTimes,
      trendData
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function getDateFilter(timeframe) {
  const now = new Date();
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

async function getStatusStats(dateFilter) {
  return await Issue.aggregate([
    { $match: { createdAt: { $gte: dateFilter } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
}

async function getCategoryStats(dateFilter) {
  return await Issue.aggregate([
    { $match: { createdAt: { $gte: dateFilter } } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
}

async function getResolutionTimes(dateFilter) {
  return await Issue.aggregate([
    { 
      $match: { 
        status: 'resolved',
        createdAt: { $gte: dateFilter }
      } 
    },
    {
      $project: {
        resolutionTime: {
          $divide: [
            { $subtract: ['$updatedAt', '$createdAt'] },
            1000 * 60 * 60 * 24 // Convert to days
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgResolutionTime: { $avg: '$resolutionTime' },
        minResolutionTime: { $min: '$resolutionTime' },
        maxResolutionTime: { $max: '$resolutionTime' }
      }
    }
  ]);
}

async function getTrendData(timeframe) {
  const groupBy = timeframe === '7d' ? '$dayOfYear' : '$week';
  
  return await Issue.aggregate([
    {
      $group: {
        _id: { [groupBy]: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
}
