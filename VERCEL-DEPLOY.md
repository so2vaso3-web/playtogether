# Hướng Dẫn Deploy Lên Vercel

## Bước 1: Kết nối GitHub với Vercel

1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
2. Đăng nhập bằng GitHub account
3. Click **"Add New Project"**
4. Chọn repository `so2vaso3-web/playtogether`
5. Click **"Import"**

## Bước 2: Cấu hình Project Settings

### Root Directory
- Set **Root Directory** = `client` (vì Next.js app nằm trong thư mục `client`)

### Framework Preset
- Framework: **Next.js**
- Build Command: `npm run build` (hoặc để mặc định)
- Output Directory: `.next` (hoặc để mặc định)
- Install Command: `npm install` (hoặc để mặc định)

## Bước 3: Environment Variables

Thêm các biến môi trường sau trong Vercel Dashboard:

### Required Variables:
```
MONGODB_URI=mongodb://localhost:27017/playtogether_hack
# Hoặc MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/playtogether_hack

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

### Optional Variables:
```
API_BASE_URL=https://your-backend-url.vercel.app
# Hoặc nếu backend chạy riêng:
# API_BASE_URL=http://localhost:5000
```

## Bước 4: Deploy Backend Server (Tùy chọn)

Nếu muốn chạy backend trên Vercel, bạn có thể:

### Option 1: Deploy Backend riêng
1. Tạo project mới trên Vercel
2. Root Directory: `server`
3. Build Command: (để trống hoặc `npm install`)
4. Output Directory: `server`
5. Install Command: `npm install`
6. Add environment variables như trên

### Option 2: Sử dụng Vercel Serverless Functions
- Backend API đã được proxy qua Next.js API routes trong `client/app/api/[...path]/route.ts`
- Chỉ cần deploy client folder là đủ

## Bước 5: Deploy

1. Click **"Deploy"**
2. Chờ build và deploy hoàn tất
3. Vercel sẽ cung cấp URL như: `https://playtogether.vercel.app`

## Bước 6: Cấu hình MongoDB Atlas (Nếu dùng cloud)

1. Tạo MongoDB Atlas account tại [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster miễn phí
3. Tạo database user
4. Whitelist IP: `0.0.0.0/0` (cho phép tất cả IP)
5. Copy connection string và thêm vào Vercel Environment Variables

## Lưu ý quan trọng:

1. **Backend Server**: Hiện tại backend chạy trên Express.js (port 5000). Bạn có 2 lựa chọn:
   - Deploy backend riêng trên Vercel hoặc Railway/Render
   - Hoặc chuyển toàn bộ logic sang Next.js API routes (đã có sẵn)

2. **File Uploads**: Files upload sẽ cần lưu vào cloud storage (S3, Cloudinary, etc.) thay vì local storage

3. **Database**: Nên dùng MongoDB Atlas thay vì local MongoDB

4. **Environment Variables**: Đảm bảo tất cả biến môi trường đã được thêm vào Vercel

## Troubleshooting:

- Nếu build fail, check logs trong Vercel Dashboard
- Đảm bảo `package.json` có đầy đủ dependencies
- Check xem có lỗi TypeScript không
- Đảm bảo MongoDB connection string đúng format

