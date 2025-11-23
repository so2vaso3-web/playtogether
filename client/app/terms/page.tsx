'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Sparkles, Shield, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
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
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">Điều Khoản Sử Dụng</h1>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-warning mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold">Cảnh Báo Quan Trọng</span>
              </div>
              <p className="text-sm">
                Việc sử dụng hack/cheat có thể vi phạm Điều khoản Dịch vụ của game và dẫn đến việc tài khoản bị ban vĩnh viễn. 
                Người dùng chịu hoàn toàn trách nhiệm về rủi ro khi sử dụng dịch vụ của chúng tôi.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                1. Chấp Nhận Điều Khoản
              </h2>
              <p>
                Bằng việc truy cập và sử dụng dịch vụ PlayTogether Hack, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này. 
                Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng dịch vụ.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Mô Tả Dịch Vụ</h2>
              <p>
                PlayTogether Hack cung cấp các công cụ và phần mềm hack cho game Play Together. 
                Chúng tôi không đảm bảo tính hiệu quả hoàn toàn của các công cụ này và không chịu trách nhiệm về bất kỳ thiệt hại nào 
                phát sinh từ việc sử dụng dịch vụ.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Trách Nhiệm Người Dùng</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Người dùng chịu trách nhiệm hoàn toàn về việc sử dụng hack và hậu quả phát sinh</li>
                <li>Không được sử dụng dịch vụ cho mục đích bất hợp pháp hoặc gian lận</li>
                <li>Bảo mật thông tin tài khoản và không chia sẻ cho người khác</li>
                <li>Tuân thủ các quy định và hướng dẫn sử dụng do chúng tôi cung cấp</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Chính Sách Hoàn Tiền</h2>
              <p>
                Tất cả các giao dịch mua gói hack đều được coi là giao dịch cuối cùng. 
                Chúng tôi không hoàn tiền trong các trường hợp:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Tài khoản game bị ban do sử dụng hack</li>
                <li>Hack không hoạt động do game cập nhật</li>
                <li>Người dùng tự ý chia sẻ tài khoản</li>
                <li>Vi phạm điều khoản sử dụng</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Bảo Mật Thông Tin</h2>
              <p>
                Chúng tôi cam kết bảo mật thông tin cá nhân của người dùng theo Chính sách Bảo mật. 
                Tuy nhiên, người dùng cũng có trách nhiệm bảo vệ thông tin đăng nhập của mình.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Quyền Sở Hữu Trí Tuệ</h2>
              <p>
                Tất cả nội dung, phần mềm, và tài liệu trên website là tài sản của PlayTogether Hack. 
                Người dùng không được sao chép, phân phối, hoặc sử dụng cho mục đích thương mại mà không có sự cho phép.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Giới Hạn Trách Nhiệm</h2>
              <p>
                PlayTogether Hack không chịu trách nhiệm về:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Việc tài khoản game bị ban vĩnh viễn</li>
                <li>Mất mát dữ liệu hoặc tài sản trong game</li>
                <li>Thiệt hại về tài chính hoặc danh tiếng</li>
                <li>Bất kỳ vấn đề kỹ thuật nào phát sinh từ việc sử dụng hack</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Thay Đổi Điều Khoản</h2>
              <p>
                Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào. 
                Người dùng nên thường xuyên kiểm tra để cập nhật các thay đổi.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Liên Hệ</h2>
              <p>
                Nếu bạn có bất kỳ câu hỏi nào về Điều khoản Sử dụng, vui lòng liên hệ với chúng tôi qua:
              </p>
              <ul className="list-none space-y-1 ml-4">
                <li>Email: support@playtogetherhack.com</li>
                <li>Telegram: @playtogetherhack</li>
                <li>Hoặc tạo ticket tại trang Hỗ trợ</li>
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

