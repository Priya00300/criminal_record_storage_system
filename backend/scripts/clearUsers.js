// backend/scripts/clearUsers.js
import mongoose from 'mongoose';
import User from '../models/User.js';

const clearUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany({});
    console.log('✅ All users deleted');
    process.exit(0);
  } catch (err) {
    console.error('❌ Deletion failed:', err);
    process.exit(1);
  }
};

clearUsers();