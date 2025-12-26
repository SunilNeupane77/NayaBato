import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Ward from '@/models/Ward';
import Issue from '@/models/Issue';
import User from '@/models/User';

// Haversine formula to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'name';
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const radius = parseFloat(searchParams.get('radius')) || 10;

    // Build match stage
    const matchStage = {};
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== 'all') {
      matchStage.isActive = status === 'active';
    }

    // Build sort stage
    let sortStage = {};
    switch (sortBy) {
      case 'issues':
        sortStage = { 'stats.totalIssues': -1 };
        break;
      case 'resolution':
        sortStage = { 'stats.resolutionRate': -1 };
        break;
      case 'population':
        sortStage = { population: -1 };
        break;
      default: // 'name'
        sortStage = { name: 1 };
    }

    const pipeline = [
      { $match: matchStage },
      // Lookup issues to count them
      {
        $lookup: {
          from: 'issues',
          localField: '_id',
          foreignField: 'assignedWard',
          pipeline: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                resolved: {
                  $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                },
                pending: {
                  $sum: { $cond: [{ $in: ['$status', ['reported', 'under-review']] }, 1, 0] }
                }
              }
            }
          ],
          as: 'issueStats'
        }
      },
      // Unwind stats
      {
        $unwind: {
          path: '$issueStats',
          preserveNullAndEmptyArrays: true
        }
      },
      // Lookup officer details
      {
        $lookup: {
          from: 'users',
          localField: 'officerInCharge',
          foreignField: '_id',
          as: 'officerDetails'
        }
      },
      {
        $unwind: {
          path: '$officerDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      // Add calculated fields
      {
        $addFields: {
          stats: {
            totalIssues: { $ifNull: ['$issueStats.total', 0] },
            resolvedIssues: { $ifNull: ['$issueStats.resolved', 0] },
            pendingIssues: { $ifNull: ['$issueStats.pending', 0] },
            resolutionRate: {
              $cond: [
                { $gt: [{ $ifNull: ['$issueStats.total', 0] }, 0] },
                {
                  $multiply: [
                    { $divide: [{ $ifNull: ['$issueStats.resolved', 0] }, { $ifNull: ['$issueStats.total', 1] }] },
                    100
                  ]
                },
                0
              ]
            }
          },
          officerInCharge: {
            _id: '$officerDetails._id',
            name: '$officerDetails.name',
            email: '$officerDetails.email',
            phone: '$officerDetails.phone'
          }
        }
      },
      {
        $project: {
          issueStats: 0,
          officerDetails: 0
        }
      }
    ];

    // Handle geospatial filtering if coordinates provided
    if (!isNaN(lat) && !isNaN(lng)) {
      // Note: This is a simplified distance calculation for sorting/filtering in aggregation
      // For precise geo queries, $geoNear should be used as the first stage, but it requires a 2dsphere index
      // Here we will filter after fetching if the dataset is small, or we can add a $addFields stage for distance
      // For now, keeping the JavaScript calculation for distance as it's flexible without index enforcement in this refactor
    }

    // Add sort and pagination
    pipeline.push({ $sort: sortStage });

    const facetStage = {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }]
      }
    };
    pipeline.push(facetStage);

    const result = await Ward.aggregate(pipeline);

    let wards = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

    // Calculate distances if coordinates provided (client-side of the aggregation result)
    if (!isNaN(lat) && !isNaN(lng)) {
      wards = wards.map(ward => {
        const distance = ward.coordinates?.latitude && ward.coordinates?.longitude
          ? calculateDistance(lat, lng, ward.coordinates.latitude, ward.coordinates.longitude)
          : null;
        return { ...ward, distance };
      }).filter(ward => !ward.distance || ward.distance <= radius);

      if (sortBy === 'distance') {
        wards.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      }
    }

    // Format resolution rate to fixed 1 decimal place
    wards = wards.map(ward => ({
      ...ward,
      stats: {
        ...ward.stats,
        resolutionRate: parseFloat(ward.stats.resolutionRate).toFixed(1)
      }
    }));

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
    console.error('Wards API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch wards',
      details: error.message,
      wards: []
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.number) {
      return NextResponse.json({
        error: 'Name and number are required'
      }, { status: 400 });
    }

    // Check if ward number already exists
    const existingWard = await Ward.findOne({ number: data.number });
    if (existingWard) {
      return NextResponse.json({
        error: 'Ward number already exists'
      }, { status: 400 });
    }

    const ward = await Ward.create(data);
    await ward.populate('officerInCharge', 'name email');

    return NextResponse.json({ ward }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ward' }, { status: 500 });
  }
}
