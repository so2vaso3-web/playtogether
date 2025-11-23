const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files

// ===== DATABASE CONNECTION =====
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/playtogether_hack')
    .then(() => console.log('✓ MongoDB Connected'))
    .catch(err => console.error('MongoDB Error:', err));

// ===== MODELS =====

// User Model
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

// Package Model
const packageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    duration: { type: Number, default: 30 }, // days
    features: [String],
    detailedFeatures: { type: mongoose.Schema.Types.Mixed, default: {} }, // GUI tính năng theo tab
    icon: String,
    popular: { type: Boolean, default: false },
    platform: { type: String, enum: ['android', 'ios', 'emulator', 'all'], default: 'all' },
    downloadUrl: String,
    systemRequirements: String,
    version: String,
    banRisk: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'medium' },
    antiBanGuarantee: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Package = mongoose.model('Package', packageSchema);

// UserPackage Model (purchased packages)
const userPackageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    expiresAt: Date,
    activatedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'expired'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const UserPackage = mongoose.model('UserPackage', userPackageSchema);

// Payment Model
const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['momo', 'zalopay', 'card', 'bank'], required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    transactionId: String,
    refCode: String,
    description: String,
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

// Transaction Model
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['deposit', 'purchase', 'refund'], required: true },
    amount: { type: Number, required: true },
    beforeBalance: Number,
    afterBalance: Number,
    description: String,
    relatedPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

// ===== MIDDLEWARE =====

const authMiddleware = (req, res, next) => {
    try {
        // Check multiple ways token can be sent
        let token = req.headers.authorization;
        
        // Handle "Bearer token" format
        if (token && token.startsWith('Bearer ')) {
            token = token.split(' ')[1];
        } else if (token && !token.includes(' ')) {
            // Token without Bearer prefix
            token = token;
        } else {
            // Try query parameter or body
            token = req.query.token || req.body.token;
        }
        
        if (!token) {
            console.error('[Auth] No token provided');
            return res.status(401).json({ message: 'Token không hợp lệ. Vui lòng đăng nhập lại.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_playtogether');
            req.userId = decoded.userId;
            next();
        } catch (jwtError) {
            console.error('[Auth] JWT Error:', jwtError.message);
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token đã hết hạn. Vui lòng đăng nhập lại.' });
            } else if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Token không hợp lệ. Vui lòng đăng nhập lại.' });
            }
            return res.status(401).json({ message: 'Token không hợp lệ. Vui lòng đăng nhập lại.' });
        }
    } catch (error) {
        console.error('[Auth] Middleware error:', error);
        res.status(401).json({ message: 'Lỗi xác thực. Vui lòng đăng nhập lại.' });
    }
};

const adminMiddleware = async (req, res, next) => {
    try {
        // Check multiple ways token can be sent
        let token = req.headers.authorization;
        
        // Handle "Bearer token" format
        if (token && token.startsWith('Bearer ')) {
            token = token.split(' ')[1];
        } else if (token && !token.includes(' ')) {
            // Token without Bearer prefix
            token = token;
        } else {
            // Try query parameter or body
            token = req.query.token || req.body.token;
        }
        
        if (!token) {
            console.error('[Admin] No token provided');
            return res.status(401).json({ message: 'Token không hợp lệ. Vui lòng đăng nhập lại.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_playtogether');
            const user = await User.findById(decoded.userId);
            
            if (!user) {
                console.error('[Admin] User not found:', decoded.userId);
                return res.status(403).json({ message: 'Không tìm thấy người dùng' });
            }
            
            if (user.role !== 'admin') {
                console.log(`[Admin] Access denied for user: ${user.phone || user.username}, role: ${user.role}`);
                return res.status(403).json({ message: 'Bạn không có quyền truy cập Admin Panel' });
            }
            
            req.userId = decoded.userId;
            next();
        } catch (jwtError) {
            console.error('[Admin] JWT Error:', jwtError.message);
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token đã hết hạn. Vui lòng đăng nhập lại.' });
            } else if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Token không hợp lệ. Vui lòng đăng nhập lại.' });
            }
            return res.status(401).json({ message: 'Token không hợp lệ. Vui lòng đăng nhập lại.' });
        }
    } catch (error) {
        console.error('[Admin] Middleware error:', error);
        res.status(401).json({ message: 'Lỗi xác thực. Vui lòng đăng nhập lại.' });
    }
};

