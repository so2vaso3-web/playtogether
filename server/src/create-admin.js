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

const User = mongoose.model('User', userSchema);

// ===== CREATE/RESET ADMIN =====
async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/playtogether_hack');
        console.log('✓ Connected to MongoDB');

        // Admin credentials - có thể thay đổi ở đây hoặc dùng biến môi trường
        const adminPhone = process.env.ADMIN_PHONE || process.argv[2] || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || process.argv[3] || 'admin123';
        const adminName = process.env.ADMIN_NAME || process.argv[4] || 'Admin';

        // Hash password
        const hashedPassword = await bcryptjs.hash(adminPassword, 10);

        // Check if admin exists
        const existingAdmin = await User.findOne({ phone: adminPhone });

        if (existingAdmin) {
            // Update existing admin
            existingAdmin.password = hashedPassword;
            existingAdmin.username = existingAdmin.username || adminPhone;
            existingAdmin.name = adminName;
            existingAdmin.role = 'admin';
            existingAdmin.isActive = true;
            await existingAdmin.save();
            console.log(`✓ Admin account updated!`);
        } else {
            // Create new admin
            const admin = new User({
                phone: adminPhone,
                password: hashedPassword,
                username: adminPhone,
                name: adminName,
                balance: 0,
                role: 'admin'
            });
            await admin.save();
            console.log(`✓ Admin account created!`);
        }

        console.log('\n📝 Admin Credentials:');
        console.log(`   Phone: ${adminPhone}`);
        console.log(`   Password: ${adminPassword}`);
        console.log(`   Name: ${adminName}`);
        console.log(`   Role: admin`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createAdmin();

