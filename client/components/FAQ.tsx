'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import axios from 'axios';

const defaultFaqs = [
  {
    question: 'Hack có bị ban không?',
    answer: 'Hack của chúng tôi được phát triển với công nghệ anti-ban tiên tiến, tỷ lệ ban cực kỳ thấp. Tuy nhiên, chúng tôi không đảm bảo 100% không bị ban nếu sử dụng quá lộ liễu.',
  },
  {
    question: 'Làm sao để tải và sử dụng hack?',
    answer: 'Sau khi mua gói, bạn sẽ nhận được link tải và hướng dẫn sử dụng chi tiết qua email hoặc trong dashboard. Quá trình setup rất đơn giản, chỉ cần vài phút.',
  },
  {
    question: 'Hack có cập nhật thường xuyên không?',
    answer: 'Chúng tôi cập nhật hack ngay khi game update. Tất cả khách hàng đều được cập nhật miễn phí trong thời gian gói còn hiệu lực.',
  },
  {
    question: 'Có hỗ trợ kỹ thuật không?',
    answer: 'Chúng tôi có đội ngũ support 24/7 sẵn sàng hỗ trợ bạn mọi lúc mọi nơi. Liên hệ qua Telegram, Discord hoặc ticket trong dashboard.',
  },
  {
    question: 'Thanh toán như thế nào?',
    answer: 'Hiện tại chúng tôi hỗ trợ nạp tiền vào ví trước, sau đó sử dụng số dư để mua các gói hack. Quá trình nạp tiền rất nhanh chóng và an toàn.',
  },
  {
    question: 'Có thể hoàn tiền không?',
    answer: 'Chúng tôi có chính sách hoàn tiền trong 24h đầu nếu hack không hoạt động do lỗi từ phía chúng tôi. Liên hệ support để được xử lý.',
  },
];

export default function FAQ() {
  const [faqs, setFaqs] = useState(defaultFaqs);

  useEffect(() => {
    fetchFaqs();
    
    // Listen for settings updates
    const handleSettingsUpdate = () => {
      fetchFaqs();
    };
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await axios.get(`/api/settings?t=${Date.now()}`);
      if (response.data?.faqs && Array.isArray(response.data.faqs) && response.data.faqs.length > 0) {
        setFaqs(response.data.faqs);
      }
    } catch (error) {
      // Use default FAQs on error
      console.error('[FAQ] Error fetching FAQs:', error);
    }
  };
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="my-20" id="faq">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HelpCircle className="w-8 h-8 text-primary" />
          <h2 className="text-4xl md:text-5xl font-bold gradient-text">
            Câu Hỏi Thường Gặp
          </h2>
        </div>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Tìm câu trả lời cho những thắc mắc của bạn
        </p>
      </div>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="gaming-card group">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left flex justify-between items-center gap-4"
            >
              <h3 className="font-bold text-white text-lg pr-4">{faq.question}</h3>
              <div className="flex-shrink-0">
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-primary" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-primary transition" />
                )}
              </div>
            </button>
            {openIndex === index && (
              <div className="mt-4 pt-4 border-t border-dark-border text-gray-400 leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