// ===== ROUTES =====

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { phone, username, password, name } = req.body;
        
        // Accept both phone and username (username can be phone)
        const userPhone = phone || username;
        
        if (!userPhone || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        // Check if phone or username already exists
        const existingUser = await User.findOne({ 
            $or: [
                { phone: userPhone },
                { username: userPhone }
            ]
        });
        
        if (existingUser) {
            return res.status(400).json({ message: 'Số điện thoại/Username đã được đăng ký' });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        const newUser = new User({
            phone: userPhone,
            password: hashedPassword,
            username: username || userPhone,
            name: name || userPhone,
            balance: 0
        });

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET || 'secret_key_playtogether',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'Đăng ký thành công',
            user: {
                _id: newUser._id,
                phone: newUser.phone,
                name: newUser.name,
                balance: newUser.balance
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi đăng ký', error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { phone, username, password } = req.body;
        
        // Accept both phone and username (username is same as phone)
        const loginField = phone || username;
        
        if (!loginField || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        // Try to find user by phone or username
        const user = await User.findOne({ 
            $or: [
                { phone: loginField },
                { username: loginField }
            ]
        }).select('+password');
        
        if (!user) {
            return res.status(400).json({ message: 'Số điện thoại hoặc mật khẩu không đúng' });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Số điện thoại hoặc mật khẩu không đúng' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'secret_key_playtogether',
            { expiresIn: '30d' }
        );

        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        res.json({
            message: 'Đăng nhập thành công',
            user: {
                _id: user._id,
                phone: user.phone,
                username: user.username || user.phone,
                name: user.name,
                balance: user.balance,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi đăng nhập', error: error.message });
    }
});

// Get Packages
app.get('/api/packages', async (req, res) => {
    try {
        // Force fresh data - no cache
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        
        const packages = await Package.find().sort({ price: 1 });
        // Filter out packages with invalid data
        const validPackages = packages.filter(pkg => pkg.name && pkg.price !== undefined && pkg.price !== null);
        console.log(`[API Packages] Returning ${validPackages.length} valid packages out of ${packages.length}`);
        console.log(`[API Packages] Package names:`, validPackages.map(p => p.name));
        res.json(validPackages);
    } catch (error) {
        console.error('[API] Error getting packages:', error);
        res.status(500).json({ message: 'Lỗi lấy gói', error: error.message });
    }
});

// Get User Info
app.get('/api/user/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const userData = user.toObject();
        if (!userData.username) {
            userData.username = userData.phone;
        }
        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy thông tin', error: error.message });
    }
});

// Create Payment (Purchase Package)
app.post('/api/payments/create', authMiddleware, async (req, res) => {
    try {
        const { packageId } = req.body;

        if (!packageId) {
            return res.status(400).json({ message: 'Vui lòng chọn gói' });
        }

        console.log('[Payment] Creating purchase for package:', packageId, 'User:', req.userId);

        const selectedPackage = await Package.findById(packageId);
        if (!selectedPackage) {
            console.error('[Payment] Package not found:', packageId);
            return res.status(404).json({ message: 'Gói không tồn tại' });
        }

        // Check user balance
        const user = await User.findById(req.userId);
        if (!user) {
            console.error('[Payment] User not found:', req.userId);
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        console.log('[Payment] User balance:', user.balance, 'Package price:', selectedPackage.price);

        if (user.balance < selectedPackage.price) {
            return res.status(400).json({ 
                message: `Số dư không đủ! Bạn cần ${selectedPackage.price.toLocaleString('vi-VN')}₫ nhưng chỉ có ${user.balance.toLocaleString('vi-VN')}₫` 
            });
        }

        // Check if user already has this package active
        const existingPackage = await UserPackage.findOne({
            userId: req.userId,
            packageId: packageId,
            status: 'active',
            expiresAt: { $gt: new Date() }
        });

        if (existingPackage) {
            return res.status(400).json({ 
                message: 'Bạn đã sở hữu gói này. Vui lòng kiểm tra trong Dashboard.' 
            });
        }

        // Deduct balance immediately
        const beforeBalance = user.balance;
        user.balance -= selectedPackage.price;
        await user.save();
        console.log('[Payment] Balance deducted. Before:', beforeBalance, 'After:', user.balance);

        // Create user package
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (selectedPackage.duration || 30));

        const userPackage = new UserPackage({
            userId: req.userId,
            packageId: packageId,
            expiresAt: expiresAt,
            status: 'active',
            activatedAt: new Date()
        });
        await userPackage.save();
        console.log('[Payment] UserPackage created:', userPackage._id);

        // Create transaction record
        const transaction = new Transaction({
            userId: req.userId,
            type: 'purchase',
            amount: selectedPackage.price,
            beforeBalance: beforeBalance,
            afterBalance: user.balance,
            description: `Mua gói ${selectedPackage.name}`
        });
        await transaction.save();
        console.log('[Payment] Transaction created:', transaction._id);

        // Update user's current package
        user.currentPackage = userPackage._id;
        await user.save();

        res.json({
            message: 'Mua gói thành công!',
            userPackage: {
                _id: userPackage._id,
                packageId: userPackage.packageId,
                expiresAt: userPackage.expiresAt,
                status: userPackage.status
            },
            newBalance: user.balance,
            transaction: {
                _id: transaction._id,
                amount: transaction.amount
            }
        });
    } catch (error) {
        console.error('[Payment] Error:', error);
        res.status(500).json({ message: 'Lỗi mua gói: ' + error.message, error: error.message });
    }
});

// Confirm Payment
app.post('/api/payments/:paymentId/confirm', authMiddleware, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Thanh toán không tồn tại' });
        }

        // Update payment status
        payment.status = 'success';
        await payment.save();

        // Create user package
        const selectedPackage = await Package.findById(payment.packageId);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + selectedPackage.duration);

        const userPackage = new UserPackage({
            userId: req.userId,
            packageId: payment.packageId,
            expiresAt,
            status: 'active'
        });

        await userPackage.save();

        // Create transaction
        const user = await User.findById(req.userId);
        const beforeBalance = user.balance;
        const afterBalance = beforeBalance - payment.amount;

        const transaction = new Transaction({
            userId: req.userId,
            type: 'purchase',
            amount: payment.amount,
            beforeBalance,
            afterBalance,
            description: `Mua gói ${selectedPackage.name}`,
            relatedPaymentId: payment._id
        });

        await transaction.save();

        // Update user
        await User.findByIdAndUpdate(req.userId, {
            balance: afterBalance,
            currentPackage: userPackage._id
        });

        res.json({
            message: 'Thanh toán thành công',
            userPackage
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xác nhận thanh toán', error: error.message });
    }
});

