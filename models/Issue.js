// Schema for Issue reports
import mongoose from 'mongoose';

const IssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the issue'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description of the issue'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['pothole', 'streetlight', 'garbage', 'water', 'electricity', 'other']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide the location address']
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    }
  },
  images: [{
    url: {
      type: String
    },
    publicId: {
      type: String
    }
  }],
  status: {
    type: String,
    required: true,
    enum: ['pending', 'reported', 'under-review', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward'
  },
  assignedWard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  statusHistory: [{
    status: {
      type: String,
      required: true,
      enum: ['pending', 'reported', 'under-review', 'in_progress', 'resolved', 'rejected']
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String
    }
  }],
  votes: {
    upvotes: { type: Number, default: 0 },
    urgent: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Create a geospatial index for location queries
IssueSchema.index({ "location.coordinates": "2dsphere" });

export default mongoose.models.Issue || mongoose.model('Issue', IssueSchema);
