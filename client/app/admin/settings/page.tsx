'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Settings,
  Upload,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  Sparkles,
  X,
  Eye,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { useScrollDirection } from '@/hooks/useScrollDirection';

export default function AdminSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState<any>({
    logoUrl: '',
    faviconUrl: '',
    siteName: 'PlayTogether Hack',
    siteDescription: 'Premium Gaming Tools',
    primaryColor: '#a855f7',
    secondaryColor: '#ec4899',
    zaloId: '0896455341',
    zaloQrUrl: '',
  });
  const [previewLogo, setPreviewLogo] = useState<string>('');
  const [previewFavicon, setPreviewFavicon] = useState<string>('');
  const [previewZaloQr, setPreviewZaloQr] = useState<string>('');
  const { scrollDirection, isAtTop } = useScrollDirection();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        router.push('/login');
        return;
      }
      
      console.log('[Settings] Fetching settings...');
      const response = await axios.get('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('[Settings] Settings response:', response.data);
      
      const settingsData = response.data || {};
      const newSettings = {
        logoUrl: settingsData.logoUrl || '',
        faviconUrl: settingsData.faviconUrl || '',
        siteName: settingsData.siteName || 'PlayTogether Hack',
        siteDescription: settingsData.siteDescription || 'Premium Gaming Tools',
        primaryColor: settingsData.primaryColor || '#a855f7',
        secondaryColor: settingsData.secondaryColor || '#ec4899',
        zaloId: settingsData.zaloId || '0896455341',
        zaloQrUrl: settingsData.zaloQrUrl || '',
      };
      
      setSettings(newSettings);
      setPreviewLogo(newSettings.logoUrl);
      setPreviewFavicon(newSettings.faviconUrl);
      setPreviewZaloQr(newSettings.zaloQrUrl);
      
      console.log('[Settings] Settings loaded successfully');
    } catch (error: any) {
      console.error('[Settings] Error fetching settings:', error);
      console.error('[Settings] Error response:', error.response);
      
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi tải cài đặt';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon' | 'zaloQr') => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP, SVG)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn. Tối đa 5MB');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      console.log('[Upload] Uploading file:', { type, fileName: file.name, fileSize: file.size });

      // Step 1: Upload file
      const uploadResponse = await axios.post('/api/admin/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[Upload] Upload response:', uploadResponse.data);

      if (!uploadResponse.data || !uploadResponse.data.url) {
        throw new Error('Upload không trả về URL');
      }

      const uploadedUrl = uploadResponse.data.url;

      // Step 2: Update local state immediately
      const updatedSettings = {
        ...settings,
        logoUrl: type === 'logo' ? uploadedUrl : settings.logoUrl,
        faviconUrl: type === 'favicon' ? uploadedUrl : settings.faviconUrl,
        zaloQrUrl: type === 'zaloQr' ? uploadedUrl : settings.zaloQrUrl,
      };

      setSettings(updatedSettings);
      if (type === 'logo') {
        setPreviewLogo(uploadedUrl);
      } else if (type === 'favicon') {
        setPreviewFavicon(uploadedUrl);
      } else if (type === 'zaloQr') {
        setPreviewZaloQr(uploadedUrl);
      }

      // Step 3: Auto-save immediately with updated settings
      console.log('[Upload] Auto-saving settings with new URL:', uploadedUrl);
      const savePayload = {
        siteName: updatedSettings.siteName || 'PlayTogether Hack',
        siteDescription: updatedSettings.siteDescription || 'Premium Gaming Tools',
        primaryColor: updatedSettings.primaryColor || '#a855f7',
        secondaryColor: updatedSettings.secondaryColor || '#ec4899',
        logoUrl: updatedSettings.logoUrl || '',
        faviconUrl: updatedSettings.faviconUrl || '',
        zaloId: updatedSettings.zaloId || '0896455341',
        zaloQrUrl: updatedSettings.zaloQrUrl || '',
      };

      console.log('[Upload] Save payload:', savePayload);

      const saveResponse = await axios.put('/api/admin/settings', savePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('[Upload] Save response:', saveResponse.data);

      // Update state with server response
      const savedData = saveResponse.data || savePayload;
      setSettings({
        logoUrl: savedData.logoUrl || '',
        faviconUrl: savedData.faviconUrl || '',
        siteName: savedData.siteName || 'PlayTogether Hack',
        siteDescription: savedData.siteDescription || 'Premium Gaming Tools',
        primaryColor: savedData.primaryColor || '#a855f7',
        secondaryColor: savedData.secondaryColor || '#ec4899',
        zaloId: savedData.zaloId || '0896455341',
        zaloQrUrl: savedData.zaloQrUrl || '',
      });

      setPreviewLogo(savedData.logoUrl || '');
      setPreviewFavicon(savedData.faviconUrl || '');
      setPreviewZaloQr(savedData.zaloQrUrl || '');

      toast.success('Upload và lưu thành công!');
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (error: any) {
      console.error('[Upload] Error:', error);
      console.error('[Upload] Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Upload thất bại';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        router.push('/login');
        return;
      }

      const payload = {
        siteName: settings.siteName || 'PlayTogether Hack',
        siteDescription: settings.siteDescription || 'Premium Gaming Tools',
        primaryColor: settings.primaryColor || '#a855f7',
        secondaryColor: settings.secondaryColor || '#ec4899',
        logoUrl: settings.logoUrl || '',
        faviconUrl: settings.faviconUrl || '',
        zaloId: settings.zaloId || '0896455341',
        zaloQrUrl: settings.zaloQrUrl || '',
      };

      console.log('[Save] Saving settings:', payload);

      const response = await axios.put('/api/admin/settings', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('[Save] Save response:', response.data);

      const savedData = response.data || payload;
      setSettings({
        logoUrl: savedData.logoUrl || '',
        faviconUrl: savedData.faviconUrl || '',
        siteName: savedData.siteName || 'PlayTogether Hack',
        siteDescription: savedData.siteDescription || 'Premium Gaming Tools',
        primaryColor: savedData.primaryColor || '#a855f7',
        secondaryColor: savedData.secondaryColor || '#ec4899',
        zaloId: savedData.zaloId || '0896455341',
        zaloQrUrl: savedData.zaloQrUrl || '',
      });

      setPreviewLogo(savedData.logoUrl || '');
      setPreviewFavicon(savedData.faviconUrl || '');
      setPreviewZaloQr(savedData.zaloQrUrl || '');

      toast.success('Lưu thành công!');
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (error: any) {
      console.error('[Save] Error:', error);
      console.error('[Save] Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi kết nối server';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLogo = () => {
    setSettings({ ...settings, logoUrl: '' });
    setPreviewLogo('');
  };

  const handleRemoveFavicon = () => {
    setSettings({ ...settings, faviconUrl: '' });
    setPreviewFavicon('');
  };

  const handleRemoveZaloQr = () => {
    setSettings({ ...settings, zaloQrUrl: '' });
    setPreviewZaloQr('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-gray-400 text-xl">Đang tải...</div>
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/admin" className="flex items-center gap-2 sm:gap-3">
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-primary transition" />
              <div>
                <h1 className="text-base sm:text-lg lg:text-xl font-bold gradient-text">Cài Đặt Website</h1>
                <p className="text-[10px] sm:text-xs text-gray-400">Quản lý logo và cài đặt</p>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="gaming-card mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            Logo & Favicon
          </h2>

          {/* Logo Upload */}
          <div className="mb-8">
            <label className="block text-white mb-3 font-semibold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Logo Website
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-1">
                {previewLogo ? (
                  <div className="relative inline-block">
                    <img
                      src={previewLogo}
                      alt="Logo preview"
                      className="max-w-[200px] sm:max-w-[300px] h-auto rounded-lg border-2 border-primary/30"
                    />
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1.5 hover:bg-danger-600 transition"
                      title="Xóa logo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-[200px] sm:w-[300px] h-[100px] sm:h-[150px] border-2 border-dashed border-dark-border rounded-lg flex items-center justify-center bg-dark-secondary/30">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-gray-500">Chưa có logo</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  CHỌN LOGO
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'logo');
                    }}
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-400">PNG, JPG, SVG (tối đa 5MB)</p>
              </div>
            </div>
          </div>

          {/* Favicon Upload */}
          <div className="mb-8">
            <label className="block text-white mb-3 font-semibold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Favicon
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-1">
                {previewFavicon ? (
                  <div className="relative inline-block">
                    <img
                      src={previewFavicon}
                      alt="Favicon preview"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-primary/30"
                    />
                    <button
                      onClick={handleRemoveFavicon}
                      className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1.5 hover:bg-danger-600 transition"
                      title="Xóa favicon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-dashed border-dark-border rounded-lg flex items-center justify-center bg-dark-secondary/30">
                    <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  CHỌN FAVICON
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'favicon');
                    }}
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-400">PNG, JPG, SVG (tối đa 5MB)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="gaming-card mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            Thông Tin Website
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-white mb-2 font-semibold">Tên Website</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-3 bg-dark-secondary border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary transition"
                placeholder="PlayTogether Hack"
              />
            </div>

            <div>
              <label className="block text-white mb-2 font-semibold">Mô Tả Website</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="w-full px-4 py-3 bg-dark-secondary border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary transition resize-none"
                rows={3}
                placeholder="Premium Gaming Tools"
              />
            </div>

            <div>
              <label className="block text-white mb-3 font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                QR Code Zalo
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1">
                  {previewZaloQr ? (
                    <div className="relative inline-block">
                      <img
                        src={previewZaloQr}
                        alt="Zalo QR preview"
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg border-2 border-primary/30"
                      />
                      <button
                        onClick={handleRemoveZaloQr}
                        className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1.5 hover:bg-danger-600 transition"
                        title="Xóa QR code"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 sm:w-40 sm:h-40 border-2 border-dashed border-dark-border rounded-lg flex items-center justify-center bg-dark-secondary/30">
                      <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500" />
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Upload QR code từ Zalo để khách hàng quét và liên hệ trực tiếp
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    CHỌN QR CODE ZALO
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'zaloQr');
                      }}
                      disabled={uploading}
                    />
                  </label>
                  <p className="text-xs text-gray-400">PNG, JPG, SVG (tối đa 5MB)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-white mb-2 font-semibold">Màu Chính</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-16 h-12 rounded-lg border border-dark-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 bg-dark-secondary border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary transition"
                    placeholder="#a855f7"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">Màu Phụ</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    className="w-16 h-12 rounded-lg border border-dark-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 bg-dark-secondary border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary transition"
                    placeholder="#ec4899"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={() => router.back()}
            className="btn-secondary px-6 py-3"
          >
            HỦY
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Đang lưu...' : 'LƯU CÀI ĐẶT'}
          </button>
        </div>
      </main>
    </div>
  );
}
