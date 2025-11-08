import {
  Target,
  Heart,
  Truck,
  Shield,
  Gift,
  Star,
  MapPin,
  Clock,
  BadgeCheck,
  Sprout,
} from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section
        className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: `url('/public/cover_gowa.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
  <div className="absolute inset-0 bg-gradient-to-r from-green-700/40 to-green-600/30 z-0"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center h-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center drop-shadow-lg">
            Về GOWA
          </h1>
          <p className="text-xl md:text-2xl font-light italic mb-4 text-center drop-shadow">
            "Từ một hạt giống lành – đến một hành trình sống xanh."
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Trong một thế giới mà tốc độ đôi khi đánh đổi cả sự an toàn,
                  GOWA chọn bắt đầu chậm rãi, bằng cách cúi mình xuống đất, lắng
                  nghe từng nhịp thở của tự nhiên và khởi sự từ điều căn bản
                  nhất: <strong>một bữa ăn sạch</strong>.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Chúng tôi là những người trẻ – <strong>thế hệ Gen Z</strong> –
                  không chọn rời bỏ đất đai, mà quay về với nông nghiệp bằng tất
                  cả sự thấu cảm và tư duy mới mẻ. Không làm nông để lãng mạn
                  hóa cái nghèo, cũng không dùng "organic" như một lớp vỏ thương
                  mại. Chúng tôi làm nông vì tin rằng:{" "}
                  <em>
                    sự minh bạch, tử tế và tự chủ trong thực phẩm chính là nền
                    tảng của một xã hội lành mạnh
                  </em>
                  .
                </p>
                <div className="bg-green-50 border-l-4 border-green-600 p-6 my-8 rounded-r-lg">
                  <p className="text-green-900 font-semibold text-xl italic">
                    "Sạch không chỉ là điều kiện – mà phải là một lời cam kết."
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Và lời cam kết đó được chúng tôi gìn giữ qua từng khâu nhỏ
                  nhất: từ giống rau trồng trên cao nguyên Đà Lạt, quy trình hữu
                  cơ không hóa chất, đến từng chuyến xe vận chuyển lạnh do chính
                  đội ngũ nội bộ vận hành, từng bó rau được giao tận tay người
                  tiêu dùng bằng đôi tay sạch và lòng tận tâm.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Chúng tôi xây dựng GOWA như một hệ sinh thái – nơi mọi mắt
                  xích từ nông trại đến bàn ăn đều nằm trong vòng kiểm soát nội
                  bộ. Chúng tôi không muốn GOWA chỉ là cái tên trong danh sách
                  startup nông nghiệp, mà là một hành trình truyền cảm hứng –
                  để sống chậm lại, ăn lành mạnh hơn, và tin rằng một bó rau nhỏ
                  cũng có thể thay đổi một lối sống.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-green-800 mb-12">
            Tầm nhìn & Sứ mệnh
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Vision */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-3 rounded-full">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800">Tầm nhìn</h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Trở thành thương hiệu dẫn đầu trong lĩnh vực nông nghiệp sạch và
                chuỗi cung ứng thực phẩm an toàn tại Việt Nam, đóng vai trò tiên
                phong trong việc xây dựng hệ sinh thái tiêu dùng bền vững và
                minh bạch.
              </p>
              <p className="text-gray-600 text-sm">
                Đến năm 2030, GOWA đặt mục tiêu mở rộng hệ thống phân phối trực
                tuyến và ngoại tuyến tại các thành phố lớn như Hà Nội, Đà Nẵng,
                và Cần Thơ, đồng thời phát triển hệ thống truy xuất nguồn gốc
                bằng công nghệ QR Blockchain.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-3 rounded-full">
                  <Heart className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800">Sứ mệnh</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Người tiêu dùng:</strong> Cung cấp nguồn thực phẩm
                    tươi sạch, truy xuất nguồn gốc rõ ràng
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Nông dân:</strong> Tạo cơ hội hợp tác công bằng,
                    nâng cao thu nhập
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Cộng đồng:</strong> Lan tỏa lối sống lành mạnh, thúc
                    đẩy kinh tế xanh
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Doanh nghiệp:</strong> Xây dựng mô hình kinh doanh
                    minh bạch, chất lượng làm nền tảng
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Policies Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-green-800 mb-12">
            Chính sách & Dịch vụ
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Delivery Policy */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-4 text-center">
                Chính sách giao hàng
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <p>
                    Phục vụ tại Tân Bình, Tân Phú, Gò Vấp và các quận lân cận
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                  <p>Giờ hoạt động: 9:00 - 18:30</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-semibold text-green-800">
                    Miễn phí ship từ 499.000đ
                  </p>
                  <p className="text-xs mt-1">
                    Phí giao hàng: 15.000 - 30.000đ
                  </p>
                </div>
                <p className="text-xs italic">
                  Chuỗi lạnh chuẩn 2-8°C, đảm bảo rau tươi ngon
                </p>
              </div>
            </div>

            {/* Return Policy */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-4 text-center">
                Chính sách đổi trả
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-semibold text-green-800">
                    Trong vòng 12 giờ
                  </p>
                  <p className="text-xs mt-1">Kể từ khi nhận hàng</p>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Sản phẩm bị dập, hư hỏng, héo úa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BadgeCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Không đúng loại hoặc số lượng</span>
                  </li>
                </ul>
                <div className="border-t pt-3">
                  <p className="font-semibold text-green-800">Hỗ trợ:</p>
                  <p className="text-xs mt-1">
                    Đổi mới trong 24h hoặc hoàn tiền 100%
                  </p>
                </div>
              </div>
            </div>

            {/* Membership Program */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Gift className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-4 text-center">
                Chương trình GOLOVE
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p className="text-center italic">
                  Tri ân khách hàng thân thiết
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Tích điểm 5% mỗi đơn hàng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Ưu đãi đặc biệt ngày lễ, sinh nhật</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>Tham quan nông trại Đà Lạt</span>
                  </li>
                </ul>
                <div className="border-t pt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">GOWA Basic</span>
                    <span className="text-gray-500">&lt;5tr</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-green-600">
                      GOWA Green
                    </span>
                    <span className="text-gray-500">5-15tr (+7%)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-green-700">
                      GOWA Premium
                    </span>
                    <span className="text-gray-500">&gt;15tr (+10%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Không khẩu hiệu hoa mỹ, không hứa hẹn vượt tầm
            </h2>
            <p className="text-xl mb-8 opacity-90">
              GOWA chỉ có một định hướng:{" "}
              <strong>làm thật – sống thật – và chạm vào niềm tin bằng sản phẩm tử tế</strong>
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-white text-green-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-50 transition-all hover:scale-105 shadow-lg"
            >
              Khám phá sản phẩm
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
