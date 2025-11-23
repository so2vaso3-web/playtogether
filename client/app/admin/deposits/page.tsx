'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  User,
  Sparkles,
  DollarSign,
} from 'lucide-react';

export default function AdminDeposits() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUser();
    fetchDeposits();
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
          console.error('[Admin Deposits] Failed to set admin:', err);
        }
      }
      
      setUser(userData);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchDeposits = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const response = await axios.get('/api/admin/deposits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeposits(response.data);
    } catch (error: any) {
      toast.error('Lỗi tải danh sách yêu cầu nạp tiền');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Xác nhận nạp tiền này?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        router.push('/login');
        return;
      }
      await axios.post(
        `/api/admin/deposits/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Đã xác nhận nạp tiền');
      await fetchDeposits();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi xác nhận nạp tiền');
    }
  };

  const handleReject = async (id: string) => {
    const note = prompt('Nhập lý do từ chối (nếu có):');
    if (note === null) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        router.push('/login');
        return;
      }
      await axios.post(
        `/api/admin/deposits/${id}/reject`,
        { adminNote: note || undefined },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Đã từ chối yêu cầu nạp tiền');
      await fetchDeposits();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi từ chối nạp tiền');
    }
  };

  const filteredDeposits = deposits.filter((deposit) => {
    if (filter === 'all') return true;
    return deposit.status === filter;
  });

  const pendingCount = deposits.filter((d) => d.status === 'pending').length;
  const approvedCount = deposits.filter((d) => d.status === 'approved').length;
  const rejectedCount = deposits.filter((d) => d.status === 'rejected').length;

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
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </Link>
            <div className="flex gap-3">
              <Link href="/admin" className="text-gray-400 hover:text-primary transition font-medium flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Wallet className="w-10 h-10 text-primary" />
            Quản Lý Nạp Tiền
          </h1>
          <p className="text-gray-400">Xác nhận hoặc từ chối các yêu cầu nạp tiền</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="gaming-card neon-border-blue">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">Tổng yêu cầu</div>
                <div className="text-3xl font-bold text-white">{deposits.length}</div>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="gaming-card neon-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">Đang chờ</div>
                <div className="text-3xl font-bold text-warning">{pendingCount}</div>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </div>
          <div className="gaming-card neon-border-blue">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">Đã xác nhận</div>
                <div className="text-3xl font-bold text-success">{approvedCount}</div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </div>
          <div className="gaming-card neon-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-1">Đã từ chối</div>
                <div className="text-3xl font-bold text-danger">{rejectedCount}</div>
              </div>
              <XCircle className="w-8 h-8 text-danger" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
            }`}
          >
            Tất Cả
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              filter === 'pending'
                ? 'bg-warning text-white'
                : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
            }`}
          >
            <Clock className="w-4 h-4" />
            Đang Chờ ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              filter === 'approved'
                ? 'bg-success text-white'
                : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Đã Xác Nhận ({approvedCount})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              filter === 'rejected'
                ? 'bg-danger text-white'
                : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Đã Từ Chối ({rejectedCount})
          </button>
        </div>

        {/* Deposits List */}
        {loading ? (
          <div className="gaming-card text-center text-gray-400 py-20">Đang tải...</div>
        ) : filteredDeposits.length === 0 ? (
          <div className="gaming-card text-center text-gray-400 py-20">
            Không có yêu cầu nạp tiền nào
          </div>
        ) : (
          <div className="gaming-card space-y-4">
            {filteredDeposits.map((deposit: any) => (
              <div
                key={deposit._id}
                className={`p-6 rounded-lg border ${
                  deposit.status === 'pending'
                    ? 'border-warning/50 bg-warning/5'
                    : deposit.status === 'approved'
                    ? 'border-success/50 bg-success/5'
                    : 'border-danger/50 bg-danger/5'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        deposit.status === 'pending'
                          ? 'bg-warning/20'
                          : deposit.status === 'approved'
                          ? 'bg-success/20'
                          : 'bg-danger/20'
                      }`}
                    >
                      {deposit.status === 'pending' ? (
                        <Clock className="w-6 h-6 text-warning" />
                      ) : deposit.status === 'approved' ? (
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      ) : (
                        <XCircle className="w-6 h-6 text-danger" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-white">
                          {deposit.userId?.username || 'Unknown'}
                        </span>
                        {deposit.userId?.name && (
                          <span className="text-gray-400">({deposit.userId.name})</span>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {deposit.description || `Nạp tiền ${deposit.amount.toLocaleString('vi-VN')}₫`}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {new Date(deposit.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {deposit.amount.toLocaleString('vi-VN')}₫
                    </div>
                    <div
                      className={`badge ${
                        deposit.status === 'pending'
                          ? 'badge-warning'
                          : deposit.status === 'approved'
                          ? 'badge-success'
                          : 'badge-danger'
                      }`}
                    >
                      {deposit.status === 'pending'
                        ? 'Đang chờ'
                        : deposit.status === 'approved'
                        ? 'Đã xác nhận'
                        : 'Đã từ chối'}
                    </div>
                  </div>
                </div>

                {deposit.adminNote && (
                  <div className="mt-3 p-3 bg-dark-card rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Ghi chú admin:</div>
                    <div className="text-sm text-white">{deposit.adminNote}</div>
                  </div>
                )}

                {deposit.status === 'pending' && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleApprove(deposit._id)}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Xác Nhận
                    </button>
                    <button
                      onClick={() => handleReject(deposit._id)}
                      className="btn-danger flex-1 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Từ Chối
                    </button>
                  </div>
                )}

                {deposit.approvedBy && (
                  <div className="mt-3 text-xs text-gray-500">
                    Xử lý bởi: {deposit.approvedBy?.username || 'Admin'} lúc{' '}
                    {new Date(deposit.approvedAt || deposit.updatedAt).toLocaleString('vi-VN')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}




