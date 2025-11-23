# 🚀 Hướng Dẫn Deploy Lên Vercel

## Bước 1: Chuẩn bị Code

1. **Đảm bảo code đã sẵn sàng:**
   ```bash
   cd client
   npm install
   npm run build  # Kiểm tra build thành công
   ```

2. **Commit và push lên GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

## Bước 2: Setup MongoDB Atlas (Nếu chưa có)

1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo tài khoản miễn phí
3. Tạo cluster mới (chọn FREE tier)
4. Tạo database user:
   - Database Access → Add New Database User
   - Username/Password → Save
5. Whitelist IP:
   - Network Access → Add IP Address
   - Chọn "Allow Access from Anywhere" (0.0.0.0/0) cho production
6. Lấy connection string:
   - Clusters → Connect → Connect your application
   - Copy connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/playtogether_hack
   ```

## Bước 3: Deploy lên Vercel

### Option A: Deploy qua GitHub (Khuyên dùng)

1. **Truy cập [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Đăng nhập** với GitHub
3. **Click "Add New Project"**
4. **Import Repository:**
   - Chọn repository `playtogether-hack-store`
   - Click "Import"
5. **Configure Project:**
   - **Root Directory:** `client` (quan trọng!)
   - **Framework Preset:** Next.js (auto-detect)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next` (mặc định)
6. **Environment Variables:**
   Thêm các biến sau:
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/playtogether_hack
   JWT_SECRET = your_super_secret_jwt_key_at_least_32_characters
   NEXTAUTH_URL = https://your-app-name.vercel.app
   NODE_ENV = production
   ```
7. **Click "Deploy"**
8. Đợi build hoàn tất (2-5 phút)
9. Copy URL deployment (vd: `https://playtogether-hack.vercel.app`)

### Option B: Deploy qua Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Navigate to client folder:**
   ```bash
   cd client
   ```

4. **Deploy:**
   ```bash
   vercel
   ```
   
5. **Follow prompts:**
   - Set up and deploy? **Y**
   - Which scope? Chọn account
   - Link to existing project? **N** (first time)
   - Project name? `playtogether-hack-store`
   - Directory? `./`
   - Override settings? **N**

6. **Add environment variables:**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add NEXTAUTH_URL
   ```

7. **Redeploy with env vars:**
   ```bash
   vercel --prod
   ```

## Bước 4: Cập nhật Environment Variables (Sau khi deploy)

1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Update `NEXTAUTH_URL` với URL thực tế của bạn:
   ```
   NEXTAUTH_URL = https://your-actual-url.vercel.app
   ```
3. Redeploy:
   - Vercel Dashboard → Deployments → ... → Redeploy

## Bước 5: Test Deployment

1. Truy cập URL: `https://your-app.vercel.app`
2. Test các chức năng:
   - ✅ Trang chủ load được
   - ✅ Đăng ký user mới
   - ✅ Đăng nhập
   - ✅ Xem packages
   - ✅ Mua package (test)
   - ✅ Dashboard hoạt động

## Bước 6: Seed Data (Tùy chọn)

Để tạo packages mẫu, bạn có thể:

**Option 1: Tạo packages qua MongoDB Atlas:**
- Truy cập MongoDB Atlas → Collections
- Add sample documents vào collection `packages`

**Option 2: Tạo API endpoint để seed:**
- Tạo `/api/admin/seed` endpoint (chỉ cho admin)
- Gọi endpoint này một lần sau khi deploy

**Option 3: Sử dụng MongoDB Compass hoặc mongo shell:**
```javascript
db.packages.insertMany([
  {
    name: 'Gói Cơ Bản',
    description: 'Gói hack cơ bản',
    price: 50000,
    duration: 7,
    features: ['God Mode', 'Speed Hack'],
    icon: '🎮',
    popular: false
  },
  // ... more packages
])
```

## 🔧 Troubleshooting

### Build Failed
- **Lỗi:** `MongoDB connection failed`
- **Giải pháp:** Kiểm tra `MONGODB_URI` trong Environment Variables

### API Routes Not Working
- **Lỗi:** `500 Internal Server Error`
- **Giải pháp:** 
  - Check Vercel Function Logs (Dashboard → Deployments → Functions)
  - Đảm bảo MongoDB connection string đúng
  - Kiểm tra JWT_SECRET đã được set

### Environment Variables Not Working
- **Lỗi:** `undefined` values
- **Giải pháp:**
  - Redeploy sau khi thêm env vars
  - Đảm bảo env vars được set cho **Production**, **Preview**, và **Development**

### CORS Issues
- **Lỗi:** CORS errors
- **Giải pháp:** Next.js API routes không cần CORS config, nhưng nếu dùng external API, thêm vào `next.config.js`

## 📝 Custom Domain (Tùy chọn)

1. Vào Vercel Dashboard → Project → Settings → Domains
2. Add domain của bạn
3. Update DNS records theo hướng dẫn
4. Update `NEXTAUTH_URL` = domain mới

## 🎉 Done!

Website của bạn đã sẵn sàng tại: `https://your-app.vercel.app`

---

**Lưu ý quan trọng:**
- ✅ Root Directory phải là `client` (không phải root project)
- ✅ Environment Variables phải được set đúng
- ✅ MongoDB Atlas network access phải cho phép từ mọi IP (0.0.0.0/0)
- ✅ JWT_SECRET nên là chuỗi ngẫu nhiên ít nhất 32 ký tự





