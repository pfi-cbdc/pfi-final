const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: '9999888800@xyz.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      
      // Update to ensure it has admin role and wallet details
      await User.findByIdAndUpdate(existingAdmin._id, { 
        role: 'admin',
        name: 'Admin User',
        walletId: 'POOL_WALLET_001',
        balance: 1000000
      });
      console.log('Admin user updated');
    } else {
      // Create admin user
      const adminUser = new User({
        name: 'Admin User',
        email: '9999888800@xyz.com',
        password: 'admin123',
        role: 'admin',
        walletId: 'POOL_WALLET_001',
        balance: 1000000
      });

      await adminUser.save();
      console.log('Admin user created successfully');
    }

    console.log('Admin credentials:');
    console.log('Email: 9999888800@xyz.com');
    console.log('Password: admin123');
    console.log('Wallet ID: POOL_WALLET_001');
    console.log('Balance: Rs. 1,000,000');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();