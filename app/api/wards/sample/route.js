import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Ward from '@/models/Ward';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Check if wards already exist
    const existingWards = await Ward.countDocuments();
    if (existingWards > 0) {
      return NextResponse.json({ message: 'Sample wards already exist' });
    }

    // Create sample wards
    const sampleWards = [
      {
        name: 'Central Ward',
        number: '1',
        description: 'Main commercial and administrative area',
        population: 15000,
        area: 5.2,
        coordinates: { latitude: 27.7172, longitude: 85.3240 },
        address: {
          street: 'Main Street',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44600'
        },
        contactInfo: {
          phone: '+977-1-4444444',
          email: 'ward1@city.gov.np'
        },
        isActive: true
      },
      {
        name: 'North Ward',
        number: '2',
        description: 'Residential area with parks and schools',
        population: 12000,
        area: 4.8,
        coordinates: { latitude: 27.7272, longitude: 85.3340 },
        address: {
          street: 'North Avenue',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44601'
        },
        contactInfo: {
          phone: '+977-1-4444445',
          email: 'ward2@city.gov.np'
        },
        isActive: true
      },
      {
        name: 'South Ward',
        number: '3',
        description: 'Industrial and commercial zone',
        population: 18000,
        area: 6.1,
        coordinates: { latitude: 27.7072, longitude: 85.3140 },
        address: {
          street: 'Industrial Road',
          city: 'Kathmandu',
          state: 'Bagmati',
          zipCode: '44602'
        },
        contactInfo: {
          phone: '+977-1-4444446',
          email: 'ward3@city.gov.np'
        },
        isActive: true
      }
    ];

    const createdWards = await Ward.insertMany(sampleWards);

    return NextResponse.json({ 
      message: `Created ${createdWards.length} sample wards`,
      wards: createdWards
    });
  } catch (error) {
    console.error('Sample wards creation error:', error);
    return NextResponse.json({ error: 'Failed to create sample wards' }, { status: 500 });
  }
}
