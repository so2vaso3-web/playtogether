'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  User,
  Shield,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function Support() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(response.data);
      if (response.data.length > 0 && !selectedTicket) {
        setSelectedTicket(response.data[0]);
      }
    } catch (error: any) {
      toast.error('Lỗi tải tickets');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!newSubject || !newMessage) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/tickets',
        { subject: newSubject, message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Tạo ticket thành công');
      setShowCreateForm(false);
      setNewSubject('');
      setNewMessage('');
      fetchTickets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi tạo ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const sendResponse = async () => {
    if (!responseMessage || !selectedTicket) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/tickets/${selectedTicket._id}/response`,
        { message: responseMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Đã gửi phản hồi');
      setResponseMessage('');
      fetchTickets();
      // Refresh selected ticket
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

      {/* Navigation */}
      <nav className="relative z-10 glass border-b border-dark-border sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <Logo size="md" showText={true} />
            </Link>
            <div className="flex gap-3 items-center">
              <Link href="/dashboard" className="px-4 py-2 text-gray-400 hover:text-primary transition">
                Dashboard
              </Link>
              <Link href="/" className="btn-secondary">
                Trang Chủ
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
            <MessageSquare className="w-10 h-10 text-primary" />
            Hỗ Trợ & Ticket
          </h1>
        </div>

        {/* Create Ticket Button */}
        <div className="mb-6">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tạo Ticket Mới
            </button>
          ) : (
            <div className="gaming-card">
              <h2 className="text-xl font-bold text-white mb-4">Tạo Ticket Mới</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2">Tiêu đề</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-dark-secondary border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="Nhập tiêu đề..."
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Nội dung</label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={6}
                    className="w-full bg-dark-secondary border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                    placeholder="Mô tả vấn đề của bạn..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={createTicket}
                    disabled={submitting}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Đang gửi...' : 'Gửi Ticket'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewSubject('');
                      setNewMessage('');
                    }}
                    className="btn-secondary"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1">
            <div className="gaming-card">
              <h2 className="text-xl font-bold text-white mb-4">Danh Sách Ticket</h2>
              {tickets.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  Chưa có ticket nào
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket._id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full text-left p-4 rounded-lg border transition ${
                        selectedTicket?._id === ticket._id
                          ? 'bg-primary/20 border-primary'
                          : 'bg-dark-secondary border-dark-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.status)}
                          <span className="font-semibold text-white text-sm">{ticket.subject || ticket.title || 'No Subject'}</span>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded border inline-block mb-2 ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
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
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedTicket.subject || selectedTicket.title || 'No Subject'}</h2>
                    <div className="flex items-center gap-3">
                      <span className={`badge px-3 py-1 ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status}
                      </span>
                      <span className="text-sm text-gray-400">
                        {new Date(selectedTicket.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Initial Message */}
                <div className="bg-dark-secondary rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-white">
                      {selectedTicket.userId?.username || selectedTicket.userId?.phone || 'User'}
                    </span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                {/* Responses */}
                {((selectedTicket.responses || selectedTicket.replies) && (selectedTicket.responses || selectedTicket.replies).length > 0) && (
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-bold text-white">Phản Hồi</h3>
                    {(selectedTicket.responses || selectedTicket.replies || []).map((response: any, idx: number) => (
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
                            {response.userId?.username || response.userId?.phone || 'User'}
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
                    <label className="block text-gray-400 mb-2">Phản hồi</label>
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

