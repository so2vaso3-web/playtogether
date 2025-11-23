# 🗄️ Hướng Dẫn Tạo MongoDB Atlas (5 phút)

## Bước 1: Đăng ký MongoDB Atlas
1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Đăng ký miễn phí (FREE tier)
3. Xác nhận email

## Bước 2: Tạo Cluster
1. Sau khi đăng nhập, chọn **"Build a Database"**
2. Chọn **FREE** tier (M0 Sandbox)
3. Chọn Cloud Provider: **AWS** (hoặc bất kỳ)
4. Chọn Region: **Singapore (ap-southeast-1)** - gần Việt Nam nhất
5. Đặt tên cluster: `playtogether-cluster` (hoặc tùy ý)
6. Click **"Create Cluster"**
7. Đợi 3-5 phút để cluster khởi tạo

## Bước 3: Tạo Database User
1. Sau khi cluster tạo xong, sẽ hiện popup **"Create Database User"**
2. Authentication Method: **Password**
3. Username: nhập username (ví dụ: `playtogether_user`)
4. Password: nhập password mạnh (SAVE LẠI PASSWORD - sẽ dùng sau!)
5. Click **"Create Database User"**

## Bước 4: Whitelist IP Address
1. Tiếp theo sẽ hiện **"Network Access"**
2. Click **"Add My Current IP Address"** (nếu muốn)
3. Hoặc click **"Allow Access from Anywhere"** (0.0.0.0/0) - khuyến nghị cho production
4. Click **"Finish and Close"**

## Bước 5: Lấy Connection String
1. Vào **"Database"** → Click **"Connect"** trên cluster của bạn
2. Chọn **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy connection string, nó sẽ có dạng:
   ```
   mongodb+srv://<username>:<password>@playtogether-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Bước 6: Tạo Connection String cho Project
1. Thay `<username>` bằng username bạn đã tạo (ví dụ: `playtogether_user`)
2. Thay `<password>` bằng password bạn đã lưu
3. Thay phần sau `@` nếu cần, hoặc giữ nguyên
4. Thêm tên database vào cuối: `/playtogether_hack`

**Ví dụ kết quả cuối cùng:**
```
mongodb+srv://playtogether_user:yourpassword123@playtogether-cluster.xxxxx.mongodb.net/playtogether_hack?retryWrites=true&w=majority
```

## ✅ Copy Connection String này vào Vercel Environment Variable:
- **Key:** `MONGODB_URI`
- **Value:** (connection string bạn vừa tạo)

---

**Lưu ý quan trọng:**
- ⚠️ Lưu lại username và password ở nơi an toàn
- ⚠️ Connection string chứa password, không chia sẻ công khai
- ✅ FREE tier có 512MB storage - đủ cho project nhỏ
- ✅ FREE tier có giới hạn nhưng đủ cho development và testing

