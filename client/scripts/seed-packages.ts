/**
 * Seed script to create sample packages with platforms
 * Run: npx ts-node scripts/seed-packages.ts
 */

import mongoose from 'mongoose';
import connectDB from '../lib/db';
import Package from '../lib/models/Package';

const samplePackages = [
  {
    name: 'Hack Android Pro',
    description: 'Hack Play Together chuyên nghiệp cho thiết bị Android',
    price: 150000,
    duration: 30,
    features: ['God Mode', 'Speed Hack', 'No Cooldown', 'Auto Play', 'Unlimited Coins'],
    icon: '📱',
    popular: true,
    platform: 'android',
    version: '1.0.0',
    systemRequirements: 'Android 6.0+, RAM 2GB+, Root không bắt buộc',
  },
  {
    name: 'Hack iOS Premium',
    description: 'Hack Play Together cao cấp cho thiết bị iOS',
    price: 200000,
    duration: 30,
    features: ['God Mode', 'Speed Hack', 'No Cooldown', 'Auto Play', 'Unlimited Coins', 'VIP Features'],
    icon: '🍎',
    popular: false,
    platform: 'ios',
    version: '1.0.0',
    systemRequirements: 'iOS 12.0+, Jailbreak không bắt buộc',
  },
  {
    name: 'Hack Giả Lập',
    description: 'Hack Play Together cho giả lập (LDPlayer, Nox, BlueStacks...)',
    price: 100000,
    duration: 30,
    features: ['God Mode', 'Speed Hack', 'No Cooldown', 'Multi-Instance'],
    icon: '💻',
    popular: false,
    platform: 'emulator',
    version: '1.0.0',
    systemRequirements: 'LDPlayer 4.0+, Nox Player 6.0+, hoặc BlueStacks 5.0+',
  },
  {
    name: 'Hack All-in-One',
    description: 'Hack Play Together hỗ trợ tất cả platform (Android, iOS, Giả Lập)',
    price: 300000,
    duration: 90,
    features: [
      'God Mode',
      'Speed Hack',
      'No Cooldown',
      'Auto Play',
      'Unlimited Coins',
      'VIP Support',
      'All Platforms',
    ],
    icon: '👑',
    popular: true,
    platform: 'all',
    version: '1.0.0',
    systemRequirements: 'Hỗ trợ tất cả thiết bị Android, iOS và giả lập',
  },
];

async function seed() {
  try {
    await connectDB();
    console.log('✓ Connected to MongoDB');

    // Insert sample packages
    for (const pkg of samplePackages) {
      const existing = await Package.findOne({ name: pkg.name });
      if (!existing) {
        await Package.create(pkg);
        console.log(`✓ Created package: ${pkg.name} (${pkg.platform})`);
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





