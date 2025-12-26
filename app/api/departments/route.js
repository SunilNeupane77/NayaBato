import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db/connect';
import Department from '@/models/Department';
import Issue from '@/models/Issue';

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
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'name';

    // Build match stage for filtering
    const matchStage = {};
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== 'all') {
      matchStage.isActive = status === 'active';
    }
    if (category && category !== 'all-categories') {
      matchStage.categories = category;
    }

    // Build sort stage
    let sortStage = {};
    switch (sortBy) {
      case 'issues':
        sortStage = { issueCount: -1 };
        break;
      case 'resolution':
        sortStage = { resolutionRate: -1 };
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
          let: { deptCategories: '$categories' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$category', '$$deptCategories'] }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                resolved: {
                  $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                }
              }
            }
          ],
          as: 'issueStats'
        }
      },
      // Unwind stats (preserve null if no issues)
      {
        $unwind: {
          path: '$issueStats',
          preserveNullAndEmptyArrays: true
        }
      },
      // Add calculated fields
      {
        $addFields: {
          issueCount: { $ifNull: ['$issueStats.total', 0] },
          resolvedCount: { $ifNull: ['$issueStats.resolved', 0] },
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
        }
      },
      // Lookup head officer details
      {
        $lookup: {
          from: 'users',
          localField: 'headOfficer',
          foreignField: '_id',
          as: 'headOfficerDetails'
        }
      },
      {
        $unwind: {
          path: '$headOfficerDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      // Project final fields
      {
        $project: {
          name: 1,
          description: 1,
          categories: 1,
          workingHours: 1,
          budget: 1,
          contactEmail: 1,
          contactPhone: 1,
          isActive: 1,
          createdAt: 1,
          headOfficer: {
            _id: '$headOfficerDetails._id',
            name: '$headOfficerDetails.name',
            email: '$headOfficerDetails.email'
          },
          issueCount: 1,
          resolvedCount: 1,
          resolutionRate: { $round: ['$resolutionRate', 1] }
        }
      },
      { $sort: sortStage },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }]
        }
      }
    ];

    const result = await Department.aggregate(pipeline);

    const departments = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

    return NextResponse.json({
      departments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Departments API error:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
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
    if (!data.name || !data.categories || data.categories.length === 0) {
      return NextResponse.json({
        error: 'Name and at least one category are required'
      }, { status: 400 });
    }

    // Check if department name already exists
    const existingDept = await Department.findOne({ name: data.name });
    if (existingDept) {
      return NextResponse.json({
        error: 'Department with this name already exists'
      }, { status: 400 });
    }

    const department = await Department.create({
      ...data,
      workingHours: data.workingHours || {
        start: '09:00',
        end: '17:00',
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }
    });

    await department.populate('headOfficer', 'name email');

    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
