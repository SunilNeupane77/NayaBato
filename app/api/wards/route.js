import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Audit from '@/models/Audit';
import Ward from '@/models/Ward';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

/**
 * Get all wards or create a new one
 * @route GET|POST /api/wards
 */
export async function GET(request) {
  try {
    // Connect to database
    await connectDB();
    
    // Get query parameters
    const url = new URL(request.url);
    const isActive = url.searchParams.get('isActive');
    const near = url.searchParams.get('near'); // Format: "lat,lng,radius"
    
    // Build query
    const query = {};
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Handle geo-spatial query
    if (near) {
      const [lat, lng, radius] = near.split(',').map(Number);
      
      if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
        const wards = await Ward.find({
          'location.coordinates': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat] // MongoDB uses [longitude, latitude]
              },
              $maxDistance: radius // Distance in meters
            }
          }
        }).populate('officerInCharge', 'name email');
        
        return NextResponse.json({
          success: true,
          count: wards.length,
          wards
        });
      }
    }
    
    // Find wards with standard query
    const wards = await Ward.find(query)
      .populate('officerInCharge', 'name email')
      .sort({ number: 1 });
    
    return NextResponse.json({
      success: true,
      count: wards.length,
      wards
    });
    
  } catch (error) {
    console.error('Error fetching wards:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching wards' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Get session and verify admin permission
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to create wards' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.number || !body.location) {
      return NextResponse.json(
        { success: false, message: 'Ward name, number, and location are required' },
        { status: 400 }
      );
    }
    
    // Create ward
    const ward = await Ward.create(body);
    
    // Log this action
    await Audit.log({
      actor: session.user.id,
      action: 'create',
      resourceType: 'Ward',
      resourceId: ward._id,
      details: { wardData: ward }
    });
    
    return NextResponse.json({
      success: true,
      ward
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating ward:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'A ward with this number already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating ward' },
      { status: 500 }
    );
  }
}
