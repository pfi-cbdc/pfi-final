const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      
      // Update to ensure it has admin role
      await User.findByIdAndUpdate(existingAdmin._id, { 
        role: 'admin',
        name: 'Admin User'
      });
      console.log('Admin user updated');
    } else {
      // Create admin user
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin'
      });

      await adminUser.save();
      console.log('Admin user created successfully');
    }

    console.log('Admin credentials:');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();