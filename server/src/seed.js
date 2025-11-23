const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

// ===== MODELS =====
const userSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    name: { type: String, default: '' },
    balance: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    currentPackage: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const packageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    duration: { type: Number, default: 30 },
    features: [String],
    icon: String,
    popular: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Package = mongoose.model('Package', packageSchema);

// ===== SEED DATA =====
async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/playtogether_hack');
        console.log('✓ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Package.deleteMany({});
        console.log('✓ Cleared existing data');

        // Create admin user
        const adminPassword = await bcryptjs.hash('admin123', 10);
        const admin = new User({
            phone: '0987654321',
            password: adminPassword,
            name: 'Admin',
            balance: 1000000,
            role: 'admin'
        });
        await admin.save();
        console.log('✓ Admin user created: 0987654321 / admin123');

        // Create test user
        const userPassword = await bcryptjs.hash('user123', 10);
        const testUser = new User({
            phone: '0123456789',
            password: userPassword,
            name: 'Nguyễn Văn A',
            balance: 500000,
            role: 'user'
        });
        await testUser.save();
        console.log('✓ Test user created: 0123456789 / user123');

        // Create packages
        const packages = [
            {
                name: 'VIP 1 THÁNG',
                description: 'Hack Play Together 30 ngày',
                price: 199000,
                duration: 30,
                features: [
                    'Teleport & NoClip',
                    'ESP đầy đủ tính năng',
                    'Speed Hack mượt',
                    'Auto Aim chính xác',
                    'Hỗ trợ Android & iOS',
                    'Cập nhật mỗi tuần'
                ],
                popular: false
            },
            {
                name: 'VIP PREMIUM 3 THÁNG',
                description: 'Hack Play Together 90 ngày - GIÁ KHUYẾN MÃI',
                price: 349000,
                duration: 90,
                features: [
                    'TẤT CẢ tính năng VIP',
                    'God Mode + Wallhack',
                    'Aimbot siêu sắc nét',
                    'Item Hack vô hạn',
                    'Hỗ trợ VIP ưu tiên',
                    'Backup account 3 lần'
                ],
                popular: true
            },
            {
                name: 'LIFETIME ELITE',
                description: 'Hack Play Together vĩnh viễn',
                price: 599000,
                duration: 365,
                features: [
                    'Vĩnh viễn không hết hạn',
                    'TẤT CẢ tính năng cao cấp',
                    'Hỗ trợ 24/7 riêng',
                    'Cập nhật free mãi mãi',
                    'Chuyên dùng cho giải đấu',
                    'Bảo hành vĩnh viễn'
                ],
                popular: false
            }
        ];

        for (const pkg of packages) {
            const newPackage = new Package(pkg);
            await newPackage.save();
            console.log(`✓ Package created: ${pkg.name} - ${pkg.price.toLocaleString('vi-VN')}₫`);
        }

        console.log('\n✓ Database seeded successfully!');
        console.log('\n📝 Test Accounts:');
        console.log('   Admin: 0987654321 / admin123');
        console.log('   User: 0123456789 / user123');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
}

seedDatabase();
