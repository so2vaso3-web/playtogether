# 🚀 Deploy Tự Động Lên Vercel - Qua GitHub

## Cách Nhanh Nhất: Deploy Qua Vercel Dashboard

### Bước 1: Truy cập Vercel
1. Mở: https://vercel.com/new
2. Đăng nhập bằng GitHub account (cùng account với repo)

### Bước 2: Import Project
1. Click **"Import Git Repository"**
2. Chọn repository: `so2vaso3-web/playtogether`
3. Click **"Import"**

### Bước 3: Cấu Hình Project

**Project Settings:**
- **Project Name**: `playtogether` (hoặc tên bạn muốn)
- **Root Directory**: `client` ⚠️ **QUAN TRỌNG: Phải set là `client`**
- **Framework Preset**: Next.js (tự động detect)
- **Build Command**: `npm run build` (mặc định)
- **Output Directory**: `.next` (mặc định)
- **Install Command**: `npm install` (mặc định)

### Bước 4: Environment Variables

Click **"Environment Variables"** và thêm:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/playtogether_hack
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NODE_ENV=production
```

**Lưu ý:**
- `MONGODB_URI`: Cần tạo MongoDB Atlas (xem hướng dẫn bên dưới)
- `JWT_SECRET`: Tạo random key (xem bên dưới)

### Bước 5: Deploy
1. Click **"Deploy"**
2. Chờ 2-3 phút để build
3. Vercel sẽ cung cấp URL: `https://playtogether.vercel.app`

---

## 📦 Tạo MongoDB Atlas (Nếu chưa có)

### Bước 1: Đăng ký
1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Đăng ký account miễn phí

### Bước 2: Tạo Cluster
1. Chọn **"Build a Database"**
2. Chọn **FREE (M0)** tier
3. Chọn region gần nhất (Singapore, Tokyo, etc.)
4. Click **"Create"**

### Bước 3: Tạo Database User
1. Vào **"Database Access"** (menu bên trái)
2. Click **"Add New Database User"**
3. Chọn **"Password"** authentication
4. Username: `playtogether`
5. Password: Tạo password mạnh (lưu lại!)
6. Database User Privileges: **"Atlas admin"**
7. Click **"Add User"**

### Bước 4: Network Access
1. Vào **"Network Access"** (menu bên trái)
2. Click **"Add IP Address"**
3. Chọn **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### Bước 5: Lấy Connection String
1. Vào **"Database"** → Click **"Connect"** trên cluster
2. Chọn **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy connection string:
   ```
   mongodb+srv://playtogether:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Thay `<password>` bằng password đã tạo ở Bước 3
6. Thêm database name vào cuối:
   ```
   mongodb+srv://playtogether:yourpassword@cluster0.xxxxx.mongodb.net/playtogether_hack?retryWrites=true&w=majority
   ```

### Bước 6: Thêm vào Vercel
1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Thêm:
   - Key: `MONGODB_URI`
   - Value: Connection string đã copy (đã thay password)
3. Click **"Save"**

---

## 🔑 Tạo JWT Secret

### Cách 1: Online
Truy cập: https://generate-secret.vercel.app/32
Copy kết quả

### Cách 2: Terminal
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Thêm vào Vercel:
- Key: `JWT_SECRET`
- Value: Kết quả vừa tạo

---

## ✅ Sau Khi Deploy

1. **Redeploy**: Sau khi thêm Environment Variables, vào **Deployments** → Click **"..."** → **"Redeploy"**

2. **Kiểm tra**:
   - Truy cập URL Vercel cung cấp
   - Test đăng ký/đăng nhập
   - Test admin panel
   - Test các chức năng khác

3. **Custom Domain** (Tùy chọn):
   - Vào Settings → Domains
   - Thêm domain của bạn

---

## 🔄 Auto Deploy

Mỗi lần bạn push code lên GitHub, Vercel sẽ tự động deploy lại!

---

## ⚠️ Lưu Ý Quan Trọng

1. **Backend Server**: Hiện tại code đã có Next.js API routes proxy đến backend. Nếu backend chạy riêng, cần deploy backend trước hoặc set `API_BASE_URL`.

2. **File Uploads**: Files upload hiện tại lưu local. Cần chuyển sang cloud storage (S3, Cloudinary) cho production.

3. **Database**: Phải dùng MongoDB Atlas (cloud), không thể dùng local MongoDB.

---

## 🆘 Nếu Có Lỗi

1. Check **Deployment Logs** trong Vercel Dashboard
2. Kiểm tra Environment Variables đã đúng chưa
3. Kiểm tra MongoDB connection string
4. Check build errors trong logs

