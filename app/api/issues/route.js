import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { uploadImage } from '@/lib/cloudinary';
import { createWithAudit } from '@/lib/db/audit-utils';
import connectDB from '@/lib/db/connect';
import { sendIssueConfirmation } from '@/lib/email';
import Issue from '@/models/Issue';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

// In Next.js App Router, we don't need to export config for formData
// The request.formData() method will parse the multipart/form-data automatically

/**
 * Create a new issue report
 * @route POST /api/issues
 */
export async function POST(request) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse form data (including files)
    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const locationJson = formData.get('location');
    
    // Validate required fields
    if (!title || !description || !category || !locationJson) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Parse location data
    let location;
    try {
      location = JSON.parse(locationJson);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid location data' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Get user from database
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Handle image uploads
    const images = [];
    const imageFiles = [];
    
    // Extract all image files from form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image-') && value instanceof File) {
        imageFiles.push(value);
      }
    }
    
    // Upload images to Cloudinary (if any)
    if (imageFiles.length > 0) {
      console.log(`Processing ${imageFiles.length} images`);
      
      for (const file of imageFiles) {
        try {
          if (file.size > 0) {
            console.log(`Uploading image: ${file.name}, size: ${file.size}`);
            
            // Convert the file to buffer for Cloudinary upload
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // Upload to Cloudinary
            const result = await uploadImage(buffer);
            
            if (result) {
              console.log('Upload successful:', result.public_id);
              images.push({
                url: result.secure_url,
                publicId: result.public_id
              });
            } else {
              console.error('Upload returned null result');
            }
          }
        } catch (error) {
          console.error('Error processing image:', error);
          // Continue with other images if one fails
        }
      }
      
      console.log(`Successfully uploaded ${images.length} out of ${imageFiles.length} images`);
    }
    
    // Create new issue with audit trail
    const newIssue = await createWithAudit({
      model: Issue,
      data: {
        title,
        description,
        category,
        location,
        images,
        reporter: user._id,
        status: 'reported',
        statusHistory: [
          {
            status: 'reported',
            updatedBy: user._id,
            notes: 'Issue reported by citizen'
          }
        ]
      },
      actor: user,
      requestInfo: {
        ip: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent')
      },
      // Notify department officials based on category
      notify: true,
      notifyUsers: [], // Will be filled with officials from relevant department
      notifyTitle: `New Issue: ${title}`,
      notifyMessage: `A new ${category} issue has been reported at ${location.address}.`
    });
    
    // Find officials to notify based on category
    const officials = await User.find({ 
      role: 'official',
      department: category === 'other' ? 'general' : category
    }).select('_id');
    
    // Create notifications for officials
    if (officials.length > 0) {
      await Notification.createNotification({
        recipient: officials.map(official => official._id),
        title: `New Issue: ${title}`,
        message: `A new ${category} issue has been reported at ${location.address}.`,
        type: 'issue_update',
        referenceId: newIssue._id,
        referenceModel: 'Issue'
      });
    }
    
    // Send confirmation email to user
    await sendIssueConfirmation({
      to: user.email,
      issueId: newIssue._id.toString(),
      title: newIssue.title,
      location: newIssue.location.address
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Issue reported successfully',
        issue: newIssue
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating issue:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating issue' },
      { status: 500 }
    );
  }
}

/**
 * Get all issues (with filtering options)
 * @route GET /api/issues
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const near = searchParams.get('near'); // Format: "lat,lng,radius"
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build query filter
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (category) {
      filter.category = category;
    }
    
    // Handle geo-spatial query
    if (near) {
      const [lat, lng, radius] = near.split(',').map(Number);
      
      if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
        filter['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat] // MongoDB uses [longitude, latitude]
            },
            $maxDistance: radius // Distance in meters
          }
        };
      }
    }
    
    // Connect to database
    await connectDB();
    
    // Execute query with pagination
    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reporter', 'name email')
      .populate('assignedTo', 'name email')
      .lean();
    
    // Get total count for pagination
    const total = await Issue.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      issues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching issues:', error);
    
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching issues' },
      { status: 500 }
    );
  }
}
