/**
 * Quick script to verify official user
 * Run with: node scripts/verify-official.js
 */

import mongoose from 'mongoose';
import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nayabato';

async function verifyOfficial() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { email: 'manishkashyap@gmail.com' },
      { verified: true },
      { new: true }
    );

    if (user) {
      console.log('✅ User verified successfully:');
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Verified: ${user.verified}`);
    } else {
      console.log('❌ User not found');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyOfficial();
