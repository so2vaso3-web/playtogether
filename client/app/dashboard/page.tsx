'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { 
  Package, 
  TrendingDown, 
  CreditCard, 
  User, 
  LogOut,
  Download,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Wallet,
  Shield,
  MessageSquare,
  Key,
  Settings,
  ArrowLeft,
  Home
} from 'lucide-react';
import PlatformBadge from '@/components/PlatformBadge';
import Logo from '@/components/Logo';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [userPackages, setUserPackages] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { scrollDirection, isAtTop } = useScrollDirection();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const [packagesRes, userPackagesRes, transactionsRes, profileRes] = await Promise.all([
        axios.get('/api/packages'),
        axios.get('/api/user/packages', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/user/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPackages(packagesRes.data);
      setUserPackages(userPackagesRes.data);
      setTransactions(transactionsRes.data);
      
      // API returns { user: ... } or direct user object
      const userData = profileRes.data?.user || profileRes.data;
      console.log('[Dashboard] User data loaded:', userData);
      
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        console.error('[Dashboard] No user data in response:', profileRes.data);
        toast.error('Không thể tải thông tin user');
      }
    } catch (error: any) {
      console.error('[Dashboard] Fetch error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        // Don't logout on other errors, just show error message
        toast.error('Lỗi tải dữ liệu: ' + (error.response?.data?.message || error.message || 'Unknown error'));
        // Keep user logged in and show partial data
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary relative flex items-center justify-center">
        <div className="animated-bg"></div>
        <div className="relative z-10 text-gray-400 text-xl">Đang tải...</div>
      </div>
    );
  }

  const activePackages = userPackages.filter((pkg: any) => pkg.status === 'active');
  const totalSpent = transactions.filter((t: any) => t.type === 'purchase').reduce((sum: number, t: any) => sum + t.amount, 0);
  const totalDeposited = transactions.filter((t: any) => t.type === 'deposit').reduce((sum: number, t: any) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-dark-primary relative">
      <div className="animated-bg"></div>
      
      {/* Navigation */}
      <nav className={`relative z-50 glass border-b border-dark-border sticky top-0 transition-transform duration-300 ease-in-out ${
        isAtTop || scrollDirection === 'up' ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 flex-wrap gap-2">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Logo size="sm" showText={true} />
            </Link>
            <div className="flex gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 items-center">
              <Link
                href="/"
                className="p-2 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-gray-400 hover:text-primary transition font-medium flex items-center gap-1.5 sm:gap-2 text-sm md:text-base rounded-lg hover:bg-dark-card/50"
                title="Trang Chủ"
              >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">Trang Chủ</span>
              </Link>
              <Link
                href="/support"
                className="p-2 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-gray-400 hover:text-primary transition font-medium flex items-center gap-1.5 sm:gap-2 text-sm md:text-base rounded-lg hover:bg-dark-card/50"
                title="Hỗ Trợ"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden md:inline">Hỗ Trợ</span>
              </Link>
              <span className="text-gray-400 text-xs sm:text-sm px-2 hidden sm:inline">
                <span className="hidden md:inline">Xin chào, </span>
                <span className="text-primary font-semibold truncate max-w-[100px] md:max-w-none">{user?.name || user?.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="btn-danger flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 whitespace-nowrap"
                title="Đăng Xuất"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Đăng Xuất</span>
                <span className="hidden sm:inline md:hidden">Thoát</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="gaming-card text-center group hover:scale-105 transition-transform relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-14 mx-auto mb-2 sm:mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-7 text-primary" />
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
                {(user?.balance || 0).toLocaleString('vi-VN')}₫
              </div>
              <div className="text-gray-400 text-xs sm:text-sm">Số dư tài khoản</div>
            </div>
          </div>
          <div className="gaming-card text-center group hover:scale-105 transition-transform">
            <div className="w-10 h-10 sm:w-12 sm:h-14 mx-auto mb-2 sm:mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
              <Package className="w-5 h-5 sm:w-6 sm:h-7 text-primary" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary mb-1">
              {activePackages.length}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Gói đang hoạt động</div>
          </div>
          <div className="gaming-card text-center group hover:scale-105 transition-transform">
            <div className="w-10 h-10 sm:w-12 sm:h-14 mx-auto mb-2 sm:mb-4 rounded-xl bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-7 text-warning" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-warning mb-1">
              {totalSpent.toLocaleString('vi-VN')}₫
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Tổng đã mua</div>
          </div>
          <div className="gaming-card text-center group hover:scale-105 transition-transform">
            <div className="w-10 h-10 sm:w-12 sm:h-14 mx-auto mb-2 sm:mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-7 text-primary" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary mb-1">
              {totalDeposited.toLocaleString('vi-VN')}₫
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Tổng đã nạp</div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="gaming-card mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            Thông Tin Tài Khoản
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <div className="text-gray-400 mb-1 text-xs sm:text-sm">Username</div>
              <div className="text-lg sm:text-xl font-bold text-white break-all">{user?.username || 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1 text-xs sm:text-sm">Tên</div>
              <div className="text-lg sm:text-xl font-bold text-white break-all">{user?.name || 'Chưa cập nhật'}</div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg opacity-50"></div>
              <div className="relative p-4 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  <div className="text-gray-400 text-xs sm:text-sm">Số dư hiện tại</div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {(user?.balance || 0).toLocaleString('vi-VN')}₫
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3 flex-wrap">
            <Link
              href="/deposit"
              className="btn-secondary inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 flex-1 sm:flex-none justify-center"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Nạp Tiền Ngay</span>
              <span className="sm:hidden">Nạp Tiền</span>
            </Link>
            <Link
              href="/support"
              className="btn-secondary inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 flex-1 sm:flex-none justify-center"
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Hỗ Trợ
            </Link>
            <Link
              href="/settings"
              className="btn-secondary inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 flex-1 sm:flex-none justify-center"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Cài Đặt
            </Link>
          </div>
        </div>

        {/* Active Packages */}
        {activePackages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
              <Package className="w-7 h-7 text-primary" />
              Gói Đang Hoạt Động
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePackages.map((upkg: any) => {
                // Handle expiresAt: null means lifetime package
                const isLifetime = !upkg.expiresAt;
                let expiresDate: Date | null = null;
                let daysLeft: number | string = 'Vô thời hạn';
                
                if (!isLifetime && upkg.expiresAt) {
                  expiresDate = upkg.expiresAt instanceof Date 
                    ? upkg.expiresAt 
                    : new Date(upkg.expiresAt);
                  if (expiresDate) {
                    daysLeft = Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  }
                }
                
                return (
                  <div key={upkg._id} className="gaming-card neon-border-blue">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-primary" />
                          {upkg.packageId?.name || 'Gói không xác định'}
                        </h3>
                        <div className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4" />
                          {isLifetime ? (
                            <span>Hết hạn: Vô thời hạn</span>
                          ) : expiresDate ? (
                            <span>Hết hạn: {expiresDate.toLocaleDateString('vi-VN')}</span>
                          ) : (
                            <span>Hết hạn: Không xác định</span>
                          )}
                        </div>
                      </div>
                      <span className="badge badge-success flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Hoạt động
                      </span>
                    </div>
                    <div className="bg-dark-secondary rounded-lg p-3 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Thời gian còn lại:</span>
                        <span className={`font-bold ${isLifetime ? 'text-success' : (typeof daysLeft === 'number' && daysLeft < 0) ? 'text-danger' : 'text-primary'}`}>
                          {typeof daysLeft === 'number' ? `${daysLeft} ngày` : String(daysLeft)}
                        </span>
                      </div>
                    </div>
                    {upkg.packageId?.features && upkg.packageId.features.length > 0 && (
                      <div className="text-sm mb-3">
                        <div className="font-semibold text-white mb-2">Tính năng:</div>
                        <ul className="space-y-1.5">
                          {upkg.packageId.features.slice(0, 3).map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-center text-gray-400">
                              <CheckCircle2 className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {upkg.packageId?.downloadUrl && (
                      <div className="space-y-2">
                        <button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('token');
                              const response = await axios.get(`/api/user/download?packageId=${upkg.packageId._id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                              });
                              if (response.data.downloadUrl) {
                                window.open(response.data.downloadUrl, '_blank');
                              }
                              if (response.data.licenseKey) {
                                toast.success(`License Key: ${response.data.licenseKey}`, { duration: 10000 });
                              }
                            } catch (error: any) {
                              toast.error(error.response?.data?.message || 'Lỗi tải hack');
                            }
                          }}
                          className="block w-full btn-secondary text-center flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Tải Hack & Lấy License
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* Transactions */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-primary" />
            Lịch Sử Giao Dịch
          </h2>
          {transactions.length === 0 ? (
            <div className="gaming-card text-center text-gray-400 py-12">
              Chưa có giao dịch nào
            </div>
          ) : (
            <div className="gaming-card">
              <div className="space-y-4">
                {transactions.map((txn: any) => (
                  <div
                    key={txn._id}
                    className="flex justify-between items-center pb-4 border-b border-dark-border last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        txn.type === 'deposit' ? 'bg-primary/10' : 'bg-danger/10'
                      }`}>
                        {txn.type === 'deposit' ? (
                          <Download className={`w-5 h-5 ${txn.type === 'deposit' ? 'text-primary' : 'text-danger'}`} />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-danger" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white mb-1">{txn.description}</div>
                        <div className="text-gray-400 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(txn.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        txn.type === 'deposit' ? 'text-primary' : 'text-danger'
                      }`}>
                        {txn.type === 'deposit' ? '+' : '-'}{txn.amount.toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
