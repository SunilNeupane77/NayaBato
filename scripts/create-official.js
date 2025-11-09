/**
 * Script to create official user
 * Run with: node scripts/create-official.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nayabato';

async function createOfficial() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'manishkashyap@gmail.com' });
    
    if (existingUser) {
      console.log('User already exists, updating verification status...');
      existingUser.verified = true;
      await existingUser.save();
      console.log('✅ User verified successfully');
    } else {
      console.log('Creating new official user...');
      
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const user = await User.create({
        name: 'Manish Kashyap',
        email: 'manishkashyap@gmail.com',
        password: hashedPassword,
        role: 'official',
        verified: true,
        department: 'general'
      });

      console.log('✅ Official user created successfully:');
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Verified: ${user.verified}`);
      console.log(`Password: password123`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

createOfficial();
