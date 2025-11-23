'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LogIn, User, Lock, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    setLoading(true);

    try {
      // Send both username and phone (username can be phone)
      const response = await axios.post('/api/auth/login', {
        username: formData.username,
        phone: formData.username, // Also send as phone for compatibility
        password: formData.password
      });
      // Ensure token is saved correctly
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('[Login] Token saved to localStorage');
      } else {
        console.error('[Login] No token in response:', response.data);
        toast.error('Không nhận được token từ server');
        return;
      }
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('[Login] User data saved:', response.data.user);
      }
      
      toast.success('Đăng nhập thành công!');
      
      // Small delay to ensure localStorage is saved
      setTimeout(() => {
        // Redirect admin to admin panel, regular users to home
        if (response.data.user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }, 100);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary relative flex items-center justify-center p-3 sm:p-4">
      <div className="animated-bg"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Logo size="sm" showText={true} />
          </Link>
        </div>

        <div className="gaming-card">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <LogIn className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Đăng Nhập</h1>
            <p className="text-sm sm:text-base text-gray-400">Chào mừng bạn quay trở lại</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-white mb-1.5 sm:mb-2 font-semibold flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="gaming-input w-full text-base"
                placeholder="Nhập username của bạn"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-1.5 sm:mb-2 font-semibold flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                Mật khẩu
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="gaming-input w-full text-base"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Đang xử lý...' : (
                <>
                  Đăng Nhập
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-400">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-primary hover:underline font-semibold">
                Đăng ký ngay
              </Link>
            </p>
            <Link 
              href="/" 
              className="block text-gray-400 hover:text-primary transition text-sm flex items-center justify-center gap-1"
            >
              ← Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
