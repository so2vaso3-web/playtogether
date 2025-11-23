# 🚀 Hướng Dẫn Setup Vercel - Tự Động

## Bước 1: Chạy Script Deploy

```powershell
cd c:\Users\so2va\Downloads\playtogether-main\playtogether-main
.\deploy-vercel.ps1
```

Script sẽ:
- ✅ Kiểm tra và cài đặt Vercel CLI
- ✅ Yêu cầu đăng nhập Vercel (mở browser)
- ✅ Deploy project tự động

## Bước 2: Thêm Environment Variables

Sau khi deploy, vào Vercel Dashboard và thêm:

### Required Variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/playtogether_hack
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NODE_ENV=production
```

### Tạo MongoDB Atlas (Nếu chưa có):

1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Tạo account miễn phí
3. Tạo cluster (chọn FREE tier)
4. Tạo database user:
   - Username: `playtogether`
   - Password: (tự đặt, lưu lại)
5. Network Access: Thêm `0.0.0.0/0` (cho phép tất cả IP)
6. Database Access: Add user với quyền "Atlas admin"
7. Click "Connect" → "Connect your application"
8. Copy connection string, thay `<password>` bằng password đã tạo
9. Thêm vào Vercel Environment Variables

### Tạo JWT Secret:

```bash
# Tạo random secret key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy kết quả và thêm vào Vercel như `JWT_SECRET`.

## Bước 3: Redeploy

Sau khi thêm Environment Variables:
1. Vào Vercel Dashboard
2. Chọn project
3. Click "Redeploy" hoặc push code mới lên GitHub

## Bước 4: Kiểm Tra

1. Truy cập URL được Vercel cung cấp
2. Test các chức năng:
   - Đăng ký/Đăng nhập
   - Xem packages
   - Admin panel
   - Deposit

## Troubleshooting

### Lỗi Build:
- Check logs trong Vercel Dashboard
- Đảm bảo tất cả dependencies đã được install
- Check TypeScript errors

### Lỗi MongoDB Connection:
- Kiểm tra MongoDB Atlas connection string
- Đảm bảo IP whitelist đã thêm `0.0.0.0/0`
- Check username/password đúng

### Lỗi API:
- Kiểm tra `API_BASE_URL` environment variable
- Nếu backend chạy riêng, cần deploy backend trước

## Lưu Ý Quan Trọng:

⚠️ **Backend Server**: Hiện tại backend Express.js (port 5000) cần deploy riêng hoặc chuyển logic sang Next.js API routes.

**Giải pháp:**
- Option 1: Deploy backend riêng trên Railway/Render
- Option 2: Chuyển toàn bộ logic backend sang Next.js API routes (đã có sẵn proxy)

**Khuyến nghị**: Dùng Next.js API routes (đã có sẵn) để không cần deploy backend riêng.

