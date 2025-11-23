/**
 * Quick test script to check database and create test user
 * Run: npx ts-node scripts/quick-test.ts
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

async function test() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('MongoDB URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected!');

    // Check existing users
    const userCount = await User.countDocuments();
    console.log(`📊 Total users: ${userCount}`);

    // Try to create a test user
    const testUsername = 'testuser';
    const existingTest = await User.findOne({ username: testUsername });
    
    if (existingTest) {
      console.log(`⚠ Test user "${testUsername}" already exists`);
    } else {
      const hashedPassword = await bcrypt.hash('test123', 10);
      const testUser = new User({
        username: testUsername,
        password: hashedPassword,
        name: 'Test User',
        balance: 0,
      });
      await testUser.save();
      console.log(`✅ Created test user: ${testUsername} / test123`);
    }

    // Check for admin
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log(`✅ Admin user exists: ${admin.username}`);
    } else {
      console.log(`⚠ No admin user found. Run: npx ts-node scripts/create-admin.ts`);
    }

    console.log('\n✅ Test completed!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('\n💡 Possible issues:');
    console.error('1. MongoDB is not running');
    console.error('2. MONGODB_URI is incorrect');
    console.error('3. Network connection issue');
    process.exit(1);
  }
}

test();

