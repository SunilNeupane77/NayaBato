import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/connect';
import Ward from '@/models/Ward';
import User from '@/models/User';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'official') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find wards assigned to this official
    const assignedWards = await Ward.find({ 
      officerInCharge: session.user.id 
    }).populate('departments', 'name categories');

    const wardData = await Promise.all(
      assignedWards.map(async (ward) => {
        const [issueStats, recentIssues, performanceMetrics] = await Promise.all([
          ward.getIssueStats(),
          ward.getRecentIssues(5),
          ward.getPerformanceMetrics()
        ]);

        return {
          ward: {
            _id: ward._id,
            name: ward.name,
            number: ward.number,
            population: ward.population,
            area: ward.area,
            facilities: ward.facilities,
            departments: ward.departments
          },
          issueStats,
          recentIssues,
          performanceMetrics
        };
      })
    );

    return NextResponse.json({ wards: wardData });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ward dashboard' }, { status: 500 });
  }
}
