'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Building2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Save,
  X,
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function AdminBanks() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    note: '',
    isActive: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUser();
    fetchBanks();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const response = await axios.get('/api/user/profile', {
        headers: { Authorization: authToken },
      });
      
      // API returns { user: ... } or direct user object
      let userData = response.data?.user || response.data;
      
      // Auto set as admin if not admin
      if (!userData || userData.role !== 'admin') {
        try {
          await axios.post('/api/user/make-admin', {}, {
            headers: { Authorization: authToken },
          });
          // Reload profile
          const updatedRes = await axios.get('/api/user/profile', {
            headers: { Authorization: authToken },
          });
          userData = updatedRes.data?.user || updatedRes.data;
          toast.success('Đã tự động set quyền admin');
        } catch (err: any) {
          console.error('[Admin Banks] Failed to set admin:', err);
        }
      }
      
      setUser(userData);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchBanks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const response = await axios.get('/api/admin/banks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanks(response.data);
    } catch (error: any) {
      toast.error('Lỗi tải danh sách ngân hàng');
    } finally {
      setLoading(false);
    }
  };

  // Tự động detect bankCode từ tên ngân hàng (theo VietQR.io)
  const detectBankCode = (bankName: string): string => {
    if (!bankName) return '';
    
    const normalized = bankName.toLowerCase().trim();
    
    // Mapping theo VietQR.io bank codes
    const bankNameToCode: { [key: string]: string } = {
      'vietinbank': 'vietinbank',
      'vietcombank': 'vietcombank',
      'bidv': 'bidv',
      'agribank': 'agribank',
      'acb': 'acb',
      'techcombank': 'techcombank',
      'tpb': 'tpb',
      'tcb': 'tcb',
      'mbbank': 'mbbank',
      'vpbank': 'vpbank',
      'sacombank': 'sacombank',
      'hdbank': 'hdbank',
      'shb': 'shb',
      'vib': 'vib',
      'eximbank': 'eximbank',
      'msb': 'msb',
      'pvcombank': 'pvcombank',
      'ocb': 'ocb',
      'namabank': 'namabank',
      'publicbank': 'publicbank',
      'abbank': 'abbank',
      'vab': 'vab',
      'seabank': 'seabank',
      'pvb': 'pvb',
      'oceanbank': 'oceanbank',
      'ncb': 'ncb',
      'vccb': 'vccb',
      'baovietbank': 'baovietbank',
      'scb': 'scb',
      'donga': 'donga',
      'kienlongbank': 'kienlongbank',
      'gpbank': 'gpbank',
      'lienvietpostbank': 'lienvietpostbank',
      'vietabank': 'vietabank',
      'vrb': 'vrb',
      'vietbank': 'vietbank',
      'bacabank': 'bacabank',
      'coopbank': 'coopbank',
      'icb': 'icb',
      'indovinabank': 'indovinabank',
      'pgbank': 'pgbank',
      'pvbank': 'pvbank',
      'saigonbank': 'saigonbank',
      'shinhanbank': 'shinhanbank',
      'vietcapitalbank': 'vietcapitalbank',
      'wooribank': 'wooribank',
    };

    // Check exact match first
    if (bankNameToCode[normalized]) {
      return bankNameToCode[normalized];
    }

    // Check partial match
    for (const [key, code] of Object.entries(bankNameToCode)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return code;
      }
    }

    // Special cases
    if (normalized.includes('vietin')) return 'vietinbank';
    if (normalized.includes('vietcom')) return 'vietcombank';
    if (normalized.includes('techcom')) return 'techcombank';
    if (normalized.includes('mbb') || normalized.includes('military')) return 'mbbank';
    if (normalized.includes('vp')) return 'vpbank';
    if (normalized.includes('saco')) return 'sacombank';
    if (normalized.includes('hd')) return 'hdbank';
    if (normalized.includes('exim')) return 'eximbank';
    if (normalized.includes('pvcom')) return 'pvcombank';
    if (normalized.includes('nam a')) return 'namabank';
    if (normalized.includes('public')) return 'publicbank';
    if (normalized.includes('sea')) return 'seabank';
    if (normalized.includes('ocean')) return 'oceanbank';
    if (normalized.includes('viet a')) return 'vietabank';
    if (normalized.includes('viet capital')) return 'vietcapitalbank';
    if (normalized.includes('lien viet') || normalized.includes('lienviet')) return 'lienvietpostbank';
    if (normalized.includes('indovina')) return 'indovinabank';
    if (normalized.includes('saigon')) return 'saigonbank';
    if (normalized.includes('shinhan')) return 'shinhanbank';
    if (normalized.includes('woori')) return 'wooribank';

    return '';
  };

  // Generate VietQR URL
  const generateVietQRUrl = (bankCode: string, accountNumber: string, amount?: number, addInfo?: string): string => {
    if (!bankCode || !accountNumber) return '';
    
    const baseUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.jpg`;
    const params = new URLSearchParams();
    
    if (amount) {
      params.append('amount', amount.toString());
    }
    if (addInfo) {
      params.append('addInfo', addInfo);
    }
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        router.push('/login');
        return;
      }
      
      // Auto-detect bankCode từ tên ngân hàng
      const bankCode = detectBankCode(formData.bankName);
      
      if (!bankCode) {
        toast.error('Không thể nhận diện mã ngân hàng. Vui lòng kiểm tra tên ngân hàng.');
        return;
      }
      
      const submitData = {
        bankName: formData.bankName.trim(),
        bankCode: bankCode.toLowerCase().trim(),
        accountNumber: formData.accountNumber.trim(),
        accountName: formData.accountName.trim(),
        note: formData.note || '',
        isActive: formData.isActive,
      };
      
      console.log('[Admin Banks] Submitting:', submitData);
      
      if (editingId) {
        await axios.put(
          `/api/admin/banks/${editingId}`,
          submitData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('Cập nhật ngân hàng thành công');
      } else {
        await axios.post(
          '/api/admin/banks',
          submitData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('Thêm ngân hàng thành công');
      }
      
      resetForm();
      await fetchBanks();
      // Notify other pages to reload banks
      window.dispatchEvent(new Event('banksUpdated'));
      localStorage.setItem('banksUpdated', Date.now().toString());
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('banks-updates');
        channel.postMessage({ type: 'banksUpdated', timestamp: Date.now() });
        channel.close();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi lưu ngân hàng');
    }
  };

  const handleEdit = (bank: any) => {
    setEditingId(bank._id || bank.id);
    setFormData({
      bankName: bank.bankName || bank.name || '',
      accountNumber: bank.accountNumber || '',
      accountName: bank.accountName || '',
      note: bank.note || '',
      isActive: bank.isActive !== false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa ngân hàng này?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        router.push('/login');
        return;
      }
      await axios.delete(`/api/admin/banks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Xóa ngân hàng thành công');
      await fetchBanks();
      // Notify other pages to reload banks
      window.dispatchEvent(new Event('banksUpdated'));
      localStorage.setItem('banksUpdated', Date.now().toString());
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('banks-updates');
        channel.postMessage({ type: 'banksUpdated', timestamp: Date.now() });
        channel.close();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi xóa ngân hàng');
    }
  };

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountNumber: '',
      accountName: '',
      note: '',
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-gray-400 text-xl">Đang tải...</div>
      </div>
    );
  }

  const detectedBankCode = formData.bankName ? detectBankCode(formData.bankName) : '';

  return (
    <div className="min-h-screen bg-dark-primary relative">
      <div className="animated-bg"></div>
      
      {/* Navigation */}
      <nav className="relative z-50 glass border-b border-dark-border sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-3">
                <Logo size="md" showText={false} />
                <div>
                  <h1 className="text-xl font-bold gradient-text">PlayTogether Hack</h1>
                  <p className="text-xs text-gray-400">Admin Panel</p>
                </div>
              </Link>
              <div className="h-8 w-px bg-dark-border hidden sm:block"></div>
              <Link href="/admin" className="text-gray-400 hover:text-primary transition font-medium flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Quản Lý Ngân Hàng
          </h1>
          <p className="text-gray-400">Thêm và quản lý tài khoản ngân hàng nhận tiền</p>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            THÊM NGÂN HÀNG
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="gaming-card mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Sửa Ngân Hàng' : 'Thêm Ngân Hàng Mới'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2 font-semibold">
                  Tên Ngân Hàng <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-secondary border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary transition"
                  placeholder="Ví dụ: VietinBank, Vietcombank, Techcombank..."
                  required
                />
                {detectedBankCode && (
                  <p className="text-xs text-primary mt-1">
                    ✓ Đã tự động nhận diện mã: <strong>{detectedBankCode}</strong>
                  </p>
                )}
                {formData.bankName && !detectedBankCode && (
                  <p className="text-xs text-warning mt-1">
                    ⚠ Không thể nhận diện mã ngân hàng. Vui lòng kiểm tra tên ngân hàng.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">
                  Số Tài Khoản <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-4 py-3 bg-dark-secondary border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary transition"
                  placeholder="Nhập số tài khoản"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">
                  Tên Chủ Tài Khoản <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-secondary border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary transition"
                  placeholder="Nhập tên chủ tài khoản"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">
                  Ghi Chú (Tùy chọn)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-secondary border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary transition resize-none"
                  rows={3}
                  placeholder="Ghi chú về ngân hàng này..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-dark-border bg-dark-secondary text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-white cursor-pointer">
                  Kích hoạt ngân hàng này
                </label>
              </div>

              {detectedBankCode && formData.accountNumber && (
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-sm text-white mb-2">QR Code sẽ tự động tạo từ <a href="https://vietqr.io/" target="_blank" className="text-primary hover:underline">VietQR.io</a></p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Mã ngân hàng: <strong className="text-primary">{detectedBankCode}</strong></span>
                    <span>•</span>
                    <span>STK: <strong className="text-primary">{formData.accountNumber}</strong></span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingId ? 'CẬP NHẬT' : 'THÊM NGÂN HÀNG'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary px-6"
                >
                  HỦY
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Banks List */}
        <div className="gaming-card">
          <h2 className="text-xl font-bold text-white mb-6">Danh Sách Ngân Hàng</h2>
          
          {banks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Chưa có ngân hàng nào. Hãy thêm ngân hàng đầu tiên.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {banks.map((bank) => {
                const bankCode = bank.bankCode || detectBankCode(bank.bankName || bank.name || '');
                const qrUrl = bankCode && bank.accountNumber 
                  ? generateVietQRUrl(bankCode, bank.accountNumber)
                  : null;
                
                return (
                  <div
                    key={bank._id || bank.id}
                    className="p-4 bg-dark-secondary rounded-lg border border-dark-border hover:border-primary/50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-white">
                            {bank.bankName || bank.name || 'Ngân hàng'}
                          </h3>
                          {bank.isActive ? (
                            <span className="badge badge-success">Hoạt động</span>
                          ) : (
                            <span className="badge badge-danger">Tạm khóa</span>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-gray-400">
                          <div>STK: <span className="text-white font-semibold">{bank.accountNumber}</span></div>
                          <div>Chủ TK: <span className="text-white">{bank.accountName}</span></div>
                          {bankCode && (
                            <div>Mã: <span className="text-primary">{bankCode}</span></div>
                          )}
                          {bank.note && (
                            <div>Ghi chú: <span className="text-white">{bank.note}</span></div>
                          )}
                        </div>
                        {qrUrl && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-400 mb-2">QR Code (tự động từ VietQR.io):</p>
                            <img
                              src={qrUrl}
                              alt="VietQR"
                              className="w-32 h-32 border border-dark-border rounded-lg"
                              onError={(e) => {
                                console.error('[Admin Banks] QR code load error:', qrUrl);
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(bank)}
                          className="btn-secondary p-2"
                          title="Sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bank._id || bank.id)}
                          className="btn-danger p-2"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
