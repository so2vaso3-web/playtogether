'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  ArrowLeft,
  Sparkles,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  User,
  Shield,
  Filter,
  RefreshCw,
} from 'lucide-react';

export default function AdminTickets() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const [profileRes, ticketsRes] = await Promise.all([
        axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/admin/tickets${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // API returns { user: ... } or direct user object
      let profileUser = profileRes.data?.user || profileRes.data;
      
      // Auto set as admin if not admin
      if (!profileUser || profileUser.role !== 'admin') {
        try {
          const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
          await axios.post('/api/user/make-admin', {}, {
            headers: { Authorization: authToken },
          });
          // Reload profile
          const updatedRes = await axios.get('/api/user/profile', {
            headers: { Authorization: authToken },
          });
          profileUser = updatedRes.data?.user || updatedRes.data;
          toast.success('Đã tự động set quyền admin');
        } catch (err: any) {
          console.error('[Admin Tickets] Failed to set admin:', err);
        }
      }

      setUser(profileUser);
      setTickets(ticketsRes.data.tickets || ticketsRes.data);
      setStats(ticketsRes.data.stats);
      
      if (selectedTicket) {
        const updated = ticketsRes.data.tickets?.find((t: any) => t._id === selectedTicket._id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push('/dashboard');
      } else {
        toast.error('Lỗi tải tickets');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendResponse = async () => {
    if (!responseMessage || !selectedTicket) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        router.push('/login');
        setSubmitting(false);
        return;
      }
      await axios.post(
        `/api/tickets/${selectedTicket._id}/response`,
        { message: responseMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Đã gửi phản hồi');
      setResponseMessage('');
      fetchData();
      const response = await axios.get(`/api/tickets/${selectedTicket._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedTicket(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi gửi phản hồi');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (ticketId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        router.push('/login');
        return;
      }
      await axios.put(
        `/api/tickets/${ticketId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Cập nhật trạng thái thành công');
      fetchData();
      if (selectedTicket?._id === ticketId) {
        const response = await axios.get(`/api/tickets/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedTicket(response.data);
      }
    } catch (error: any) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-primary" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-primary border-primary';
      case 'pending':
        return 'text-warning border-warning';
      case 'resolved':
        return 'text-green-500 border-green-500';
      case 'closed':
        return 'text-gray-500 border-gray-500';
      default:
        return 'text-gray-400 border-gray-400';
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
            <div className="flex items-center gap-4">
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
              <div className="h-8 w-px bg-dark-border"></div>
              <button
                onClick={() => router.back()}
                className="text-gray-400 hover:text-primary transition text-sm px-3 py-1 rounded hover:bg-dark-secondary flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay Lại
              </button>
              <Link href="/admin" className="text-gray-400 hover:text-primary transition text-sm px-3 py-1 rounded hover:bg-dark-secondary flex items-center gap-2">
                Admin Dashboard
              </Link>
              <Link href="/" className="text-gray-400 hover:text-primary transition text-sm px-3 py-1 rounded hover:bg-dark-secondary">
                Trang Chủ
              </Link>
            </div>
            <div className="flex gap-3 items-center">
              <span className="text-gray-400">
                <span className="text-primary font-semibold">{user?.username}</span> (Admin)
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  router.push('/');
                }}
                className="btn-danger flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
            <MessageSquare className="w-10 h-10 text-primary" />
            Quản Lý Tickets
          </h1>
          <button
            onClick={fetchData}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Làm Mới
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="gaming-card text-center">
              <div className="text-2xl font-bold text-white mb-1">{stats.total || 0}</div>
              <div className="text-xs text-gray-400">Tổng số</div>
            </div>
            <div className="gaming-card text-center border border-primary/30">
              <div className="text-2xl font-bold text-primary mb-1">{stats.open || 0}</div>
              <div className="text-xs text-gray-400">Mở</div>
            </div>
            <div className="gaming-card text-center border border-warning/30">
              <div className="text-2xl font-bold text-warning mb-1">{stats.pending || 0}</div>
              <div className="text-xs text-gray-400">Đang xử lý</div>
            </div>
            <div className="gaming-card text-center border border-green-500/30">
              <div className="text-2xl font-bold text-green-500 mb-1">{stats.resolved || 0}</div>
              <div className="text-xs text-gray-400">Đã giải quyết</div>
            </div>
            <div className="gaming-card text-center border border-gray-500/30">
              <div className="text-2xl font-bold text-gray-500 mb-1">{stats.closed || 0}</div>
              <div className="text-xs text-gray-400">Đã đóng</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-primary text-white'
                : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            Tất Cả
          </button>
          <button
            onClick={() => setStatusFilter('open')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              statusFilter === 'open'
                ? 'bg-primary text-white'
                : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
            }`}
          >
            Mở
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              statusFilter === 'pending'
                ? 'bg-warning text-white'
                : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
            }`}
          >
            Đang Xử Lý
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              statusFilter === 'resolved'
                ? 'bg-green-500 text-white'
                : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
            }`}
          >
            Đã Giải Quyết
          </button>
          <button
            onClick={() => setStatusFilter('closed')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              statusFilter === 'closed'
                ? 'bg-gray-500 text-white'
                : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
            }`}
          >
            Đã Đóng
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1">
            <div className="gaming-card">
              <h2 className="text-xl font-bold text-white mb-4">Danh Sách Tickets</h2>
              {tickets.length === 0 ? (
                <div className="text-center text-gray-400 py-8">Chưa có ticket nào</div>
              ) : (
                <div className="space-y-2 max-h-[700px] overflow-y-auto">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket._id}
                      onClick={() => {
                        const token = localStorage.getItem('token');
                        if (!token) {
                          toast.error('Vui lòng đăng nhập lại');
                          router.push('/login');
                          return;
                        }
                        axios.get(`/api/tickets/${ticket._id}`, {
                          headers: { Authorization: `Bearer ${token}` },
                        }).then(res => setSelectedTicket(res.data));
                      }}
                      className={`w-full text-left p-4 rounded-lg border transition ${
                        selectedTicket?._id === ticket._id
                          ? 'bg-primary/20 border-primary'
                          : 'bg-dark-secondary border-dark-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          {getStatusIcon(ticket.status)}
                          <span className="font-semibold text-white text-sm">{ticket.subject}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        {ticket.priority === 'urgent' && (
                          <span className="text-xs text-red-500 font-bold">URGENT</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        Từ: {ticket.userId?.username || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="gaming-card">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`badge px-3 py-1 ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status}
                      </span>
                      <span className="badge badge-info">{selectedTicket.priority}</span>
                      <span className="text-sm text-gray-400">
                        {new Date(selectedTicket.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => updateStatus(selectedTicket._id, e.target.value)}
                      className="bg-dark-secondary border border-dark-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="open">Mở</option>
                      <option value="pending">Đang xử lý</option>
                      <option value="resolved">Đã giải quyết</option>
                      <option value="closed">Đã đóng</option>
                    </select>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-dark-secondary rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-white">
                      {selectedTicket.userId?.username || 'N/A'}
                    </span>
                    <span className="text-gray-400">({selectedTicket.userId?.name || 'Chưa có tên'})</span>
                  </div>
                </div>

                {/* Initial Message */}
                <div className="bg-dark-secondary rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-white">
                      {selectedTicket.userId?.username || 'User'}
                    </span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                {/* Responses */}
                {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-bold text-white">Phản Hồi</h3>
                    {selectedTicket.responses.map((response: any, idx: number) => (
                      <div
                        key={idx}
                        className={`bg-dark-secondary rounded-lg p-4 ${
                          response.isAdmin ? 'border-l-4 border-primary' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {response.isAdmin ? (
                            <Shield className="w-4 h-4 text-primary" />
                          ) : (
                            <User className="w-4 h-4 text-secondary" />
                          )}
                          <span className="font-semibold text-white">
                            {response.userId?.username || 'User'}
                            {response.isAdmin && (
                              <span className="ml-2 text-xs text-primary">(Admin)</span>
                            )}
                          </span>
                          <span className="text-xs text-gray-400 ml-auto">
                            {new Date(response.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap">{response.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Response Form */}
                {selectedTicket.status !== 'closed' && (
                  <div className="border-t border-dark-border pt-6">
                    <label className="block text-gray-400 mb-2">Phản hồi (Admin)</label>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      rows={4}
                      className="w-full bg-dark-secondary border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none mb-3"
                      placeholder="Nhập phản hồi của bạn..."
                    />
                    <button
                      onClick={sendResponse}
                      disabled={submitting || !responseMessage}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? 'Đang gửi...' : 'Gửi Phản Hồi'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="gaming-card text-center text-gray-400 py-12">
                Chọn một ticket để xem chi tiết
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

