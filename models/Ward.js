// Enhanced Ward Schema with advanced geospatial features
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
  // Advanced geospatial metadata
  geospatialMetadata: {
    optimizationApplied: {
      type: Boolean,
      default: false
    },
    originalPosition: {
      type: [Number], // [longitude, latitude]
      default: null
    },
    optimizationReason: String,
    coverageScore: {
      type: Number,
      default: 0
    },
    nearestWardDistance: {
      type: Number,
      default: 0
    }
  },
  officerInCharge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedOfficials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  // Performance metrics
  metrics: {
    totalIssues: { type: Number, default: 0 },
    resolvedIssues: { type: Number, default: 0 },
    avgResolutionTime: { type: Number, default: 0 }, // in days
    lastUpdated: { type: Date, default: Date.now }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Enhanced geospatial indexes
WardSchema.index({ "location.coordinates": "2dsphere" });
WardSchema.index({ number: 1, isActive: 1 });
WardSchema.index({ name: "text" });

// Method to update geospatial metadata
WardSchema.methods.updateGeospatialMetadata = function(metadata) {
  this.geospatialMetadata = {
    ...this.geospatialMetadata,
    ...metadata
  };
  return this.save();
};

// Method to get enhanced issue stats with geospatial analysis
WardSchema.methods.getEnhancedIssueStats = async function() {
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

  // Calculate average distance of issues from ward center
  const distanceStats = await this.model('Issue').aggregate([
    { $match: { assignedWard: this._id } },
    {
      $project: {
        distance: {
          $sqrt: {
            $add: [
              { $pow: [{ $subtract: [{ $arrayElemAt: ['$location.coordinates.coordinates', 0] }, this.location.coordinates.coordinates[0]] }, 2] },
              { $pow: [{ $subtract: [{ $arrayElemAt: ['$location.coordinates.coordinates', 1] }, this.location.coordinates.coordinates[1]] }, 2] }
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        avgDistance: { $avg: '$distance' },
        maxDistance: { $max: '$distance' },
        minDistance: { $min: '$distance' }
      }
    }
  ]);

  return { 
    statusStats: stats, 
    categoryStats,
    distanceStats: distanceStats[0] || { avgDistance: 0, maxDistance: 0, minDistance: 0 }
  };
};

// Static method to find nearest ward with enhanced metadata
WardSchema.statics.findNearestEnhanced = async function(coordinates, maxDistance = 5000) {
  const results = await this.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: coordinates
        },
        distanceField: 'distance',
        maxDistance: maxDistance,
        query: { isActive: true },
        spherical: true
      }
    },
    {
      $project: {
        name: 1,
        number: 1,
        location: 1,
        distance: 1,
        geospatialMetadata: 1,
        metrics: 1
      }
    },
    { $limit: 5 }
  ]);

  return results;
};

// Method to calculate coverage efficiency
WardSchema.methods.calculateCoverageEfficiency = async function() {
  const nearbyWards = await this.model('Ward').find({
    _id: { $ne: this._id },
    isActive: true,
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: this.location.coordinates.coordinates
        },
        $maxDistance: 20000 // 20km radius
      }
    }
  }).limit(5);

  let totalDistance = 0;
  nearbyWards.forEach(ward => {
    // Simple distance calculation for efficiency score
    const dx = ward.location.coordinates.coordinates[0] - this.location.coordinates.coordinates[0];
    const dy = ward.location.coordinates.coordinates[1] - this.location.coordinates.coordinates[1];
    totalDistance += Math.sqrt(dx * dx + dy * dy);
  });

  const avgDistance = nearbyWards.length > 0 ? totalDistance / nearbyWards.length : 0;
  const efficiency = Math.min(100, Math.max(0, (avgDistance - 0.01) * 1000)); // Normalized score

  return {
    nearbyWards: nearbyWards.length,
    averageDistance: avgDistance,
    efficiencyScore: Math.round(efficiency)
  };
};

export default mongoose.models.Ward || mongoose.model('Ward', WardSchema);
