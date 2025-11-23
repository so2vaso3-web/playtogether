# 🎮 Play Together Hack Store

Web application for selling Play Together hack packages built with Next.js 14, TypeScript, Tailwind CSS, and MongoDB.

## ✨ Features

- ✅ User Authentication (Register/Login)
- ✅ Package Management
- ✅ Payment System (MoMo, ZaloPay, Card, Bank)
- ✅ User Dashboard
- ✅ Transaction History
- ✅ Purchase Packages
- ✅ Responsive Design

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd playtogether-hack-store/client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017/playtogether_hack
JWT_SECRET=your_secret_key_here_change_in_production
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Project Structure

```
client/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── packages/      # Package endpoints
│   │   ├── payments/      # Payment endpoints
│   │   └── user/          # User endpoints
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── register/          # Register page
│   └── packages/          # Package pages
├── components/            # React components
├── lib/                   # Utilities
│   ├── models/           # MongoDB models
│   ├── auth.ts           # Auth utilities
│   ├── db.ts             # Database connection
│   └── axios.ts          # Axios instance
└── public/               # Static files
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Packages
- `GET /api/packages` - Get all packages

### User
- `GET /api/user/profile` - Get user profile (auth required)
- `GET /api/user/packages` - Get user packages (auth required)
- `GET /api/user/transactions` - Get user transactions (auth required)

### Payments
- `POST /api/payments/create` - Create payment (auth required)
- `POST /api/payments/[id]/confirm` - Confirm payment (auth required)

### Health
- `GET /api/health` - Health check

## 🚀 Deploy to Vercel

### Method 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
cd client
vercel
```

### Method 2: Deploy via GitHub

1. Push your code to GitHub

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "New Project"

4. Import your GitHub repository

5. Configure Environment Variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key
   - `NEXTAUTH_URL` - Your Vercel deployment URL

6. Click "Deploy"

### Environment Variables on Vercel

Add these in your Vercel project settings:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_super_secret_jwt_key_here
NEXTAUTH_URL=https://your-app.vercel.app
NODE_ENV=production
```

## 📝 MongoDB Setup

### Option 1: Local MongoDB
```bash
# Install MongoDB locally
# Then use:
MONGODB_URI=mongodb://localhost:27017/playtogether_hack
```

### Option 2: MongoDB Atlas (Recommended for production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. Create a free cluster

3. Get your connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/playtogether_hack
```

4. Add to `.env.local`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/playtogether_hack
```

## 🔒 Security Notes

- Never commit `.env.local` file
- Use strong JWT_SECRET in production
- Enable MongoDB authentication
- Use HTTPS in production
- Rate limiting recommended for production

## 📄 License

MIT License

## 👨‍💻 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check MongoDB is running (if local)
- Verify MONGODB_URI is correct
- Check MongoDB Atlas network access (if using Atlas)

### Build Errors
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Check TypeScript errors

### API Routes Not Working
- Ensure MongoDB connection is established
- Check environment variables
- Verify JWT token is valid

## 📞 Support

For issues or questions, please open an issue on GitHub.





