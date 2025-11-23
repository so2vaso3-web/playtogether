# 🎮 Play Together Hack Store

Full-stack web application for selling Play Together hack packages.

## 📁 Project Structure

```
playtogether-hack-store/
├── client/          # Next.js frontend + API routes
├── server/          # Express.js backend (legacy)
└── uploads/         # File uploads directory
```

## 🚀 Quick Start

### Client (Next.js - Recommended for Vercel)

```bash
cd client
npm install
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and JWT secret
npm run dev
```

Visit: http://localhost:3000

### Server (Express.js - Legacy)

```bash
cd server
npm install
# Setup .env file
npm run dev
```

Visit: http://localhost:5000

## 🌐 Deploy to Vercel

The **client** folder contains a Next.js app optimized for Vercel deployment.

See [client/README.md](./client/README.md) for detailed deployment instructions.

### Quick Deploy Steps:

1. Push code to GitHub
2. Import to Vercel
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXTAUTH_URL`
4. Deploy!

## 📝 Features

- ✅ User Authentication
- ✅ Package Management
- ✅ Payment System
- ✅ User Dashboard
- ✅ Transaction History
- ✅ Responsive Design

## 🛠️ Tech Stack

**Client (Next.js)**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- MongoDB + Mongoose
- JWT Authentication

**Server (Express - Legacy)**
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

## 📄 License

MIT License





