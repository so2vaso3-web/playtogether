'use client';

import Link from 'next/link';
import { ArrowLeft, Lock, Sparkles, Shield, Eye } from 'lucide-react';

export default function PrivacyPage() {
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
                <p className="text-xs text-gray-400">Premium Gaming Tools</p>
              </div>
            </Link>
            <Link href="/" className="btn-secondary">
              Trang Chủ
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition mb-8">
          <ArrowLeft className="w-5 h-5" />
          Về Trang Chủ
        </Link>

        <div className="gaming-card">
          <div className="flex items-center gap-3 mb-8">
            <Lock className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">Chính Sách Bảo Mật</h1>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                1. Cam Kết Bảo Mật
              </h2>
              <p>
                PlayTogether Hack cam kết bảo vệ quyền riêng tư và thông tin cá nhân của người dùng. 
                Chúng tôi tuân thủ các tiêu chuẩn bảo mật cao nhất để đảm bảo thông tin của bạn được an toàn.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-secondary" />
                2. Thông Tin Chúng Tôi Thu Thập
              </h2>
              <p>Chúng tôi có thể thu thập các thông tin sau:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Thông tin đăng ký:</strong> Username, mật khẩu (đã được mã hóa), tên hiển thị</li>
                <li><strong>Thông tin giao dịch:</strong> Lịch sử nạp tiền, mua gói hack</li>
                <li><strong>Thông tin sử dụng:</strong> Log truy cập, thời gian sử dụng dịch vụ</li>
                <li><strong>Thông tin kỹ thuật:</strong> IP address, thiết bị sử dụng, trình duyệt</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Mục Đích Sử Dụng Thông Tin</h2>
              <p>Thông tin được thu thập được sử dụng để:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Xác thực và quản lý tài khoản người dùng</li>
                <li>Xử lý các giao dịch và thanh toán</li>
                <li>Cung cấp và cải thiện dịch vụ</li>
                <li>Gửi thông báo quan trọng về tài khoản và dịch vụ</li>
                <li>Ngăn chặn gian lận và lạm dụng</li>
                <li>Tuân thủ các yêu cầu pháp lý</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Bảo Mật Thông Tin</h2>
              <p>Chúng tôi áp dụng các biện pháp bảo mật sau:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Mã hóa mật khẩu bằng bcrypt (hashing)</li>
                <li>SSL/TLS cho tất cả kết nối</li>
                <li>Bảo vệ database với firewall và access control</li>
                <li>Backup dữ liệu định kỳ</li>
                <li>Kiểm tra và cập nhật bảo mật thường xuyên</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Chia Sẻ Thông Tin</h2>
              <p>
                Chúng tôi KHÔNG bán, cho thuê, hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba, 
                trừ các trường hợp sau:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Khi có yêu cầu từ cơ quan pháp luật</li>
                <li>Để bảo vệ quyền lợi và an toàn của chúng tôi và người dùng khác</li>
                <li>Với nhà cung cấp dịch vụ đáng tin cậy (như hosting, payment gateway) với điều kiện họ cam kết bảo mật</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Cookie và Công Nghệ Theo Dõi</h2>
              <p>
                Chúng tôi sử dụng cookies và công nghệ tương tự để:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Lưu trữ session và xác thực người dùng</li>
                <li>Nhớ cài đặt và tùy chọn của người dùng</li>
                <li>Phân tích lưu lượng truy cập và cải thiện website</li>
              </ul>
              <p className="mt-4">
                Bạn có thể tắt cookies trong trình duyệt, nhưng điều này có thể ảnh hưởng đến trải nghiệm sử dụng.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Quyền Của Người Dùng</h2>
              <p>Bạn có quyền:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Truy cập và xem thông tin cá nhân của mình</li>
                <li>Yêu cầu chỉnh sửa hoặc cập nhật thông tin</li>
                <li>Yêu cầu xóa tài khoản và dữ liệu cá nhân</li>
                <li>Từ chối nhận email marketing (nếu có)</li>
                <li>Khiếu nại về việc xử lý dữ liệu cá nhân</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Dữ Liệu Trẻ Em</h2>
              <p>
                Dịch vụ của chúng tôi không dành cho trẻ em dưới 13 tuổi. 
                Chúng tôi không cố ý thu thập thông tin từ trẻ em dưới 13 tuổi. 
                Nếu phát hiện, chúng tôi sẽ xóa thông tin đó ngay lập tức.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Thay Đổi Chính Sách</h2>
              <p>
                Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian. 
                Các thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo trên website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Liên Hệ</h2>
              <p>
                Nếu bạn có câu hỏi về Chính sách Bảo mật, vui lòng liên hệ:
              </p>
              <ul className="list-none space-y-1 ml-4">
                <li>Email: privacy@playtogetherhack.com</li>
                <li>Support: support@playtogetherhack.com</li>
                <li>Telegram: @playtogetherhack</li>
              </ul>
            </section>

            <div className="border-t border-dark-border pt-6 mt-8">
              <p className="text-sm text-gray-400">
                Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

