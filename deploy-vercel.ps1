# Script tự động deploy lên Vercel
Write-Host "🚀 Bắt đầu deploy lên Vercel..." -ForegroundColor Green

# Di chuyển vào thư mục client
Set-Location client

# Kiểm tra Vercel CLI
Write-Host "📦 Kiểm tra Vercel CLI..." -ForegroundColor Yellow
$vercelVersion = vercel --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vercel CLI chưa được cài đặt. Đang cài đặt..." -ForegroundColor Red
    npm install -g vercel
}

Write-Host "✅ Vercel CLI: $vercelVersion" -ForegroundColor Green

# Login Vercel (nếu chưa login)
Write-Host "🔐 Kiểm tra đăng nhập Vercel..." -ForegroundColor Yellow
vercel whoami 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Chưa đăng nhập Vercel. Vui lòng đăng nhập..." -ForegroundColor Yellow
    Write-Host "   Mở trình duyệt và đăng nhập..." -ForegroundColor Cyan
    vercel login
}

# Deploy
Write-Host "🚀 Bắt đầu deploy..." -ForegroundColor Green
Write-Host "   Project sẽ được deploy với cấu hình mặc định" -ForegroundColor Cyan
Write-Host "   Root Directory: client" -ForegroundColor Cyan
Write-Host "   Framework: Next.js" -ForegroundColor Cyan

vercel --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deploy thành công!" -ForegroundColor Green
    Write-Host "📝 Lưu ý: Cần thêm Environment Variables trong Vercel Dashboard:" -ForegroundColor Yellow
    Write-Host "   - MONGODB_URI" -ForegroundColor Cyan
    Write-Host "   - JWT_SECRET" -ForegroundColor Cyan
    Write-Host "   - NODE_ENV=production" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deploy thất bại. Vui lòng kiểm tra lỗi ở trên." -ForegroundColor Red
}

Set-Location ..

