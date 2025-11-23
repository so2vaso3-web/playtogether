'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserPlus, User, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
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
      // Send username as phone (username = phone in this system)
      const response = await axios.post('/api/auth/register', {
        phone: formData.username,
        username: formData.username,
        password: formData.password,
        name: formData.name || formData.username
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Đăng ký thành công!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
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
              <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Đăng Ký</h1>
            <p className="text-sm sm:text-base text-gray-400">Tạo tài khoản mới</p>
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
                placeholder="Nhập username (VD: player123)"
                required
              />
              <div className="text-gray-400 text-xs mt-1">Username phải là duy nhất</div>
            </div>

            <div>
              <label className="block text-white mb-1.5 sm:mb-2 font-semibold flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                Tên (tùy chọn)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="gaming-input w-full text-base"
                placeholder="Tên của bạn"
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
                  Đăng Ký
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-400">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Đăng nhập
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
