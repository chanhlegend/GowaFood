import { useEffect, useState, useRef } from "react";
import coverGowa from "../../public/cover_gowa.jpg";
import certificate from "../../public/certificate.jpg";
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
} from "lucide-react";

// Custom hook for scroll animation (Intersection Observer)
function useScrollAnimation(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, ...options }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible];
}

// Animated Section Component
function AnimatedSection({ children, className = "", delay = 0 }) {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Animated Card Component with stagger
function AnimatedCard({ children, className = "", index = 0 }) {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-500 ease-out ${isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-8 scale-95'
        }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {children}
    </div>
  );
}

// Floating background shapes component
function FloatingShapes() {
  return (
    <>
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-200/20 rounded-full blur-3xl animate-float" />
      <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-lime-200/30 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute right-1/4 top-1/3 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.8s' }} />
    </>
  );
}

export default function AboutUsPage() {
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    // Trigger hero animation after mount
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center text-white overflow-hidden">
        <img
          src={coverGowa}
          alt="Gowa Cover"
          className={`absolute inset-0 w-full h-full object-cover z-0 transition-all duration-1000 ${heroLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
            }`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-700/40 to-green-600/30 z-10"></div>

        {/* Animated floating particles */}
        <div className="absolute inset-0 z-10 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-20 flex flex-col items-center justify-center h-full">
          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center drop-shadow-lg transition-all duration-1000 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <span className="inline-block animate-bounce-in" style={{ animationDelay: '0.3s' }}>Về</span>{' '}
            <span className="inline-block animate-bounce-in bg-gradient-to-r from-lime-300 to-green-300 bg-clip-text text-transparent" style={{ animationDelay: '0.5s' }}>GOWA</span>
          </h1>
          <p
            className={`text-xl md:text-2xl font-light italic mb-4 text-center drop-shadow transition-all duration-1000 delay-300 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            "Từ một hạt giống lành – đến một hành trình sống xanh."
          </p>

          {/* Scroll indicator */}
          <div
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-700 ${heroLoaded ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-1">
              <div className="w-1.5 h-3 bg-white/70 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24 relative">
        <FloatingShapes />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="p-8 md:p-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    Trong một thế giới mà tốc độ đôi khi đánh đổi cả sự an toàn,
                    GOWA chọn bắt đầu chậm rãi, bằng cách cúi mình xuống đất, lắng
                    nghe từng nhịp thở của tự nhiên và khởi sự từ điều căn bản
                    nhất: <strong className="text-green-700">một bữa ăn sạch</strong>.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Chúng tôi là những người trẻ – <strong className="text-green-700">thế hệ Gen Z</strong> –
                    không chọn rời bỏ đất đai, mà quay về với nông nghiệp bằng tất
                    cả sự thấu cảm và tư duy mới mẻ. Không làm nông để lãng mạn
                    hóa cái nghèo, cũng không dùng "organic" như một lớp vỏ thương
                    mại. Chúng tôi làm nông vì tin rằng:{" "}
                    <em className="text-green-600">
                      sự minh bạch, tử tế và tự chủ trong thực phẩm chính là nền
                      tảng của một xã hội lành mạnh
                    </em>
                    .
                  </p>

                  {/* Quote with special animation */}
                  <AnimatedSection delay={200}>
                    <div className="animated-header bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-l-4 border-green-600 p-6 my-8 rounded-r-xl shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 shimmer-bg opacity-50" />
                      <p className="text-green-900 font-semibold text-xl italic relative z-10">
                        "Sạch không chỉ là điều kiện – mà phải là một lời cam kết."
                      </p>
                    </div>
                  </AnimatedSection>

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
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 relative">
        <FloatingShapes />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-green-800 mb-12 flex items-center justify-center gap-3">
              <span className="w-12 h-1 bg-gradient-to-r from-transparent to-green-500 rounded-full" />
              Tầm nhìn & Sứ mệnh
              <span className="w-12 h-1 bg-gradient-to-l from-transparent to-green-500 rounded-full" />
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Vision */}
            <AnimatedCard index={0} className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-green-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-full group-hover:scale-110 transition-transform duration-500 shadow-lg">
                      <Target className="w-8 h-8 text-green-600 group-hover:rotate-12 transition-transform duration-500" />
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
              </div>
            </AnimatedCard>

            {/* Mission */}
            <AnimatedCard index={1} className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-green-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-full group-hover:scale-110 transition-transform duration-500 shadow-lg">
                      <Heart className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-800">Sứ mệnh</h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      { title: 'Người tiêu dùng:', desc: 'Cung cấp nguồn thực phẩm tươi sạch, truy xuất nguồn gốc rõ ràng' },
                      { title: 'Nông dân:', desc: 'Tạo cơ hội hợp tác công bằng, nâng cao thu nhập' },
                      { title: 'Cộng đồng:', desc: 'Lan tỏa lối sống lành mạnh, thúc đẩy kinh tế xanh' },
                      { title: 'Doanh nghiệp:', desc: 'Xây dựng mô hình kinh doanh minh bạch, chất lượng làm nền tảng' },
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 group/item hover:translate-x-1 transition-transform duration-300"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <BadgeCheck className="w-5 h-5 text-green-600 mt-1 flex-shrink-0 group-hover/item:scale-125 transition-transform duration-300" />
                        <p className="text-gray-700">
                          <strong className="text-green-700">{item.title}</strong> {item.desc}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Policies Section */}
      <section className="py-16 relative">
        <FloatingShapes />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-green-800 mb-12 flex items-center justify-center gap-3">
              <span className="w-12 h-1 bg-gradient-to-r from-transparent to-green-500 rounded-full" />
              Chính sách & Dịch vụ
              <span className="w-12 h-1 bg-gradient-to-l from-transparent to-green-500 rounded-full" />
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Delivery Policy */}
            <AnimatedCard index={0}>
              <div className="usp-card bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-green-100 h-full group">
                <div className="usp-icon bg-gradient-to-br from-green-100 to-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:shadow-xl transition-all duration-500">
                  <Truck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-4 text-center">
                  Chính sách giao hàng
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2 hover:translate-x-1 transition-transform duration-300">
                    <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <p>
                      Phục vụ tại Tân Bình, Tân Phú, Gò Vấp và các quận lân cận
                    </p>
                  </div>
                  <div className="flex items-start gap-2 hover:translate-x-1 transition-transform duration-300">
                    <Clock className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <p>Giờ hoạt động: 9:00 - 18:30</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg shadow-inner">
                    <p className="font-semibold text-green-800">
                      Miễn phí ship từ 499.000đ
                    </p>
                    <p className="text-xs mt-1">
                      Phí giao hàng: 15.000 - 30.000đ
                    </p>
                  </div>
                  <p className="text-xs italic text-green-700">
                    Chuỗi lạnh chuẩn 2-8°C, đảm bảo rau tươi ngon
                  </p>
                </div>
              </div>
            </AnimatedCard>

            {/* Return Policy */}
            <AnimatedCard index={1}>
              <div className="usp-card bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-green-100 h-full group">
                <div className="usp-icon bg-gradient-to-br from-green-100 to-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:shadow-xl transition-all duration-500">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-4 text-center">
                  Chính sách đổi trả
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg shadow-inner">
                    <p className="font-semibold text-green-800">
                      Trong vòng 12 giờ
                    </p>
                    <p className="text-xs mt-1">Kể từ khi nhận hàng</p>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 hover:translate-x-1 transition-transform duration-300">
                      <BadgeCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Sản phẩm bị dập, hư hỏng, héo úa</span>
                    </li>
                    <li className="flex items-start gap-2 hover:translate-x-1 transition-transform duration-300">
                      <BadgeCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Không đúng loại hoặc số lượng</span>
                    </li>
                  </ul>
                  <div className="border-t border-green-100 pt-3">
                    <p className="font-semibold text-green-800">Hỗ trợ:</p>
                    <p className="text-xs mt-1">
                      Đổi mới trong 24h hoặc hoàn tiền 100%
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Membership Program */}
            <AnimatedCard index={2}>
              <div className="usp-card bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-green-100 h-full group">
                <div className="usp-icon bg-gradient-to-br from-green-100 to-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:shadow-xl transition-all duration-500">
                  <Gift className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-4 text-center">
                  Chương trình GOLOVE
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p className="text-center italic text-green-600">
                    Tri ân khách hàng thân thiết
                  </p>
                  <ul className="space-y-2">
                    {[
                      'Tích điểm 5% mỗi đơn hàng',
                      'Ưu đãi đặc biệt ngày lễ, sinh nhật',
                      'Tham quan nông trại Đà Lạt'
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-2 hover:translate-x-1 transition-transform duration-300">
                        <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-green-100 pt-3 space-y-1">
                    {[
                      { name: 'GOWA Basic', range: '<5tr', color: 'text-gray-700' },
                      { name: 'GOWA Green', range: '5-15tr (+7%)', color: 'text-green-600' },
                      { name: 'GOWA Premium', range: '>15tr (+10%)', color: 'text-green-700' },
                    ].map((tier, i) => (
                      <div key={i} className="flex justify-between text-xs hover:bg-green-50 p-1 rounded transition-colors duration-300">
                        <span className={`font-semibold ${tier.color}`}>
                          {tier.name}
                        </span>
                        <span className="text-gray-500">{tier.range}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Certificate Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        <FloatingShapes />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="text-3xl md:text-4xl font-bold text-center text-green-800 mb-6 flex items-center justify-center gap-3">
                <span className="w-12 h-1 bg-gradient-to-r from-transparent to-green-500 rounded-full" />
                Chứng nhận & Cam kết Chất lượng
                <span className="w-12 h-1 bg-gradient-to-l from-transparent to-green-500 rounded-full" />
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                GOWA tự hào với các chứng nhận về an toàn thực phẩm và quy trình
                sản xuất theo tiêu chuẩn quốc tế, đảm bảo mang đến sản phẩm tốt nhất
                cho người tiêu dùng.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-3xl shadow-2xl overflow-hidden group">
                <div className="p-8 md:p-12 relative">
                  <div className="absolute inset-0 shimmer-bg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                  <img
                    src={certificate}
                    alt="GOWA Certificate"
                    className="w-full h-auto rounded-2xl shadow-lg group-hover:scale-[1.02] transition-transform duration-500 relative z-10"
                  />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Không khẩu hiệu hoa mỹ, không hứa hẹn vượt tầm
              </h2>
              <p className="text-xl mb-8 opacity-90">
                GOWA chỉ có một định hướng:{" "}
                <strong className="text-lime-300">làm thật – sống thật – và chạm vào niềm tin bằng sản phẩm tử tế</strong>
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="cta-pulse bg-white text-green-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-50 transition-all duration-500 hover:scale-110 shadow-lg hover:shadow-2xl animate-pulse-glow relative overflow-hidden"
              >
                <span className="relative z-10">Khám phá sản phẩm</span>
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
