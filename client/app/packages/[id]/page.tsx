'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Shield, 
  Download,
  ShoppingCart,
  Wallet,
  AlertCircle,
  Smartphone,
  Apple,
  Monitor,
  Info,
  FileCode,
  AlertTriangle,
  BookOpen,
  Key,
  FileText,
  ArrowRight
} from 'lucide-react';
import PlatformBadge from '@/components/PlatformBadge';
import PackageFeatures from '@/components/PackageFeatures';
import Logo from '@/components/Logo';

export default function PackageDetail() {
  const router = useRouter();
  const params = useParams();
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [purchasing, setPurchasing] = useState(false);
  const { scrollDirection, isAtTop } = useScrollDirection();

  useEffect(() => {
    fetchPackage();
    fetchUser();
  }, []);

  const fetchPackage = async () => {
    try {
      const response = await axios.get('/api/packages');
      console.log('[Package Detail] All packages:', response.data);
      console.log('[Package Detail] Looking for ID:', params.id);
      
      // KV models use 'id' instead of '_id'
      const foundPackage = response.data.find((p: any) => {
        const match = p.id === params.id || p._id === params.id;
        if (match) {
          console.log('[Package Detail] Found package:', p);
        }
        return match;
      });
      
      if (foundPackage) {
        // Ensure we use 'id' consistently
        if (!foundPackage.id && foundPackage._id) {
          foundPackage.id = foundPackage._id;
        }
        setPkg(foundPackage);
      } else {
        console.error('[Package Detail] Package not found. Available IDs:', response.data.map((p: any) => p.id || p._id));
        toast.error('Không tìm thấy gói');
        router.push('/');
      }
    } catch (error: any) {
      console.error('[Package Detail] Error:', error);
      toast.error('Lỗi tải thông tin gói: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // API returns { user: ... } or direct user object
        const userData = response.data?.user || response.data;
        console.log('[Package Detail] User loaded:', userData);
        console.log('[Package Detail] User balance:', userData?.balance);
        setUser(userData);
      }
    } catch (error) {
      // Not logged in, that's ok
      console.log('[Package Detail] User not logged in');
    }
  };

  const handlePurchase = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Vui lòng đăng nhập trước');
      router.push('/login');
      return;
    }

    if (!user) {
      toast.error('Đang tải thông tin user...');
      return;
    }

    // Check balance
    if ((user.balance || 0) < pkg.price) {
      toast.error(`Số dư không đủ! Bạn cần ${pkg.price.toLocaleString('vi-VN')}₫ nhưng chỉ có ${(user.balance || 0).toLocaleString('vi-VN')}₫`);
      router.push('/deposit');
      return;
    }

    setPurchasing(true);

    try {
      // KV models use 'id' instead of '_id'
      if (!pkg || (!pkg.id && !pkg._id)) {
        toast.error('Thông tin gói không hợp lệ');
        setPurchasing(false);
        return;
      }

      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      // KV models use 'id' instead of '_id'
      const packageId = pkg.id || pkg._id;
      
      console.log('[Purchase] Sending request:', {
        packageId: packageId,
        packageName: pkg.name,
        price: pkg.price,
        userBalance: user.balance
      });

      const response = await axios.post(
        '/api/payments/create',
        { packageId: packageId },
        { 
          headers: { Authorization: authToken },
          timeout: 30000 // 30 seconds timeout
        }
      );

      console.log('[Purchase] Success response:', response.data);
      
      if (response.data.message) {
        toast.success(response.data.message);
      } else {
        toast.success('Mua gói thành công!');
      }
      
      // Refresh user data
      await fetchUser();
      
      // Notify other pages to reload user data
      window.dispatchEvent(new Event('userBalanceUpdated'));
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('[Purchase] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Mua gói thất bại';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        if (errorMessage.includes('Số dư không đủ')) {
          setTimeout(() => {
            router.push('/deposit');
          }, 2000);
        } else if (errorMessage.includes('đã sở hữu')) {
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      } else if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else if (error.response?.status === 404) {
        toast.error('Gói không tồn tại hoặc đã bị xóa');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Kết nối timeout. Vui lòng thử lại.');
      }
    } finally {
      setPurchasing(false);
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

  if (!pkg) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-primary relative">
      <div className="animated-bg"></div>
      
      {/* Navigation */}
      <nav className={`relative z-50 glass border-b border-dark-border sticky top-0 transition-transform duration-300 ease-in-out ${
        isAtTop || scrollDirection === 'up' ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0">
              <Logo size="sm" showText={false} />
              <div className="hidden xs:block">
                <Logo size="md" showText={true} />
              </div>
            </Link>
            <div className="flex gap-2 sm:gap-3">
              <Link href="/dashboard" className="text-gray-400 hover:text-primary transition font-medium text-xs sm:text-sm md:text-base px-2 sm:px-3">
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        {/* Back Button */}
        <div className="mb-3 sm:mb-4 md:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-gray-400 hover:text-primary transition font-medium group text-xs sm:text-sm md:text-base"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform flex-shrink-0" />
            <span className="whitespace-nowrap">Quay lại trang chủ</span>
          </Link>
        </div>

        <div className="gaming-card neon-border">
          <div className="text-center mb-6 sm:mb-8 px-2 sm:px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl overflow-hidden">
              {pkg.icon ? (
                typeof pkg.icon === 'string' ? (
                  <img 
                    src={pkg.icon} 
                    alt={pkg.name}
                    className="w-full h-full object-contain p-1.5 sm:p-2"
                    onError={(e) => {
                      // Fallback to icon if image fails
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  pkg.icon
                )
              ) : (
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary" />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight px-2 break-words">
              {pkg.name}
            </h1>
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap px-2">
              <PlatformBadge platform={pkg.platform || 'all'} size="sm" />
              {pkg.version && (
                <span className="badge badge-info flex items-center gap-1 text-xs sm:text-sm">
                  <FileCode className="w-3 h-3 flex-shrink-0" />
                  <span>v{pkg.version}</span>
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-3 sm:mb-4 px-2">
              {pkg.description || 'Không có mô tả'}
            </p>
            {pkg.platform === 'android' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success/20 border border-success/40 text-success text-sm mb-2 shadow-lg shadow-success/20">
                <Smartphone className="w-4 h-4" />
                <span>Hỗ trợ thiết bị Android</span>
              </div>
            )}
            {pkg.platform === 'ios' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700/20 border border-gray-700/40 text-gray-300 text-sm mb-2 shadow-lg">
                <Apple className="w-4 h-4" />
                <span>Hỗ trợ thiết bị iOS</span>
              </div>
            )}
            {pkg.platform === 'emulator' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-info/20 border border-info/40 text-info text-sm mb-2 shadow-lg shadow-info/20">
                <Monitor className="w-4 h-4" />
                <span>Hỗ trợ giả lập (LDPlayer, Nox, BlueStacks...)</span>
              </div>
            )}
            {pkg.platform === 'all' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/40 text-primary text-sm mb-2 shadow-lg shadow-primary/20">
                <CheckCircle2 className="w-4 h-4" />
                <span>Hỗ trợ tất cả platform (Android, iOS, Giả Lập)</span>
              </div>
            )}
          </div>

          {/* GUI Giới Thiệu Tính Năng Hack - Hiển thị ngay sau mô tả */}
          {pkg.detailedFeatures && Object.keys(pkg.detailedFeatures).length > 0 && (
            <div className="mb-8">
              <PackageFeatures features={pkg.detailedFeatures} />
            </div>
          )}

          <div className="gaming-card bg-dark-secondary mb-6 sm:mb-8 px-3 sm:px-4 md:px-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2 sm:mb-3 break-words">
                {pkg.price.toLocaleString('vi-VN')}₫
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-gray-400 text-xs sm:text-sm md:text-base">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Thời hạn: <span className="text-primary font-semibold">{pkg.duration} ngày</span></span>
              </div>
            </div>

            {/* Simple Features List (fallback) */}
            {!pkg.detailedFeatures && pkg.features && pkg.features.length > 0 && (
              <div className="mb-4 sm:mb-6 px-2">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 text-center flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <span>Tính Năng:</span>
                </h3>
                <ul className="space-y-2 sm:space-y-3">
                  {pkg.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start text-gray-400 gap-2 sm:gap-3">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base break-words">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* User Balance Info - New Design */}
            {user ? (
              <div className="mb-4 sm:mb-6 gaming-card relative overflow-hidden border border-primary/30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
                <div className="relative p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                        <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-gray-400 text-xs sm:text-sm mb-1">Số dư tài khoản</div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent break-words">
                          {(user.balance || 0).toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                    </div>
                  </div>
                  {(user.balance || 0) < pkg.price && (
                    <Link
                      href="/deposit"
                      className="block text-center mt-2 sm:mt-3 text-primary hover:text-primary-300 underline font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-colors"
                    >
                      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="break-words">Nạp thêm tiền để mua gói này →</span>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-4 sm:mb-6 gaming-card bg-warning/10 border border-warning/30 p-3 sm:p-4">
                <p className="text-white mb-2 text-center font-semibold flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-warning flex-shrink-0" />
                  <span>Vui lòng đăng nhập để mua gói</span>
                </p>
                <Link href="/login" className="block text-center text-warning hover:text-warning-600 underline font-semibold text-xs sm:text-sm">
                  Đăng nhập ngay →
                </Link>
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={!user || (user.balance || 0) < pkg.price || purchasing}
              className="btn-primary w-full text-sm sm:text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-3 sm:py-4"
            >
              {!user ? (
                <>
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Vui lòng đăng nhập</span>
                </>
              ) : (user.balance || 0) < pkg.price ? (
                <>
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Không đủ tiền</span>
                </>
              ) : purchasing ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>Mua Ngay</span>
                </>
              )}
            </button>
          </div>

          {/* System Requirements */}
          {pkg.systemRequirements && (
            <div className="gaming-card bg-dark-secondary mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-white">Yêu Cầu Hệ Thống</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{pkg.systemRequirements}</p>
            </div>
          )}

          {/* Ban Risk Info */}
          {pkg.antiBanGuarantee ? (
            <div className="gaming-card bg-success/10 border-2 border-success/30 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-success icon-glow-success" />
                <h3 className="font-bold text-success text-lg">✅ Đảm Bảo Không Ban</h3>
              </div>
              <p className="text-white text-sm">
                Gói này được đảm bảo 100% không bị ban. Nếu tài khoản bị ban trong thời gian sử dụng, chúng tôi sẽ hoàn tiền ngay lập tức.
              </p>
            </div>
          ) : pkg.banRisk === 'high' ? (
            <div className="gaming-card bg-danger/10 border-2 border-danger/30 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-danger icon-glow-danger" />
                <h3 className="font-bold text-danger text-lg">⚠️ Nguy Cơ Bị Ban</h3>
              </div>
              <p className="text-white text-sm">
                Gói này có nguy cơ bị ban cao (gói giá rẻ). Vui lòng sử dụng cẩn thận và không lạm dụng tính năng hack.
              </p>
            </div>
          ) : pkg.banRisk === 'low' ? (
            <div className="gaming-card bg-warning/10 border-2 border-warning/30 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-warning icon-glow-warning" />
                <h3 className="font-bold text-warning text-lg">🛡️ Nguy Cơ Thấp</h3>
              </div>
              <p className="text-white text-sm">
                Gói này có nguy cơ bị ban thấp, an toàn cao. Tuy nhiên vẫn nên sử dụng hợp lý.
              </p>
            </div>
          ) : null}

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="gaming-card bg-dark-secondary text-center">
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-sm font-semibold text-white mb-1">Bảo Hành</div>
              <div className="text-xs text-gray-400">Trong thời gian sử dụng</div>
            </div>
            <div className="gaming-card bg-dark-secondary text-center">
              <Download className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-sm font-semibold text-white mb-1">Cập Nhật</div>
              <div className="text-xs text-gray-400">Miễn phí khi game update</div>
            </div>
          </div>

          {/* Hướng Dẫn Nhận Hack và Cài Đặt */}
          <div className="gaming-card bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30 mt-6 sm:mt-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-1.5 sm:p-2 bg-primary/20 rounded-lg flex-shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">📖 Hướng Dẫn Nhận Hack & Cài Đặt</h2>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Bước 1: Mua gói */}
              <div className="gaming-card bg-dark-secondary border-l-4 border-primary">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
                    1
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      <span>Mua Gói Hack</span>
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-2 sm:mb-3">
                      Sau khi mua gói thành công, bạn sẽ nhận được thông báo xác nhận và gói hack sẽ được kích hoạt trong tài khoản của bạn.
                    </p>
                    <div className="bg-dark-card p-2 sm:p-3 rounded-lg border border-primary/20">
                      <p className="text-xs sm:text-sm text-gray-300">
                        <span className="text-primary font-semibold">Lưu ý:</span> Đảm bảo số dư tài khoản đủ để mua gói. Sau khi mua, gói sẽ được kích hoạt ngay lập tức.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bước 2: Nhận key/license */}
              <div className="gaming-card bg-dark-secondary border-l-4 border-warning">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-warning rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
                    2
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <Key className="w-4 h-4 sm:w-5 sm:h-5 text-warning flex-shrink-0" />
                      <span>Nhận Key/License</span>
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-2 sm:mb-3">
                      Sau khi mua gói, bạn cần vào <Link href="/dashboard" className="text-primary hover:underline font-semibold">Dashboard</Link> để xem key/license của gói hack.
                    </p>
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-300">
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Đăng nhập vào tài khoản của bạn</span>
                      </div>
                      <div className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-300">
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Vào mục <span className="text-primary font-semibold">"Gói Của Tôi"</span> trong Dashboard</span>
                      </div>
                      <div className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-300">
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Copy key/license được cung cấp</span>
                      </div>
                    </div>
                    <div className="bg-warning/10 p-2 sm:p-3 rounded-lg border border-warning/20 mt-2 sm:mt-3">
                      <p className="text-xs sm:text-sm text-warning">
                        <span className="font-semibold">⚠️ Quan trọng:</span> Key/License là duy nhất cho mỗi tài khoản. Không chia sẻ key với người khác!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bước 3: Tải file hack */}
              <div className="gaming-card bg-dark-secondary border-l-4 border-info">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-info rounded-full flex items-center justify-center text-white font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <Download className="w-5 h-5 text-info" />
                      Tải File Hack
                    </h3>
                    <p className="text-gray-400 mb-3">
                      Trong Dashboard, bạn sẽ thấy link tải file hack. Tải file về thiết bị của bạn.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>File hack thường có định dạng <span className="text-primary font-semibold">.apk</span> (Android) hoặc <span className="text-primary font-semibold">.ipa</span> (iOS)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>Đảm bảo tải đúng file cho platform của bạn (Android/iOS/Emulator)</span>
                      </div>
                    </div>
                    {pkg.platform === 'android' && (
                      <div className="bg-info/10 p-3 rounded-lg border border-info/20 mt-3">
                        <p className="text-sm text-info">
                          <span className="font-semibold">📱 Android:</span> File sẽ có định dạng .apk. Cần bật "Cài đặt từ nguồn không xác định" trong Settings.
                        </p>
                      </div>
                    )}
                    {pkg.platform === 'ios' && (
                      <div className="bg-info/10 p-3 rounded-lg border border-info/20 mt-3">
                        <p className="text-sm text-info">
                          <span className="font-semibold">🍎 iOS:</span> File sẽ có định dạng .ipa. Cần cài đặt qua AltStore hoặc Sideloadly.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bước 4: Cài đặt */}
              <div className="gaming-card bg-dark-secondary border-l-4 border-success">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-success rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
                    4
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                      <span>Cài Đặt Hack</span>
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-2 sm:mb-3">
                      Sau khi tải file về, tiến hành cài đặt hack vào thiết bị của bạn.
                    </p>
                    <div className="space-y-2 sm:space-y-3">
                      {pkg.platform === 'android' || pkg.platform === 'all' ? (
                        <div className="bg-dark-card p-3 sm:p-4 rounded-lg">
                          <h4 className="text-white font-semibold mb-2 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                            <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                            <span>Android:</span>
                          </h4>
                          <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-gray-300 ml-1 sm:ml-2">
                            <li>Mở file .apk đã tải về</li>
                            <li>Cho phép cài đặt từ nguồn không xác định (nếu được hỏi)</li>
                            <li>Nhấn "Cài đặt" và chờ quá trình hoàn tất</li>
                            <li>Mở ứng dụng hack và nhập key/license đã nhận</li>
                            <li>Kích hoạt hack và bắt đầu sử dụng</li>
                          </ol>
                        </div>
                      ) : null}
                      {pkg.platform === 'ios' || pkg.platform === 'all' ? (
                        <div className="bg-dark-card p-3 sm:p-4 rounded-lg">
                          <h4 className="text-white font-semibold mb-2 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                            <Apple className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                            <span>iOS:</span>
                          </h4>
                          <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-gray-300 ml-1 sm:ml-2">
                            <li>Cài đặt AltStore hoặc Sideloadly trên máy tính</li>
                            <li>Kết nối iPhone/iPad với máy tính</li>
                            <li>Sideload file .ipa vào thiết bị</li>
                            <li>Tin cậy nhà phát triển trong Settings → General → VPN & Device Management</li>
                            <li>Mở ứng dụng hack và nhập key/license</li>
                            <li>Kích hoạt hack và bắt đầu sử dụng</li>
                          </ol>
                        </div>
                      ) : null}
                      {pkg.platform === 'emulator' || pkg.platform === 'all' ? (
                        <div className="bg-dark-card p-3 sm:p-4 rounded-lg">
                          <h4 className="text-white font-semibold mb-2 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                            <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                            <span>Giả Lập (LDPlayer, Nox, BlueStacks):</span>
                          </h4>
                          <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-gray-300 ml-1 sm:ml-2">
                            <li>Mở giả lập Android trên máy tính</li>
                            <li>Kéo thả file .apk vào cửa sổ giả lập</li>
                            <li>Chờ quá trình cài đặt hoàn tất</li>
                            <li>Mở ứng dụng hack trong giả lập</li>
                            <li>Nhập key/license và kích hoạt</li>
                            <li>Mở game Play Together và sử dụng hack</li>
                          </ol>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bước 5: Sử dụng */}
              <div className="gaming-card bg-dark-secondary border-l-4 border-secondary">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-secondary" />
                      Sử Dụng Hack
                    </h3>
                    <p className="text-gray-400 mb-3">
                      Sau khi cài đặt thành công, bạn có thể sử dụng các tính năng hack trong game.
                    </p>
                    <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                      <h4 className="text-success font-semibold mb-2">✅ Mẹo Sử Dụng An Toàn:</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                          <span>Không sử dụng quá nhiều tính năng cùng lúc để tránh bị phát hiện</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                          <span>Sử dụng các tính năng một cách hợp lý và tự nhiên</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                          <span>Nếu gặp lỗi, liên hệ support qua Zalo để được hỗ trợ</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                          <span>Update hack miễn phí khi game có bản cập nhật mới</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hỗ trợ */}
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-semibold">Cần hỗ trợ?</span> Nếu bạn gặp bất kỳ vấn đề nào trong quá trình nhận hack hoặc cài đặt, vui lòng liên hệ support qua Zalo để được hỗ trợ nhanh chóng 24/7.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
