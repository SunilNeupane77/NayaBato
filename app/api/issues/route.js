import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { uploadImage } from '@/lib/cloudinary';
import { createWithAudit } from '@/lib/db/audit-utils';
import connectDB from '@/lib/db/connect';
import { sendIssueConfirmation } from '@/lib/email';
import { badRequest, handleApiError, unauthorized } from '@/lib/error-handler';
import mongoose from 'mongoose';
// Import models in dependency order
import Issue from '@/models/Issue';
import Notification from '@/models/Notification';
import User from '@/models/User'; // User is referenced by Ward
import Ward from '@/models/Ward'; // Ward is referenced by Issue
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';


/**
 * Create a new issue report
 * @route POST /api/issues
 */
export async function POST(request) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      throw unauthorized('Authentication required to report issues');
    }
    
    // Parse form data (including files)
    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const locationJson = formData.get('location');
    
    // Validate required fields
    if (!title || !description || !category || !locationJson) {
      throw badRequest('Missing required fields for issue creation');
    }
    
    // Parse location data
    let location;
    try {
      location = JSON.parse(locationJson);
      
      // Validate that location has the required structure
      if (!location.coordinates || 
          !location.coordinates.type || 
          !location.coordinates.coordinates || 
          !Array.isArray(location.coordinates.coordinates) || 
          location.coordinates.coordinates.length !== 2) {
        throw new Error('Location data is missing required fields');
      }
      
      // Validate that coordinates are numbers
      if (typeof location.coordinates.coordinates[0] !== 'number' || 
          typeof location.coordinates.coordinates[1] !== 'number') {
        throw new Error('Location coordinates must be numbers');
      }
    } catch (error) {
      throw badRequest(`Invalid location data format: ${error.message}`);
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
    
    // Assign ward using professional Haversine-based service
    let assignedWard = null;
    let wardAssignmentInfo = null;
    
    try {
      if (location && location.coordinates && location.coordinates.coordinates) {
        const { wardAssignmentService } = await import('@/lib/services/ward-assignment-service');
        
        const assignmentResult = await wardAssignmentService.assignWard(
          location.coordinates.coordinates,
          {
            maxDistance: 10000, // 10km search radius
            fallbackToNearest: true,
            includeAlternatives: false
          }
        );
        
        if (assignmentResult.success) {
          assignedWard = assignmentResult.ward._id;
          wardAssignmentInfo = {
            method: assignmentResult.method,
            distance: assignmentResult.distance,
            searchRadius: assignmentResult.searchRadius,
            message: assignmentResult.message
          };
          console.log(`Professional ward assignment: ${assignmentResult.message}`);
        } else {
          console.log(`Ward assignment failed: ${assignmentResult.error}`);
          wardAssignmentInfo = {
            method: assignmentResult.method,
            error: assignmentResult.error,
            searchRadius: assignmentResult.searchRadius
          };
        }
      } else {
        console.log('Invalid location coordinates structure:', location);
      }
    } catch (error) {
      console.error('Error in professional ward assignment:', error);
      wardAssignmentInfo = {
        method: 'error',
        error: error.message
      };
      // Continue with issue creation even if ward assignment fails
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
        assignedWard, // Assign the nearest ward if found
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
    
    // Get ward officer if a ward was assigned
    let wardOfficerId = null;
    if (newIssue.assignedWard) {
      // Use the already imported Ward model instead of dynamic import
      const assignedWard = await Ward.findById(newIssue.assignedWard).populate('officerInCharge', '_id');
      if (assignedWard && assignedWard.officerInCharge) {
        wardOfficerId = assignedWard.officerInCharge._id;
      }
    }
    
    // Combine officials and ward officer IDs for notification (remove duplicates)
    const notifyIds = [...new Set([
      ...officials.map(official => official._id.toString()),
      ...(wardOfficerId ? [wardOfficerId.toString()] : [])
    ])].map(id => new mongoose.Types.ObjectId(id));
    
    // Create notifications for officials and ward officer
    if (notifyIds.length > 0) {
      await Notification.createNotification({
        recipient: notifyIds,
        title: `New Issue: ${title}`,
        message: `A new ${category} issue has been reported at ${location.address}.`,
        type: 'issue_update',
        referenceId: newIssue._id,
        referenceModel: 'Issue'
      });
    }
    
    // Send confirmation email to user
    try {
      const emailResult = await sendIssueConfirmation({
        to: user.email,
        issueId: newIssue._id.toString(),
        title: newIssue.title,
        location: newIssue.location.address
      });
      
      if (emailResult.success) {
        console.log(`Issue confirmation email sent to ${user.email} (Email ID: ${emailResult.data?.id || 'unknown'})`);
      } else {
        console.error('Error sending issue confirmation email:', emailResult.error);
      }
    } catch (emailError) {
      // Log error but don't fail the request
      console.error('Exception sending issue confirmation email:', emailError);
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Issue reported successfully',
        issue: newIssue
      },
      { status: 201 }
    );
    
  } catch (error) {
    return handleApiError(error, error.statusCode || 500);
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
    const wardId = searchParams.get('ward');
    const near = searchParams.get('near'); // Format: "lat,lng,radius"
    const isOfficial = searchParams.get('official') === 'true';
    
    // Get session if we need to check for official role
    let session = null;
    if (isOfficial) {
      session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'official') {
        return NextResponse.json(
          { success: false, message: 'Not authorized' },
          { status: 403 }
        );
      }
    }
    
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
    
    if (wardId) {
      filter.assignedWard = wardId;
    }
    
    // For officials without department, show all issues that need attention
    if (isOfficial) {
      // Officials see all issues or can be assigned specific issues
      if (session.user.department) {
        // If they have a department, filter by department categories
        await connectDB();
        const Department = await import('@/models/Department').then(module => module.default);
        const department = await Department.findOne({ name: session.user.department });
        if (department && department.categories && department.categories.length > 0) {
          filter.category = { $in: department.categories };
        }
      } else {
        // If they don't have a department, show issues that need attention
        filter.status = { $in: ['reported', 'under-review'] };
      }
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
