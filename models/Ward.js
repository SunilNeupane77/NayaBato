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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create a geospatial index for location queries
WardSchema.index({ "location.coordinates": "2dsphere" });

// Create an index on ward number for quick lookups
WardSchema.index({ number: 1 });

// Method to get issues assigned to this ward
WardSchema.methods.getAssignedIssues = async function() {
  return await this.model('Issue').find({ 
    assignedWard: this._id 
  }).sort({ createdAt: -1 });
};

// Static method to find nearest ward to coordinates using Haversine formula
WardSchema.statics.findNearest = async function(coordinates, maxDistance = 5000) {
  return await this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates // [longitude, latitude]
        },
        $maxDistance: maxDistance // Distance in meters
      }
    },
    isActive: true
  }).limit(1);
};

export default mongoose.models.Ward || mongoose.model('Ward', WardSchema);
