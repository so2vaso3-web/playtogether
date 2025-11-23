'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Home,
  Save,
  ArrowLeft,
  Sparkles,
  Plus,
  X,
  Edit,
  Trash2,
  HelpCircle,
  Search,
  Globe,
  Facebook,
  MessageCircle,
  Youtube,
  Bell,
  Eye,
} from 'lucide-react';
import { useScrollDirection } from '@/hooks/useScrollDirection';

export default function AdminHomepage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    heroTitle: 'PlayTogether Hack Store',
    heroDescription: 'Công cụ hack game hàng đầu với công nghệ Anti-Ban tiên tiến',
    heroPrimaryButtonText: 'Xem Gói Ngay',
    heroPrimaryButtonLink: '#packages',
    heroSecondaryButtonText: 'Hỗ Trợ',
    heroSecondaryButtonLink: '/support',
    faqs: [],
    metaTitle: 'PlayTogether Hack Store',
    metaDescription: 'Công cụ hack game hàng đầu',
    metaKeywords: 'hack game, playtogether, gaming tools',
    facebookUrl: '',
    telegramUrl: '',
    discordUrl: '',
    youtubeUrl: '',
    bannerText: '',
    bannerEnabled: false,
    bannerLink: '',
  });
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '' });
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
      const response = await axios.get('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = response.data || {};
      setSettings({
        heroTitle: data.heroTitle || 'PlayTogether Hack Store',
        heroDescription: data.heroDescription || 'Công cụ hack game hàng đầu với công nghệ Anti-Ban tiên tiến',
        heroPrimaryButtonText: data.heroPrimaryButtonText || 'Xem Gói Ngay',
        heroPrimaryButtonLink: data.heroPrimaryButtonLink || '#packages',
        heroSecondaryButtonText: data.heroSecondaryButtonText || 'Hỗ Trợ',
        heroSecondaryButtonLink: data.heroSecondaryButtonLink || '/support',
        faqs: data.faqs || [],
        metaTitle: data.metaTitle || 'PlayTogether Hack Store',
        metaDescription: data.metaDescription || 'Công cụ hack game hàng đầu',
        metaKeywords: data.metaKeywords || 'hack game, playtogether, gaming tools',
        facebookUrl: data.facebookUrl || '',
        telegramUrl: data.telegramUrl || '',
        discordUrl: data.discordUrl || '',
        youtubeUrl: data.youtubeUrl || '',
        bannerText: data.bannerText || '',
        bannerEnabled: data.bannerEnabled !== undefined ? data.bannerEnabled : false,
        bannerLink: data.bannerLink || '',
      });
    } catch (error: any) {
      console.error('[Admin Homepage] Error:', error);
      toast.error('Lỗi tải cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/admin/settings', settings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Lưu thành công!');
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFaq = () => {
    if (!faqForm.question || !faqForm.answer) {
      toast.error('Vui lòng điền đầy đủ câu hỏi và câu trả lời');
      return;
    }
    setSettings({
      ...settings,
      faqs: [...(settings.faqs || []), { ...faqForm }],
    });
    setFaqForm({ question: '', answer: '' });
    toast.success('Đã thêm FAQ');
  };

  const handleEditFaq = (index: number) => {
    const faq = settings.faqs[index];
    setEditingFaq(index);
    setFaqForm({ question: faq.question, answer: faq.answer });
  };

  const handleUpdateFaq = () => {
    if (!faqForm.question || !faqForm.answer) {
      toast.error('Vui lòng điền đầy đủ câu hỏi và câu trả lời');
      return;
    }
    const newFaqs = [...(settings.faqs || [])];
    newFaqs[editingFaq] = { ...faqForm };
    setSettings({ ...settings, faqs: newFaqs });
    setEditingFaq(null);
    setFaqForm({ question: '', answer: '' });
    toast.success('Đã cập nhật FAQ');
  };

  const handleDeleteFaq = (index: number) => {
    if (!confirm('Bạn có chắc muốn xóa FAQ này?')) return;
    const newFaqs = [...(settings.faqs || [])];
    newFaqs.splice(index, 1);
    setSettings({ ...settings, faqs: newFaqs });
    toast.success('Đã xóa FAQ');
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
      
      <nav className={`relative z-50 glass border-b border-dark-border sticky top-0 transition-transform duration-300 ease-in-out ${
        isAtTop || scrollDirection === 'up' ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-3">
                <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-primary transition" />
                <div>
                  <h1 className="text-xl font-bold gradient-text">Quản Lý Trang Chủ</h1>
                  <p className="text-xs text-gray-400">Tùy chỉnh nội dung trang chủ</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="gaming-card mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Hero Section
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2 font-semibold">Tiêu đề chính</label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                className="gaming-input w-full"
                placeholder="PlayTogether Hack Store"
              />
            </div>
            
            <div>
              <label className="block text-white mb-2 font-semibold">Mô tả</label>
              <textarea
                value={settings.heroDescription}
                onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                className="gaming-input w-full"
                rows={3}
                placeholder="Công cụ hack game hàng đầu..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2 font-semibold">Nút chính - Text</label>
                <input
                  type="text"
                  value={settings.heroPrimaryButtonText}
                  onChange={(e) => setSettings({ ...settings, heroPrimaryButtonText: e.target.value })}
                  className="gaming-input w-full"
                  placeholder="Xem Gói Ngay"
                />
              </div>
              <div>
                <label className="block text-white mb-2 font-semibold">Nút chính - Link</label>
                <input
                  type="text"
                  value={settings.heroPrimaryButtonLink}
                  onChange={(e) => setSettings({ ...settings, heroPrimaryButtonLink: e.target.value })}
                  className="gaming-input w-full"
                  placeholder="#packages"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2 font-semibold">Nút phụ - Text</label>
                <input
                  type="text"
                  value={settings.heroSecondaryButtonText}
                  onChange={(e) => setSettings({ ...settings, heroSecondaryButtonText: e.target.value })}
                  className="gaming-input w-full"
                  placeholder="Hỗ Trợ"
                />
              </div>
              <div>
                <label className="block text-white mb-2 font-semibold">Nút phụ - Link</label>
                <input
                  type="text"
                  value={settings.heroSecondaryButtonLink}
                  onChange={(e) => setSettings({ ...settings, heroSecondaryButtonLink: e.target.value })}
                  className="gaming-input w-full"
                  placeholder="/support"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="gaming-card mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" />
            FAQ (Câu Hỏi Thường Gặp)
          </h2>
          
          <div className="space-y-4 mb-6">
            {settings.faqs && settings.faqs.length > 0 ? (
              settings.faqs.map((faq: any, index: number) => (
                <div key={index} className="p-4 bg-dark-secondary rounded-lg border border-dark-border">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{faq.question}</h3>
                      <p className="text-gray-400 text-sm">{faq.answer}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditFaq(index)}
                        className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition"
                      >
                        <Edit className="w-4 h-4 text-primary" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(index)}
                        className="w-8 h-8 rounded-lg bg-danger/10 hover:bg-danger/20 flex items-center justify-center transition"
                      >
                        <Trash2 className="w-4 h-4 text-danger" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">Chưa có FAQ nào</div>
            )}
          </div>
          
          <div className="border-t border-dark-border pt-4">
            <h3 className="text-white font-semibold mb-4">
              {editingFaq !== null ? 'Chỉnh sửa FAQ' : 'Thêm FAQ mới'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Câu hỏi</label>
                <input
                  type="text"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="gaming-input w-full"
                  placeholder="Nhập câu hỏi..."
                />
              </div>
              <div>
                <label className="block text-white mb-2">Câu trả lời</label>
                <textarea
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="gaming-input w-full"
                  rows={3}
                  placeholder="Nhập câu trả lời..."
                />
              </div>
              <div className="flex gap-3">
                {editingFaq !== null ? (
                  <>
                    <button
                      onClick={handleUpdateFaq}
                      className="btn-primary flex-1"
                    >
                      Cập nhật
                    </button>
                    <button
                      onClick={() => {
                        setEditingFaq(null);
                        setFaqForm({ question: '', answer: '' });
                      }}
                      className="btn-secondary"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddFaq}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm FAQ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SEO Section */}
        <div className="gaming-card mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            SEO & Meta Tags
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2 font-semibold">Meta Title</label>
              <input
                type="text"
                value={settings.metaTitle}
                onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                className="gaming-input w-full"
                placeholder="PlayTogether Hack Store"
              />
            </div>
            
            <div>
              <label className="block text-white mb-2 font-semibold">Meta Description</label>
              <textarea
                value={settings.metaDescription}
                onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                className="gaming-input w-full"
                rows={2}
                placeholder="Mô tả ngắn cho SEO..."
              />
            </div>
            
            <div>
              <label className="block text-white mb-2 font-semibold">Meta Keywords</label>
              <input
                type="text"
                value={settings.metaKeywords}
                onChange={(e) => setSettings({ ...settings, metaKeywords: e.target.value })}
                className="gaming-input w-full"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="gaming-card mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Liên Kết Mạng Xã Hội
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                <Facebook className="w-4 h-4 text-primary" />
                Facebook URL
              </label>
              <input
                type="url"
                value={settings.facebookUrl}
                onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                className="gaming-input w-full"
                placeholder="https://facebook.com/..."
              />
            </div>
            
            <div>
              <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                Telegram URL
              </label>
              <input
                type="url"
                value={settings.telegramUrl}
                onChange={(e) => setSettings({ ...settings, telegramUrl: e.target.value })}
                className="gaming-input w-full"
                placeholder="https://t.me/..."
              />
            </div>
            
            <div>
              <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                Discord URL
              </label>
              <input
                type="url"
                value={settings.discordUrl}
                onChange={(e) => setSettings({ ...settings, discordUrl: e.target.value })}
                className="gaming-input w-full"
                placeholder="https://discord.gg/..."
              />
            </div>
            
            <div>
              <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                <Youtube className="w-4 h-4 text-primary" />
                YouTube URL
              </label>
              <input
                type="url"
                value={settings.youtubeUrl}
                onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                className="gaming-input w-full"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        </div>

        {/* Banner/Announcement */}
        <div className="gaming-card mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Banner Thông Báo
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.bannerEnabled}
                  onChange={(e) => setSettings({ ...settings, bannerEnabled: e.target.checked })}
                  className="w-5 h-5 rounded bg-dark-card border-dark-border text-primary focus:ring-primary"
                />
                <span className="text-white font-semibold">Hiển thị banner</span>
              </label>
            </div>
            
            {settings.bannerEnabled && (
              <>
                <div>
                  <label className="block text-white mb-2 font-semibold">Nội dung banner</label>
                  <input
                    type="text"
                    value={settings.bannerText}
                    onChange={(e) => setSettings({ ...settings, bannerText: e.target.value })}
                    className="gaming-input w-full"
                    placeholder="Nhập nội dung thông báo..."
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2 font-semibold">Link (tùy chọn)</label>
                  <input
                    type="url"
                    value={settings.bannerLink}
                    onChange={(e) => setSettings({ ...settings, bannerLink: e.target.value })}
                    className="gaming-input w-full"
                    placeholder="https://..."
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4 justify-end">
          <Link href="/admin" className="btn-secondary px-6 py-3">
            Hủy
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Đang lưu...' : 'LƯU TẤT CẢ'}
          </button>
        </div>
      </main>
    </div>
  );
}

