'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowLeft,
  Sparkles,
  LogOut,
  X,
  Check,
  Save,
  DollarSign,
  Clock,
  Smartphone,
  Apple,
  Monitor,
  Globe,
  Link as LinkIcon,
  Info,
  FileCode,
  Upload,
  Image as ImageIcon,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Map,
  Bug,
  Fish,
  Gift,
  Gamepad2,
  Settings,
} from 'lucide-react';
import PlatformBadge from '@/components/PlatformBadge';

export default function AdminPackages() {
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '30',
    features: [] as string[],
    detailedFeatures: {} as { [key: string]: Array<{ name: string; description?: string; enabled?: boolean }> },
    icon: '',
    popular: false,
    platform: 'all' as 'android' | 'ios' | 'emulator' | 'all',
    downloadUrl: '',
    systemRequirements: '',
    version: '',
    banRisk: 'medium' as 'none' | 'low' | 'medium' | 'high',
    antiBanGuarantee: false,
  });
  const [newFeature, setNewFeature] = useState('');
  const [activeFeatureTab, setActiveFeatureTab] = useState('chung');
  const [newDetailedFeature, setNewDetailedFeature] = useState({ name: '', description: '' });
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [iconPreview, setIconPreview] = useState<string>('');

  // Danh sách tính năng hack Play Together mới nhất tháng 11/2025 (Tiếng Việt hoàn toàn)
  const getPlayTogetherDefaultFeatures = () => {
    return {
      chung: [
        { name: 'Tự Động Di Chuyển Thông Minh AI', description: 'Hệ thống AI tự động di chuyển thông minh, tránh người chơi khác và chướng ngại vật', enabled: true },
        { name: 'Tự Động Tới', description: 'Tự động di chuyển đến vị trí mục tiêu đã chọn', enabled: true },
        { name: 'Tăng Tốc Độ (2x, 3x, 5x, 10x)', description: 'Tăng tốc độ di chuyển lên 2x, 3x, 5x, hoặc 10x lần', enabled: true },
        { name: 'Bay / Đi Xuyên Tường', description: 'Bay và đi xuyên qua tường, địa hình', enabled: true },
        { name: 'Dịch Chuyển Đến Điểm Nhất Định', description: 'Dịch chuyển tức thì đến vị trí bất kỳ trên bản đồ', enabled: true },
        { name: 'Dịch Chuyển Theo Tọa Độ', description: 'Dịch chuyển theo tọa độ X, Y, Z chính xác', enabled: true },
        { name: 'Nhìn Xuyên Tường', description: 'Nhìn xuyên tường, thấy người chơi và NPC ẩn', enabled: true },
        { name: 'Sức Bền Vô Hạn', description: 'Sức bền vô hạn, không bao giờ mệt', enabled: true },
        { name: 'Không Có Thời Gian Chờ', description: 'Bỏ cooldown tất cả kỹ năng và hành động', enabled: true },
        { name: 'Tự Động Tránh Người Chơi', description: 'Tự động tránh các người chơi khác khi hack', enabled: true },
        { name: 'Hệ Thống Chống Ban AI', description: 'Hệ thống AI chống ban thông minh, giả lập hành vi người thật', enabled: true },
        { name: 'Chế Độ Tàng Hình', description: 'Chế độ tàng hình, người khác không thấy bạn', enabled: true },
        { name: 'Chế Độ Bất Tử', description: 'Bất tử, không nhận sát thương', enabled: true },
        { name: 'Hiện Bảng Thông Tin', description: 'Hiển thị bảng thông tin chi tiết về game và hack', enabled: true },
        { name: 'Khôi Phục Trạng Thái', description: 'Khôi phục lại trạng thái trước đó khi cần thiết', enabled: true },
        { name: 'Nhận Thành Tích', description: 'Tự động nhận tất cả thành tích có sẵn', enabled: true },
        { name: 'Tăng Kích Thước Nhân Vật', description: 'Tăng hoặc giảm kích thước nhân vật theo ý muốn', enabled: true },
        { name: 'Nhảy Cao Không Giới Hạn', description: 'Nhảy cao vô hạn, không bị giới hạn bởi vật lý', enabled: true },
        { name: 'Đi Trên Nước', description: 'Đi bộ trên mặt nước như đi trên đất', enabled: true },
        { name: 'Vượt Qua Vật Cản', description: 'Tự động vượt qua các vật cản và chướng ngại vật', enabled: true },
        { name: 'Tự Động Tránh Bẫy', description: 'Tự động phát hiện và tránh các bẫy trên bản đồ', enabled: true },
        { name: 'Hiển Thị Tọa Độ', description: 'Hiển thị tọa độ hiện tại trên màn hình', enabled: true },
        { name: 'Compass Hack', description: 'La bàn chỉ đường đến các điểm quan trọng', enabled: true },
        { name: 'Tự Động Hồi Máu', description: 'Tự động hồi máu khi máu thấp', enabled: true },
        { name: 'Máu Không Giảm', description: 'Máu luôn ở mức tối đa, không bao giờ giảm', enabled: true },
        { name: 'Năng Lượng Vô Hạn', description: 'Năng lượng không bao giờ cạn', enabled: true },
        { name: 'Tự Động Uống Thuốc', description: 'Tự động uống thuốc khi cần thiết', enabled: true },
        { name: 'Chế Độ Ban Đêm', description: 'Bật/tắt chế độ ban đêm bất cứ lúc nào', enabled: true },
        { name: 'Thay Đổi Thời Tiết', description: 'Thay đổi thời tiết theo ý muốn', enabled: true },
        { name: 'Gravity Hack', description: 'Điều chỉnh trọng lực, bay lơ lửng hoặc rơi nhanh', enabled: true },
      ],
      map: [
        { name: 'Bản Đồ Radar Hack', description: 'Hiển thị tất cả NPC, vật phẩm, sự kiện trên radar', enabled: true },
        { name: 'Đánh Dấu Vị Trí', description: 'Đánh dấu các vị trí quan trọng trên bản đồ', enabled: true },
        { name: 'Tự Động Tìm Đường', description: 'Tự động tìm đường ngắn nhất đến mục tiêu', enabled: true },
        { name: 'Dịch Chuyển Đến Người Chơi', description: 'Dịch chuyển đến người chơi bất kỳ', enabled: true },
        { name: 'Hiển Thị Tất Cả Tài Nguyên', description: 'Hiển thị tất cả tài nguyên trên bản đồ', enabled: true },
        { name: 'Tự Động Thu Thập Vật Phẩm Gần Đó', description: 'Tự động thu thập vật phẩm gần đó', enabled: true },
        { name: 'Bản Đồ Không Giới Hạn', description: 'Bỏ giới hạn di chuyển trên bản đồ', enabled: true },
        { name: 'Hiển Thị Đường Dẫn Tối Ưu', description: 'Hiển thị đường đi tối ưu nhất trên bản đồ', enabled: true },
        { name: 'Phóng To / Thu Nhỏ Bản Đồ', description: 'Phóng to thu nhỏ bản đồ không giới hạn', enabled: true },
        { name: 'Bản Đồ 3D', description: 'Xem bản đồ ở chế độ 3D chi tiết', enabled: true },
        { name: 'Đánh Dấu Nhiều Điểm', description: 'Đánh dấu nhiều điểm cùng lúc trên bản đồ', enabled: true },
        { name: 'Lưu Vị Trí Yêu Thích', description: 'Lưu các vị trí yêu thích để dịch chuyển nhanh', enabled: true },
        { name: 'Hiển Thị Khoảng Cách', description: 'Hiển thị khoảng cách đến các điểm trên bản đồ', enabled: true },
        { name: 'Bản Đồ Toàn Màn Hình', description: 'Mở bản đồ ở chế độ toàn màn hình', enabled: true },
        { name: 'Tự Động Cập Nhật Bản Đồ', description: 'Bản đồ tự động cập nhật theo thời gian thực', enabled: true },
        { name: 'Hiển Thị Mật Độ Người Chơi', description: 'Hiển thị mật độ người chơi trên từng khu vực', enabled: true },
        { name: 'Lọc Điểm Quan Trọng', description: 'Lọc và chỉ hiển thị các điểm quan trọng trên bản đồ', enabled: true },
      ],
      contrung: [
        { name: 'Tự Động Bắt Côn Trùng', description: 'Tự động tìm và bắt tất cả côn trùng gần đó', enabled: true },
        { name: 'Nhìn Thấy Côn Trùng Xuyên Tường', description: 'Nhìn thấy côn trùng xuyên tường', enabled: true },
        { name: 'Bắt Ngay Lập Tức', description: 'Bắt côn trùng ngay lập tức, không cần chờ', enabled: true },
        { name: 'Làm Nổi Bật Côn Trùng Hiếm', description: 'Làm nổi bật côn trùng hiếm trên map', enabled: true },
        { name: 'Tự Động Bán Côn Trùng', description: 'Tự động bán côn trùng khi túi đầy', enabled: true },
        { name: 'Lọc Côn Trùng Theo Độ Hiếm', description: 'Lọc và chỉ bắt côn trùng theo độ hiếm', enabled: true },
        { name: 'Dự Đoán Vị Trí Côn Trùng Hiếm', description: 'Dự đoán vị trí xuất hiện côn trùng hiếm', enabled: true },
        { name: 'Tự Động Đuổi Theo Côn Trùng', description: 'Tự động đuổi theo côn trùng khi phát hiện', enabled: true },
        { name: 'Bắt Nhiều Côn Trùng Cùng Lúc', description: 'Bắt nhiều côn trùng cùng một lúc', enabled: true },
        { name: 'Hút Côn Trùng Từ Xa', description: 'Hút côn trùng về phía mình từ khoảng cách xa', enabled: true },
        { name: 'Tự Động Phân Loại Côn Trùng', description: 'Tự động phân loại côn trùng sau khi bắt', enabled: true },
        { name: 'Thông Báo Côn Trùng Hiếm', description: 'Thông báo khi phát hiện côn trùng hiếm gần đó', enabled: true },
        { name: 'Lịch Sử Vị Trí Côn Trùng', description: 'Ghi nhớ các vị trí đã bắt được côn trùng hiếm', enabled: true },
        { name: 'Tự Động Thay Đổi Dụng Cụ Bắt', description: 'Tự động thay đổi dụng cụ bắt phù hợp', enabled: true },
        { name: 'Tăng Tỷ Lệ Bắt Trúng', description: 'Tăng tỷ lệ bắt trúng côn trùng lên 100%', enabled: true },
        { name: 'Bỏ Qua Animation Bắt', description: 'Bỏ qua animation khi bắt côn trùng', enabled: true },
        { name: 'Tự Động Nâng Cấp Lưới', description: 'Tự động nâng cấp lưới bắt côn trùng', enabled: true },
      ],
      cauca: [
        { name: 'Tự Động Câu Cá', description: 'Tự động câu cá, không cần tương tác', enabled: true },
        { name: 'Bắt Cá Ngay Lập Tức', description: 'Bắt cá ngay lập tức, bỏ qua minigame', enabled: true },
        { name: 'Làm Nổi Bật Cá Hiếm', description: 'Làm nổi bật cá hiếm trên map', enabled: true },
        { name: 'Tự Động Timing Hoàn Hảo', description: 'Tự động timing hoàn hảo khi câu', enabled: true },
        { name: 'Mồi Câu Không Giới Hạn', description: 'Mồi câu không giới hạn', enabled: true },
        { name: 'Nam Châm Thu Hút Cá', description: 'Thu hút tất cả cá trong khu vực', enabled: true },
        { name: 'Tự Động Bán Cá', description: 'Tự động bán cá khi túi đầy', enabled: true },
        { name: 'Tự Động Thả Câu', description: 'Tự động thả cần câu ở vị trí tốt nhất', enabled: true },
        { name: 'Câu Nhiều Cá Cùng Lúc', description: 'Câu nhiều cá cùng một lúc', enabled: true },
        { name: 'Tự Động Chọn Mồi Phù Hợp', description: 'Tự động chọn mồi phù hợp với từng loại cá', enabled: true },
        { name: 'Hiển Thị Thông Tin Cá', description: 'Hiển thị thông tin chi tiết về cá khi phát hiện', enabled: true },
        { name: 'Tự Động Nâng Cấp Cần Câu', description: 'Tự động nâng cấp cần câu khi đủ điều kiện', enabled: true },
        { name: 'Tăng Tỷ Lệ Câu Cá Hiếm', description: 'Tăng tỷ lệ câu được cá hiếm lên tối đa', enabled: true },
        { name: 'Tự Động Phân Loại Cá', description: 'Tự động phân loại cá sau khi câu', enabled: true },
        { name: 'Bỏ Qua Animation Câu Cá', description: 'Bỏ qua tất cả animation khi câu cá', enabled: true },
        { name: 'Câu Cá Mọi Vị Trí', description: 'Câu cá được ở mọi vị trí, không cần nước', enabled: true },
        { name: 'Hiển Thị Vị Trí Cá Hiếm', description: 'Hiển thị vị trí xuất hiện cá hiếm trên map', enabled: true },
        { name: 'Tự Động Sửa Dụng Cụ Câu', description: 'Tự động sửa chữa dụng cụ câu khi hỏng', enabled: true },
      ],
      thuthap: [
        { name: 'Tự Động Thu Thập Tài Nguyên', description: 'Tự động thu thập tất cả tài nguyên xung quanh', enabled: true },
        { name: 'Sửa Dụng Cụ', description: 'Tự động sửa chữa dụng cụ khi hư hỏng', enabled: true },
        { name: 'Bảo Quản', description: 'Tự động bảo quản vật phẩm một cách thông minh', enabled: true },
        { name: 'Mở Hộp Quà / Gói Thẻ', description: 'Tự động mở hộp quà và gói thẻ khi có', enabled: true },
        { name: 'Túi Đồ Không Giới Hạn', description: 'Túi đồ không giới hạn', enabled: true },
        { name: 'Tự Động Sắp Xếp Túi Đồ', description: 'Tự động sắp xếp túi đồ', enabled: true },
        { name: 'Thu Hoạch Nhiều Vật Phẩm', description: 'Thu hoạch nhiều vật phẩm cùng lúc', enabled: true },
        { name: 'Thu Hoạch Ngay Lập Tức', description: 'Thu hoạch ngay lập tức, không cần đợi', enabled: true },
        { name: 'Hiển Thị Tài Nguyên Trên Bản Đồ', description: 'Hiển thị tất cả tài nguyên trên map', enabled: true },
        { name: 'Chức Năng Gói Bán Nhanh', description: 'Tự động bán các gói vật phẩm một cách nhanh chóng', enabled: true },
        { name: 'Tự Động Trồng Cây', description: 'Tự động trồng và chăm sóc cây trồng', enabled: true },
        { name: 'Thu Hoạch Tự Động', description: 'Tự động thu hoạch khi cây trồng chín', enabled: true },
        { name: 'Tăng Tốc Độ Trồng Trọt', description: 'Tăng tốc độ phát triển của cây trồng', enabled: true },
        { name: 'Tự Động Chăm Sóc Động Vật', description: 'Tự động cho ăn và chăm sóc động vật', enabled: true },
        { name: 'Thu Sản Phẩm Tự Động', description: 'Tự động thu sản phẩm từ động vật', enabled: true },
        { name: 'Xây Dựng Tự Động', description: 'Tự động xây dựng các công trình', enabled: true },
        { name: 'Nâng Cấp Tự Động', description: 'Tự động nâng cấp nhà cửa và công trình', enabled: true },
        { name: 'Sản Xuất Không Giới Hạn', description: 'Sản xuất vật phẩm không giới hạn', enabled: true },
        { name: 'Tự Động Mua Bán', description: 'Tự động mua bán vật phẩm với giá tốt nhất', enabled: true },
        { name: 'Tự Động Trao Đổi', description: 'Tự động trao đổi vật phẩm với người chơi khác', enabled: true },
        { name: 'Tự Động Làm Nhiệm Vụ', description: 'Tự động nhận và hoàn thành nhiệm vụ', enabled: true },
        { name: 'Tự Động Tìm Kiếm Vật Phẩm', description: 'Tự động tìm kiếm và thu thập vật phẩm quý', enabled: true },
        { name: 'Tự Động Nâng Cấp Nhân Vật', description: 'Tự động nâng cấp level và kỹ năng nhân vật', enabled: true },
        { name: 'Tự Động Học Kỹ Năng', description: 'Tự động học và nâng cấp kỹ năng', enabled: true },
        { name: 'Tự Động Mặc Đồ', description: 'Tự động mặc đồ phù hợp cho nhân vật', enabled: true },
        { name: 'Tự Động Sửa Đồ', description: 'Tự động sửa chữa đồ đạc khi hỏng', enabled: true },
        { name: 'Tự Động Nạp Tiền', description: 'Tự động nạp tiền vào game (nếu có tích hợp)', enabled: true },
        { name: 'Bỏ Qua Tất Cả Quảng Cáo', description: 'Tự động bỏ qua tất cả quảng cáo', enabled: true },
        { name: 'Tự Động Đăng Nhập', description: 'Tự động đăng nhập vào game', enabled: true },
        { name: 'Tự Động Nhận Thưởng Hàng Ngày', description: 'Tự động nhận phần thưởng đăng nhập hàng ngày', enabled: true },
      ],
      sukien: [
        { name: 'Tự Động Tham Gia Sự Kiện', description: 'Tự động tham gia tất cả sự kiện', enabled: true },
        { name: 'Tự Động Hoàn Thành Nhiệm Vụ', description: 'Tự động hoàn thành nhiệm vụ sự kiện', enabled: true },
        { name: 'Hiển Thị Thời Gian Sự Kiện', description: 'Hiển thị thời gian sự kiện còn lại', enabled: true },
        { name: 'Tự Động Nhận Thưởng Sự Kiện', description: 'Tự động nhận thưởng sự kiện', enabled: true },
        { name: 'Hiển Thị Vị Trí Sự Kiện', description: 'Hiển thị vị trí sự kiện trên map', enabled: true },
        { name: 'Tự Động Hoàn Thành Minigame Sự Kiện', description: 'Tự động hoàn thành minigame trong sự kiện', enabled: true },
        { name: 'Thông Báo Sự Kiện Mới', description: 'Thông báo khi có sự kiện mới xuất hiện', enabled: true },
        { name: 'Tự Động Dịch Chuyển Đến Sự Kiện', description: 'Tự động dịch chuyển đến vị trí sự kiện', enabled: true },
        { name: 'Tăng Tỷ Lệ Nhận Thưởng', description: 'Tăng tỷ lệ nhận được phần thưởng cao từ sự kiện', enabled: true },
        { name: 'Nhận Tất Cả Thưởng Sự Kiện', description: 'Nhận tất cả phần thưởng từ sự kiện cùng lúc', enabled: true },
        { name: 'Lịch Sử Sự Kiện', description: 'Xem lịch sử các sự kiện đã tham gia', enabled: true },
        { name: 'Tự Động Đăng Ký Sự Kiện', description: 'Tự động đăng ký tham gia sự kiện khi có', enabled: true },
        { name: 'Hoàn Thành Nhiệm Vụ Hàng Ngày', description: 'Tự động hoàn thành nhiệm vụ hàng ngày', enabled: true },
        { name: 'Hoàn Thành Nhiệm Vụ Hàng Tuần', description: 'Tự động hoàn thành nhiệm vụ hàng tuần', enabled: true },
        { name: 'Tham Gia Sự Kiện Đặc Biệt', description: 'Tự động tham gia các sự kiện đặc biệt', enabled: true },
        { name: 'Nhận Code Quà Tặng', description: 'Tự động nhận code quà tặng từ sự kiện', enabled: true },
      ],
      minigame: [
        { name: 'Tự Động Thắng Minigame', description: 'Tự động thắng tất cả minigame', enabled: true },
        { name: 'Timing Hoàn Hảo', description: 'Timing hoàn hảo cho mọi minigame', enabled: true },
        { name: 'Bỏ Qua Animation Minigame', description: 'Bỏ qua animation, hoàn thành ngay', enabled: true },
        { name: 'Chơi Minigame Không Giới Hạn', description: 'Không giới hạn số lần chơi minigame', enabled: true },
        { name: 'Tự Động Nhận Thưởng Minigame', description: 'Tự động nhận thưởng minigame', enabled: true },
        { name: 'Điểm Số Tối Đa', description: 'Đạt điểm số tối đa trong mọi minigame', enabled: true },
        { name: 'Tự Động Chơi Minigame', description: 'Tự động chơi minigame mà không cần tương tác', enabled: true },
        { name: 'Bỏ Qua Thời Gian Chờ', description: 'Bỏ qua thời gian chờ giữa các lượt chơi', enabled: true },
        { name: 'Hack Điểm Số', description: 'Thiết lập điểm số theo ý muốn', enabled: true },
        { name: 'Tự Động Hoàn Thành Mục Tiêu', description: 'Tự động hoàn thành mục tiêu minigame', enabled: true },
        { name: 'Tăng Tốc Độ Minigame', description: 'Tăng tốc độ chơi minigame để hoàn thành nhanh hơn', enabled: true },
        { name: 'Nhận Tất Cả Thưởng', description: 'Nhận tất cả phần thưởng từ minigame', enabled: true },
        { name: 'Không Giới Hạn Mạng Sống', description: 'Không giới hạn số mạng sống trong minigame', enabled: true },
        { name: 'Chế Độ Dễ Dàng', description: 'Giảm độ khó minigame xuống mức dễ nhất', enabled: true },
      ],
      caidat: [
        { name: 'Tùy Chỉnh Phím Tắt', description: 'Tùy chỉnh phím tắt cho mọi tính năng', enabled: true },
        { name: 'Giao Diện Menu Đẹp', description: 'Giao diện menu đẹp mắt, dễ sử dụng', enabled: true },
        { name: 'Chế Độ An Toàn', description: 'Chế độ an toàn, giảm nguy cơ ban', enabled: true },
        { name: 'Tự Động Cập Nhật', description: 'Tự động cập nhật khi game update', enabled: true },
        { name: 'Lưu / Tải Cấu Hình', description: 'Lưu và tải cấu hình hack', enabled: true },
        { name: 'Hỗ Trợ Đa Ngôn Ngữ', description: 'Hỗ trợ nhiều ngôn ngữ', enabled: true },
        { name: 'Tối Ưu Hiệu Suất', description: 'Tối ưu hiệu suất, giảm lag', enabled: true },
        { name: 'Backup / Restore Settings', description: 'Sao lưu và khôi phục cài đặt', enabled: true },
        { name: 'Chế Độ Tối', description: 'Giao diện chế độ tối để bảo vệ mắt', enabled: true },
        { name: 'Thông Báo Push', description: 'Nhận thông báo push khi có sự kiện mới', enabled: true },
        { name: 'Log Hành Động', description: 'Ghi log tất cả hành động hack', enabled: true },
        { name: 'Reset Cài Đặt', description: 'Khôi phục cài đặt về mặc định', enabled: true },
        { name: 'Xuất / Nhập Cấu Hình', description: 'Xuất và nhập cấu hình hack giữa các thiết bị', enabled: true },
        { name: 'Chế Độ Tự Động', description: 'Tự động bật/tắt các tính năng theo lịch trình', enabled: true },
      ],
    };
  };

  // Function thêm tính năng mặc định
  const loadDefaultFeatures = () => {
    const defaultFeatures = getPlayTogetherDefaultFeatures();
    setFormData({
      ...formData,
      detailedFeatures: defaultFeatures,
    });
    toast.success(`Đã thêm ${Object.values(defaultFeatures).flat().length} tính năng hack Play Together mới nhất tháng 11/2025 (tiếng Việt)!`);
  };

  useEffect(() => {
    checkAdmin();
    fetchPackages();
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
          console.error('[Admin Packages] Failed to set admin:', err);
        }
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        router.push('/login');
        return;
      }
      
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const response = await axios.get('/api/admin/packages', {
        headers: { Authorization: authToken },
      });
      setPackages(response.data);
    } catch (error: any) {
      toast.error('Lỗi tải danh sách packages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.price) {
        toast.error('Vui lòng điền đầy đủ tên gói và giá');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        router.push('/login');
        return;
      }
      
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const payload = {
        name: formData.name.trim(),
        description: formData.description || '',
        price: parseInt(formData.price.toString()) || 0,
        duration: parseInt(formData.duration.toString()) || 30,
        features: formData.features.filter((f) => f && f.trim()),
        icon: formData.icon || '',
        popular: formData.popular || false,
      };

      console.log('[Admin Packages] Creating package:', payload);
      
      const response = await axios.post(
        '/api/admin/packages',
        payload,
        {
          headers: { Authorization: authToken },
        }
      );
      
      console.log('[Admin Packages] Package created:', response.data);
      toast.success('Tạo gói thành công!');
      setShowCreateModal(false);
      resetForm();
      await fetchPackages();
      // Notify homepage to reload packages
      console.log('[Admin Packages] Triggering packagesUpdated event');
      window.dispatchEvent(new Event('packagesUpdated'));
      // Also use localStorage to trigger cross-tab updates
      localStorage.setItem('packagesUpdated', Date.now().toString());
      localStorage.removeItem('packagesUpdated');
    } catch (error: any) {
      console.error('[Admin Packages] Error creating package:', error);
      toast.error(error.response?.data?.message || 'Lỗi tạo gói');
    }
  };

  const handleEdit = (pkg: any) => {
    setEditingPackage(pkg);
    setIconPreview(pkg.icon || '');
    const price = pkg.price || 0;
    // Auto-set ban risk based on price if not set
    let banRisk = pkg.banRisk;
    if (!banRisk) {
      if (price >= 500000) {
        banRisk = 'none';
      } else if (price >= 300000) {
        banRisk = 'low';
      } else if (price >= 100000) {
        banRisk = 'medium';
      } else {
        banRisk = 'high';
      }
    }
    setFormData({
      name: pkg.name || '',
      description: pkg.description || '',
      price: pkg.price?.toString() || '',
      duration: pkg.duration?.toString() || '30',
      features: pkg.features || [],
      detailedFeatures: pkg.detailedFeatures || {},
      icon: pkg.icon || '',
      popular: pkg.popular || false,
      platform: pkg.platform || 'all',
      downloadUrl: pkg.downloadUrl || '',
      systemRequirements: pkg.systemRequirements || '',
      version: pkg.version || '',
      banRisk: banRisk,
      antiBanGuarantee: pkg.antiBanGuarantee || (price >= 500000),
    });
  };

  const handleUpdate = async () => {
    try {
      if (!formData.name || !formData.price) {
        toast.error('Vui lòng điền đầy đủ tên gói và giá');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        router.push('/login');
        return;
      }
      
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const payload = {
        name: formData.name.trim(),
        description: formData.description || '',
        price: parseInt(formData.price.toString()) || 0,
        duration: parseInt(formData.duration.toString()) || 30,
        features: formData.features.filter((f) => f && f.trim()),
        detailedFeatures: formData.detailedFeatures || {},
        icon: formData.icon || '',
        popular: formData.popular || false,
        platform: formData.platform || 'all',
        downloadUrl: formData.downloadUrl || '',
        systemRequirements: formData.systemRequirements || '',
        version: formData.version || '',
        banRisk: formData.banRisk || 'medium',
        antiBanGuarantee: formData.antiBanGuarantee || false,
      };

      const packageId = editingPackage.id || editingPackage._id;
      console.log('[Admin Packages] Updating package:', packageId, payload);
      
      const response = await axios.put(
        `/api/admin/packages/${packageId}`,
        payload,
        {
          headers: { Authorization: authToken },
        }
      );
      
      console.log('[Admin Packages] Package updated:', response.data);
      toast.success('Cập nhật gói thành công!');
      setEditingPackage(null);
      resetForm();
      await fetchPackages();
      // Notify homepage to reload packages - MULTIPLE METHODS
      console.log('[Admin Packages] Triggering packagesUpdated event after update');
      
      // Method 1: Window event
      window.dispatchEvent(new Event('packagesUpdated'));
      
      // Method 2: CustomEvent with data
      window.dispatchEvent(new CustomEvent('packagesUpdated', { 
        detail: { packageId: packageId, timestamp: Date.now() }
      }));
      
      // Method 3: localStorage for cross-tab
      localStorage.setItem('packagesUpdated', Date.now().toString());
      setTimeout(() => localStorage.removeItem('packagesUpdated'), 100);
      
      // Method 4: BroadcastChannel for cross-tab (if supported)
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('packages-updates');
        channel.postMessage({ type: 'updated', timestamp: Date.now() });
        channel.close();
      }
    } catch (error: any) {
      console.error('[Admin Packages] Error updating package:', error);
      toast.error(error.response?.data?.message || 'Lỗi cập nhật gói');
    }
  };

  const handleDelete = async (packageId: string, packageName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa gói "${packageName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/packages/${packageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Xóa gói thành công!');
      await fetchPackages();
      // Notify homepage to reload packages - MULTIPLE METHODS
      console.log('[Admin Packages] Triggering packagesUpdated event after delete');
      
      // Method 1: Window event
      window.dispatchEvent(new Event('packagesUpdated'));
      
      // Method 2: CustomEvent with data
      window.dispatchEvent(new CustomEvent('packagesUpdated', { 
        detail: { packageId: packageId, timestamp: Date.now(), action: 'deleted' }
      }));
      
      // Method 3: localStorage for cross-tab
      localStorage.setItem('packagesUpdated', Date.now().toString());
      setTimeout(() => localStorage.removeItem('packagesUpdated'), 100);
      
      // Method 4: BroadcastChannel for cross-tab (if supported)
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('packages-updates');
        channel.postMessage({ type: 'deleted', timestamp: Date.now() });
        channel.close();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi xóa gói');
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const resetForm = () => {
    setIconPreview('');
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '30',
      features: [],
      detailedFeatures: {},
      icon: '',
      popular: false,
      platform: 'all',
      downloadUrl: '',
      systemRequirements: '',
      version: '',
      banRisk: 'medium',
      antiBanGuarantee: false,
    });
    setNewFeature('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pkg.description && pkg.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <Package className="w-10 h-10 text-secondary" />
              Quản Lý Packages
            </h1>
            <p className="text-gray-400">Quản lý tất cả gói hack trong hệ thống</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-gray-400">
              Tổng: <span className="text-secondary font-bold">{packages.length}</span> gói
            </div>
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    toast.error('Vui lòng đăng nhập lại');
                    return;
                  }
                  
                  const defaultFeatures = getPlayTogetherDefaultFeatures();
                  const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                  
                  // Tìm 3 gói cần update (tìm theo nhiều cách)
                  const vip1Month = packages.find(p => 
                    p.name && (
                      p.name.toLowerCase().includes('vip 1 tháng') ||
                      p.name.toLowerCase().includes('vip 1 month') ||
                      (p.price >= 190000 && p.price <= 210000 && p.duration === 30)
                    )
                  );
                  
                  const vipPremium = packages.find(p => 
                    p.name && (
                      p.name.toLowerCase().includes('vip premium') ||
                      p.name.toLowerCase().includes('vip 3 tháng') ||
                      p.name.toLowerCase().includes('vip 3 month') ||
                      (p.price >= 340000 && p.price <= 360000 && p.duration === 90)
                    )
                  );
                  
                  const lifetimeElite = packages.find(p => 
                    p.name && (
                      p.name.toLowerCase().includes('lifetime') ||
                      p.name.toLowerCase().includes('elite') ||
                      (p.price >= 590000 && p.price <= 610000 && p.duration >= 365)
                    )
                  );
                  
                  let updatedCount = 0;
                  const totalFeatures = Object.values(defaultFeatures).flat().length;
                  
                  // Update VIP 1 THÁNG
                  if (vip1Month) {
                    await axios.put(
                      `/api/admin/packages/${vip1Month.id || vip1Month._id}`,
                      { 
                        detailedFeatures: defaultFeatures,
                        features: [
                          'Auto Di Chuyển Thông Minh',
                          'Auto Sửa Dụng Cụ Nâng Cao',
                          'Auto Bảo Quản Thông Minh',
                        ],
                      },
                      { headers: { Authorization: authToken } }
                    );
                    updatedCount++;
                    toast.success(`✅ Đã thêm ${totalFeatures} tính năng vào "${vip1Month.name}"`);
                  } else {
                    toast.error('⚠ Không tìm thấy gói VIP 1 THÁNG');
                  }
                  
                  // Update VIP PREMIUM 3 THÁNG
                  if (vipPremium) {
                    await axios.put(
                      `/api/admin/packages/${vipPremium.id || vipPremium._id}`,
                      { 
                        detailedFeatures: defaultFeatures,
                        features: [
                          'Auto Di Chuyển Thông Minh AI',
                          'Auto Sửa Dụng Cụ Nâng Cao',
                          'Auto Bảo Quản Thông Minh',
                          'Đảm bảo không ban - Hoàn tiền nếu bị ban',
                        ],
                        antiBanGuarantee: true,
                        banRisk: 'none',
                      },
                      { headers: { Authorization: authToken } }
                    );
                    updatedCount++;
                    toast.success(`✅ Đã thêm ${totalFeatures} tính năng vào "${vipPremium.name}"`);
                  } else {
                    toast.error('⚠ Không tìm thấy gói VIP PREMIUM 3 THÁNG');
                  }
                  
                  // Update LIFETIME ELITE
                  if (lifetimeElite) {
                    await axios.put(
                      `/api/admin/packages/${lifetimeElite.id || lifetimeElite._id}`,
                      { 
                        detailedFeatures: defaultFeatures,
                        features: [
                          'Auto Di Chuyển Thông Minh AI',
                          'Auto Sửa Dụng Cụ Nâng Cao',
                          'Auto Bảo Quản Thông Minh',
                          'Đảm bảo không ban - Hoàn tiền nếu bị ban',
                          'Hỗ trợ trọn đời',
                        ],
                        antiBanGuarantee: true,
                        banRisk: 'none',
                      },
                      { headers: { Authorization: authToken } }
                    );
                    updatedCount++;
                    toast.success(`✅ Đã thêm ${totalFeatures} tính năng vào "${lifetimeElite.name}"`);
                  } else {
                    toast.error('⚠ Không tìm thấy gói LIFETIME ELITE');
                  }
                  
                  if (updatedCount > 0) {
                    toast.success(`🎉 Đã thêm tính năng cho ${updatedCount}/3 gói! Tổng cộng ${totalFeatures} tính năng hack Play Together.`);
                    await fetchPackages();
                    // Notify homepage to reload
                    window.dispatchEvent(new Event('packagesUpdated'));
                    localStorage.setItem('packagesUpdated', Date.now().toString());
                    if (typeof BroadcastChannel !== 'undefined') {
                      const channel = new BroadcastChannel('packages-updates');
                      channel.postMessage({ type: 'updated', timestamp: Date.now() });
                      channel.close();
                    }
                  } else {
                    toast.error('❌ Không tìm thấy gói nào. Vui lòng kiểm tra tên gói hoặc tạo gói mới.');
                  }
                } catch (error: any) {
                  console.error('[Admin Packages] Error adding features to packages:', error);
                  toast.error(error.response?.data?.message || 'Lỗi thêm tính năng vào gói');
                }
              }}
              className="btn-secondary flex items-center gap-2 bg-warning/20 hover:bg-warning/30 border-warning/50 text-warning"
              title="Thêm tất cả tính năng Play Together mới nhất (110+ tính năng) vào 3 gói: VIP 1 THÁNG, VIP PREMIUM 3 THÁNG, LIFETIME ELITE"
            >
              <Sparkles className="w-4 h-4" />
              Thêm Tính Năng Cho 3 Gói Chính (110+ tính năng)
            </button>
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    toast.error('Vui lòng đăng nhập lại');
                    return;
                  }
                  
                  if (!confirm('Bạn có chắc muốn tạo 3 gói mặc định (VIP 1 THÁNG, VIP PREMIUM 3 THÁNG, LIFETIME ELITE)? Nếu gói đã tồn tại sẽ được cập nhật.')) {
                    return;
                  }
                  
                  const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                  
                  const response = await axios.post(
                    '/api/admin/packages/seed-default',
                    {},
                    { headers: { Authorization: authToken } }
                  );
                  
                  toast.success(response.data.message || 'Đã tạo/cập nhật 3 gói mặc định thành công!');
                  await fetchPackages();
                  
                  // Notify homepage to reload
                  window.dispatchEvent(new Event('packagesUpdated'));
                  localStorage.setItem('packagesUpdated', Date.now().toString());
                  if (typeof BroadcastChannel !== 'undefined') {
                    const channel = new BroadcastChannel('packages-updates');
                    channel.postMessage({ type: 'created', timestamp: Date.now() });
                    channel.close();
                  }
                } catch (error: any) {
                  console.error('[Admin Packages] Error seeding packages:', error);
                  toast.error(error.response?.data?.message || 'Lỗi tạo gói mặc định');
                }
              }}
              className="btn-secondary flex items-center gap-2 bg-info/20 hover:bg-info/30 border-info/50 text-info"
              title="Tự động tạo 3 gói mặc định: VIP 1 THÁNG (199k), VIP PREMIUM 3 THÁNG (349k), LIFETIME ELITE (599k) với đầy đủ tính năng"
            >
              <Package className="w-4 h-4" />
              Tạo 3 Gói Mặc Định
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm Gói Mới
            </button>
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
              placeholder="Tìm kiếm gói (tên, mô tả)..."
            />
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id || pkg._id} className="gaming-card group relative">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{pkg.icon || <Package className="w-10 h-10 text-primary" />}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="w-10 h-10 rounded-lg bg-primary/20 hover:bg-primary/40 border border-primary/50 flex items-center justify-center transition shadow-lg shadow-primary/20 hover:shadow-primary/40"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-5 h-5 text-primary" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id || pkg._id, pkg.name)}
                    className="w-10 h-10 rounded-lg bg-danger/20 hover:bg-danger/40 border border-danger/50 flex items-center justify-center transition shadow-lg shadow-danger/20 hover:shadow-danger/40"
                    title="Xóa"
                  >
                    <Trash2 className="w-5 h-5 text-danger" />
                  </button>
                </div>
              </div>
              
              {/* Nút Sửa lớn ở dưới card */}
              <div className="mt-4 pt-4 border-t border-dark-border">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-2.5"
                >
                  <Edit className="w-5 h-5" />
                  Sửa Gói
                </button>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <PlatformBadge platform={pkg.platform || 'all'} size="sm" />
                {pkg.version && (
                  <span className="badge badge-info text-xs">v{pkg.version}</span>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-4 min-h-[40px]">{pkg.description || 'Không có mô tả'}</p>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-secondary">
                    {pkg.price?.toLocaleString('vi-VN') || 0}₫
                  </div>
                  <div className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {pkg.duration} ngày
                  </div>
                </div>
              </div>

              {pkg.features && pkg.features.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-2">Tính năng:</div>
                  <div className="space-y-1">
                    {pkg.features.slice(0, 3).map((feature: string, idx: number) => (
                      <div key={idx} className="text-xs text-gray-500">• {feature}</div>
                    ))}
                    {pkg.features.length > 3 && (
                      <div className="text-xs text-gray-500">+ {pkg.features.length - 3} tính năng khác</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="gaming-card text-center py-12 text-gray-400">
            Không tìm thấy gói nào
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingPackage) && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-3 sm:p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreateModal(false);
                setEditingPackage(null);
                resetForm();
              }
            }}
          >
            <div 
              className="gaming-card max-w-2xl w-full my-4 sm:my-8 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {editingPackage ? (
                    <>
                      <Edit className="w-6 h-6 text-primary" />
                      Chỉnh Sửa Gói
                    </>
                  ) : (
                    <>
                      <Plus className="w-6 h-6 text-primary" />
                      Thêm Gói Mới
                    </>
                  )}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingPackage(null);
                    resetForm();
                  }}
                  className="w-8 h-8 rounded-lg bg-dark-secondary hover:bg-dark-border flex items-center justify-center transition"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-4 pb-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-dark-secondary pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2 font-semibold">Tên gói *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="gaming-input w-full"
                      placeholder="VD: Hack Android Pro"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Giá (₫) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => {
                        const price = parseInt(e.target.value) || 0;
                        // Auto-update ban risk based on price
                        let newBanRisk: 'none' | 'low' | 'medium' | 'high' = formData.banRisk;
                        let newAntiBanGuarantee = formData.antiBanGuarantee;
                        
                        if (price >= 500000) {
                          newBanRisk = 'none';
                          newAntiBanGuarantee = true;
                        } else if (price >= 300000) {
                          newBanRisk = 'low';
                          newAntiBanGuarantee = false;
                        } else if (price >= 100000) {
                          newBanRisk = 'medium';
                          newAntiBanGuarantee = false;
                        } else if (price > 0) {
                          newBanRisk = 'high';
                          newAntiBanGuarantee = false;
                        }
                        
                        setFormData({ 
                          ...formData, 
                          price: e.target.value,
                          banRisk: newBanRisk,
                          antiBanGuarantee: newAntiBanGuarantee,
                        });
                      }}
                      className="gaming-input w-full"
                      placeholder="50000"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Platform *
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                      className="gaming-input w-full"
                      required
                    >
                      <option value="all">Tất Cả (Android, iOS, Giả Lập)</option>
                      <option value="android">Android</option>
                      <option value="ios">iOS</option>
                      <option value="emulator">Giả Lập</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                      <FileCode className="w-4 h-4" />
                      Version
                    </label>
                    <input
                      type="text"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className="gaming-input w-full"
                      placeholder="VD: 1.0.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="gaming-input w-full min-h-[100px] resize-none"
                    placeholder="Mô tả về gói hack..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Thời hạn (ngày)
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="gaming-input w-full"
                      placeholder="30"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      Logo/Icon (URL hoặc upload ảnh)
                    </label>
                    {iconPreview || formData.icon ? (
                      <div className="mb-3 relative inline-block">
                        <img
                          src={iconPreview || formData.icon}
                          alt="Icon preview"
                          className="w-20 h-20 object-contain rounded-lg border-2 border-primary/30"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, icon: '' });
                            setIconPreview('');
                          }}
                          className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 hover:bg-danger-600 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => {
                          setFormData({ ...formData, icon: e.target.value });
                          setIconPreview(e.target.value);
                        }}
                        className="gaming-input flex-1"
                        placeholder="URL ảnh hoặc emoji (🎮)"
                      />
                      <label className="btn-primary cursor-pointer inline-flex items-center gap-2 px-4 py-2">
                        <Upload className="w-4 h-4" />
                        {uploadingIcon ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('File quá lớn. Tối đa 5MB');
                              return;
                            }

                            setUploadingIcon(true);
                            try {
                              const token = localStorage.getItem('token');
                              if (!token) {
                                toast.error('Vui lòng đăng nhập lại');
                                router.push('/login');
                                setUploadingIcon(false);
                                return;
                              }

                              const uploadFormData = new FormData();
                              uploadFormData.append('file', file);
                              uploadFormData.append('type', 'package-icon');

                              const response = await axios.post('/api/admin/upload', uploadFormData, {
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                  // Don't set Content-Type - let axios set it automatically with boundary
                                },
                              });

                              if (response.data && response.data.url) {
                                setFormData({ ...formData, icon: response.data.url });
                                setIconPreview(response.data.url);
                                toast.success('Upload thành công!');
                              } else {
                                toast.error('Upload thất bại: Không nhận được URL');
                              }
                            } catch (error: any) {
                              console.error('[Upload Error]', error);
                              const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Upload thất bại';
                              toast.error(`Lỗi upload: ${errorMessage}`);
                            } finally {
                              setUploadingIcon(false);
                            }
                          }}
                          disabled={uploadingIcon}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Có thể nhập URL ảnh hoặc upload file (PNG, JPG, SVG - tối đa 5MB)</p>
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Download URL (sau khi mua)
                  </label>
                  <input
                    type="url"
                    value={formData.downloadUrl}
                    onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                    className="gaming-input w-full"
                    placeholder="https://example.com/download/hack.apk"
                  />
                  <p className="text-xs text-gray-400 mt-1">Link download sẽ hiển thị sau khi user mua gói</p>
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Yêu Cầu Hệ Thống
                  </label>
                  <textarea
                    value={formData.systemRequirements}
                    onChange={(e) => setFormData({ ...formData, systemRequirements: e.target.value })}
                    className="gaming-input w-full min-h-[80px] resize-none"
                    placeholder="VD: Android 6.0+, RAM 2GB+, Root không bắt buộc"
                  />
                </div>

                {/* GUI Quản Lý Tính Năng Chi Tiết */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-white font-semibold text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      GUI Quản Lý Tính Năng Gói
                    </label>
                    <button
                      type="button"
                      onClick={loadDefaultFeatures}
                      className="btn-secondary flex items-center gap-2 text-sm px-3 py-2"
                      title="Thêm tất cả tính năng hack Play Together mới nhất tháng 11/2025"
                    >
                      <Sparkles className="w-4 h-4" />
                      Thêm Tính Năng Mặc Định (PlayTogether 11/2025)
                    </button>
                  </div>
                  
                  {/* Tabs để chọn category */}
                  <div className="flex flex-wrap gap-2 mb-4 pb-2 border-b border-dark-border">
                    {[
                      { id: 'chung', label: 'Chung', icon: Settings },
                      { id: 'map', label: 'MAP', icon: Map },
                      { id: 'contrung', label: 'Côn Trùng', icon: Bug },
                      { id: 'cauca', label: 'Câu Cá', icon: Fish },
                      { id: 'thuthap', label: 'Thu Thập', icon: Package },
                      { id: 'sukien', label: 'Sự Kiện', icon: Gift },
                      { id: 'minigame', label: 'Mini Game', icon: Gamepad2 },
                      { id: 'caidat', label: 'Cài Đặt', icon: Settings },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const featureCount = formData.detailedFeatures[tab.id]?.length || 0;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveFeatureTab(tab.id)}
                          className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm ${
                            activeFeatureTab === tab.id
                              ? 'bg-primary text-white shadow-lg shadow-primary/50'
                              : 'bg-dark-secondary text-gray-400 hover:text-white hover:bg-dark-card'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                          {featureCount > 0 && (
                            <span className="bg-primary/30 text-white text-xs px-1.5 py-0.5 rounded-full">
                              {featureCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Form thêm tính năng mới */}
                  <div className="bg-dark-secondary rounded-lg p-4 mb-4">
                    <label className="block text-white mb-2 font-semibold">
                      Thêm tính năng vào {activeFeatureTab === 'chung' ? 'Chung' : activeFeatureTab === 'map' ? 'MAP' : activeFeatureTab === 'contrung' ? 'Côn Trùng' : activeFeatureTab === 'cauca' ? 'Câu Cá' : activeFeatureTab === 'thuthap' ? 'Thu Thập' : activeFeatureTab === 'sukien' ? 'Sự Kiện' : activeFeatureTab === 'minigame' ? 'Mini Game' : 'Cài Đặt'}
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newDetailedFeature.name}
                        onChange={(e) => setNewDetailedFeature({ ...newDetailedFeature, name: e.target.value })}
                        className="gaming-input w-full"
                        placeholder="Tên tính năng (VD: Teleport & NoClip)"
                      />
                      <input
                        type="text"
                        value={newDetailedFeature.description}
                        onChange={(e) => setNewDetailedFeature({ ...newDetailedFeature, description: e.target.value })}
                        className="gaming-input w-full"
                        placeholder="Mô tả (tùy chọn)"
                      />
                      <button
                        onClick={() => {
                          if (!newDetailedFeature.name.trim()) {
                            toast.error('Vui lòng nhập tên tính năng');
                            return;
                          }
                          const currentFeatures = formData.detailedFeatures[activeFeatureTab] || [];
                          setFormData({
                            ...formData,
                            detailedFeatures: {
                              ...formData.detailedFeatures,
                              [activeFeatureTab]: [
                                ...currentFeatures,
                                {
                                  name: newDetailedFeature.name.trim(),
                                  description: newDetailedFeature.description.trim() || undefined,
                                  enabled: true
                                }
                              ]
                            }
                          });
                          setNewDetailedFeature({ name: '', description: '' });
                          toast.success('Đã thêm tính năng');
                        }}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm Tính Năng
                      </button>
                    </div>
                  </div>

                  {/* Danh sách tính năng của tab hiện tại - Layout 2 cột */}
                  <div className="bg-dark-secondary rounded-lg p-4">
                    <label className="block text-white mb-3 font-semibold">
                      Tính năng {activeFeatureTab === 'chung' ? 'Chung' : activeFeatureTab === 'map' ? 'MAP' : activeFeatureTab === 'contrung' ? 'Côn Trùng' : activeFeatureTab === 'cauca' ? 'Câu Cá' : activeFeatureTab === 'thuthap' ? 'Thu Thập' : activeFeatureTab === 'sukien' ? 'Sự Kiện' : activeFeatureTab === 'minigame' ? 'Mini Game' : 'Cài Đặt'}
                      {formData.detailedFeatures[activeFeatureTab] && (
                        <span className="text-primary ml-2">({formData.detailedFeatures[activeFeatureTab].length})</span>
                      )}
                    </label>
                    {formData.detailedFeatures[activeFeatureTab] && formData.detailedFeatures[activeFeatureTab].length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                        {(() => {
                          const features = formData.detailedFeatures[activeFeatureTab] || [];
                          const midPoint = Math.ceil(features.length / 2);
                          const leftColumn = features.slice(0, midPoint);
                          const rightColumn = features.slice(midPoint);
                          
                          return (
                            <>
                              {/* Cột trái */}
                              <div className="space-y-2">
                                {leftColumn.map((feature: any, index: number) => (
                                  <div key={index} className="flex items-start gap-2 p-3 bg-dark-card rounded-lg border border-dark-border hover:border-primary/50 transition">
                                    <div className="w-5 h-5 rounded bg-primary/20 border-2 border-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <CheckCircle2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                                        {feature.name}
                                        {feature.description && (
                                          <span 
                                            className="text-gray-500 text-sm cursor-help hover:text-primary transition" 
                                            title={feature.description}
                                          >
                                            (?)
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const currentFeatures = formData.detailedFeatures[activeFeatureTab] || [];
                                        const updated = currentFeatures.filter((_: any, i: number) => i !== index);
                                        setFormData({
                                          ...formData,
                                          detailedFeatures: {
                                            ...formData.detailedFeatures,
                                            [activeFeatureTab]: updated
                                          }
                                        });
                                        toast.success('Đã xóa tính năng');
                                      }}
                                      className="text-danger hover:text-white transition p-1 flex-shrink-0"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Cột phải */}
                              <div className="space-y-2">
                                {rightColumn.map((feature: any, index: number) => (
                                  <div key={midPoint + index} className="flex items-start gap-2 p-3 bg-dark-card rounded-lg border border-dark-border hover:border-primary/50 transition">
                                    <div className="w-5 h-5 rounded bg-primary/20 border-2 border-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <CheckCircle2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                                        {feature.name}
                                        {feature.description && (
                                          <span 
                                            className="text-gray-500 text-sm cursor-help hover:text-primary transition" 
                                            title={feature.description}
                                          >
                                            (?)
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const currentFeatures = formData.detailedFeatures[activeFeatureTab] || [];
                                        const updated = currentFeatures.filter((_: any, i: number) => i !== (midPoint + index));
                                        setFormData({
                                          ...formData,
                                          detailedFeatures: {
                                            ...formData.detailedFeatures,
                                            [activeFeatureTab]: updated
                                          }
                                        });
                                        toast.success('Đã xóa tính năng');
                                      }}
                                      className="text-danger hover:text-white transition p-1 flex-shrink-0"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-4">
                        Chưa có tính năng nào. Thêm tính năng ở trên.
                      </div>
                    )}
                  </div>
                </div>

                {/* Tính năng đơn giản (fallback) */}
                <div>
                  <label className="block text-white mb-2 font-semibold">Tính năng đơn giản (fallback - nếu không dùng GUI trên)</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addFeature();
                        }
                      }}
                      className="gaming-input flex-1"
                      placeholder="Nhập tính năng và nhấn Enter"
                    />
                    <button
                      onClick={addFeature}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="badge badge-info flex items-center gap-2"
                      >
                        {feature}
                        <button
                          onClick={() => removeFeature(index)}
                          className="hover:text-white transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2 font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Nguy Cơ Bị Ban
                    </label>
                    <select
                      value={formData.banRisk}
                      onChange={(e) => {
                        const newBanRisk = e.target.value as 'none' | 'low' | 'medium' | 'high';
                        const price = parseInt(formData.price) || 0;
                        setFormData({ 
                          ...formData, 
                          banRisk: newBanRisk,
                          // Auto-set antiBanGuarantee based on banRisk
                          antiBanGuarantee: newBanRisk === 'none' || (newBanRisk === 'low' && price >= 300000),
                        });
                      }}
                      className="gaming-input w-full"
                    >
                      <option value="none">Không có nguy cơ (Đảm bảo 100%)</option>
                      <option value="low">Nguy cơ thấp (An toàn cao)</option>
                      <option value="medium">Nguy cơ trung bình</option>
                      <option value="high">Nguy cơ cao (Gói rẻ)</option>
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      {formData.banRisk === 'none' && '✅ Đảm bảo không ban - Gói cao cấp'}
                      {formData.banRisk === 'low' && '⚠️ Nguy cơ thấp - An toàn'}
                      {formData.banRisk === 'medium' && '⚠️⚠️ Nguy cơ trung bình - Cẩn thận'}
                      {formData.banRisk === 'high' && '❌ Nguy cơ cao - Gói rẻ có thể bị ban'}
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.antiBanGuarantee}
                        onChange={(e) => setFormData({ ...formData, antiBanGuarantee: e.target.checked })}
                        className="w-5 h-5 rounded bg-dark-card border-dark-border text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="text-white font-semibold">Đảm Bảo Không Ban</span>
                        <p className="text-xs text-gray-400">Cam kết hoàn tiền nếu bị ban</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                      className="w-5 h-5 rounded bg-dark-card border-dark-border text-primary focus:ring-primary"
                    />
                    <span className="text-white font-semibold">Gói phổ biến</span>
                  </label>
                </div>

              </div>
              
              {/* Sticky Footer with buttons */}
              <div className="flex gap-3 pt-4 mt-4 border-t border-dark-border flex-shrink-0 sticky bottom-0 bg-dark-card pb-2">
                <button
                  onClick={editingPackage ? handleUpdate : handleCreate}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingPackage ? 'Cập Nhật' : 'Tạo Gói'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingPackage(null);
                    resetForm();
                  }}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

