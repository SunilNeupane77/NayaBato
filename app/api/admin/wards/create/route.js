import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import { handleApiError, unauthorized, badRequest } from '@/lib/error-handler';
import { wardCreationService } from '@/lib/services/ward-creation-service';
import Ward from '@/models/Ward';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

/**
 * Create new ward with advanced geospatial optimization
 * @route POST /api/admin/wards/create
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      throw unauthorized('Admin access required');
    }

    const body = await request.json();
    const { action = 'create', ...data } = body;

    await connectDB();

    switch (action) {
      case 'create': {
        const {
          name,
          number,
          description,
          location,
          population,
          area,
          contactEmail,
          contactPhone,
          validateCoverage = true,
          optimizePosition = true
        } = data;

        // Check for duplicate ward number
        const existingWard = await Ward.findOne({ number });
        if (existingWard) {
          throw badRequest(`Ward number ${number} already exists`);
        }

        const wardData = {
          name: name?.trim(),
          number,
          description: description?.trim(),
          location: {
            address: location?.address,
            coordinates: {
              type: 'Point',
              coordinates: [
                parseFloat(location?.coordinates?.coordinates[0]),
                parseFloat(location?.coordinates?.coordinates[1])
              ]
            }
          },
          population: population || 0,
          area: area || 5,
          contactEmail,
          contactPhone,
          isActive: true
        };

        const result = await wardCreationService.createWard(wardData, {
          validateCoverage: false,
          optimizePosition: false
        });

        return NextResponse.json({
          success: true,
          message: 'Ward created successfully with geospatial optimization',
          ward: result.ward,
          analytics: result.analytics
        }, { status: 201 });
      }

      case 'bulk_create': {
        const { wards, options = {} } = data;
        
        if (!Array.isArray(wards) || wards.length === 0) {
          throw badRequest('Wards array is required for bulk creation');
        }

        const result = await wardCreationService.bulkCreateWards(wards, options);

        return NextResponse.json({
          success: true,
          message: `Bulk creation completed: ${result.created} created, ${result.failed} failed`,
          results: result
        });
      }

      case 'validate_position': {
        const { coordinates } = data;
        
        if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
          throw badRequest('Valid coordinates [lng, lat] required');
        }

        const existingWards = await Ward.find({ isActive: true }).lean();
        const optimization = await wardCreationService.optimizeWardPosition(coordinates, existingWards);
        
        return NextResponse.json({
          success: true,
          optimization
        });
      }

      case 'analyze_coverage': {
        const { coordinates, area = 5 } = data;
        
        const existingWards = await Ward.find({ isActive: true }).lean();
        const mockWardData = {
          location: { coordinates: { coordinates } },
          area
        };
        
        const analysis = wardCreationService.analyzeCoverageImpact(mockWardData, existingWards);
        
        return NextResponse.json({
          success: true,
          analysis
        });
      }

      default:
        throw badRequest('Invalid action. Supported: create, bulk_create, validate_position, analyze_coverage');
    }

  } catch (error) {
    return handleApiError(error);
  }
}
