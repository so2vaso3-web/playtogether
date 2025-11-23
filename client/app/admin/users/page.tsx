'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  Edit,
  Trash2,
  Shield,
  UserX,
  UserCheck,
  ArrowLeft,
  Sparkles,
  LogOut,
  Wallet,
  Eye,
  X,
  Check,
  Package,
  CreditCard,
  Clock,
  TrendingUp,
  Plus,
  Calendar,
} from 'lucide-react';

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editingBalance, setEditingBalance] = useState<any>(null);
  const [balanceValue, setBalanceValue] = useState<string>('');
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [userPackages, setUserPackages] = useState<any[]>([]);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [userDeposits, setUserDeposits] = useState<any[]>([]);
  const [allPackages, setAllPackages] = useState<any[]>([]);
  const [addingPackage, setAddingPackage] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  useEffect(() => {
    checkAdmin();
    fetchUsers();
  }, []);

  const checkAdmin = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      // Get user profile
      const response = await axios.get('/api/user/profile', {
        headers: { Authorization: authToken },
      });
      
      // API returns { user: ... } or direct user object
      const user = response.data?.user || response.data;
      
      // Auto set as admin if not admin
      if (!user || user.role !== 'admin') {
        try {
          await axios.post('/api/user/make-admin', {}, {
            headers: { Authorization: authToken },
          });
          toast.success('Đã tự động set quyền admin');
        } catch (err: any) {
          console.error('[Admin Users] Failed to set admin:', err);
        }
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: { _t: Date.now() }, // Cache busting
      });
      console.log('[Admin Users] Fetched users:', response.data);
      // Ensure balance is a number for all users
      const usersWithBalance = response.data.map((user: any) => ({
        ...user,
        balance: Number(user.balance) || 0,
      }));
      setUsers(usersWithBalance);
    } catch (error: any) {
      console.error('[Admin Users] Error fetching users:', error);
      toast.error('Lỗi tải danh sách users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      role: user.role || 'user',
      isActive: user.isActive !== false,
      balance: user.balance || 0,
    });
  };

  const handleEditBalance = (user: any) => {
    setEditingBalance(user);
    setBalanceValue((user.balance || 0).toString());
  };

  const handleSaveBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const newBalance = parseFloat(balanceValue);
      
      if (isNaN(newBalance) || newBalance < 0) {
        toast.error('Số dư không hợp lệ!');
        return;
      }

      console.log('[Admin Users] Updating balance:', {
        userId: editingBalance._id || editingBalance.id,
        oldBalance: editingBalance.balance,
        newBalance: newBalance,
      });

      const response = await axios.put(
        `/api/admin/users/${editingBalance._id || editingBalance.id}`,
        { balance: newBalance },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('[Admin Users] Update response:', response.data);

      toast.success('Cập nhật số dư thành công!');
      setEditingBalance(null);
      setBalanceValue('');
      
      // Wait a bit before reloading to ensure KV is synced
      await new Promise(resolve => setTimeout(resolve, 200));
      await fetchUsers();
    } catch (error: any) {
      console.error('[Admin Users] Error updating balance:', error);
      toast.error(error.response?.data?.message || 'Lỗi cập nhật số dư');
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/admin/users/${editingUser._id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Cập nhật user thành công!');
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật user');
    }
  };

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`Bạn có chắc muốn xóa user "${username}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Xóa user thành công!');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi xóa user');
    }
  };

  const handleViewUser = async (user: any) => {
    setViewingUser(user);
    setUserDetails(user);
    setUserPackages([]);
    setUserTransactions([]);
    setUserDeposits([]);
    
    try {
      const token = localStorage.getItem('token');
      
      // Fetch user detail from admin API
      const detailRes = await axios.get(`/api/admin/users/${user._id || user.id}/detail`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (detailRes.data) {
        setUserDetails(detailRes.data.user);
        setUserPackages(detailRes.data.packages || []);
        setUserTransactions(detailRes.data.transactions || []);
        setUserDeposits(detailRes.data.deposits || []);
      }
      
      // Fetch all packages for adding
      try {
        const allPkgsRes = await axios.get('/api/packages');
        setAllPackages(allPkgsRes.data || []);
      } catch (e) {
        console.error('[View User] Error fetching all packages:', e);
      }
    } catch (error: any) {
      console.error('[View User] Error:', error);
      toast.error('Lỗi tải thông tin user');
    }
  };

  const handleAddPackage = async () => {
    if (!selectedPackageId) {
      toast.error('Vui lòng chọn gói');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/admin/users/${viewingUser._id || viewingUser.id}`,
        { currentPackage: selectedPackageId, packagePurchasedAt: new Date() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Đã thêm gói cho user!');
      setAddingPackage(false);
      setSelectedPackageId('');
      
      // Reload user details
      await new Promise(resolve => setTimeout(resolve, 200));
      await handleViewUser({ ...viewingUser, _id: viewingUser._id || viewingUser.id });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi thêm gói');
    }
  };

  const handleRemovePackage = async () => {
    if (!confirm('Bạn có chắc muốn xóa gói của user này?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/admin/users/${viewingUser._id || viewingUser.id}`,
        { currentPackage: null, packagePurchasedAt: null },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Đã xóa gói của user!');
      
      // Reload user details
      await new Promise(resolve => setTimeout(resolve, 200));
      await handleViewUser({ ...viewingUser, _id: viewingUser._id || viewingUser.id });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi xóa gói');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <Link href="/admin" className="text-gray-400 hover:text-primary transition text-sm flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="btn-danger flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Đăng Xuất
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-primary" />
              Quản Lý Users
            </h1>
            <p className="text-gray-400">Quản lý tất cả users trong hệ thống</p>
          </div>
          <div className="text-gray-400">
            Tổng: <span className="text-primary font-bold">{users.length}</span> users
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gaming-input w-full pl-12"
              placeholder="Tìm kiếm user (username, name)..."
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="gaming-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-4 px-4 text-white font-semibold">Username</th>
                <th className="text-left py-4 px-4 text-white font-semibold">Tên</th>
                <th className="text-left py-4 px-4 text-white font-semibold">Số dư</th>
                <th className="text-left py-4 px-4 text-white font-semibold">Role</th>
                <th className="text-left py-4 px-4 text-white font-semibold">Trạng thái</th>
                <th className="text-left py-4 px-4 text-white font-semibold">Ngày tạo</th>
                <th className="text-left py-4 px-4 text-white font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-dark-border hover:bg-dark-secondary transition">
                  <td className="py-4 px-4 text-white font-semibold">{user.username}</td>
                  <td className="py-4 px-4 text-gray-400">{user.name || '-'}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">
                        {(user.balance || 0).toLocaleString('vi-VN')}₫
                      </span>
                      <button
                        onClick={() => handleEditBalance(user)}
                        className="w-6 h-6 rounded bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition"
                        title="Chỉnh sửa số dư"
                      >
                        <Wallet className="w-3.5 h-3.5 text-primary" />
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-info'}`}>
                      {user.role === 'admin' ? (
                        <>
                          <Shield className="w-3 h-3" />
                          Admin
                        </>
                      ) : (
                        'User'
                      )}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {user.isActive !== false ? (
                      <span className="badge badge-success flex items-center gap-1 w-fit">
                        <UserCheck className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="badge badge-danger flex items-center gap-1 w-fit">
                        <UserX className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-400 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="w-8 h-8 rounded-lg bg-info/10 hover:bg-info/20 flex items-center justify-center transition"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4 text-info" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4 text-primary" />
                      </button>
                      {user._id !== editingUser?._id && (
                        <button
                          onClick={() => handleDelete(user._id, user.username)}
                          className="w-8 h-8 rounded-lg bg-danger/10 hover:bg-danger/20 flex items-center justify-center transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4 text-danger" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Không tìm thấy user nào
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="gaming-card max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Edit className="w-6 h-6 text-primary" />
                  Chỉnh Sửa User
                </h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className="w-8 h-8 rounded-lg bg-dark-secondary hover:bg-dark-border flex items-center justify-center transition"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2 font-semibold">Username</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    disabled
                    className="gaming-input w-full opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Username không thể thay đổi</p>
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold">Tên</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="gaming-input w-full"
                    placeholder="Tên user"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="gaming-input w-full"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Số dư
                  </label>
                  <input
                    type="number"
                    value={editForm.balance}
                    onChange={(e) => setEditForm({ ...editForm, balance: parseFloat(e.target.value) || 0 })}
                    className="gaming-input w-full"
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                      className="w-5 h-5 rounded bg-dark-card border-dark-border text-primary focus:ring-primary"
                    />
                    <span className="text-white font-semibold">Tài khoản đang hoạt động</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveEdit}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Balance Modal */}
        {editingBalance && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="gaming-card max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-primary" />
                  Chỉnh Sửa Số Dư
                </h2>
                <button
                  onClick={() => {
                    setEditingBalance(null);
                    setBalanceValue('');
                  }}
                  className="w-8 h-8 rounded-lg bg-dark-secondary hover:bg-dark-border flex items-center justify-center transition"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2 font-semibold">User</label>
                  <input
                    type="text"
                    value={editingBalance.username}
                    disabled
                    className="gaming-input w-full opacity-50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold">Số dư hiện tại</label>
                  <div className="gaming-input w-full opacity-50 cursor-not-allowed text-primary font-bold text-lg">
                    {(editingBalance.balance || 0).toLocaleString('vi-VN')}₫
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold">Số dư mới</label>
                  <input
                    type="number"
                    value={balanceValue}
                    onChange={(e) => setBalanceValue(e.target.value)}
                    className="gaming-input w-full text-lg"
                    placeholder="Nhập số dư mới"
                    min="0"
                    step="1000"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-1">Nhập số dư mới cho user này</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveBalance}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Lưu
                  </button>
                  <button
                    onClick={() => {
                      setEditingBalance(null);
                      setBalanceValue('');
                    }}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {viewingUser && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="gaming-card max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-dark-card pb-4 border-b border-dark-border z-10">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <UserCheck className="w-8 h-8 text-primary" />
                  Chi Tiết User: {viewingUser.username}
                </h2>
                <button
                  onClick={() => {
                    setViewingUser(null);
                    setUserDetails(null);
                    setUserPackages([]);
                    setUserTransactions([]);
                    setUserDeposits([]);
                  }}
                  className="w-10 h-10 rounded-lg bg-dark-secondary hover:bg-dark-border flex items-center justify-center transition"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="gaming-card bg-dark-secondary">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-primary" />
                      Thông Tin Tài Khoản
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Username</div>
                        <div className="text-white font-semibold">{userDetails?.username || '-'}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Tên</div>
                        <div className="text-white">{userDetails?.name || '-'}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Số dư</div>
                        <div className="text-2xl font-bold text-primary">
                          {(userDetails?.balance || 0).toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Role</div>
                        <span className={`badge ${userDetails?.role === 'admin' ? 'badge-danger' : 'badge-info'}`}>
                          {userDetails?.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Ngày tạo</div>
                        <div className="text-white">
                          {userDetails?.createdAt ? new Date(userDetails.createdAt).toLocaleString('vi-VN') : '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="gaming-card bg-dark-secondary">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Gói Đang Sở Hữu
                    </h3>
                    {userPackages.length > 0 ? (
                      <div className="space-y-3">
                        {userPackages.map((pkg: any, index: number) => (
                          <div key={index} className="p-4 bg-dark-card rounded-lg border border-primary/20">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="text-white font-semibold text-lg">
                                  {pkg.packageId?.name || 'Unknown Package'}
                                </div>
                                <div className="text-primary font-bold text-xl mt-1">
                                  {pkg.packageId?.price?.toLocaleString('vi-VN') || 0}₫
                                </div>
                              </div>
                              <span className="badge badge-success">Active</span>
                            </div>
                            {pkg.expiresAt && (
                              <div className="text-gray-400 text-sm mt-2 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Hết hạn: {new Date(pkg.expiresAt).toLocaleString('vi-VN')}
                              </div>
                            )}
                            {!pkg.expiresAt && (
                              <div className="text-success text-sm mt-2">Gói vĩnh viễn</div>
                            )}
                            <button
                              onClick={handleRemovePackage}
                              className="mt-3 btn-danger text-sm w-full"
                            >
                              Xóa Gói
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-8">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>User chưa có gói nào</p>
                      </div>
                    )}
                    
                    {!addingPackage ? (
                      <button
                        onClick={() => setAddingPackage(true)}
                        className="mt-4 btn-primary w-full flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm Gói Cho User
                      </button>
                    ) : (
                      <div className="mt-4 space-y-3">
                        <select
                          value={selectedPackageId}
                          onChange={(e) => setSelectedPackageId(e.target.value)}
                          className="gaming-input w-full"
                        >
                          <option value="">Chọn gói...</option>
                          {allPackages.map((pkg: any) => (
                            <option key={pkg.id || pkg._id} value={pkg.id || pkg._id}>
                              {pkg.name} - {pkg.price?.toLocaleString('vi-VN')}₫
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddPackage}
                            className="btn-primary flex-1"
                          >
                            Thêm
                          </button>
                          <button
                            onClick={() => {
                              setAddingPackage(false);
                              setSelectedPackageId('');
                            }}
                            className="btn-secondary"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transactions */}
                <div className="gaming-card bg-dark-secondary">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Lịch Sử Giao Dịch ({userTransactions.length})
                  </h3>
                  {userTransactions.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {userTransactions.map((tx: any) => (
                        <div key={tx.id || tx._id} className="p-3 bg-dark-card rounded-lg border border-dark-border">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="text-white font-semibold">{tx.description || tx.type}</div>
                              <div className="text-gray-400 text-sm">
                                {tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : '-'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${
                                tx.type === 'deposit' ? 'text-primary' : 'text-danger'
                              }`}>
                                {tx.type === 'deposit' ? '+' : '-'}{tx.amount?.toLocaleString('vi-VN') || 0}₫
                              </div>
                              <div className="text-gray-400 text-xs">
                                {tx.afterBalance?.toLocaleString('vi-VN') || 0}₫
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">Chưa có giao dịch nào</div>
                  )}
                </div>

                {/* Deposits */}
                <div className="gaming-card bg-dark-secondary">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Lịch Sử Nạp Tiền ({userDeposits.length})
                  </h3>
                  {userDeposits.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {userDeposits.map((deposit: any) => (
                        <div key={deposit.id || deposit._id} className="p-3 bg-dark-card rounded-lg border border-dark-border">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="text-white font-semibold">
                                {deposit.amount?.toLocaleString('vi-VN') || 0}₫
                              </div>
                              <div className="text-gray-400 text-sm">
                                {deposit.createdAt ? new Date(deposit.createdAt).toLocaleString('vi-VN') : '-'}
                              </div>
                            </div>
                            <span className={`badge ${
                              deposit.status === 'approved' ? 'badge-success' :
                              deposit.status === 'pending' ? 'badge-warning' : 'badge-danger'
                            }`}>
                              {deposit.status === 'approved' ? 'Đã duyệt' :
                               deposit.status === 'pending' ? 'Đang chờ' : 'Đã từ chối'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">Chưa có yêu cầu nạp tiền nào</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

