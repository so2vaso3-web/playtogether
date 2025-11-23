/**
 * Fix database - remove old phone index
 * Run: node scripts/fix-database.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/playtogether_hack';

async function fixDatabase() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get all indexes
    const indexes = await usersCollection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(idx => {
      console.log('  -', JSON.stringify(idx.key));
    });

    // Drop phone index if exists
    try {
      await usersCollection.dropIndex('phone_1');
      console.log('\n✅ Dropped phone_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n⚠ phone_1 index does not exist (already removed)');
      } else {
        throw error;
      }
    }

    // Drop phone_1_1 index if exists
    try {
      await usersCollection.dropIndex('phone_1_1');
      console.log('✅ Dropped phone_1_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('⚠ phone_1_1 index does not exist');
      } else {
        throw error;
      }
    }

    // Ensure username index exists
    try {
      await usersCollection.createIndex({ username: 1 }, { unique: true });
      console.log('✅ Created username_1 index');
    } catch (error) {
      console.log('⚠ Username index may already exist');
    }

    console.log('\n✅ Database fixed!');
    console.log('\n📝 Now you can:');
    console.log('1. Run: node scripts/create-admin.js');
    console.log('2. Or register a new user via web');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixDatabase();





