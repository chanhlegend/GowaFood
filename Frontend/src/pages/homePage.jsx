// src/pages/HomePage.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ProductService } from "../services/productService";

import banner1 from "../assets/images/banner_img_1.png";
import banner2 from "../assets/images/banner_img_2.png";
import banner3 from "../assets/images/banner_img_3.png";
import slideshow1 from "../assets/images/slideshow_1.jpg";
import slideshow2 from "../assets/images/slideshow_2.jpg";

const slides = [
  {
    id: 1,
    title: "SUNI GREEN FARM",
    headline: "THAM GIA MEMBERSHIP",
    bullets: [
      "Giá thành viên ưu đãi lên đến 50%",
      "Freeship tận nơi",
      "Nông sản tươi trực tiếp từ farm",
    ],
    cta: "Nhận Ưu Đãi",
    bg: slideshow1,
  },
  {
    id: 2,
    title: "ƯU ĐÃI ĐẶC BIỆT",
    headline: "NÔNG SẢN SẠCH CHO MỌI NHÀ",
    bullets: [
      "Combo rau củ theo tuần",
      "Đảm bảo VietGAP",
      "Tươi ngon mỗi ngày",
    ],
    cta: "Khám phá ngay",
    bg: slideshow2,
  },
  {
    id: 3,
    title: "FARM TO TABLE",
    headline: "GIÁ TỐT - CHẤT LƯỢNG CAO",
    bullets: [
      "Thu hoạch sáng – giao trong ngày",
      "Đổi trả trong 24h",
      "An toàn cho sức khỏe",
    ],
    cta: "Mua Ngay",
    bg: slideshow1,
  },
];

const CATE_DESCRIPTIONS = {
  default: "Rau sạch được làm mới hằng ngày, không bảo quản qua đêm",
};

const currencyVN = (n) =>
  typeof n === "number" ? new Intl.NumberFormat("vi-VN").format(n) + "đ" : n;

