const mongoose = require('mongoose');

// Simple schema definitions
const WardSchema = new mongoose.Schema({
  name: String,
  number: Number,
  assignedOfficials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { strict: false });

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String
}, { strict: false });

const Ward = mongoose.models.Ward || mongoose.model('Ward', WardSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const MONGODB_URI = 'mongodb+srv://sunilneupane960:YRrEaJwfgXQbRqBw@cluster0.2j2o9ri.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function assignWards() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all officials and wards
    const officials = await User.find({ role: 'official' });
    const wards = await Ward.find({});

    console.log(`Found ${officials.length} officials and ${wards.length} wards`);

    // Assign each official to all wards for testing
    for (const ward of wards) {
      if (!ward.assignedOfficials) {
        ward.assignedOfficials = [];
      }
      ward.assignedOfficials = officials.map(official => official._id);
      await ward.save();
      console.log(`Assigned ${officials.length} officials to ward: ${ward.name}`);
    }

    console.log('Ward assignment completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignWards();
