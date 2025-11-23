/**
 * Script to create admin user
 * Run: npx ts-node scripts/create-admin.ts
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Setup environment
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/playtogether_hack';

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  name: { type: String, default: '' },
  balance: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  currentPackage: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const adminData = {
  username: 'admin',
  password: 'admin123',
  name: 'Administrator',
  role: 'admin' as const,
  balance: 0,
};

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ username: adminData.username });
    
    if (existingAdmin) {
      console.log('⚠ Admin user already exists!');
      console.log('Username:', adminData.username);
      console.log('\nTo change password, update the user in MongoDB directly or delete and recreate.');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const admin = new User({
      ...adminData,
      password: hashedPassword,
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('\n=== Admin Credentials ===');
    console.log('Username:', adminData.username);
    console.log('Password:', adminData.password);
    console.log('Role: admin');
    console.log('\n⚠ IMPORTANT: Change the password after first login!');
    console.log('⚠ Or update the password in the script and run again.');
    
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Failed to create admin:', error.message);
    process.exit(1);
  }
}

createAdmin();

