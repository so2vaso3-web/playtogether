'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle2,
  Download,
  Sparkles,
  Plus,
  Building2,
  Copy,
  QrCode,
  AlertCircle,
  Wallet,
  CheckCircle,
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function Deposit() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [requestCreated, setRequestCreated] = useState(false);
  const [createdAmount, setCreatedAmount] = useState(0);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const { scrollDirection, isAtTop } = useScrollDirection();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUser();
    fetchBanks();
    
    // Listen for banks updates
    const handleBanksUpdate = () => {
      console.log('[Deposit] Banks update event received - FORCING RELOAD');
      fetchBanks(true); // Force reload
    };
    window.addEventListener('banksUpdated', handleBanksUpdate);
    
    // Listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'banksUpdated') {
        console.log('[Deposit] Banks update from localStorage - FORCING RELOAD');
        fetchBanks(true); // Force reload
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for BroadcastChannel messages
    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel('banks-updates');
      broadcastChannel.onmessage = (e) => {
        if (e.data.type === 'banksUpdated') {
          console.log('[Deposit] Banks update from BroadcastChannel - FORCING RELOAD');
          fetchBanks(true); // Force reload
        }
      };
    }
    
    // Check localStorage on mount
    const checkBanksUpdate = () => {
      const lastUpdate = localStorage.getItem('banksUpdated');
      if (lastUpdate) {
        const now = Date.now();
        const updateTime = parseInt(lastUpdate);
        // If updated within last 10 seconds, reload
        if (now - updateTime < 10000) {
          console.log('[Deposit] Recent banks update detected, FORCING RELOAD...');
          fetchBanks(true); // Force reload
        }
      }
    };
    checkBanksUpdate();
    
    return () => {
      window.removeEventListener('banksUpdated', handleBanksUpdate);
      window.removeEventListener('storage', handleStorageChange);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // API returns { user: ... } or direct user object
      const userData = response.data?.user || response.data;
      console.log('[Deposit] User loaded:', userData);
      console.log('[Deposit] User balance:', userData?.balance);
      setUser(userData);
    } catch (error) {
      router.push('/login');
    }
  };

  // Helper to get effective bankCode (with auto-detect for 3456345670 ONLY if bankCode is missing)
  const getEffectiveBankCode = (bank: any): string => {
    // Priority 1: Use bankCode from database if available
    let bankCode = bank.bankCode ? String(bank.bankCode).trim().toLowerCase() : '';
    const accountNumber = bank.accountNumber ? String(bank.accountNumber).trim() : '';
    
    // Priority 2: Auto-detect ONLY if bankCode is truly missing
    // Special case: if account is 3456345670 and no bankCode, use ICB
    if (!bankCode && accountNumber === '3456345670') {
      bankCode = 'icb';
    }
    
    return bankCode;
  };

  const fetchBanks = async (forceReload = false) => {
    try {
      // Force cache busting
      const cacheBuster = forceReload ? `&_=${Date.now()}` : `?t=${Date.now()}`;
      const response = await axios.get(`/api/banks${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('[Deposit] Banks loaded:', response.data.length, forceReload ? '(FORCED RELOAD)' : '');
      const activeBanks = response.data.filter((b: any) => b.isActive !== false);
      
      // Enrich banks with effective bankCode (only if bankCode is missing)
      const enrichedBanks = activeBanks.map((b: any) => {
        // Only auto-detect if bankCode is truly missing from database
        let effectiveCode = b.bankCode ? String(b.bankCode).trim().toLowerCase() : '';
        if (!effectiveCode) {
          effectiveCode = getEffectiveBankCode(b);
        }
        return {
          ...b,
          effectiveBankCode: effectiveCode,
          // Ensure bankCode is set from database if available
          bankCode: b.bankCode ? String(b.bankCode).trim().toLowerCase() : effectiveCode
        };
      });
      
      enrichedBanks.forEach((b: any) => {
        const hasQR = !!(b.effectiveBankCode && b.accountNumber);
        console.log(`[Deposit] Bank: ${b.bankName || b.name}`, {
          _id: b._id,
          code: b.bankCode || 'MISSING',
          effectiveCode: b.effectiveBankCode || 'MISSING',
          account: b.accountNumber || 'MISSING',
          canShowQR: hasQR,
          fullData: b
        });
      });
      
      setBanks(enrichedBanks);
      if (enrichedBanks.length > 0) {
        // Find bank by ID if selectedBank exists, otherwise pick best one
        let selected = null;
        if (selectedBank?._id || selectedBank?.id) {
          const currentId = selectedBank._id || selectedBank.id;
          selected = enrichedBanks.find((b: any) => (b._id || b.id) === currentId);
        }
        if (!selected) {
          // Ưu tiên chọn bank có đủ thông tin để hiển thị QR
          selected = enrichedBanks.find((b: any) => b.effectiveBankCode && b.accountNumber) || enrichedBanks[0];
        }
        // Ensure _id is set for compatibility
        if (selected && !selected._id && selected.id) {
          selected._id = selected.id;
        }
        setSelectedBank(selected);
        console.log('[Deposit] Selected bank:', {
          _id: selected._id || selected.id,
          name: selected.bankName || selected.name,
          code: selected.bankCode || 'MISSING',
          effectiveCode: selected.effectiveBankCode || 'MISSING',
          account: selected.accountNumber || 'MISSING',
          canShowQR: !!(selected.effectiveBankCode && selected.accountNumber),
          fullData: selected
        });
      } else {
        setBanks([]);
        setSelectedBank(null);
      }
    } catch (error: any) {
      console.error('[Deposit] Error fetching banks:', error);
      console.error('[Deposit] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.response?.data?.message || 'Lỗi tải danh sách ngân hàng');
      setBanks([]);
      setSelectedBank(null);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        router.push('/login');
        setLoading(false);
        return;
      }

      if (!amount || amount.trim() === '') {
        toast.error('Vui lòng nhập số tiền');
        setLoading(false);
        return;
      }

      const depositAmount = parseInt(amount.replace(/\D/g, ''));

      if (isNaN(depositAmount) || depositAmount <= 0) {
        toast.error('Vui lòng nhập số tiền hợp lệ');
        setLoading(false);
        return;
      }

      if (depositAmount < 10000) {
        toast.error('Số tiền tối thiểu là 10,000₫');
        setLoading(false);
        return;
      }

      if (!selectedBank) {
        toast.error('Vui lòng chọn ngân hàng');
        setLoading(false);
        return;
      }

      // Tạo nội dung chuyển khoản random
      const transferContent = generateTransferContent(depositAmount);
      
      const bankId = selectedBank._id || selectedBank.id;
      const bankName = selectedBank.bankName || selectedBank.name || 'Ngân hàng';
      
      console.log('[Deposit] Creating deposit request:', {
        amount: depositAmount,
        method: `Chuyển khoản ${bankName}`,
        bankId: bankId,
        transferContent,
        selectedBank: {
          _id: selectedBank._id,
          id: selectedBank.id,
          name: bankName,
        },
      });
      
      const response = await axios.post(
        '/api/deposits/create',
        { 
          amount: depositAmount, 
          method: `Chuyển khoản ${bankName}`,
          description: `Nạp tiền ${depositAmount.toLocaleString('vi-VN')}₫ - ${transferContent}`,
          bankId: bankId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('[Deposit] Deposit request created:', response.data);

      toast.success(`Yêu cầu nạp tiền ${depositAmount.toLocaleString('vi-VN')}₫ đã được tạo. Vui lòng chuyển khoản và chờ admin xác nhận.`);
      setCreatedAmount(depositAmount);
      setRequestCreated(true);
      setPaymentCompleted(false);
    } catch (error: any) {
      console.error('[Deposit] Error creating deposit:', error);
      console.error('[Deposit] Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Nạp tiền thất bại';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã copy ${label}`);
  };

  // Generate random transfer content
  const generateTransferContent = (amount: number): string => {
    // Format: Random 6-8 character code + amount (last 4 digits)
    const randomChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars (I, O, 0, 1)
    const randomCode = Array.from({ length: 6 }, () => 
      randomChars[Math.floor(Math.random() * randomChars.length)]
    ).join('');
    const amountSuffix = String(amount).slice(-4); // Last 4 digits of amount
    return `${randomCode}${amountSuffix}`.substring(0, 20);
  };

  const getTransferContent = () => {
    if (!amount || !user) return '';
    const amt = parseInt(amount);
    if (isNaN(amt) || amt < 10000) return '';
    return generateTransferContent(amt);
  };

  const transferContent = getTransferContent();

  return (
    <div className="min-h-screen bg-dark-primary relative">
      <div className="animated-bg"></div>
      
      {/* Navigation */}
      <nav className={`relative z-50 glass border-b border-dark-border sticky top-0 transition-transform duration-300 ease-in-out ${
        isAtTop || scrollDirection === 'up' ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Logo size="sm" showText={true} />
            </Link>
            <div className="flex gap-1.5 sm:gap-2 lg:gap-3">
              <Link href="/dashboard" className="text-gray-400 hover:text-primary transition font-medium text-sm sm:text-base px-2 sm:px-3">
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">Nạp Tiền Vào Ví</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-400">Nạp tiền để mua các gói hack</p>
            </div>
            {/* Balance Display - New Design */}
            {user && (
              <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 gaming-card neon-border-blue relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
                <div className="relative flex items-center gap-3 w-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-400 text-xs sm:text-sm mb-1">Số dư hiện tại</div>
                    <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {user?.balance?.toLocaleString('vi-VN') || 0}₫
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Deposit Form - Ẩn khi đã tạo yêu cầu */}
            {!requestCreated && (
              <div className="gaming-card">
                <form onSubmit={handleDeposit} className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-white mb-3 font-semibold flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    Số tiền cần nạp
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="gaming-input w-full text-xl"
                      placeholder="Nhập số tiền (VD: 100000)"
                      required
                      min="10000"
                    />
                  </div>
                  <div className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Tối thiểu: 10,000₫
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <label className="block text-gray-400 text-xs sm:text-sm mb-2">Nạp nhanh:</label>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmount(amt.toString())}
                        className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border transition text-xs sm:text-sm font-semibold ${
                          amount === amt.toString()
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-dark-border bg-dark-card text-gray-300 hover:border-primary/50'
                        }`}
                      >
                        {amt >= 1000 ? `${amt / 1000}K` : amt}₫
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bank Selection */}
                {banks.length > 0 && (
                  <div>
                    <label className="block text-white mb-2 sm:mb-3 font-semibold flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Chọn ngân hàng
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {banks.map((bank: any) => {
                        const effectiveCode = getEffectiveBankCode(bank);
                        const hasQR = !!(effectiveCode && bank.accountNumber);
                        const bankId = bank._id || bank.id;
                        const isSelected = selectedBank && (
                          (selectedBank._id && selectedBank._id === bankId) ||
                          (selectedBank.id && selectedBank.id === bankId) ||
                          (!selectedBank._id && !selectedBank.id && selectedBank === bank)
                        );
                        return (
                          <button
                            key={bankId || bank.bankName || bank.name}
                            type="button"
                            onClick={() => {
                              // Ensure _id is set for compatibility
                              const bankToSelect = { ...bank };
                              if (!bankToSelect._id && bankToSelect.id) {
                                bankToSelect._id = bankToSelect.id;
                              }
                              console.log('[Deposit] Bank selected:', {
                                _id: bankToSelect._id || bankToSelect.id,
                                name: bankToSelect.bankName || bankToSelect.name,
                                code: bankToSelect.bankCode || 'MISSING',
                                effectiveCode: effectiveCode || 'MISSING',
                                account: bankToSelect.accountNumber || 'MISSING',
                                canShowQR: hasQR,
                                fullData: bankToSelect
                              });
                              setSelectedBank(bankToSelect);
                            }}
                            className={`p-4 rounded-lg border-2 transition text-left ${
                              isSelected
                                ? 'border-primary bg-primary/10'
                                : 'border-dark-border bg-dark-card hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-bold text-white mb-1">{bank.bankName || bank.name}</div>
                                <div className="text-gray-400 text-xs">STK: {bank.accountNumber || 'N/A'}</div>
                                <div className="text-gray-400 text-xs">Chủ TK: {bank.accountName || 'N/A'}</div>
                                {hasQR && (
                                  <div className="text-success text-xs mt-1 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Có QR Code
                                  </div>
                                )}
                                {!hasQR && (
                                  <div className="text-warning text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {!effectiveCode ? 'Thiếu mã ngân hàng' : 'Thiếu STK'}
                                  </div>
                                )}
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!selectedBank && banks.length === 0 && (
                  <div className="gaming-card bg-warning/10 border border-warning/30">
                    <div className="flex items-center gap-2 text-warning">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm">Chưa có ngân hàng nào. Vui lòng liên hệ admin.</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !selectedBank}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Đang xử lý...'
                  ) : !selectedBank ? (
                    'Vui lòng chọn ngân hàng'
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Tạo Yêu Cầu Nạp Tiền
                    </>
                  )}
                </button>
              </form>
              </div>
            )}

            {/* Right Column - QR Code & Bank Info - Hiển thị khi đã tạo yêu cầu */}
            {requestCreated && selectedBank && createdAmount >= 10000 && (
              <div className="gaming-card neon-border-blue w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-1.5 sm:gap-2">
                    <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    Thông Tin Chuyển Khoản
                  </h3>
                  <button
                    onClick={() => {
                      setRequestCreated(false);
                      setAmount('');
                      setCreatedAmount(0);
                    }}
                    className="text-gray-400 hover:text-white transition text-xs sm:text-sm"
                  >
                    Tạo yêu cầu mới
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* QR Code */}
                  <div className="text-center">
                    {(() => {
                      // Priority 1: Direct QR code image
                      if (selectedBank.qrCode) {
                        const qrUrl = selectedBank.qrCode.startsWith('http') 
                          ? selectedBank.qrCode 
                          : `/api/public/uploads/${selectedBank.qrCode}`;
                        return (
                          <div className="bg-white p-3 sm:p-4 rounded-lg inline-block mb-2 sm:mb-3">
                            <img
                              src={qrUrl}
                              alt="QR Code"
                              className="w-full max-w-[180px] sm:max-w-[220px] lg:max-w-[250px] h-auto"
                              onError={(e) => {
                                // Fallback to VietQR
                                const img = e.currentTarget as HTMLImageElement;
                                let bankCode = selectedBank.bankCode ? String(selectedBank.bankCode).toLowerCase().trim() : '';
                                if (!bankCode && selectedBank.effectiveBankCode) {
                                  bankCode = selectedBank.effectiveBankCode;
                                }
                                const accountNumber = selectedBank.accountNumber ? String(selectedBank.accountNumber).trim().replace(/\s/g, '') : '';
                                
                                if (bankCode && accountNumber) {
                                  const addInfo = generateTransferContent(createdAmount);
                                  const amountInt = Math.floor(createdAmount);
                                  const encodedAddInfo = encodeURIComponent(addInfo.trim());
                                  const vietQrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.jpg?amount=${amountInt}&addInfo=${encodedAddInfo}`;
                                  console.log('[Deposit] Fallback QR URL (QR nạp tiền):', { 
                                    url: vietQrUrl, 
                                    amount: amountInt, 
                                    addInfo: addInfo, 
                                    encoded: encodedAddInfo,
                                    note: 'QR code này chứa sẵn số tiền và nội dung chuyển khoản',
                                  });
                                  console.log('[Deposit] QR fallback to VietQR:', { bankCode, accountNumber, url: vietQrUrl });
                                  img.src = vietQrUrl;
                                }
                              }}
                            />
                          </div>
                        );
                      }
                      
                      // Priority 2: VietQR API
                      // Use bankCode from database first, fallback to effectiveBankCode
                      let bankCode = selectedBank.bankCode ? String(selectedBank.bankCode).toLowerCase().trim() : '';
                      if (!bankCode && selectedBank.effectiveBankCode) {
                        bankCode = selectedBank.effectiveBankCode;
                      }
                      let accountNumber = selectedBank.accountNumber ? String(selectedBank.accountNumber).trim().replace(/\s/g, '') : '';
                      
                      console.log('[Deposit] Using bankCode for QR:', {
                        fromDatabase: selectedBank.bankCode,
                        effective: selectedBank.effectiveBankCode,
                        final: bankCode,
                        account: accountNumber
                      });
                      
                      console.log('[Deposit] Checking QR conditions:', {
                        hasBankCode: !!bankCode,
                        hasAccountNumber: !!accountNumber,
                        bankCode: bankCode,
                        accountNumber: accountNumber,
                        bankCodeLength: bankCode.length,
                        accountNumberLength: accountNumber.length,
                        selectedBank: selectedBank
                      });
                      
                      if (bankCode && accountNumber && bankCode.length > 0 && accountNumber.length > 0) {
                        // Sử dụng số tiền từ input hoặc createdAmount
                        const currentAmount = createdAmount || (amount ? parseInt(amount.replace(/\D/g, '')) : 0);
                        const amountValue = currentAmount >= 10000 ? currentAmount : 0;
                        const addInfo = amountValue > 0 ? generateTransferContent(amountValue) : '';
                        
                        // Format URL theo đúng VietQR.io Quicklink API
                        // Format: https://img.vietqr.io/image/{bankCode}-{accountNumber}-compact.jpg?amount={amount}&addInfo={addInfo}
                        // Đảm bảo:
                        // - amount: số nguyên (không có dấu phẩy, không có .0)
                        // - addInfo: nội dung chuyển khoản (được encode URL)
                        // - bankCode: mã ngân hàng (chữ thường, không có khoảng trắng)
                        // - accountNumber: số tài khoản (không có khoảng trắng)
                        const amountInt = Math.floor(amountValue);
                        // Encode addInfo để đảm bảo các ký tự đặc biệt được xử lý đúng
                        const encodedAddInfo = addInfo ? encodeURIComponent(addInfo.trim()) : '';
                        
                        // Tạo URL QR code với số tiền và nội dung chuyển khoản
                        // Khi khách quét QR code này bằng app ngân hàng, app sẽ tự động điền số tiền và nội dung
                        const vietQrUrl = amountValue > 0 && addInfo
                          ? `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.jpg?amount=${amountInt}&addInfo=${encodedAddInfo}`
                          : `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.jpg`;
                        
                        console.log('[Deposit] QR Code VietQR (QR nạp tiền):', {
                          url: vietQrUrl,
                          bankCode: bankCode,
                          accountNumber: accountNumber,
                          amount: amountInt,
                          addInfo: addInfo,
                          encodedAddInfo: encodedAddInfo,
                          note: 'QR code này chứa sẵn số tiền và nội dung chuyển khoản. Khi quét bằng app ngân hàng, thông tin sẽ tự động điền.',
                        });
                        
                        console.log('[Deposit] Generating VietQR:', { 
                          bankCode, 
                          accountNumber, 
                          amountValue, 
                          addInfo,
                          url: vietQrUrl,
                          bankName: selectedBank.bankName || selectedBank.name,
                          fullSelectedBank: selectedBank
                        });
                        
                        return (
                          <div className="text-center">
                            <div className="bg-white p-3 sm:p-4 rounded-lg inline-block mb-2 sm:mb-3">
                              <img
                                key={`qr-${bankCode}-${accountNumber}-${amountValue}-${Date.now()}`}
                                src={vietQrUrl}
                                alt="VietQR"
                                className="w-full max-w-[180px] sm:max-w-[220px] lg:max-w-[250px] h-auto"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  console.error('[Deposit] QR code failed to load:', {
                                    bankCode,
                                    accountNumber,
                                    url: vietQrUrl,
                                    error: e,
                                    selectedBank: selectedBank
                                  });
                                  const img = e.currentTarget as HTMLImageElement;
                                  img.style.display = 'none';
                                  const parent = img.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="text-gray-400 text-sm p-4">QR Code không khả dụng<br/><span class="text-xs text-gray-500">Vui lòng chuyển khoản thủ công</span></div>';
                                  }
                                }}
                                onLoad={() => {
                                  console.log('[Deposit] QR code loaded successfully:', vietQrUrl);
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                      
                      // No QR code available
                      return (
                        <div className="bg-dark-secondary p-4 rounded-lg mb-2 sm:mb-3">
                          <QrCode className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-400 text-xs sm:text-sm">QR Code không khả dụng</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {(() => {
                              const effectiveCode = getEffectiveBankCode(selectedBank);
                              const missingCode = !effectiveCode || effectiveCode.length === 0;
                              const missingAccount = !selectedBank.accountNumber || String(selectedBank.accountNumber).trim().length === 0;
                              return missingCode ? 'Thiếu mã ngân hàng' : missingAccount ? 'Thiếu số tài khoản' : 'Vui lòng chuyển khoản thủ công';
                            })()}
                          </p>
                        </div>
                      );
                    })()}
                    {(() => {
                      const currentAmount = createdAmount || (amount ? parseInt(amount.replace(/\D/g, '')) : 0);
                      const amountValue = currentAmount >= 10000 ? currentAmount : 0;
                      if (amountValue > 0) {
                        return (
                          <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                            <p className="text-primary text-xs font-semibold mb-1">📱 Quét mã QR bằng app ngân hàng</p>
                            <p className="text-success text-xs mb-1">✓ Số tiền: {amountValue.toLocaleString('vi-VN')}₫</p>
                            <p className="text-success text-xs mb-1">✓ Nội dung: {generateTransferContent(amountValue)}</p>
                            <p className="text-gray-400 text-xs mt-2">Tự động điền - Bạn chỉ cần xác nhận!</p>
                          </div>
                        );
                      }
                      return (
                        <p className="text-gray-400 text-xs sm:text-sm mt-2">Nhập số tiền để hiển thị QR code</p>
                      );
                    })()}
                  </div>

                  {/* Bank Info */}
                  <div className="space-y-3">
                    <div className="p-4 bg-dark-secondary rounded-lg">
                      <div className="text-gray-400 text-xs mb-1">Ngân hàng</div>
                      <div className="text-white font-bold text-lg">{selectedBank.bankName}</div>
                    </div>
                    
                    <div className="p-4 bg-dark-secondary rounded-lg">
                      <div className="text-gray-400 text-xs mb-1">Số tài khoản</div>
                      <div className="flex items-center justify-between">
                        <div className="text-white font-bold">{selectedBank.accountNumber}</div>
                        <button
                          onClick={() => copyToClipboard(selectedBank.accountNumber, 'số tài khoản')}
                          className="p-2 hover:bg-primary/20 rounded transition"
                        >
                          <Copy className="w-5 h-5 text-primary" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-dark-secondary rounded-lg">
                      <div className="text-gray-400 text-xs mb-1">Chủ tài khoản</div>
                      <div className="flex items-center justify-between">
                        <div className="text-white font-bold">{selectedBank.accountName}</div>
                        <button
                          onClick={() => copyToClipboard(selectedBank.accountName, 'tên tài khoản')}
                          className="p-2 hover:bg-primary/20 rounded transition"
                        >
                          <Copy className="w-5 h-5 text-primary" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-dark-secondary rounded-lg">
                      <div className="text-gray-400 text-xs mb-1">Số tiền</div>
                      <div className="text-primary font-bold text-2xl">
                        {createdAmount.toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                    
                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                      <div className="text-gray-400 text-xs mb-2">Nội dung chuyển khoản</div>
                      <div className="flex items-start sm:items-center gap-2 mb-2">
                        <div className="text-white font-bold text-sm break-all flex-1 min-w-0 overflow-hidden">
                          <span className="block truncate sm:break-all">{generateTransferContent(createdAmount)}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(generateTransferContent(createdAmount), 'nội dung chuyển khoản')}
                          className="p-2 hover:bg-primary/20 rounded transition flex-shrink-0 mt-0.5 sm:mt-0"
                        >
                          <Copy className="w-5 h-5 text-primary" />
                        </button>
                      </div>
                      <div className="text-warning text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span className="break-words">Vui lòng ghi đúng nội dung để admin xác nhận nhanh nhất</span>
                      </div>
                    </div>
                    
                    {/* Hoàn tất thanh toán button */}
                    {!paymentCompleted && (
                      <button
                        onClick={() => {
                          setPaymentCompleted(true);
                          toast.success('Đã xác nhận chuyển khoản. Vui lòng chờ admin xác nhận.');
                        }}
                        className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Hoàn tất thanh toán
                      </button>
                    )}
                    
                    {paymentCompleted && (
                      <div className="mt-4 p-4 bg-success/10 border border-success/30 rounded-lg">
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-semibold">Đã xác nhận chuyển khoản</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-2">Vui lòng chờ admin xác nhận. Bạn có thể kiểm tra trạng thái trong Dashboard.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - QR Code Preview - REMOVED: Chỉ hiển thị sau khi tạo yêu cầu */}
          {false && !requestCreated && selectedBank && amount && parseInt(amount) >= 10000 && (
            <div className="lg:col-span-1">
              <div className="gaming-card neon-border-blue sticky top-20 sm:top-24">
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Xem Trước
                </h3>
                
                {/* QR Code - Tự động từ VietQR.io */}
                <div className="text-center mb-4 sm:mb-6">
                  {(() => {
                    // Lấy bankCode từ database hoặc auto-detect
                    let bankCode = selectedBank.bankCode ? String(selectedBank.bankCode).toLowerCase().trim() : '';
                    if (!bankCode && selectedBank.effectiveBankCode) {
                      bankCode = selectedBank.effectiveBankCode;
                    }
                    
                    const accountNumber = selectedBank.accountNumber ? String(selectedBank.accountNumber).trim().replace(/\s/g, '') : '';
                    
                    if (bankCode && accountNumber && bankCode.length > 0 && accountNumber.length > 0) {
                      const amountValue = parseInt(amount) || 0;
                      // Format URL theo VietQR.io Quicklink API (QR nạp tiền)
                      // Format: https://img.vietqr.io/image/{bankCode}-{accountNumber}-compact.jpg?amount={amount}&addInfo={addInfo}
                      // QR code này chứa sẵn số tiền và nội dung chuyển khoản
                      const amountInt = Math.floor(amountValue);
                      const encodedAddInfo = transferContent ? encodeURIComponent(transferContent.trim()) : '';
                      const vietQrUrl = amountValue > 0 && transferContent
                        ? `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.jpg?amount=${amountInt}&addInfo=${encodedAddInfo}`
                        : `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.jpg`;
                      
                      return (
                        <div className="bg-white p-2 sm:p-3 rounded-lg inline-block">
                          <img
                            key={`preview-qr-${bankCode}-${accountNumber}-${amountValue}-${Date.now()}`}
                            src={vietQrUrl}
                            alt="VietQR"
                            className="w-full max-w-[150px] sm:max-w-[180px] lg:max-w-[200px] h-auto"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              console.error('[Deposit] Preview QR failed:', {
                                bankCode,
                                accountNumber,
                                url: vietQrUrl,
                              });
                              const img = e.currentTarget as HTMLImageElement;
                              img.style.display = 'none';
                              const parent = img.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="text-gray-400 text-xs p-2">QR Code không khả dụng</div>';
                              }
                            }}
                            onLoad={() => {
                              console.log('[Deposit] Preview QR loaded successfully from VietQR.io');
                            }}
                          />
                        </div>
                      );
                    }
                    
                    return (
                      <div className="text-center py-4">
                        <QrCode className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-400 text-xs mb-1">QR Code không khả dụng</p>
                        <p className="text-gray-500 text-xs">
                          {!bankCode ? 'Thiếu mã ngân hàng' : !accountNumber ? 'Thiếu số tài khoản' : 'Vui lòng chuyển khoản thủ công'}
                        </p>
                      </div>
                    );
                  })()}
                  <p className="text-gray-400 text-xs mt-2">Quét mã QR để chuyển khoản</p>
                </div>

                {/* Bank Info */}
                <div className="space-y-3">
                  <div className="p-3 bg-dark-secondary rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">Ngân hàng</div>
                    <div className="text-white font-bold">{selectedBank.bankName}</div>
                  </div>
                  
                  <div className="p-3 bg-dark-secondary rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">Số tài khoản</div>
                    <div className="flex items-center justify-between">
                      <div className="text-white font-bold text-sm">{selectedBank.accountNumber}</div>
                      <button
                        onClick={() => copyToClipboard(selectedBank.accountNumber, 'số tài khoản')}
                        className="p-1.5 hover:bg-primary/20 rounded transition"
                      >
                        <Copy className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-dark-secondary rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">Chủ tài khoản</div>
                    <div className="flex items-center justify-between">
                      <div className="text-white font-bold text-sm">{selectedBank.accountName}</div>
                      <button
                        onClick={() => copyToClipboard(selectedBank.accountName, 'tên tài khoản')}
                        className="p-1.5 hover:bg-primary/20 rounded transition"
                      >
                        <Copy className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-dark-secondary rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">Số tiền</div>
                    <div className="text-primary font-bold text-lg">
                      {parseInt(amount).toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                  
                  <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">Nội dung chuyển khoản</div>
                    <div className="flex items-start sm:items-center gap-2">
                      <div className="text-white font-bold text-sm break-all flex-1 min-w-0 overflow-hidden">
                        <span className="block truncate sm:break-all">{transferContent}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(transferContent, 'nội dung chuyển khoản')}
                        className="p-1.5 hover:bg-primary/20 rounded transition flex-shrink-0 mt-0.5 sm:mt-0"
                      >
                        <Copy className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                    <div className="text-warning text-xs mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span className="break-words">Ghi đúng nội dung để xác nhận nhanh</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
