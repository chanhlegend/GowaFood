// src/components/Footer.jsx

import { Phone, Mail, MapPin, ChevronRight } from "lucide-react"
// Đảm bảo file tồn tại tại: src/assets/images/logo.png
import Logo from "../assets/images/logo.png"

export default function Footer() {
  return (
    <footer className="w-full bg-green-700 text-white">
      {/* viền mảnh giống ảnh */}
      <div className="border-t border-white/20" />

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-3 flex items-start">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-2xl p-2 shadow-md">
                <img
                  src={Logo}
                  alt="GOWA Food"
                  className="h-14 w-14 object-contain"
                />
              </div>
              <div className="leading-tight">
                <div className="text-2xl font-extrabold tracking-wide">GOWA</div>
                <div className="text-lg -mt-1">Food</div>
              </div>
            </div>
          </div>

          {/* Giới thiệu */}
          <div className="md:col-span-4">
            <h3 className="text-xl font-bold mb-3">Giới thiệu</h3>
            <div className="space-y-2 text-white/90">
              <p>Công Ty CP Đầu Tư Và Phát Triển Nông Trại Hữu Cơ.</p>
              <p>- Trụ sở chính: số 504 Nguyễn Tất Thành, phường 18, quận 4, Tp.Hồ Chí Minh</p>
              <p>- Kho hàng: 504 Nguyễn Tất Thành, phường 18, quận 4, Tp.Hồ Chí Minh</p>
              <p>- MST: 0316411616</p>
            </div>
          </div>

          {/* Liên kết */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-3">Liên kết</h3>
            <ul className="space-y-2">
              {[
                { label: "Tìm kiếm", href: "#" },
                { label: "Giới thiệu", href: "#" },
                { label: "Chính sách đổi trả", href: "#" },
                { label: "Chính sách bảo mật", href: "#" },
                { label: "Điều khoản dịch vụ", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-2 text-white/90 hover:text-white transition"
                  >
                    <ChevronRight className="h-4 w-4 shrink-0" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Thông tin liên hệ */}
          <div className="md:col-span-3">
            <h3 className="text-xl font-bold mb-3">Thông tin liên hệ</h3>

            <div className="space-y-3 text-white/90">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5" />
                <div>Bán lẻ 08 9932 7766 | Bán sỉ 0379 588 499</div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5" />
                <a
                  href="mailto:sale@sunigreenfarm.vn"
                  className="hover:text-white underline decoration-white/30"
                >
                  sale@sunigreenfarm.vn
                </a>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5" />
                <div>504 Nguyễn Tất Thành, phường 18, quận 4, Tp.Hồ Chí Minh.</div>
              </div>

              {/* line mảnh */}
              <div className="h-px bg-white/50 my-2" />

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {["Chanh Đào Mật Ong", "Cải Kale", "Cần Tây"].map((tag) => (
                  <a
                    key={tag}
                    href="#"
                    className="inline-flex items-center gap-2 hover:underline decoration-white/30"
                  >
                    <ChevronRight className="h-4 w-4" />
                    {tag}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* copyright */}
        <div className="mt-10">
          <div className="h-px bg-white/20 mb-4" />
          <p className="text-center text-sm text-white/80">
            Copyright © 2025 <span className="font-semibold">SUNI GREEN FARM</span> | Cửa hàng rau sạch Organic Food
          </p>
        </div>
      </div>
    </footer>
  )
}
