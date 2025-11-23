'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Settings,
  Lock,
  Key,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // API returns { user: ... } or direct user object
      const userData = response.data?.user || response.data;
      setUser(userData);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        toast.error('Lỗi tải thông tin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/user/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Đổi mật khẩu thành công');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setChangingPassword(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi đổi mật khẩu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary relative flex items-center justify-center">
        <div className="animated-bg"></div>
        <div className="relative z-10 text-gray-400 text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary relative">
      <div className="animated-bg"></div>

      <nav className="relative z-10 glass border-b border-dark-border sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-lg blur opacity-50"></div>
                <div className="relative bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">PlayTogether Hack</h1>
                <p className="text-xs text-gray-400">Premium Gaming Tools</p>
              </div>
            </Link>
            <div className="flex gap-3 items-center">
              <Link href="/dashboard" className="btn-secondary">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <h1 className="text-4xl font-bold gradient-text mb-8 flex items-center gap-3">
          <Settings className="w-10 h-10 text-primary" />
          Cài Đặt Tài Khoản
        </h1>

        {/* Account Info */}
        <div className="gaming-card mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Thông Tin Tài Khoản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 mb-2">Username</label>
              <div className="bg-dark-secondary border border-dark-border rounded-lg px-4 py-3 text-white">
                {user?.username}
              </div>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Tên Hiển Thị</label>
              <div className="bg-dark-secondary border border-dark-border rounded-lg px-4 py-3 text-white">
                {user?.name || 'Chưa cập nhật'}
              </div>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Vai Trò</label>
              <div className="bg-dark-secondary border border-dark-border rounded-lg px-4 py-3">
                <span className={`badge ${user?.role === 'admin' ? 'badge-success' : 'badge-info'}`}>
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Ngày Tạo</label>
              <div className="bg-dark-secondary border border-dark-border rounded-lg px-4 py-3 text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="gaming-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Lock className="w-6 h-6 text-primary" />
              Đổi Mật Khẩu
            </h2>
            {!changingPassword && (
              <button
                onClick={() => setChangingPassword(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Đổi Mật Khẩu
              </button>
            )}
          </div>

          {changingPassword && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full bg-dark-secondary border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary pr-12"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full bg-dark-secondary border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary pr-12"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full bg-dark-secondary border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary pr-12"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={submitting}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Đang lưu...' : 'Lưu Mật Khẩu Mới'}
                </button>
                <button
                  onClick={() => {
                    setChangingPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Links */}
        <div className="gaming-card mt-6">
          <h2 className="text-xl font-bold text-white mb-4">Liên Kết Quan Trọng</h2>
          <div className="space-y-3">
            <Link href="/terms" className="flex items-center gap-3 text-gray-400 hover:text-primary transition">
              <CheckCircle2 className="w-5 h-5" />
              <span>Điều Khoản Sử Dụng</span>
            </Link>
            <Link href="/privacy" className="flex items-center gap-3 text-gray-400 hover:text-primary transition">
              <Lock className="w-5 h-5" />
              <span>Chính Sách Bảo Mật</span>
            </Link>
            <Link href="/support" className="flex items-center gap-3 text-gray-400 hover:text-primary transition">
              <MessageSquare className="w-5 h-5" />
              <span>Hỗ Trợ & Ticket</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

