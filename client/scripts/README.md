# Scripts

## Tạo Admin User

### Cách 1: Sử dụng script (Khuyên dùng)

```bash
cd client
npx ts-node scripts/create-admin.ts
```

Script sẽ tạo admin user với:
- Username: `admin`
- Password: `admin123`
- Role: `admin`

**Lưu ý:** Đổi mật khẩu sau lần đăng nhập đầu tiên!

### Cách 2: Chỉnh sửa username/password trong script

Mở file `scripts/create-admin.ts` và thay đổi:
```typescript
const adminData = {
  username: 'your_admin_username',
  password: 'your_secure_password',
  name: 'Administrator',
  role: 'admin' as const,
  balance: 0,
};
```

Sau đó chạy:
```bash
npx ts-node scripts/create-admin.ts
```

### Cách 3: Tạo thủ công qua MongoDB

1. Connect vào MongoDB (MongoDB Compass hoặc mongo shell)
2. Tìm collection `users`
3. Insert document mới:
```json
{
  "username": "admin",
  "password": "$2a$10$hashed_password_here",
  "name": "Administrator",
  "role": "admin",
  "balance": 0,
  "isActive": true
}
```

**Hoặc** update user hiện có:
```javascript
db.users.updateOne(
  { username: "your_username" },
  { $set: { role: "admin" } }
)
```

### Hash password để tạo thủ công

Nếu muốn tạo admin thủ công, bạn cần hash password trước. Chạy script này:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your_password', 10).then(hash => console.log(hash));"
```

## Seed Packages

Tạo sample packages:

```bash
npx ts-node scripts/seed.ts
```

## Lưu ý

- Đảm bảo MongoDB đang chạy
- Đảm bảo file `.env.local` có `MONGODB_URI`
- Admin có thể quản lý tất cả user và packages (khi có admin panel)





