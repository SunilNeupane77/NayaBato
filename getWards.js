
import connectDB from './lib/db/connect.js';
import Ward from './models/Ward.js';

async function getWards() {
  try {
    await connectDB();
    const wards = await Ward.find({}).lean();
    console.log(JSON.stringify(wards, null, 2));
  } catch (error) {
    console.error('Error fetching wards:', error);
  } finally {
    process.exit(0);
  }
}

getWards();
