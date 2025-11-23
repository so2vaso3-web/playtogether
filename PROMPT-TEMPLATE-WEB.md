# 🚀 PROMPT TEMPLATE: Tạo Web Store với Next.js + Vercel KV

Copy prompt này vào Cursor để tạo web store mới từ đầu, sau đó deploy lên Vercel.

---

## 📝 PROMPT CHO CURSOR:

```
Tạo một web store Next.js 14 với TypeScript theo yêu cầu sau:

## 🎯 YÊU CẦU CHÍNH:

### 1. Tech Stack:
- **Next.js 14** với App Router và TypeScript
- **Tailwind CSS** cho styling
- **Vercel KV** (Redis) làm database (KHÔNG dùng MongoDB)
- **JWT** cho authentication
- **bcryptjs** cho password hashing
- **Framer Motion** cho animations
- **React Hot Toast** cho notifications
- **Lucide React** cho icons

### 2. Cấu trúc Database (Vercel KV):
Tạo các KV models trong `lib/kv-models/`:
- **User**: id, username, password (hashed), name, balance, role (user/admin), currentPackage, isActive, lastLogin
- **Package**: id, name, description, price, duration (days), features[], detailedFeatures, icon, popular, isActive
- **Transaction**: id, userId, type (deposit/purchase/refund), amount, beforeBalance, afterBalance, description
- **DepositRequest**: id, userId, amount, method, status (pending/approved/rejected), description, adminNote
- **BankAccount**: id, bankName, bankCode, accountNumber, accountName, isActive, note
- **Ticket**: id, userId, title, message, status (open/pending/resolved/closed), priority, responses[]
- **SiteSettings**: logoUrl, faviconUrl, siteName, siteDescription, primaryColor, secondaryColor, zaloId, zaloQrUrl
- **License**: id, userId, packageId, licenseKey, expiresAt, isActive

### 3. Helper Files:
- `lib/kv-local.ts`: Local mock KV store với KV_PREFIXES constants
- `lib/kv.ts`: Wrapper cho Vercel KV, tự động dùng local mock nếu không có credentials
- `lib/kv-models/index.ts`: Export tất cả models
- `lib/auth.ts`: JWT authentication helper
- `lib/db.ts`: Database connection (health check cho KV)
- `lib/axios.ts`: Axios instance với auth token

### 4. API Routes (`app/api/`):

#### Auth:
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập, trả về JWT token

#### Packages:
- `GET /api/packages` - Lấy tất cả packages (public)
- `GET /api/admin/packages` - Lấy tất cả packages (admin)
- `POST /api/admin/packages` - Tạo package mới (admin)
- `PUT /api/admin/packages/[id]` - Cập nhật package (admin)
- `DELETE /api/admin/packages/[id]` - Xóa package (admin)

#### Payments & Transactions:
- `POST /api/payments/create` - Tạo transaction mua package
- `GET /api/user/transactions` - Lấy transactions của user
- `GET /api/user/packages` - Lấy packages đã mua

#### Deposits:
- `POST /api/user/deposits` - Tạo deposit request
- `GET /api/admin/deposits` - Lấy tất cả deposit requests (admin)
- `POST /api/admin/deposits/[id]/approve` - Duyệt deposit (admin)
- `POST /api/admin/deposits/[id]/reject` - Từ chối deposit (admin)

#### Bank Accounts:
- `GET /api/banks` - Lấy tất cả bank accounts (public)
- `POST /api/admin/banks` - Tạo bank account (admin)
- `PUT /api/admin/banks/[id]` - Cập nhật bank account (admin)
- `DELETE /api/admin/banks/[id]` - Xóa bank account (admin)

#### Tickets:
- `GET /api/tickets` - Lấy tickets của user
- `POST /api/tickets` - Tạo ticket mới
- `GET /api/tickets/[id]` - Lấy chi tiết ticket
- `POST /api/tickets/[id]/response` - Thêm response vào ticket

#### Users:
- `GET /api/user/profile` - Lấy profile hiện tại
- `PUT /api/user/profile` - Cập nhật profile
- `PUT /api/user/change-password` - Đổi mật khẩu
- `GET /api/admin/users` - Lấy tất cả users (admin)
- `PUT /api/admin/users/[id]` - Cập nhật user (admin)
- `DELETE /api/admin/users/[id]` - Xóa user (admin)

#### Settings:
- `GET /api/settings` - Lấy site settings (public)
- `PUT /api/settings` - Cập nhật settings (admin)
- `GET /api/favicon` - Lấy favicon
- `GET /api/admin/stats` - Lấy thống kê (admin)

#### Upload:
- `POST /api/admin/upload` - Upload file (admin only)

### 5. Frontend Pages:

#### Public:
- `/` - Trang chủ với packages, features, FAQ
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/packages` - Xem tất cả packages

