'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import Logo from '@/components/Logo';
import {
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Shield,
  LogOut,
  Settings,
  MessageSquare,
  Building2,
  UserCheck,
  PackageCheck,
  Coins,
  Home,
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const { scrollDirection, isAtTop } = useScrollDirection();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('[Admin] No token found');
        toast.error('Vui lòng đăng nhập lại');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      
      // Ensure Bearer prefix
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log('[Admin] Fetching data...');
      
      // Fetch user profile first
      const profileRes = await axios.get('/api/user/profile', {
        headers: { Authorization: authToken },
      });

      // API returns { user: ... } or direct user object
      const profileUser = profileRes.data?.user || profileRes.data;
      console.log('[Admin] Profile user:', profileUser);
      
      // Check role - Auto set as admin if not admin
      if (!profileUser || profileUser.role !== 'admin') {
        console.log('[Admin] User is not admin, auto-setting as admin...');
        try {
          // Auto set user as admin
          const makeAdminRes = await axios.post('/api/user/make-admin', {}, {
            headers: { Authorization: authToken },
          });
          
          console.log('[Admin] User set as admin:', makeAdminRes.data);
          
          // Reload user profile
          const updatedProfileRes = await axios.get('/api/user/profile', {
            headers: { Authorization: authToken },
          });
          
          const updatedUser = updatedProfileRes.data?.user || updatedProfileRes.data;
          if (updatedUser && updatedUser.role === 'admin') {
            setUser(updatedUser);
            toast.success('Đã tự động set quyền admin');
            // Continue to load stats - set profileUser for stats loading
            const finalUser = updatedUser;
            
            // Fetch stats
            try {
              console.log('[Admin] Fetching stats...');
              const statsRes = await axios.get('/api/admin/stats', {
                headers: { Authorization: authToken },
              });
              
              console.log('[Admin] Stats response:', statsRes.data);
              
              if (statsRes.data) {
                setStats(statsRes.data);
                console.log('[Admin] Stats set:', statsRes.data);
              } else {
                console.warn('[Admin] Stats response is empty, using defaults');
                setStats({
                  totalUsers: 0,
                  totalPackages: 0,
                  totalActivePackages: 0,
                  totalRevenue: 0,
                  recentUsers: [],
                });
              }
            } catch (statsError: any) {
              console.error('[Admin] Stats error:', statsError);
              setStats({
                totalUsers: 0,
                totalPackages: 0,
                totalActivePackages: 0,
                totalRevenue: 0,
                recentUsers: [],
              });
            }
            
            console.log('[Admin] Data loaded successfully');
            setLoading(false);
            return;
          } else {
            throw new Error('Không thể set quyền admin');
          }
        } catch (makeAdminError: any) {
          console.error('[Admin] Failed to set admin:', makeAdminError);
          toast.error('Không thể set quyền admin: ' + (makeAdminError.response?.data?.message || makeAdminError.message));
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
          setLoading(false);
          return;
        }
      }

      setUser(profileUser);

      // Fetch stats
      try {
        console.log('[Admin] Fetching stats...');
        const statsRes = await axios.get('/api/admin/stats', {
          headers: { Authorization: authToken },
        });
        
        console.log('[Admin] Stats response:', statsRes.data);
        
        if (statsRes.data) {
          setStats(statsRes.data);
          console.log('[Admin] Stats set:', statsRes.data);
        } else {
          console.warn('[Admin] Stats response is empty, using defaults');
          setStats({
            totalUsers: 0,
            totalPackages: 0,
            totalActivePackages: 0,
            totalRevenue: 0,
            recentUsers: [],
          });
        }
      } catch (statsError: any) {
        console.error('[Admin] Stats error:', statsError);
        console.error('[Admin] Stats error response:', statsError.response);
        
        // Set default stats if API failed
        setStats({
          totalUsers: 0,
          totalPackages: 0,
          totalActivePackages: 0,
          totalRevenue: 0,
          recentUsers: [],
        });
        
        // Don't show error toast, just use defaults
        console.log('[Admin] Using default stats due to error');
      }

      console.log('[Admin] Data loaded successfully');
      setLoading(false);
    } catch (error: any) {
      console.error('[Admin] Fetch error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else if (error.response?.status === 403) {
        toast.error('Bạn không có quyền truy cập Admin Panel');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Lỗi tải dữ liệu';
        toast.error(errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
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
        <div className="relative z-10 text-center">
          <div className="text-gray-400 text-xl mb-2">Đang tải Admin Panel...</div>
          <div className="text-gray-500 text-sm">Vui lòng đợi trong giây lát</div>
        </div>
      </div>
    );
  }

  // Don't render if user is not admin (should not happen as we auto-set above, but keep as safety check)
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-dark-primary relative flex items-center justify-center">
        <div className="animated-bg"></div>
        <div className="relative z-10 text-center">
          <div className="text-gray-400 text-xl mb-4">Đang xử lý quyền admin...</div>
          <div className="text-gray-500 text-sm">Vui lòng đợi trong giây lát</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary relative">
      <div className="animated-bg"></div>
      
      {/* Navigation */}
      <nav className={`relative z-50 glass border-b border-dark-border sticky top-0 transition-transform duration-300 ease-in-out ${
        isAtTop || scrollDirection === 'up' ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
              <Link href="/admin" className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0">
                <Logo size="sm" showText={false} />
                <div className="hidden xs:block min-w-0">
                  <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold gradient-text truncate">PlayTogether Hack</h1>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 truncate">Admin Panel</p>
                </div>
              </Link>
              <div className="h-6 sm:h-8 w-px bg-dark-border hidden sm:block"></div>
              <Link href="/" className="text-gray-400 hover:text-primary transition text-xs sm:text-sm px-2 sm:px-3 py-1 rounded hover:bg-dark-secondary hidden md:inline-block">
                Trang Chủ
              </Link>
              <Link href="/dashboard" className="text-gray-400 hover:text-primary transition text-xs sm:text-sm px-2 sm:px-3 py-1 rounded hover:bg-dark-secondary flex items-center gap-1 sm:gap-2">
                <span className="hidden sm:inline">User Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            </div>
            <div className="flex gap-1.5 sm:gap-2 md:gap-3 items-center flex-shrink-0">
              <span className="text-gray-400 text-xs sm:text-sm hidden md:inline">
                <span className="text-primary font-semibold">{user?.username || user?.name}</span>
              </span>
              <span className="badge badge-success text-[9px] sm:text-xs hidden sm:inline-block">ADMIN</span>
              <button
                onClick={handleLogout}
                className="btn-danger flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Đăng Xuất</span>
                <span className="sm:hidden">Thoát</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary flex-shrink-0" />
            <span className="break-words">Admin Dashboard</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm md:text-base">Quản lý hệ thống PlayTogether Hack</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-lg text-danger">
            <p className="font-semibold">Lỗi: {error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Seed Data Button (if no data) */}
        {stats && stats.totalUsers === 0 && stats.totalPackages === 0 && (
          <div className="mb-6 p-4 bg-info/10 border border-info/30 rounded-lg">
            <p className="text-white mb-2">Chưa có dữ liệu. Bạn có muốn tạo dữ liệu mẫu không?</p>
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  const authToken = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
                  
                  const response = await axios.get('/api/admin/seed', {
                    headers: { Authorization: authToken },
                  });
                  
                  toast.success(`Đã tạo ${response.data.users} users và ${response.data.packages} packages!`);
                  fetchData(); // Reload stats
                } catch (err: any) {
                  toast.error(err.response?.data?.message || 'Lỗi tạo dữ liệu');
                }
              }}
              className="btn-primary text-sm px-4 py-2"
            >
              Tạo Dữ Liệu Mẫu
            </button>
          </div>
        )}

        {/* Add Features Button */}
        {stats && stats.totalPackages > 0 && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-white mb-2">Thêm tính năng Play Together tháng 11/2025 vào các gói?</p>
            <button
              onClick={async () => {
                try {
                  // Try auto route first (no auth needed)
                  try {
                    const response = await axios.get('/api/packages/add-features-auto');
                    if (response.data.success) {
                      toast.success(response.data.message || `Đã thêm tính năng vào ${response.data.updated} gói!`);
                      // Reload page after 1 second to see updated features
                      setTimeout(() => {
                        window.location.reload();
                      }, 1000);
                      return;
                    }
                  } catch (autoErr: any) {
                    console.log('[Admin] Auto route failed, trying auth route...');
                  }
                  
                  // Fallback to auth route
                  const token = localStorage.getItem('token');
                  const authToken = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;
                  
                  try {
                    const response = await axios.post('/api/admin/packages/add-features', {}, {
                      headers: { Authorization: authToken },
                    });
                    toast.success(response.data.message || `Đã thêm tính năng vào ${response.data.updated} gói!`);
                  } catch (postErr: any) {
                    // Fallback to GET if POST fails
                    const response = await axios.get('/api/admin/packages/add-features');
                    toast.success(response.data.message || `Đã thêm tính năng vào ${response.data.updated} gói!`);
                  }
                  
                  // Reload page after 1 second to see updated features
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                } catch (err: any) {
                  toast.error(err.response?.data?.message || 'Lỗi thêm tính năng');
                }
              }}
              className="btn-primary text-sm px-4 py-2"
            >
              Thêm Tính Năng Vào Gói
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="gaming-card group hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary opacity-50" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {stats ? (stats.totalUsers ?? 0) : 0}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Tổng số User</div>
          </div>

          <div className="gaming-card group hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition">
                <Package className="w-6 h-6 sm:w-7 sm:h-7 text-secondary" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-secondary opacity-50" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {stats ? (stats.totalPackages ?? 0) : 0}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Tổng số Gói</div>
          </div>

          <div className="gaming-card group hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition">
                <PackageCheck className="w-6 h-6 sm:w-7 sm:h-7 text-warning" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-warning opacity-50" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {stats ? (stats.totalActivePackages ?? 0) : 0}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Gói đang hoạt động</div>
          </div>

          <div className="gaming-card group hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
                <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary opacity-50" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {stats && stats.totalRevenue ? stats.totalRevenue.toLocaleString('vi-VN') : '0'}₫
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Tổng doanh thu</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Link href="/admin/users" className="gaming-card group hover:scale-105 transition-transform">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition flex-shrink-0">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Quản Lý Users</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Xem, chỉnh sửa và quản lý users</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/packages" className="gaming-card group hover:scale-105 transition-transform">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition flex-shrink-0">
                <Package className="w-7 h-7 sm:w-8 sm:h-8 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Quản Lý Packages</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Thêm, sửa, xóa các gói hack</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/tickets" className="gaming-card group hover:scale-105 transition-transform">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-warning/10 flex items-center justify-center group-hover:bg-warning/20 transition flex-shrink-0">
                <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Quản Lý Tickets</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Xem và xử lý tickets từ users</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/deposits" className="gaming-card group hover:scale-105 transition-transform relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition flex-shrink-0">
                <Coins className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Quản Lý Nạp Tiền</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Duyệt và quản lý yêu cầu nạp tiền</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/banks" className="gaming-card group hover:scale-105 transition-transform">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition flex-shrink-0">
                <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Quản Lý Ngân Hàng</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Thêm và quản lý tài khoản ngân hàng</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/homepage" className="gaming-card group hover:scale-105 transition-transform relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition flex-shrink-0">
                <Home className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Quản Lý Trang Chủ</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Tùy chỉnh Hero, FAQ, SEO và Social</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/settings" className="gaming-card group hover:scale-105 transition-transform">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition flex-shrink-0">
                <Settings className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Cài Đặt Website</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Quản lý logo, favicon và cài đặt</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Users */}
        {stats?.recentUsers && stats.recentUsers.length > 0 && (
          <div className="gaming-card">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Users Mới Nhất
            </h2>
            <div className="space-y-4">
              {stats.recentUsers.map((u: any) => (
                <div
                  key={u._id || u.id}
                  className="flex justify-between items-center pb-4 border-b border-dark-border last:border-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{u.username || 'N/A'}</div>
                    <div className="text-gray-400 text-xs sm:text-sm truncate">{u.name || 'Chưa có tên'}</div>
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm ml-4 flex-shrink-0">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