// Get User Packages
app.get('/api/user/packages', authMiddleware, async (req, res) => {
    try {
        const userPackages = await UserPackage.find({ userId: req.userId })
            .populate('packageId')
            .sort({ createdAt: -1 });
        res.json(userPackages);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy gói', error: error.message });
    }
});

// Get Transactions
app.get('/api/user/transactions', authMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.userId })
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy giao dịch', error: error.message });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Play Together Hack Store API' });
});

// Get Settings (public)
app.get('/api/settings', async (req, res) => {
    try {
        // Get settings from database
        const settings = await Setting.find();
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        
        // Return settings with defaults
        res.json({
            siteName: settingsObj.siteName || 'PlayTogether Hack',
            siteDescription: settingsObj.siteDescription || 'Premium Gaming Tools',
            logoUrl: settingsObj.logoUrl || '',
            faviconUrl: settingsObj.faviconUrl || '',
            zaloQrUrl: settingsObj.zaloQrUrl || '',
            zaloId: settingsObj.zaloId || '',
            maintenance: settingsObj.maintenance || false,
            ...settingsObj
        });
    } catch (error) {
        // Return defaults if database error
        res.json({
            siteName: 'PlayTogether Hack',
            siteDescription: 'Premium Gaming Tools',
            logoUrl: '',
            faviconUrl: '',
            zaloQrUrl: '',
            zaloId: '',
            maintenance: false
        });
    }
});

