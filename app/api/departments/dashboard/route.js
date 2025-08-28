import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db/connect';
import Department from '@/models/Department';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session || !['admin', 'official'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const query = session.user.role === 'official' 
      ? { headOfficer: session.user.id }
      : {};

    const departments = await Department.find(query)
      .populate('headOfficer', 'name email')
      .populate('staff.user', 'name email')
      .populate('serviceAreas', 'name number');

    const departmentData = await Promise.all(
      departments.map(async (dept) => {
        const [issueStats, performanceMetrics, wardDistribution] = await Promise.all([
          dept.getIssueStats(),
          dept.getPerformanceMetrics(),
          dept.getWardDistribution()
        ]);

        return {
          department: {
            _id: dept._id,
            name: dept.name,
            description: dept.description,
            categories: dept.categories,
            budget: dept.budget,
            workingHours: dept.workingHours,
            staff: dept.staff,
            serviceAreas: dept.serviceAreas,
            headOfficer: dept.headOfficer
          },
          issueStats,
          performanceMetrics,
          wardDistribution
        };
      })
    );

    return NextResponse.json({ departments: departmentData });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch department dashboard' }, { status: 500 });
  }
}