// Component slide
function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    start();
    return stop;
  }, [index]);

  const start = () => {
    stop();
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
  };
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
  };

  return (
    <div
      onMouseEnter={stop}
      onMouseLeave={start}
      className="relative w-full h-[340px] md:h-[420px] rounded-2xl overflow-hidden mb-10"
    >
      <div
        className="flex h-full transition-transform duration-500"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s) => (
          <div
            key={s.id}
            className="w-full flex-shrink-0 h-full bg-white flex items-center px-6 md:px-12"
          >
            <div className="flex-1">
              <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold">
                {s.title}
              </span>
              <h2 className="mt-3 text-3xl md:text-5xl font-bold text-slate-800">
                {s.headline}
              </h2>
              <ul className="mt-3 text-slate-700 list-disc list-inside space-y-1 text-sm md:text-base">
                {s.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <button className="mt-5 px-6 py-3 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-900 font-semibold transition">
                {s.cta}
              </button>
            </div>
            <div className="hidden md:block flex-1 h-full">
              <img
                src={s.bg}
                alt={s.headline}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Nút prev/next */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2.5 w-2.5 rounded-full ${
              i === index ? "bg-slate-800" : "bg-slate-400/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await ProductService.getAllProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Không thể tải sản phẩm", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const groups = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const cat = p?.category || {};
      const id = cat?._id || cat?.id || cat || "others";
      const name = (cat?.name || "Khác").toUpperCase();

      if (!map.has(id)) {
        map.set(id, {
          id,
          name,
          desc:
            (cat?.description && String(cat.description).trim()) ||
            CATE_DESCRIPTIONS[name] ||
            CATE_DESCRIPTIONS.default,
          items: [],
        });
      }
      map.get(id).items.push(p);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "vi")
    );
  }, [products]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center text-slate-600">
        Đang tải sản phẩm…
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center text-slate-600">
        Chưa có sản phẩm nào.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Slide */}
      <HeroCarousel />

      {/* Section theo Category */}
      {groups.map((g) => (
        <section key={g.id} className="mt-7 mb-10">
          <div className="flex items-center justify-between rounded-xl bg-green-700 px-5 py-4">
            <div>
              <h2 className="text-white font-bold tracking-wide text-base sm:text-lg">
                {g.name}
              </h2>
              <p className="text-green-100 text-xs sm:text-sm mt-1">{g.desc}</p>
            </div>
            <Link
              to={`/category/${g.id}`}
              className="text-green-50/90 hover:text-white font-semibold text-sm inline-flex items-center gap-1"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {g.items.slice(0, 8).map((p) => {
              const img = (Array.isArray(p.images) && p.images[0]?.url) || "";
              return (
                <Link
                  key={p._id || p.id}
                  to={`/product/${p._id || p.id}`}
                  className="group"
                >
                  <div className="rounded-2xl bg-white border border-green-100 shadow-sm hover:shadow-lg transition-all duration-150 hover:-translate-y-0.5">
                    <div className="aspect-square w-full bg-green-50 border-b border-green-100 flex items-center justify-center overflow-hidden rounded-t-2xl">
                      {img ? (
                        <img
                          src={img}
                          alt={p.name}
                          className="max-h-[78%] max-w-[90%] object-contain"
                        />
                      ) : (
                        <div className="text-slate-400 text-sm">
                          (Không có ảnh)
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="text-slate-800 font-semibold text-sm sm:text-base line-clamp-2">
                        {p.name}
                      </div>
                      <div className="mt-1 text-green-700 font-bold text-sm">
                        {currencyVN(p.price)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      <div class="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {" "}
        <div class="border border-green-500 rounded-lg p-6 text-center flex flex-col items-center">
          {" "}
          <div class="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center -mt-12 bg-white">
            {" "}
            <img
              src={banner1}
              alt="Banner 1"
              class="w-8 h-8 text-green-600"
            />{" "}
          </div>{" "}
          <h3 class="mt-6 text-green-700 font-semibold text-lg">
            {" "}
            Nguồn giống tiêu chuẩn{" "}
          </h3>{" "}
          <p class="mt-2 text-slate-600 text-sm leading-relaxed">
            {" "}
            Nguồn giống khỏe giúp cây trồng đạt năng suất và chất lượng tốt.
            Giống mới lạ đem đến trải nghiệm mới cho thực khách{" "}
          </p>{" "}
        </div>{" "}
        <div class="border border-green-500 rounded-lg p-6 text-center flex flex-col items-center">
          {" "}
          <div class="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center -mt-12 bg-white">
            {" "}
            <img
              src={banner2}
              alt="Banner 2"
              class="w-8 h-8 text-green-600"
            />{" "}
          </div>{" "}
          <h3 class="mt-6 text-green-700 font-semibold text-lg">
            {" "}
            Tiêu chuẩn chất lượng{" "}
          </h3>{" "}
          <p class="mt-2 text-slate-600 text-sm leading-relaxed">
            {" "}
            Các vườn nông sản của Suni được ứng dụng nuôi trồng theo các tiêu
            chí an toàn hữu cơ tối thiểu theo chứng nhận của VietGap, GlobalGap
            & Organic USDA{" "}
          </p>{" "}
        </div>{" "}
        <div class="border border-green-500 rounded-lg p-6 text-center flex flex-col items-center">
          {" "}
          <div class="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center -mt-12 bg-white">
            {" "}
            <img
              src={banner3}
              alt="Banner 3"
              class="w-8 h-8 text-green-600"
            />{" "}
          </div>{" "}
          <h3 class="mt-6 text-green-700 font-semibold text-lg">
            {" "}
            Sản phẩm dinh dưỡng{" "}
          </h3>{" "}
          <p class="mt-2 text-slate-600 text-sm leading-relaxed">
            {" "}
            Nông sản an toàn được đánh giá không chỉ an toàn và ngon mà còn có
            nhiều giá trị dinh dưỡng thiết thực{" "}
          </p>{" "}
        </div>{" "}
      </div>
    </div>
  );
}