// User Download
app.get('/api/user/download', authMiddleware, async (req, res) => {
    try {
        const { packageId } = req.query;
        const userPackage = await UserPackage.findOne({ 
            userId: req.userId, 
            packageId,
            status: 'active'
        }).populate('packageId');
        
        if (!userPackage) {
            return res.status(404).json({ message: 'Gói không tồn tại hoặc đã hết hạn' });
        }
        
        res.json({
            downloadUrl: userPackage.packageId?.downloadUrl || '#',
            licenseKey: `LIC-${userPackage._id.toString().substring(0, 8).toUpperCase()}`
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tải xuống', error: error.message });
    }
});

// ===== ADMIN ROUTES =====

// Admin Stats
app.get('/api/admin/stats', adminMiddleware, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPackages = await Package.countDocuments();
        const totalTransactions = await Transaction.countDocuments();
        const totalRevenue = await Transaction.aggregate([
            { $match: { type: 'deposit' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        res.json({
            totalUsers,
            totalPackages,
            totalTransactions,
            totalRevenue: totalRevenue[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy thống kê', error: error.message });
    }
});

// Admin Banks (CRUD)
const bankSchema = new mongoose.Schema({
    name: String,
    bankName: String, // Alias for name (for compatibility)
    bankCode: String, // Bank code for VietQR (e.g., VCB, TPB, TCB, vietinbank, etc.)
    accountNumber: String,
    accountName: String,
    qrCode: String, // Direct QR code image URL (if available)
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-save hook to sync name and bankName
bankSchema.pre('save', function(next) {
    if (this.bankName && !this.name) {
        this.name = this.bankName;
    }
    if (this.name && !this.bankName) {
        this.bankName = this.name;
    }
    next();
});

const Bank = mongoose.model('Bank', bankSchema);

// Helper function to detect bank code from bank name
const detectBankCodeFromName = (bankName) => {
    if (!bankName) return '';
    
    const bankNameToCode = {
        'vietinbank': 'vietinbank',
        'vietcombank': 'vietcombank',
        'bidv': 'bidv',
        'agribank': 'agribank',
        'acb': 'acb',
        'techcombank': 'techcombank',
        'mbbank': 'mbbank',
        'vpbank': 'vpbank',
        'tpbank': 'tpbank',
        'sacombank': 'sacombank',
        'vietin': 'vietinbank',
        'vcb': 'vietcombank',
        'vietcom': 'vietcombank',
        'tpb': 'tpbank',
        'mbb': 'mbbank',
        'tcb': 'techcombank',
        'shb': 'shb',
        'eximbank': 'eximbank',
        'hdbank': 'hdbank',
        'vib': 'vib',
        'msb': 'msb',
        'pvcombank': 'pvcombank',
        'ocb': 'ocb',
        'namabank': 'namabank',
        'vietabank': 'vietabank',
        'abbank': 'abbank',
        'pvb': 'pvcombank',
        'seabank': 'seabank',
        'publicbank': 'publicbank',
        'bacabank': 'bacabank',
        'scb': 'scb',
        'vietbank': 'vietbank',
        'baovietbank': 'baovietbank',
        'icb': 'icb',
        'indovina': 'icb',
        'indovinabank': 'icb',
        'ngân hàng': 'icb', // Default fallback
    };
    
    const normalized = bankName.toLowerCase().trim();
    
    // Exact match
    if (bankNameToCode[normalized]) {
        return bankNameToCode[normalized];
    }
    
    // Partial match
    for (const [key, code] of Object.entries(bankNameToCode)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return code;
        }
    }
    
    return '';
};

// Public API to get active banks (for deposit page)
app.get('/api/banks', async (req, res) => {
    try {
        const banks = await Bank.find({ isActive: true }).sort({ createdAt: -1 });
        console.log('[API Banks] Found', banks.length, 'active banks in database');
        
        // Ensure both name and bankName are set, and auto-detect bankCode if missing
        const mappedBanks = banks.map(bank => {
            const bankObj = bank.toObject();
            const bankName = bankObj.bankName || bankObj.name || 'Ngân hàng';
            let bankCode = (bankObj.bankCode || '').toString().trim().toLowerCase();
            const accountNumber = (bankObj.accountNumber || '').toString().trim();
            const accountName = bankObj.accountName || '';
            
            // Auto-detect bankCode ONLY if truly missing from database
            // Priority: Use bankCode from database > Auto-detect from name > Special case (3456345670)
            if (!bankCode && bankName) {
                bankCode = detectBankCodeFromName(bankName);
                if (bankCode) {
                    console.log('[API Banks] Auto-detected code:', bankCode, 'for:', bankName);
                }
            }
            
            // Special case: if account number is 3456345670 and STILL no bankCode, use ICB
            // This should rarely happen if bankCode is properly set in database
            if (accountNumber === '3456345670' && !bankCode) {
                bankCode = 'icb';
                console.log('[API Banks] Auto-detected ICB for account 3456345670 (fallback)');
            }
            
            const result = {
                ...bankObj,
                _id: bankObj._id,
                name: bankName,
                bankName: bankName,
                bankCode: bankCode,
                accountNumber: accountNumber,
                accountName: accountName,
                isActive: bankObj.isActive !== false
            };
            
            // Log banks without required info
            if (!result.bankCode || !result.accountNumber) {
                console.warn('[API Banks] Bank missing info:', {
                    _id: result._id,
                    name: result.bankName,
                    code: result.bankCode || 'MISSING',
                    account: result.accountNumber || 'MISSING',
                    canShowQR: false
                });
            } else {
                console.log('[API Banks] Bank OK:', {
                    _id: result._id,
                    name: result.bankName,
                    code: result.bankCode,
                    account: result.accountNumber,
                    canShowQR: true
                });
            }
            
            return result;
        });
        
        console.log('[API Banks] Returning', mappedBanks.length, 'banks');
        const banksWithQR = mappedBanks.filter(b => b.bankCode && b.accountNumber);
        console.log('[API Banks] Banks with QR capability:', banksWithQR.length);
        
        res.json(mappedBanks);
    } catch (error) {
        console.error('[API Banks] Error:', error);
        res.status(500).json({ message: 'Lỗi lấy danh sách ngân hàng', error: error.message });
    }
});

app.get('/api/admin/banks', adminMiddleware, async (req, res) => {
    try {
        const banks = await Bank.find().sort({ createdAt: -1 });
        res.json(banks);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách ngân hàng', error: error.message });
    }
});

app.post('/api/admin/banks', adminMiddleware, async (req, res) => {
    try {
        // Ensure both name and bankName are set, and bankCode is lowercase
        const bankName = req.body.bankName || req.body.name || 'Ngân hàng';
        let bankCode = req.body.bankCode ? req.body.bankCode.toLowerCase().trim() : '';
        
        // Auto-detect bankCode if not provided
        if (!bankCode && bankName) {
            bankCode = detectBankCodeFromName(bankName);
            console.log('[API] Auto-detected bankCode:', bankCode, 'from bankName:', bankName);
        }
        
        const bankData = {
            ...req.body,
            name: bankName,
            bankName: bankName,
            bankCode: bankCode,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        };
        
        console.log('[API] Creating bank:', bankData);
        
        const bank = new Bank(bankData);
        await bank.save();
        console.log('[API] Bank created:', bank.name, 'Code:', bank.bankCode, 'Account:', bank.accountNumber);
        res.json(bank);
    } catch (error) {
        console.error('[API] Error creating bank:', error);
        res.status(500).json({ message: 'Lỗi tạo ngân hàng', error: error.message });
    }
});

app.put('/api/admin/banks/:id', adminMiddleware, async (req, res) => {
    try {
        // Ensure both name and bankName are set, and bankCode is lowercase
        const bankName = req.body.bankName || req.body.name;
        let bankCode = req.body.bankCode ? req.body.bankCode.toLowerCase().trim() : req.body.bankCode;
        
        // Auto-detect bankCode if not provided but bankName changed
        if (!bankCode && bankName) {
            bankCode = detectBankCodeFromName(bankName);
            console.log('[API] Auto-detected bankCode:', bankCode, 'from bankName:', bankName);
        }
        
        const updateData = {
            ...req.body,
        };
        if (bankName) {
            updateData.name = bankName;
            updateData.bankName = bankName;
        }
        if (bankCode !== undefined) {
            updateData.bankCode = bankCode;
        }
        
        console.log('[API] Updating bank:', req.params.id, updateData);
        
        const bank = await Bank.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!bank) {
            return res.status(404).json({ message: 'Ngân hàng không tồn tại' });
        }
        console.log('[API] Bank updated:', bank.name, 'Code:', bank.bankCode, 'Account:', bank.accountNumber);
        res.json(bank);
    } catch (error) {
        console.error('[API] Error updating bank:', error);
        res.status(500).json({ message: 'Lỗi cập nhật ngân hàng', error: error.message });
    }
});

app.delete('/api/admin/banks/:id', adminMiddleware, async (req, res) => {
    try {
        await Bank.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa ngân hàng', error: error.message });
    }
});

// Admin Deposits
const depositSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    bankId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bank' },
    transactionCode: String,
    image: String,
    method: String,
    transferContent: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    note: String
}, { timestamps: true });
const Deposit = mongoose.model('Deposit', depositSchema);

// Create Deposit Request (Public - requires auth)
app.post('/api/deposits/create', authMiddleware, async (req, res) => {
    try {
        const { amount, method, transferContent, bankId } = req.body;
        
        if (!amount || amount < 10000) {
            return res.status(400).json({ message: 'Số tiền tối thiểu là 10,000₫' });
        }

        const deposit = new Deposit({
            userId: req.userId,
            amount: Number(amount),
            method: method || 'Bank Transfer',
            transferContent: transferContent || '',
            bankId: bankId || null,
            status: 'pending'
        });

        await deposit.save();
        
        res.json({
            message: 'Yêu cầu nạp tiền đã được tạo',
            deposit
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo yêu cầu nạp tiền', error: error.message });
    }
});

app.get('/api/admin/deposits', adminMiddleware, async (req, res) => {
    try {
        const deposits = await Deposit.find()
            .populate('userId', 'phone name')
            .populate('bankId')
            .sort({ createdAt: -1 });
        res.json(deposits);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách nạp tiền', error: error.message });
    }
});

app.post('/api/admin/deposits/:id/approve', adminMiddleware, async (req, res) => {
    try {
        const deposit = await Deposit.findById(req.params.id).populate('userId');
        if (!deposit) {
            return res.status(404).json({ message: 'Không tìm thấy yêu cầu nạp tiền' });
        }
        
        deposit.status = 'approved';
        await deposit.save();
        
        // Update user balance
        const user = await User.findById(deposit.userId._id);
        const beforeBalance = user.balance;
        const afterBalance = beforeBalance + deposit.amount;
        
        await User.findByIdAndUpdate(deposit.userId._id, { balance: afterBalance });
        
        // Create transaction
        await Transaction.create({
            userId: deposit.userId._id,
            type: 'deposit',
            amount: deposit.amount,
            beforeBalance,
            afterBalance,
            description: `Nạp tiền - ${deposit.transactionCode || ''}`
        });
        
        res.json({ message: 'Duyệt thành công', deposit });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi duyệt nạp tiền', error: error.message });
    }
});

app.post('/api/admin/deposits/:id/reject', adminMiddleware, async (req, res) => {
    try {
        const deposit = await Deposit.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', note: req.body.note || '' },
            { new: true }
        );
        res.json({ message: 'Từ chối thành công', deposit });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi từ chối nạp tiền', error: error.message });
    }
});

// Admin Packages (CRUD)
app.get('/api/admin/packages', adminMiddleware, async (req, res) => {
    try {
        const packages = await Package.find().sort({ createdAt: -1 });
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách gói', error: error.message });
    }
});

app.post('/api/admin/packages', adminMiddleware, async (req, res) => {
    try {
        // Ensure required fields
        const packageData = {
            name: req.body.name || 'Gói không tên',
            description: req.body.description || '',
            price: Number(req.body.price) || 0,
            duration: Number(req.body.duration) || 30,
            features: Array.isArray(req.body.features) ? req.body.features : [],
            icon: req.body.icon || '',
            popular: req.body.popular || false,
            ...req.body
        };
        
        const pkg = new Package(packageData);
        await pkg.save();
        console.log('[API] Package created:', pkg.name, pkg.price);
        res.json(pkg);
    } catch (error) {
        console.error('[API] Error creating package:', error);
        res.status(500).json({ message: 'Lỗi tạo gói', error: error.message });
    }
});

app.put('/api/admin/packages/:id', adminMiddleware, async (req, res) => {
    try {
        // Ensure required fields
        const updateData = {
            ...req.body,
            price: req.body.price !== undefined ? Number(req.body.price) : undefined,
            duration: req.body.duration !== undefined ? Number(req.body.duration) : undefined,
        };
        
        const pkg = await Package.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!pkg) {
            return res.status(404).json({ message: 'Gói không tồn tại' });
        }
        console.log('[API] Package updated:', pkg.name, pkg.price);
        res.json(pkg);
    } catch (error) {
        console.error('[API] Error updating package:', error);
        res.status(500).json({ message: 'Lỗi cập nhật gói', error: error.message });
    }
});

app.delete('/api/admin/packages/:id', adminMiddleware, async (req, res) => {
    try {
        await Package.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa gói', error: error.message });
    }
});

// Admin Settings
const settingSchema = new mongoose.Schema({
    key: { type: String, unique: true, required: true },
    value: mongoose.Schema.Types.Mixed
}, { timestamps: true });
const Setting = mongoose.model('Setting', settingSchema);

app.get('/api/admin/settings', adminMiddleware, async (req, res) => {
    try {
        const settings = await Setting.find();
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        res.json(settingsObj);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy cài đặt', error: error.message });
    }
});

app.put('/api/admin/settings', adminMiddleware, async (req, res) => {
    try {
        for (const [key, value] of Object.entries(req.body)) {
            await Setting.findOneAndUpdate(
                { key },
                { key, value },
                { upsert: true, new: true }
            );
        }
        
        // Return updated settings
        const settings = await Setting.find();
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        
        res.json({
            message: 'Cập nhật thành công',
            ...settingsObj
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật cài đặt', error: error.message });
    }
});

// Admin Upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
        const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép file ảnh (PNG, JPG, SVG, etc.)'));
        }
    }
});

app.use('/public', express.static('public'));

app.post('/api/admin/upload', adminMiddleware, upload.single('file'), (req, res) => {
    try {
        console.log('[Upload] Request received');
        console.log('[Upload] Headers:', req.headers);
        console.log('[Upload] Body keys:', Object.keys(req.body || {}));
        console.log('[Upload] File:', req.file ? {
            originalname: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
        } : 'NO FILE');

        if (!req.file) {
            console.error('[Upload] No file received');
            return res.status(400).json({ message: 'Không có file được upload. Vui lòng kiểm tra lại.' });
        }

        // Return URL that works with Next.js proxy
        const fileUrl = `/api/public/uploads/${req.file.filename}`;
        console.log('[Upload] Success:', fileUrl);
        
        res.json({
            url: fileUrl,
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size
        });
    } catch (error) {
        console.error('[Upload] Error:', error);
        res.status(500).json({ message: 'Lỗi upload: ' + error.message, error: error.message });
    }
});

// Error handler for multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File quá lớn. Tối đa 5MB' });
        }
        return res.status(400).json({ message: 'Lỗi upload: ' + error.message });
    }
    if (error) {
        return res.status(400).json({ message: error.message || 'Lỗi upload file' });
    }
    next();
});

