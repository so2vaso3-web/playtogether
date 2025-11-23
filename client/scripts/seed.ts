/**
 * Seed script to create sample packages
 * Run: npx ts-node scripts/seed.ts
 */

import mongoose from 'mongoose';
import connectDB from '../lib/db';
import Package from '../lib/models/Package';

const samplePackages = [
  {
    name: 'Gói Cơ Bản',
    description: 'Gói hack cơ bản cho người mới bắt đầu',
    price: 50000,
    duration: 7,
    features: ['God Mode', 'Speed Hack', 'No Cooldown'],
    icon: '🎮',
    popular: false,
  },
  {
    name: 'Gói Pro',
    description: 'Gói hack chuyên nghiệp với đầy đủ tính năng',
    price: 150000,
    duration: 30,
    features: ['God Mode', 'Speed Hack', 'No Cooldown', 'Auto Play', 'Unlimited Coins'],
    icon: '💎',
    popular: true,
  },
  {
    name: 'Gói Premium',
    description: 'Gói hack cao cấp nhất với tất cả tính năng độc quyền',
    price: 300000,
    duration: 90,
    features: [
      'God Mode',
      'Speed Hack',
      'No Cooldown',
      'Auto Play',
      'Unlimited Coins',
      'VIP Support',
      'Early Access',
    ],
    icon: '👑',
    popular: false,
  },
];

async function seed() {
  try {
    await connectDB();
    console.log('✓ Connected to MongoDB');

    // Clear existing packages (optional)
    // await Package.deleteMany({});
    // console.log('✓ Cleared existing packages');

    // Insert sample packages
    for (const pkg of samplePackages) {
      const existing = await Package.findOne({ name: pkg.name });
      if (!existing) {
        await Package.create(pkg);
        console.log(`✓ Created package: ${pkg.name}`);
      } else {
        console.log(`- Package already exists: ${pkg.name}`);
      }
    }

    console.log('✓ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
}

seed();





