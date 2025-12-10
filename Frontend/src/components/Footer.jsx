// src/components/Footer.jsx

import { Phone, Mail, MapPin, ChevronRight, Facebook, Instagram } from "lucide-react"
import { FaTiktok } from "react-icons/fa"
import { Link } from "react-router-dom"
// Đảm bảo file tồn tại tại: src/assets/images/logo.png
import Logo from "../assets/images/logo.png"

export default function Footer() {
  return (
    <footer className="w-full bg-green-700 text-white">
      {/* viền mảnh giống ảnh */}
      <div className="border-t border-white/20" />

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Logo - luôn căn giữa */}
          <div className="md:col-span-3 flex justify-center">
            <div className="flex items-center">
              <div className="bg-white rounded-full p-2 shadow-md">
                <img
                  src={Logo}
                  alt="GOWA Food"
                  className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Giới thiệu */}
          <div className="md:col-span-4">
            <h3 className="text-xl font-bold mb-3">THÔNG TIN CÔNG TY</h3>
            <div className="space-y-2 text-white/90 text-sm">
              <p>Công ty TNHH Thực phẩm sạch GOWA</p>
              <p>Địa chỉ: Số 4 Núi Thành, phường Tân Bình, thành phố Hồ Chí Minh</p>
              <p>Mã số thuế: 0319065837</p>
            </div>
          </div>

          {/* Liên kết */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-3">Liên kết</h3>
            <ul className="space-y-2">
              {[
                { label: "Về Gowa", href: "/aboutus" },
                { label: "Tầm nhìn & Sứ mệnh", href: "/aboutus" },
                { label: "Chính sách giao hàng", href: "/aboutus" },
                { label: "Chính sách đổi trả và hoàn tiền", href: "/aboutus" },
                { label: "Chương trình thành viên", href: "/aboutus" },
                { label: " Hướng dẫn mua hàng", href: "/guideline" },
              ].map((item) => (
                <li key={item.label}>
                  {item.href.startsWith("/") ? (
                    <Link
                      to={item.href}
                      className="inline-flex items-center gap-2 text-white/90 hover:text-white transition text-sm"
                    >
                      <ChevronRight className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className="inline-flex items-center gap-2 text-white/90 hover:text-white transition text-sm"
                    >
                      <ChevronRight className="h-4 w-4 shrink-0" />
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Thông tin liên hệ */}
          <div className="md:col-span-3">
            <h3 className="text-xl font-bold mb-3">Thông tin liên hệ</h3>

            <div className="space-y-3 text-white/90 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5" />
                <div>0996455555</div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5" />
                <a
                  href="mailto:gowafoodvn@gmail.com"
                  className="hover:text-white underline decoration-white/30"
                >
                  gowafoodvn@gmail.com
                </a>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5" />
                <div>4 Núi Thành, phường Tân Bình, Thành Phố Hồ Chí Minh</div>
              </div>

              {/* line mảnh */}
              <div className="h-px bg-white/50 my-2" />

              <div className="flex items-center gap-4">
                <a
                  href="https://www.facebook.com/gowacleanfood"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a
                  href="https://www.tiktok.com/@gowa.food"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="TikTok"
                >
                  <FaTiktok className="h-6 w-6" />
                </a>
                <a
                  href="https://www.instagram.com/gowafoodvn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* copyright */}
        <div className="mt-10">
          <div className="h-px bg-white/20 mb-4" />
          <p className="text-center text-sm text-white/80">
            Copyright © 2025 <span className="font-semibold">GOWA FOOD</span> | Cửa hàng rau sạch Gowa Food
          </p>
        </div>
      </div>
    </footer>

  )
}
