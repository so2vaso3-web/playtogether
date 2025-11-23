const mongoose = require('mongoose');
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

async function checkAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/playtogether_hack');
        console.log('✓ Connected to MongoDB\n');

        // Find admin user
        const adminUser = await User.findOne({ 
            $or: [
                { phone: 'admin' },
                { username: 'admin' },
                { role: 'admin' }
            ]
        });

        if (adminUser) {
            console.log('📝 Admin User Found:');
            console.log(`   ID: ${adminUser._id}`);
            console.log(`   Phone: ${adminUser.phone}`);
            console.log(`   Username: ${adminUser.username || 'N/A'}`);
            console.log(`   Name: ${adminUser.name}`);
            console.log(`   Role: ${adminUser.role}`);
            console.log(`   IsActive: ${adminUser.isActive}`);
            
            if (adminUser.role !== 'admin') {
                console.log('\n⚠️  WARNING: User role is not "admin"!');
                console.log('   Fixing role...');
                adminUser.role = 'admin';
                await adminUser.save();
                console.log('   ✓ Role fixed to "admin"');
            }
        } else {
            console.log('❌ No admin user found!');
            console.log('   Run: node reset-admin.js admin admin123 Admin');
        }

        // List all users with admin role
        const allAdmins = await User.find({ role: 'admin' });
        console.log(`\n📊 Total admin users: ${allAdmins.length}`);
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkAdmin();