#### User Dashboard (`/dashboard`):
- Overview: balance, current package, recent transactions
- Packages: danh sách packages đã mua
- Transactions: lịch sử giao dịch
- Deposits: nạp tiền
- Tickets: support tickets
- Profile: thông tin cá nhân

#### Admin Dashboard (`/admin`):
- Overview: stats (total users, revenue, deposits pending)
- Users: quản lý users
- Packages: CRUD packages
- Transactions: xem tất cả transactions
- Deposits: duyệt/từ chối deposits
- Banks: quản lý bank accounts
- Tickets: quản lý support tickets
- Settings: cấu hình site (logo, colors, zalo info)

### 6. UI/UX Requirements:

#### Design:
- **Dark theme** với purple/violet accent colors
- **Gradient backgrounds** cho hero sections
- **Glass morphism** effects cho cards
- **Smooth animations** với Framer Motion
- **Responsive design** (mobile-first)

#### Components cần tạo:
- `components/PlatformBadge` - Badge cho platform (Android/iOS/Emulator)
- `components/PackageCard` - Card hiển thị package
- `components/FeatureCard` - Card hiển thị feature
- `components/StatsCard` - Card hiển thị số liệu thống kê
- `components/FAQItem` - FAQ accordion item
- `components/ProtectedRoute` - Route protection wrapper
- `components/AdminRoute` - Admin-only route wrapper
- `hooks/useScrollDirection` - Hook detect scroll direction
- `hooks/useAuth` - Hook quản lý auth state

#### Pages Structure:
- Hero section với CTA buttons
- Platform filters (All/Android/iOS/Emulator)
- Package cards grid
- Features section
- Statistics section (Users count, Hacks count, Rating, Success rate)
- Support section (Zalo contact)
- FAQ section

### 7. Authentication Flow:
- JWT token stored in localStorage
- Token được gửi trong Authorization header
- Protected routes check token và role
- Auto redirect to /login nếu chưa authenticate
- Auto redirect to /dashboard nếu đã login

### 8. Environment Variables:
```
KV_REST_API_URL=<vercel_kv_url>
KV_REST_API_TOKEN=<vercel_kv_token>
JWT_SECRET=<random_secret_string>
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 9. Configuration Files:

#### `next.config.js`:
```javascript
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '.'),
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
}

module.exports = nextConfig
```

#### `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 10. Deployment:
- Code sẵn sàng deploy lên Vercel
- Không cần MongoDB, chỉ cần Vercel KV
- Tự động fallback về local mock KV khi dev local
- Environment variables cần set trên Vercel dashboard

### 11. Seed Data Script:
Tạo `scripts/seed-local.ts` để seed dữ liệu mẫu:
- 1 admin user (username: admin, password: admin123)
- 1 test user (username: test, password: test123)
- 3 packages mẫu (VIP 1 Month, VIP Premium 3 Months, Lifetime Elite)

## ⚠️ QUAN TRỌNG:
- **KHÔNG dùng MongoDB/Mongoose**, chỉ dùng Vercel KV
- Tất cả models phải import `KV_PREFIXES` từ `lib/kv-local.ts`
- Tất cả models phải import `kvHelpers` từ `lib/kv.ts`
- `lib/kv.ts` KHÔNG được export `KV_PREFIXES` (để tránh circular import)
- Dùng path alias `@/` cho tất cả imports
- Code phải sẵn sàng deploy lên Vercel ngay sau khi tạo xong

Tạo code đầy đủ, clean, và sẵn sàng production!
```

---

## 📋 CHECKLIST SAU KHI TẠO WEB:

- [ ] Kiểm tra tất cả imports dùng `@/` path alias
- [ ] Đảm bảo không có mongoose imports
- [ ] Kiểm tra tất cả KV models import đúng `KV_PREFIXES` từ `kv-local.ts`
- [ ] Test chạy `npm run dev` locally
- [ ] Test build `npm run build`
- [ ] Push code lên GitHub
- [ ] Setup Vercel KV database trên Vercel dashboard
- [ ] Thêm Environment Variables trên Vercel:
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
  - `JWT_SECRET`
- [ ] Deploy lên Vercel
- [ ] Test tất cả features sau khi deploy

---

## 🔗 LINKS HỮU ÍCH:

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Vercel KV Docs](https://vercel.com/docs/storage/vercel-kv)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Lưu ý:** Prompt này đã được tối ưu để tránh các lỗi thường gặp khi deploy lên Vercel. Code sẽ sẵn sàng production ngay sau khi tạo xong!

