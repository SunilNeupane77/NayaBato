// Schema for Government Departments
import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a department name'],
    trim: true,
    maxlength: [100, 'Department name cannot be more than 100 characters'],
    unique: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  headOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  staff: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    position: String,
    assignedWards: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward'
    }]
  }],
  contactEmail: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  contactPhone: {
    type: String
  },
  categories: [{
    type: String,
    enum: ['pothole', 'streetlight', 'garbage', 'water', 'electricity', 'other']
  }],
  budget: {
    allocated: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    year: { type: Number, default: new Date().getFullYear() }
  },
  workingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' },
    workingDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }]
  },
  serviceAreas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to get issues assigned to this department with filters
DepartmentSchema.methods.getAssignedIssues = async function(options = {}) {
  const { limit, skip, status, ward, priority } = options;
  
  const query = { 
    category: { $in: this.categories } 
  };
  
  if (status) query.status = status;
  if (ward) query.assignedWard = ward;
  if (priority) query.priority = priority;
  
  const issuesQuery = this.model('Issue').find(query)
    .populate('reporter', 'name email')
    .populate('assignedWard', 'name number')
    .sort({ priority: -1, createdAt: -1 });
  
  if (skip !== undefined) issuesQuery.skip(skip);
  if (limit !== undefined) issuesQuery.limit(limit);
  
  return await issuesQuery;
};

// Method to get department performance metrics
DepartmentSchema.methods.getPerformanceMetrics = async function() {
  const totalIssues = await this.model('Issue').countDocuments({ 
    category: { $in: this.categories } 
  });
  
  const resolvedIssues = await this.model('Issue').countDocuments({ 
    category: { $in: this.categories },
    status: 'resolved' 
  });

  const avgResolutionTime = await this.model('Issue').aggregate([
    { 
      $match: { 
        category: { $in: this.categories },
        status: 'resolved' 
      } 
    },
    {
      $project: {
        resolutionTime: {
          $divide: [
            { $subtract: ['$updatedAt', '$createdAt'] },
            1000 * 60 * 60 * 24
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgTime: { $avg: '$resolutionTime' }
      }
    }
  ]);

  return {
    totalIssues,
    resolvedIssues,
    resolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues * 100).toFixed(1) : 0,
    avgResolutionTime: avgResolutionTime[0]?.avgTime?.toFixed(1) || 0,
    budgetUtilization: this.budget.allocated > 0 ? (this.budget.spent / this.budget.allocated * 100).toFixed(1) : 0
  };
};

// Method to get count of issues by status
DepartmentSchema.methods.getIssueStats = async function() {
  return await this.model('Issue').aggregate([
    {
      $match: { category: { $in: this.categories } }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Method to get ward-wise issue distribution
DepartmentSchema.methods.getWardDistribution = async function() {
  return await this.model('Issue').aggregate([
    {
      $match: { category: { $in: this.categories } }
    },
    {
      $lookup: {
        from: 'wards',
        localField: 'assignedWard',
        foreignField: '_id',
        as: 'ward'
      }
    },
    {
      $unwind: '$ward'
    },
    {
      $group: {
        _id: {
          wardId: '$ward._id',
          wardName: '$ward.name',
          wardNumber: '$ward.number'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.wardNumber': 1 }
    }
  ]);
};

// Static method to find departments by category
DepartmentSchema.statics.findByCategory = async function(category) {
  return await this.find({ 
    categories: category,
    isActive: true 
  });
};

export default mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
