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

async function cleanupAdmins() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/playtogether_hack');
        console.log('✓ Connected to MongoDB\n');

        // Find all admin users
        const allAdmins = await User.find({ role: 'admin' });
        console.log(`📊 Found ${allAdmins.length} admin users:\n`);
        
        allAdmins.forEach((admin, index) => {
            console.log(`${index + 1}. Phone: ${admin.phone}, Username: ${admin.username}, Name: ${admin.name}`);
        });

        // Keep only the "admin" user, remove others
        const keepAdmin = await User.findOne({ 
            $or: [
                { phone: 'admin' },
                { username: 'admin' }
            ]
        });

        if (keepAdmin) {
            console.log(`\n✓ Keeping admin user: ${keepAdmin.phone}`);
            
            // Remove other admin users
            const deleted = await User.deleteMany({ 
                role: 'admin',
                _id: { $ne: keepAdmin._id }
            });
            
            console.log(`✓ Removed ${deleted.deletedCount} other admin users`);
        } else {
            console.log('\n⚠️  No "admin" user found!');
        }

        // Final check
        const remainingAdmins = await User.find({ role: 'admin' });
        console.log(`\n📊 Remaining admin users: ${remainingAdmins.length}`);
        remainingAdmins.forEach((admin) => {
            console.log(`   - ${admin.phone} (${admin.username})`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanupAdmins();

