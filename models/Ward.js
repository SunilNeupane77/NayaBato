// Schema for Ward
import mongoose from 'mongoose';

const WardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a ward name'],
    trim: true,
    maxlength: [100, 'Ward name cannot be more than 100 characters']
  },
  number: {
    type: Number,
    required: [true, 'Please provide a ward number'],
    unique: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide the ward address']
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
  boundaries: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // [[[longitude, latitude], [longitude, latitude], ...]]
      default: []
    }
  },
  officerInCharge: {
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
  population: {
    type: Number,
    default: 0
  },
  area: {
    type: Number, // in square kilometers
    default: 0
  },
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  facilities: [{
    name: String,
    type: {
      type: String,
      enum: ['hospital', 'school', 'park', 'police_station', 'fire_station', 'other']
    },
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number]
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create a geospatial index for location queries
WardSchema.index({ "location.coordinates": "2dsphere" });

// Method to get issues assigned to this ward with statistics
WardSchema.methods.getIssueStats = async function() {
  const stats = await this.model('Issue').aggregate([
    { $match: { assignedWard: this._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const categoryStats = await this.model('Issue').aggregate([
    { $match: { assignedWard: this._id } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  return { statusStats: stats, categoryStats };
};

// Method to get recent issues
WardSchema.methods.getRecentIssues = async function(limit = 10) {
  return await this.model('Issue').find({ 
    assignedWard: this._id 
  })
  .populate('reporter', 'name email')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Method to get ward performance metrics
WardSchema.methods.getPerformanceMetrics = async function() {
  const totalIssues = await this.model('Issue').countDocuments({ assignedWard: this._id });
  const resolvedIssues = await this.model('Issue').countDocuments({ 
    assignedWard: this._id, 
    status: 'resolved' 
  });
  
  const avgResolutionTime = await this.model('Issue').aggregate([
    { 
      $match: { 
        assignedWard: this._id, 
        status: 'resolved' 
      } 
    },
    {
      $project: {
        resolutionTime: {
          $divide: [
            { $subtract: ['$updatedAt', '$createdAt'] },
            1000 * 60 * 60 * 24 // Convert to days
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
    avgResolutionTime: avgResolutionTime[0]?.avgTime?.toFixed(1) || 0
  };
};

// Static method to find nearest ward
WardSchema.statics.findNearest = async function(coordinates, maxDistance = 5000) {
  return await this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  }).limit(1);
};

export default mongoose.models.Ward || mongoose.model('Ward', WardSchema);
