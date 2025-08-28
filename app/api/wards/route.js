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
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    let wards = await Ward.find(query)
      .populate('officerInCharge', 'name email phone')
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Ward.countDocuments(query);

    // Calculate distances if coordinates provided
    if (!isNaN(lat) && !isNaN(lng)) {
      wards = wards.map(ward => {
        const distance = ward.coordinates?.latitude && ward.coordinates?.longitude
          ? calculateDistance(lat, lng, ward.coordinates.latitude, ward.coordinates.longitude)
          : null;
        return { ...ward.toObject(), distance };
      }).filter(ward => !ward.distance || ward.distance <= radius);
    }

    // Get basic statistics for each ward
    const wardsWithStats = await Promise.all(
      wards.map(async (ward) => {
        try {
          const totalIssues = await Issue.countDocuments({ assignedWard: ward._id });
          const resolvedIssues = await Issue.countDocuments({ assignedWard: ward._id, status: 'resolved' });
          const pendingIssues = await Issue.countDocuments({ assignedWard: ward._id, status: { $in: ['reported', 'under-review'] } });

          return {
            ...ward.toObject ? ward.toObject() : ward,
            stats: {
              totalIssues,
              resolvedIssues,
              pendingIssues,
              resolutionRate: totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0
            }
          };
        } catch (err) {
          console.error('Error fetching stats for ward:', ward._id, err);
          return {
            ...ward.toObject ? ward.toObject() : ward,
            stats: {
              totalIssues: 0,
              resolvedIssues: 0,
              pendingIssues: 0,
              resolutionRate: 0
            }
          };
        }
      })
    );

    // Sort wards
    wardsWithStats.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || Infinity) - (b.distance || Infinity);
        case 'issues':
          return b.stats.totalIssues - a.stats.totalIssues;
        case 'resolution':
          return parseFloat(b.stats.resolutionRate) - parseFloat(a.stats.resolutionRate);
        case 'population':
          return (b.population || 0) - (a.population || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return NextResponse.json({
      wards: wardsWithStats,
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
      wards: [] // Return empty array as fallback
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
