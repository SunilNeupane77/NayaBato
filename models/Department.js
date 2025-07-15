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
DepartmentSchema.methods.getAssignedIssues = async function() {
  return await this.model('Issue').find({ 
    category: { $in: this.categories } 
  }).sort({ createdAt: -1 });
};

export default mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
