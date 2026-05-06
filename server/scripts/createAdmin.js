require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grocery-sub';

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const adminEmail = 'superadmin@grocery.com';
    const adminPassword = 'superpassword123'; // It will be hashed by the pre-save hook

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const adminUser = new User({
      name: 'Admin User',
      email: adminEmail,
      passwordHash: adminPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin account created successfully:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
};

createAdmin();
