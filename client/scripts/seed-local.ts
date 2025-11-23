// Seed local mock KV with sample data for testing
import { localKV, KV_PREFIXES } from '../lib/kv-local';
import bcrypt from 'bcryptjs';

export async function seedLocal() {
  console.log('🌱 Seeding local mock KV store...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminId = crypto.randomUUID();
  const admin = {
    id: adminId,
    username: 'admin',
    password: adminPassword,
    name: 'Admin User',
    balance: 1000000,
    role: 'admin' as const,
    currentPackage: null,
    isActive: true,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await localKV.set(`${KV_PREFIXES.USER}${adminId}`, admin);
  await localKV.set(`${KV_PREFIXES.USER_BY_USERNAME}admin`, adminId);

  // Create test user
  const testPassword = await bcrypt.hash('test123', 10);
  const testId = crypto.randomUUID();
  const testUser = {
    id: testId,
    username: 'test',
    password: testPassword,
    name: 'Test User',
    balance: 50000,
    role: 'user' as const,
    currentPackage: null,
    isActive: true,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await localKV.set(`${KV_PREFIXES.USER}${testId}`, testUser);
  await localKV.set(`${KV_PREFIXES.USER_BY_USERNAME}test`, testId);

  // Create sample packages
  const packages = [
    {
      id: crypto.randomUUID(),
      name: 'VIP 1 THÁNG',
      description: 'Hack Play Together 30 ngày',
      price: 199000,
      duration: 30,
      features: ['Auto Di Chuyển Thông Minh', 'Auto Sửa Dụng Cụ Nâng Cao', 'Auto Bảo Quản Thông Minh'],
      icon: '🎮',
      popular: false,
      platform: 'all' as const,
      banRisk: 'medium' as const,
      antiBanGuarantee: false,
      version: 'V2.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      name: 'VIP PREMIUM 3 THÁNG',
      description: 'Hack Play Together 90 ngày - GIÁ KHUYẾN MÃI',
      price: 349000,
      duration: 90,
      features: ['Auto Di Chuyển Thông Minh', 'Auto Sửa Dụng Cụ Nâng Cao', 'Auto Bảo Quản Thông Minh'],
      icon: '🎮',
      popular: true,
      platform: 'all' as const,
      banRisk: 'none' as const,
      antiBanGuarantee: true,
      version: 'V2.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      name: 'LIFETIME ELITE',
      description: 'Hack Play Together vĩnh viễn',
      price: 599000,
      duration: 365,
      features: ['Auto Di Chuyển Thông Minh AI', 'Auto Sửa Dụng Cụ Nâng Cao', 'Auto Bảo Quản Thông Minh'],
      icon: '🎮',
      popular: true,
      platform: 'all' as const,
      banRisk: 'none' as const,
      antiBanGuarantee: true,
      version: 'V2.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const packageIds: string[] = [];
  for (const pkg of packages) {
    await localKV.set(`${KV_PREFIXES.PACKAGE}${pkg.id}`, pkg);
    packageIds.push(pkg.id);
  }
  await localKV.set(KV_PREFIXES.PACKAGE_ALL, packageIds);

  console.log('✅ Seeded:');
  console.log('  - Admin user: username="admin", password="admin123"');
  console.log('  - Test user: username="test", password="test123"');
  console.log(`  - ${packages.length} packages`);
}

export default seedLocal;

