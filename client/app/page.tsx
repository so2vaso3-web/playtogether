'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import {
  Shield, 
  Zap, 
  Users, 
  Clock, 
  CheckCircle2, 
  Star, 
  Download,
  Lock,
  HelpCircle,
  Mail,
  MessageSquare,
  Award,
  LayoutDashboard,
  Grid3x3,
  Coins,
  AlertTriangle,
  Sparkles,
  Smartphone,
  Apple,
  Monitor,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users2,
  Globe,
  ArrowRight,
  Package,
  Wallet
} from 'lucide-react';
import FAQ from '@/components/FAQ';
import PlatformBadge from '@/components/PlatformBadge';
import PackageFeatures from '@/components/PackageFeatures';
import Logo from '@/components/Logo';

export default function Home() {
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [packagesError, setPackagesError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'android' | 'ios' | 'emulator'>('all');
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const { scrollDirection, isAtTop } = useScrollDirection();

  useEffect(() => {
    // Load critical data first
    fetchPackages();
    checkUser();
    // Load site settings after a short delay (non-critical)
    setTimeout(() => {
      fetchSiteSettings();
    }, 100);
    
    // Listen for packages updates (when admin adds/edits packages)
    const handlePackagesUpdate = (event: any) => {
      console.log('[Home] Packages update event received', event);
      // Force reload packages immediately with cache busting
      // Use a small delay to ensure database is updated
      setTimeout(() => {
        console.log('[Home] Reloading packages...');
        fetchPackages();
      }, 500);
    };
    window.addEventListener('packagesUpdated', handlePackagesUpdate);
    
    // Also listen on storage event (for cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'packagesUpdated') {
        console.log('[Home] Storage event received, reloading packages');
        setTimeout(() => fetchPackages(), 500);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for BroadcastChannel messages (cross-tab)
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('packages-updates');
      channel.onmessage = (event) => {
        console.log('[Home] BroadcastChannel message received', event.data);
        setTimeout(() => fetchPackages(), 500);
      };
      
      return () => {
        channel.close();
        window.removeEventListener('packagesUpdated', handlePackagesUpdate);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
    
    return () => {
      window.removeEventListener('packagesUpdated', handlePackagesUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      window.removeEventListener('packagesUpdated', handlePackagesUpdate);
    };
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const response = await axios.get(`/api/settings?t=${Date.now()}`);
      console.log('[Home] Settings loaded:', response.data);
      setSiteSettings(response.data);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  // Listen for settings updates
  useEffect(() => {
    const handleSettingsUpdate = (event: any) => {
      console.log('[Home] Settings update event received', event);
      // Force reload settings immediately
      fetchSiteSettings();
    };
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  // Listen for user balance updates
  useEffect(() => {
    const handleBalanceUpdate = () => {
      console.log('[Home] User balance update event received');
      checkUser(); // Reload user data
    };
    window.addEventListener('userBalanceUpdated', handleBalanceUpdate);
    return () => {
      window.removeEventListener('userBalanceUpdated', handleBalanceUpdate);
    };
  }, []);

  const getZaloLink = () => {
    // Fixed Zalo link
    const fixedZaloId = '0896455341';
    if (siteSettings?.zaloId) {
      const zaloId = siteSettings.zaloId.trim();
      const cleanId = zaloId.replace(/^(https?:\/\/)?(www\.)?zalo\.me\//, '');
      return `https://zalo.me/${cleanId}`;
    }
    return `https://zalo.me/${fixedZaloId}`;
  };

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // API returns { user: ... } or direct user object
        const userData = response.data?.user || response.data;
        console.log('[Home] User loaded:', userData);
        setUser(userData);
      }
    } catch (error) {
      // User not logged in
      console.log('[Home] User not logged in');
    }
  };

  const fetchPackages = async () => {
    try {
      // Force fresh data with multiple cache busting methods
      const timestamp = Date.now();
      const random = Math.random();
      const response = await axios.get(`/api/packages?t=${timestamp}&r=${random}&_=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      console.log('[Home] Packages loaded:', response.data.length, 'packages');
      console.log('[Home] Package names:', response.data.map((p: any) => p.name));
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setPackages(response.data);
        setPackagesError(null);
      } else {
        console.warn('[Home] No packages found in response');
        setPackages([]);
        setPackagesError('Chưa có gói nào. Vui lòng liên hệ admin.');
      }
    } catch (error: any) {
      console.error('[Home] Error loading packages:', error);
      setPackages([]);
      setPackagesError('Lỗi tải gói: ' + (error.response?.data?.message || error.message || 'Không thể kết nối server'));
      // Only show toast for real errors, not empty packages
      if (error.response?.status && error.response.status !== 200) {
        toast.error('Lỗi tải gói');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary relative">
      <div className="animated-bg"></div>
      
      {/* Navigation */}
      <nav className={`relative z-50 glass border-b border-dark-border sticky top-0 transition-transform duration-300 ease-in-out ${
        isAtTop || scrollDirection === 'up' ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 flex-shrink">
              <Logo size="sm" showText={false} />
              <div className="hidden xs:block min-w-0">
                <h1 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold gradient-text truncate">
                  {siteSettings?.siteName || 'PlayTogether Hack'}
                </h1>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 truncate">
                  {siteSettings?.siteDescription || 'Premium Gaming Tools'}
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 flex-shrink-0">
              {user ? (
                <>
                  <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 hover:border-primary/40 transition-all">
                    <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
                    <span className="font-bold text-primary text-[10px] sm:text-xs md:text-sm whitespace-nowrap">{(user.balance || 0).toLocaleString('vi-VN')}₫</span>
                  </div>
                  <Link 
                    href="/dashboard" 
                    className="btn-secondary text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 flex items-center gap-1 sm:gap-1.5 md:gap-2"
                    title="Bảng Điều Khiển"
                  >
                    <Grid3x3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="hidden md:inline">Bảng Điều Khiển</span>
                    <span className="md:hidden">Dashboard</span>
                  </Link>
                  <Link 
                    href="/deposit" 
                    className="btn-primary text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 flex items-center gap-1 sm:gap-1.5 md:gap-2"
                    title="Nạp Tiền"
                  >
                    <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Nạp Tiền</span>
                    <span className="sm:hidden">Nạp</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary text-[10px] sm:text-xs md:text-sm px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 min-w-[50px] sm:min-w-[60px] md:min-w-[80px]">
                    Đăng Nhập
                  </Link>
                  <Link href="/register" className="btn-primary text-[10px] sm:text-xs md:text-sm px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 min-w-[50px] sm:min-w-[60px] md:min-w-[80px]">
                    Đăng Ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Banner Announcement */}
        {siteSettings?.bannerEnabled && siteSettings?.bannerText && (
          <div className="mb-6 px-4">
            <div className="gaming-card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30">
              {siteSettings.bannerLink ? (
                <Link href={siteSettings.bannerLink} className="block text-center py-3 text-white hover:text-primary transition">
                  {siteSettings.bannerText}
                </Link>
              ) : (
                <div className="text-center py-3 text-white">
                  {siteSettings.bannerText}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 px-2 sm:px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 gradient-text leading-tight px-2">
            {siteSettings?.heroTitle || 'PlayTogether Hack Store'}
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto mb-4 sm:mb-6 md:mb-8 px-2 leading-relaxed">
            {siteSettings?.heroDescription || 'Công cụ hack game hàng đầu với công nghệ Anti-Ban tiên tiến'}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 px-2">
            <Link href={siteSettings?.heroPrimaryButtonLink || '#packages'} className="btn-primary text-xs sm:text-sm md:text-base px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 w-full sm:w-auto flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>{siteSettings?.heroPrimaryButtonText || 'Xem Gói Ngay'}</span>
            </Link>
            <Link href={siteSettings?.heroSecondaryButtonLink || '/support'} className="btn-secondary text-xs sm:text-sm md:text-base px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 w-full sm:w-auto flex items-center justify-center gap-2">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>{siteSettings?.heroSecondaryButtonText || 'Hỗ Trợ'}</span>
            </Link>
          </div>
        </div>

        {/* Platform Filter */}
        <div className="mb-6 sm:mb-8 md:mb-12 px-2">
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs md:text-sm font-semibold transition flex items-center gap-1 sm:gap-1.5 md:gap-2 ${
                selectedPlatform === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-dark-card text-gray-400 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 icon-glow-primary flex-shrink-0" />
              <span className="whitespace-nowrap">Tất Cả</span>
            </button>
            <button
              onClick={() => setSelectedPlatform('android')}
              className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs md:text-sm font-semibold transition flex items-center gap-1 sm:gap-1.5 md:gap-2 ${
                selectedPlatform === 'android'
                  ? 'bg-primary text-white'
                  : 'bg-dark-card text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 icon-glow-info flex-shrink-0" />
              <span className="whitespace-nowrap">Android</span>
            </button>
            <button
              onClick={() => setSelectedPlatform('ios')}
              className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs md:text-sm font-semibold transition flex items-center gap-1 sm:gap-1.5 md:gap-2 ${
                selectedPlatform === 'ios'
                  ? 'bg-primary text-white'
                  : 'bg-dark-card text-gray-400 hover:text-white'
              }`}
            >
              <Apple className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 icon-glow-info flex-shrink-0" />
              <span className="whitespace-nowrap">iOS</span>
            </button>
            <button
              onClick={() => setSelectedPlatform('emulator')}
              className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs md:text-sm font-semibold transition flex items-center gap-1 sm:gap-1.5 md:gap-2 ${
                selectedPlatform === 'emulator'
                  ? 'bg-primary text-white'
                  : 'bg-dark-card text-gray-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 icon-glow-info flex-shrink-0" />
              <span className="whitespace-nowrap">Giả Lập</span>
            </button>
          </div>
        </div>

        {/* Packages Grid */}
        <div id="packages" className="mb-8 sm:mb-12 md:mb-16 lg:mb-20">
          {loading ? (
            <div className="text-center text-gray-400 text-base sm:text-lg md:text-xl py-12 sm:py-16 md:py-20">Đang tải...</div>
          ) : packagesError ? (
            <div className="text-center text-red-400 text-base sm:text-lg md:text-xl py-12 sm:py-16 md:py-20 px-4">
              {packagesError}
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center text-gray-400 text-base sm:text-lg md:text-xl py-12 sm:py-16 md:py-20 px-4">
              Chưa có gói nào. Vui lòng liên hệ admin.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-0">
              {packages
                .filter((pkg: any) => 
                  selectedPlatform === 'all' || 
                  pkg.platform === selectedPlatform || 
                  pkg.platform === 'all'
                )
                .map((pkg: any, index: number) => {
                  const isHot = index === 1;
                  const isPopular = pkg.price >= 599000;
                  
                  // Auto-calculate banRisk if not set
                  let banRisk = pkg.banRisk;
                  let antiBanGuarantee = pkg.antiBanGuarantee;
                  
                  if (!banRisk) {
                    if (pkg.price >= 500000) {
                      banRisk = 'none';
                      antiBanGuarantee = true;
                    } else if (pkg.price >= 300000) {
                      banRisk = 'low';
                    } else if (pkg.price >= 100000) {
                      banRisk = 'medium';
                    } else {
                      banRisk = 'high';
                    }
                  }
                  
                  return (
                <div
                  key={pkg.id || pkg._id}
                  className="gaming-card group relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Anti-Ban Guarantee Badge */}
                  {antiBanGuarantee && (
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
                      <div className="bg-gradient-to-r from-success to-success/80 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg shadow-success/50 flex items-center gap-0.5 sm:gap-1">
                        <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">KHÔNG BAN</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Ban Risk Warning - Hiển thị cho tất cả mức độ nguy cơ */}
                  {!antiBanGuarantee && banRisk && banRisk !== 'none' && (
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
                      {banRisk === 'high' && (
                        <div className="bg-gradient-to-r from-danger to-danger/80 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg shadow-danger/50 flex items-center gap-0.5 sm:gap-1">
                          <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                          <span className="whitespace-nowrap">NGUY CƠ BAN</span>
                        </div>
                      )}
                      {banRisk === 'medium' && (
                        <div className="bg-gradient-to-r from-warning to-warning/80 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg shadow-warning/50 flex items-center gap-0.5 sm:gap-1">
                          <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                          <span className="whitespace-nowrap">NGUY CƠ TRUNG BÌNH</span>
                        </div>
                      )}
                      {banRisk === 'low' && (
                        <div className="bg-gradient-to-r from-info to-info/80 text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg shadow-info/50 flex items-center gap-0.5 sm:gap-1">
                          <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                          <span className="whitespace-nowrap">NGUY CƠ THẤP</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Hot/Popular Badges */}
                  {isHot && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
                      <div className="bg-gradient-to-r from-danger to-warning text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg animate-pulse flex items-center gap-0.5 sm:gap-1">
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">HOT</span>
                      </div>
                    </div>
                  )}
                  {isPopular && !isHot && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
                      <div className="bg-gradient-to-r from-primary to-secondary text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg flex items-center gap-0.5 sm:gap-1">
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-warning text-warning flex-shrink-0" />
                        <span className="whitespace-nowrap text-[9px] sm:text-xs">PHỔ BIẾN</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-4 sm:mb-6 pt-1">
                    <div className="icon-container w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-2xl relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                      {(() => {
                        // Kiểm tra xem icon có hợp lệ không (có extension ảnh)
                        const isValidImage = pkg.icon && 
                          pkg.icon.trim() && 
                          (pkg.icon.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || pkg.icon.startsWith('http'));
                        
                        if (isValidImage) {
                          const imageSrc = pkg.icon.startsWith('http') 
                            ? pkg.icon 
                            : pkg.icon.startsWith('/') 
                              ? pkg.icon 
                              : `/${pkg.icon}`;
                          
                          return (
                            <div className="relative w-full h-full">
                              <img 
                                src={imageSrc} 
                                alt=""
                                className="w-full h-full object-contain p-2"
                                loading="lazy"
                                decoding="async"
                                style={{ fontFamily: 'monospace', fontSize: '0px', color: 'transparent' }}
                                onError={(e) => {
                                  // Ẩn ảnh lỗi ngay lập tức và ẩn mọi text
                                  const img = e.currentTarget as HTMLImageElement;
                                  img.style.display = 'none';
                                  img.style.visibility = 'hidden';
                                  img.style.opacity = '0';
                                  img.style.width = '0';
                                  img.style.height = '0';
                                  // Hiển thị icon fallback
                                  const parent = img.parentElement;
                                  if (parent) {
                                    const existingFallback = parent.querySelector('.fallback-icon');
                                    if (!existingFallback) {
                                      const fallback = document.createElement('div');
                                      fallback.className = 'fallback-icon absolute inset-0 flex items-center justify-center';
                                      fallback.innerHTML = '<svg class="w-8 h-8 sm:w-10 sm:h-10 text-primary icon-glow-primary icon-float" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>';
                                      parent.appendChild(fallback);
                                    }
                                  }
                                }}
                              />
                            </div>
                          );
                        }
                        return <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary icon-glow-primary icon-float" />;
                      })()}
                      {isHot && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-danger rounded-full animate-ping"></div>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 px-2 break-words line-clamp-2">
                      {pkg.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 flex-wrap px-2">
                      <PlatformBadge platform={pkg.platform || 'all'} size="sm" />
                      {pkg.version && (
                        <span className="badge badge-info text-[10px] sm:text-xs">v{pkg.version}</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 mb-4 sm:mb-6 text-center min-h-[48px] sm:min-h-[60px] text-xs sm:text-sm leading-relaxed px-2 line-clamp-3">
                    {pkg.description || 'Không có mô tả'}
                  </p>

                  {/* GUI Giới Thiệu Tính Năng - Compact cho trang chủ */}
                  {pkg.detailedFeatures && Object.keys(pkg.detailedFeatures).length > 0 && (
                    <div className="mb-3 sm:mb-4 px-2">
                      {(() => {
                        // Lọc tính năng dựa trên giá gói: gói rẻ ít tính năng, gói đắt nhiều tính năng
                        const price = pkg.price || 0;
                        let filteredFeatures: any = {};
                        let featureRatio = 1; // Tỷ lệ tính năng hiển thị
                        
                        // Xác định tỷ lệ tính năng dựa trên giá
                        if (price < 250000) {
                          // Gói rẻ (< 250k): Hiển thị ~35% tính năng cơ bản
                          featureRatio = 0.35;
                        } else if (price < 450000) {
                          // Gói trung bình (250k - 450k): Hiển thị ~65% tính năng
                          featureRatio = 0.65;
                        } else {
                          // Gói cao cấp (>= 450k): Hiển thị 100% tính năng
                          featureRatio = 1.0;
                        }
                        
                        // Lọc tính năng theo tỷ lệ cho từng category
                        Object.keys(pkg.detailedFeatures).forEach((category) => {
                          const categoryFeatures = pkg.detailedFeatures[category] || [];
                          const featuresCount = Math.max(1, Math.ceil(categoryFeatures.length * featureRatio));
                          filteredFeatures[category] = categoryFeatures.slice(0, featuresCount);
                        });
                        
                        // Tính tổng số tính năng gốc và đã lọc
                        const totalOriginalFeatures = Object.values(pkg.detailedFeatures).flat().length;
                        const totalFilteredFeatures = Object.values(filteredFeatures).flat().length;
                        
                        return (
                          <div>
                            {/* Badge hiển thị số tính năng */}
                            {totalOriginalFeatures > 0 && (
                              <div className="mb-2 flex items-center justify-center gap-2">
                                <div className="badge badge-info text-[10px] sm:text-xs px-2 py-1">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  {totalFilteredFeatures}/{totalOriginalFeatures} tính năng
                                  {price < 250000 && <span className="ml-1">(Cơ Bản)</span>}
                                  {price >= 250000 && price < 450000 && <span className="ml-1">(Premium)</span>}
                                  {price >= 450000 && <span className="ml-1">(Elite)</span>}
                                </div>
                              </div>
                            )}
                            <PackageFeatures features={filteredFeatures} compact={true} price={price} />
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Fallback: Simple features list nếu không có detailedFeatures */}
                  {!pkg.detailedFeatures && pkg.features && pkg.features.length > 0 && (
                    <div className="mb-4 sm:mb-6 space-y-2 px-2">
                      <div className="font-semibold text-white text-xs sm:text-sm mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 justify-between">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                          <span>Tính năng:</span>
                        </div>
                        {(() => {
                          const price = pkg.price || 0;
                          let maxShow = 4; // Default
                          if (price < 250000) {
                            maxShow = 3; // Gói rẻ: ít tính năng
                          } else if (price < 450000) {
                            maxShow = 5; // Gói trung bình: nhiều hơn
                          } else {
                            maxShow = pkg.features.length; // Gói cao cấp: tất cả
                          }
                          return (
                            <div className="badge badge-info text-[9px] sm:text-[10px]">
                              {Math.min(maxShow, pkg.features.length)}/{pkg.features.length}
                            </div>
                          );
                        })()}
                      </div>
                      {(() => {
                        const price = pkg.price || 0;
                        let maxShow = 4;
                        if (price < 250000) {
                          maxShow = 3;
                        } else if (price < 450000) {
                          maxShow = 5;
                        } else {
                          maxShow = pkg.features.length;
                        }
                        const featuresToShow = pkg.features.slice(0, maxShow);
                        return (
                          <>
                            {featuresToShow.map((feature: string, idx: number) => (
                              <div key={idx} className="flex items-start text-xs sm:text-sm gap-1.5 sm:gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-gray-400 break-words line-clamp-2">{feature}</span>
                              </div>
                            ))}
                            {pkg.features.length > maxShow && (
                              <div className="text-gray-500 text-[10px] sm:text-xs pl-5 sm:pl-6">
                                + {pkg.features.length - maxShow} tính năng khác
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                  
                  <div className="mb-4 sm:mb-6 text-center px-2">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1.5 sm:mb-2 break-words">
                      {pkg.price.toLocaleString('vi-VN')}₫
                    </div>
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-gray-400 text-xs sm:text-sm">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="break-words">Thời hạn: <span className="text-primary font-semibold">{pkg.duration} ngày</span></span>
                    </div>
                  </div>

                    <div className="mb-4 sm:mb-6 space-y-1.5 sm:space-y-2 px-2">
                    {antiBanGuarantee ? (
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-success font-semibold bg-success/10 px-2 py-1 rounded">
                        <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 icon-glow-success flex-shrink-0" />
                        <span className="text-center break-words">✅ Đảm bảo không ban - Hoàn tiền nếu bị ban</span>
                      </div>
                    ) : banRisk === 'high' ? (
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-danger font-semibold bg-danger/10 px-2 py-1 rounded">
                        <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 icon-glow-danger flex-shrink-0" />
                        <span className="text-center break-words">⚠️ Gói rẻ - Có nguy cơ bị ban</span>
                      </div>
                    ) : banRisk === 'medium' ? (
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-warning font-semibold bg-warning/10 px-2 py-1 rounded">
                        <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 icon-glow-warning flex-shrink-0" />
                        <span className="text-center break-words">⚠️⚠️ Nguy cơ trung bình - Cẩn thận khi sử dụng</span>
                      </div>
                    ) : banRisk === 'low' ? (
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-info font-semibold bg-info/10 px-2 py-1 rounded">
                        <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 icon-glow-info flex-shrink-0" />
                        <span className="text-center break-words">🛡️ Nguy cơ thấp - An toàn cao</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                        <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 icon-glow-primary flex-shrink-0" />
                        <span className="text-center break-words">Bảo hành trong thời gian sử dụng</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                      <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 icon-glow-warning flex-shrink-0" />
                      <span className="text-center break-words">Update miễn phí khi game update</span>
                    </div>
                    {pkg.systemRequirements && (
                      <div className="text-[10px] sm:text-xs text-gray-500 text-center mt-2 pt-2 border-t border-dark-border px-2 break-words">
                        {pkg.systemRequirements}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/packages/${pkg.id || pkg._id}`}
                    className="btn-primary w-full text-center flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Mua Ngay</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
                  );
              })}
            </div>
          )}
        </div>

        {/* Features Showcase */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 gradient-text">
              Tính Năng Nổi Bật
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto">
              Tại sao chọn chúng tôi?
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="gaming-card text-center group">
              <div className="icon-container w-16 h-16 mx-auto mb-6 rounded-2xl">
                <Shield className="w-8 h-8 text-primary icon-glow-primary icon-float" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Anti-Ban System</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Hệ thống chống ban tiên tiến sử dụng AI, tỷ lệ an toàn cao nhất thị trường
              </p>
            </div>
            <div className="gaming-card text-center group">
              <div className="icon-container w-16 h-16 mx-auto mb-6 rounded-2xl">
                <Zap className="w-8 h-8 text-warning icon-glow-warning icon-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Auto Update</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Tự động cập nhật khi game update, không cần chờ đợi hay thao tác thủ công
              </p>
            </div>
            <div className="gaming-card text-center group">
              <div className="icon-container w-16 h-16 mx-auto mb-6 rounded-2xl">
                <Download className="w-8 h-8 text-warning icon-glow-warning icon-float" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Easy Setup</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Cài đặt đơn giản với hướng dẫn chi tiết, chỉ cần vài phút là có thể sử dụng ngay
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-16 lg:mb-20">
          <div className="gaming-card text-center neon-border-blue group hover:scale-105 transition-transform">
            <div className="icon-container w-16 h-16 mx-auto mb-3 rounded-full">
              <Users2 className="w-8 h-8 text-primary icon-glow-primary icon-float" />
            </div>
            <div className="text-4xl font-bold text-secondary mb-2">10,000+</div>
            <div className="text-gray-400 text-sm">Người dùng</div>
          </div>
          <div className="gaming-card text-center neon-border group hover:scale-105 transition-transform">
            <div className="icon-container w-16 h-16 mx-auto mb-3 rounded-full">
              <Package className="w-8 h-8 text-warning icon-glow-warning icon-float" />
            </div>
            <div className="text-4xl font-bold text-warning mb-2">50+</div>
            <div className="text-gray-400 text-sm">Gói hack</div>
          </div>
          <div className="gaming-card text-center neon-border group hover:scale-105 transition-transform">
            <div className="icon-container w-16 h-16 mx-auto mb-3 rounded-full">
              <Star className="w-8 h-8 text-warning fill-warning icon-glow-warning icon-float" />
            </div>
            <div className="text-4xl font-bold text-warning mb-2">4.9/5</div>
            <div className="text-gray-400 text-sm">Đánh giá trung bình</div>
          </div>
          <div className="gaming-card text-center neon-border group hover:scale-105 transition-transform">
            <div className="icon-container w-16 h-16 mx-auto mb-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-primary icon-glow-primary icon-float" />
            </div>
            <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
            <div className="text-gray-400 text-sm">Tỷ lệ thành công</div>
          </div>
        </div>

        {/* Zalo Contact Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="gaming-card bg-gradient-to-br from-[#0068FF]/20 to-[#0068FF]/10 border-2 border-[#0068FF]/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0068FF] rounded-full flex items-center justify-center shadow-lg shadow-[#0068FF]/50">
                      <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                      Cần Hỗ Trợ?
                    </h3>
                  </div>
                  <p className="text-gray-300 text-sm sm:text-base mb-4">
                    Liên hệ với chúng tôi qua Zalo để được hỗ trợ nhanh chóng 24/7. Đội ngũ support sẵn sàng giải đáp mọi thắc mắc của bạn!
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span>Phản hồi trong 5 phút</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span>Hỗ trợ 24/7</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span>Giải đáp mọi thắc mắc</span>
                    </div>
                  </div>
                </div>
                {siteSettings?.zaloQrUrl ? (
                  <div className="flex flex-col items-center gap-3 flex-shrink-0">
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-xl">
                      <img
                        src={siteSettings.zaloQrUrl}
                        alt="Zalo QR Code"
                        className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <p className="text-white text-sm font-semibold text-center">Quét QR để liên hệ Zalo</p>
                  </div>
                ) : siteSettings?.zaloId ? (
                  <a
                    href={getZaloLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold bg-[#0068FF] hover:bg-[#0052CC] border-[#0068FF] hover:border-[#0052CC] shadow-lg shadow-[#0068FF]/50 hover:shadow-[#0068FF]/70 transition-all hover:scale-105 flex-shrink-0"
                  >
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Liên Hệ Zalo Ngay</span>
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <FAQ />


        {/* Footer */}
        <footer className="border-t border-dark-border pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary icon-glow-primary icon-float" />
                PlayTogether Hack
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Nền tảng hack game hàng đầu Việt Nam với công nghệ tiên tiến và đội ngũ support chuyên nghiệp.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Liên Hệ</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <a 
                  href={getZaloLink()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-info hover:text-info-600 transition group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0068FF] flex items-center justify-center group-hover:scale-110 transition">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold">Zalo: {siteSettings?.zaloId ? siteSettings.zaloId : '0896455341'}</span>
                </a>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 icon-glow-primary" />
                  <span>support@playtogetherhack.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 icon-glow-info" />
                  <span>Telegram: @playtogetherhack</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Hỗ Trợ</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <Link href="/#faq" className="flex items-center gap-2 hover:text-primary transition">
                  <HelpCircle className="w-4 h-4 icon-glow-primary" />
                  <span>FAQ</span>
                </Link>
                <Link href="/support" className="flex items-center gap-2 hover:text-primary transition">
                  <MessageSquare className="w-4 h-4 icon-glow-info" />
                  <span>Ticket Support</span>
                </Link>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 icon-glow-warning icon-pulse" />
                  <span>Support 24/7</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-dark-border pt-8">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mb-4">
              <Link href="/terms" className="hover:text-primary transition">
                Điều Khoản Sử Dụng
              </Link>
              <Link href="/privacy" className="hover:text-primary transition">
                Chính Sách Bảo Mật
              </Link>
              <Link href="/support" className="hover:text-primary transition">
                Hỗ Trợ
              </Link>
            </div>
            <div className="text-center text-sm text-gray-400">
              <p>© 2024 PlayTogether Hack. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Floating Zalo Button */}
        <a
          href={getZaloLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 group"
          title="Liên hệ Zalo"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-[#0068FF] rounded-full blur-lg opacity-50 group-hover:opacity-75 transition animate-pulse"></div>
            <div className="relative bg-[#0068FF] w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
              <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-danger rounded-full flex items-center justify-center animate-ping">
              <div className="w-3 h-3 bg-danger rounded-full"></div>
            </div>
          </div>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-dark-card border border-dark-border px-3 py-2 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="text-white text-sm font-semibold">Liên hệ Zalo</div>
            <div className="text-gray-400 text-xs">Hỗ trợ 24/7</div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-dark-card border-r border-b border-dark-border rotate-45"></div>
          </div>
        </a>
      </main>
    </div>
  );
}