// Admin Tickets
const ticketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: String,
    message: String,
    status: { type: String, enum: ['open', 'closed', 'pending'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    replies: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        isAdmin: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });
const Ticket = mongoose.model('Ticket', ticketSchema);

app.get('/api/admin/tickets', adminMiddleware, async (req, res) => {
    try {
        const { status } = req.query;
        const query = status && status !== 'all' ? { status } : {};
        const tickets = await Ticket.find(query)
            .populate('userId', 'phone name')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách ticket', error: error.message });
    }
});

// Admin Users
app.get('/api/admin/users', adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách người dùng', error: error.message });
    }
});

app.put('/api/admin/users/:id', adminMiddleware, async (req, res) => {
    try {
        const { name, balance, role, isActive } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (balance !== undefined) updateData.balance = balance;
        if (role !== undefined) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật người dùng', error: error.message });
    }
});

app.delete('/api/admin/users/:id', adminMiddleware, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Xóa thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa người dùng', error: error.message });
    }
});

// Tickets Routes
// GET - Get all tickets for user or all tickets for admin
app.get('/api/tickets', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        if (user.role === 'admin') {
            // Admin sees all tickets
            const tickets = await Ticket.find()
                .populate('userId', 'username phone name')
                .populate('replies.userId', 'username phone name role')
                .sort({ createdAt: -1 });
            return res.json(tickets);
        } else {
            // User sees only their tickets
            const tickets = await Ticket.find({ userId: req.userId })
                .populate('userId', 'username phone name')
                .populate('replies.userId', 'username phone name role')
                .sort({ createdAt: -1 });
            return res.json(tickets);
        }
    } catch (error) {
        console.error('[API Tickets] Error:', error);
        res.status(500).json({ message: 'Lỗi lấy tickets', error: error.message });
    }
});

