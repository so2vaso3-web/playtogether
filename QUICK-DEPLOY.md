# ⚡ QUICK DEPLOY - 5 Phút

## Bước 1: Vercel Dashboard (2 phút)
1. Mở: https://vercel.com/new
2. Login bằng GitHub
3. Import repo: `so2vaso3-web/playtogether`
4. **QUAN TRỌNG**: Set **Root Directory = `client`**
5. Click **Deploy** (bỏ qua env vars tạm thời)

## Bước 2: MongoDB Atlas (2 phút)
1. Mở: https://mongodb.com/cloud/atlas/register
2. Tạo account FREE
3. Tạo cluster FREE
4. Database Access → Add User:
   - Username: `playtogether`
   - Password: (tự đặt, lưu lại)
5. Network Access → Add IP: `0.0.0.0/0`
6. Database → Connect → Connect your application
7. Copy connection string, thay `<password>` và thêm `/playtogether_hack` vào cuối

## Bước 3: Environment Variables (1 phút)
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Thêm:
   ```
   MONGODB_URI=mongodb+srv://playtogether:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/playtogether_hack?retryWrites=true&w=majority
   JWT_SECRET=your-random-32-char-secret-key-here
   NODE_ENV=production
   ```
3. Tạo JWT_SECRET: https://generate-secret.vercel.app/32

## Bước 4: Redeploy
1. Vercel Dashboard → Deployments
2. Click **"..."** → **"Redeploy"**
3. Chờ 2 phút

## ✅ Xong!
Truy cập URL Vercel cung cấp và test!

---

**Lưu ý**: Nếu có lỗi, check logs trong Vercel Dashboard.

