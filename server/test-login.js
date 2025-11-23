const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

async function testLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/playtogether_hack');
        console.log('✓ Connected to MongoDB\n');

        const username = 'admin';
        const password = 'admin123';

        // Find user
        const user = await User.findOne({ 
            $or: [
                { phone: username },
                { username: username }
            ]
        }).select('+password');

        if (!user) {
            console.log('❌ User not found!');
            process.exit(1);
        }

        console.log('📝 User found:');
        console.log(`   ID: ${user._id}`);
        console.log(`   Phone: ${user.phone}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   IsActive: ${user.isActive}\n`);

        // Check password
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        console.log(`🔐 Password check: ${isPasswordValid ? '✓ Valid' : '✗ Invalid'}\n`);

        if (isPasswordValid) {
            // Generate token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET || 'secret_key_playtogether',
                { expiresIn: '30d' }
            );

            console.log('✅ Login successful!');
            console.log(`\n📋 Token: ${token.substring(0, 50)}...`);
            console.log(`\n📋 User data for client:`);
            console.log(JSON.stringify({
                _id: user._id,
                phone: user.phone,
                username: user.username || user.phone,
                name: user.name,
                balance: user.balance,
                role: user.role
            }, null, 2));
        } else {
            console.log('❌ Invalid password!');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testLogin();