// POST - Create new ticket
app.post('/api/tickets', authMiddleware, async (req, res) => {
    try {
        const { subject, message, priority } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ message: 'Subject và message là bắt buộc' });
        }

        const ticket = await Ticket.create({
            userId: req.userId,
            subject,
            message,
            priority: priority || 'medium',
            status: 'open',
            replies: []
        });

        const populatedTicket = await Ticket.findById(ticket._id)
            .populate('userId', 'username phone name')
            .populate('replies.userId', 'username phone name role');

        res.json({
            message: 'Ticket đã được tạo thành công',
            ticket: populatedTicket
        });
    } catch (error) {
        console.error('[API Tickets] Error:', error);
        res.status(500).json({ message: 'Lỗi tạo ticket', error: error.message });
    }
});

app.get('/api/tickets/:id', authMiddleware, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('userId', 'phone name')
            .populate('replies.userId', 'phone name role');
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy ticket', error: error.message });
    }
});

app.post('/api/tickets/:id/response', authMiddleware, async (req, res) => {
    try {
        const { message } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket không tồn tại' });
        }
        
        const user = await User.findById(req.userId);
        const isAdmin = user && user.role === 'admin';
        
        ticket.replies.push({
            userId: req.userId,
            message,
            isAdmin: isAdmin,
            createdAt: new Date()
        });
        
        await ticket.save();
        
        const updatedTicket = await Ticket.findById(req.params.id)
            .populate('userId', 'username phone name')
            .populate('replies.userId', 'username phone name role');
        
        res.json(updatedTicket);
    } catch (error) {
        console.error('[API Tickets Response] Error:', error);
        res.status(500).json({ message: 'Lỗi gửi phản hồi', error: error.message });
    }
});

// Favicon
app.get('/api/favicon', (req, res) => {
    res.status(404).json({ message: 'Favicon not found' });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
});

// ===== SERVER START =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api`);
});

module.exports = app;
