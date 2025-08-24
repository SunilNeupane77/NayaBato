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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to get issues assigned to this department
DepartmentSchema.methods.getAssignedIssues = async function(options = {}) {
  const { limit, skip, status } = options;
  
  const query = { 
    category: { $in: this.categories } 
  };
  
  if (status) {
    query.status = status;
  }
  
  const issuesQuery = this.model('Issue').find(query)
    .sort({ createdAt: -1 });
  
  if (skip !== undefined) {
    issuesQuery.skip(skip);
  }
  
  if (limit !== undefined) {
    issuesQuery.limit(limit);
  }
  
  return await issuesQuery;
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

// Method to set department status
DepartmentSchema.methods.setStatus = async function(isActive) {
  this.isActive = isActive;
  return await this.save();
};

// Static method to find departments by category
DepartmentSchema.statics.findByCategory = async function(category) {
  return await this.find({ 
    categories: category,
    isActive: true 
  });
};

export default mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
