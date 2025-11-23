const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

// ===== MODELS =====
const userSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    username: { type: String, default: '' },
    name: { type: String, default: '' },
    balance: { type: Number, default: 0 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    currentPackage: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// ===== RESET ADMIN =====
async function resetAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/playtogether_hack');
        console.log('✓ Connected to MongoDB');

        // Admin credentials - Thay đổi ở đây
        const adminPhone = process.argv[2] || 'admin';
        const adminPassword = process.argv[3] || 'admin123';
        const adminName = process.argv[4] || 'Admin';

        console.log('\n🔄 Resetting admin account...');
        console.log(`   Phone/Username: ${adminPhone}`);
        console.log(`   Password: ${adminPassword}`);
        console.log(`   Name: ${adminName}\n`);

        // Hash password
        const hashedPassword = await bcryptjs.hash(adminPassword, 10);

        // Find existing admin by phone or username
        let existingAdmin = await User.findOne({ 
            $or: [
                { phone: adminPhone },
                { username: adminPhone }
            ]
        });

        if (existingAdmin) {
            // Update existing admin
            existingAdmin.phone = adminPhone;
            existingAdmin.username = adminPhone;
            existingAdmin.password = hashedPassword;
            existingAdmin.name = adminName;
            existingAdmin.role = 'admin';
            existingAdmin.isActive = true;
            await existingAdmin.save();
            console.log('✓ Admin account updated!');
        } else {
            // Check if there's any admin account
            const anyAdmin = await User.findOne({ role: 'admin' });
            
            if (anyAdmin) {
                // Update existing admin account
                anyAdmin.phone = adminPhone;
                anyAdmin.username = adminPhone;
                anyAdmin.password = hashedPassword;
                anyAdmin.name = adminName;
                anyAdmin.isActive = true;
                await anyAdmin.save();
                console.log('✓ Existing admin account updated!');
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
                console.log('✓ New admin account created!');
            }
        }

        console.log('\n📝 Admin Credentials:');
        console.log(`   Username/Phone: ${adminPhone}`);
        console.log(`   Password: ${adminPassword}`);
        console.log(`   Name: ${adminName}`);
        console.log(`   Role: admin`);
        console.log('\n✅ Done! You can now login with these credentials.\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Usage: node reset-admin.js [username] [password] [name]
// Example: node reset-admin.js admin admin123 Admin
resetAdmin();

