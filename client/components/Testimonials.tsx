'use client';

import { Star, User } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    username: 'player123',
    rating: 5,
    comment: 'Hack rất mượt, không bị lag. Mua từ lâu rồi vẫn chạy tốt!',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    username: 'gamer456',
    rating: 5,
    comment: 'Dễ sử dụng, tính năng đầy đủ. Support rất nhiệt tình!',
  },
  {
    id: 3,
    name: 'Lê Văn C',
    username: 'hack789',
    rating: 5,
    comment: 'Giá rẻ, chất lượng tốt. Đã recommend cho nhiều bạn bè!',
  },
  {
    id: 4,
    name: 'Phạm Văn D',
    username: 'proplayer',
    rating: 5,
    comment: 'Update nhanh, không bao giờ bị ban. Rất đáng tin cậy!',
  },
];

export default function Testimonials() {
  return (
    <div className="my-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
          Đánh Giá Từ Người Dùng
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Những gì khách hàng nói về chúng tôi
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="gaming-card group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white truncate">{testimonial.name}</div>
                <div className="text-gray-400 text-sm truncate">@{testimonial.username}</div>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-warning fill-warning" />
              ))}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{testimonial.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
