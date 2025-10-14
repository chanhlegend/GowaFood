// src/pages/HomePage.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ProductService } from "../services/productService";

import banner1 from "../assets/images/banner_img_1.png";
import banner2 from "../assets/images/banner_img_2.png";
import banner3 from "../assets/images/banner_img_3.png";
import slideshow1 from "../assets/images/slideshow_1.jpg";
import slideshow2 from "../assets/images/slideshow_2.jpg";

import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

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

function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const start = () => {
    stop();
    timer.current = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5000
    );
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
        className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2
             bg-custom-green/60 rounded-full shadow w-10 h-10
             hover:bg-custom-green/70 transition
             border border-slate-200 text-white
             flex items-center justify-center"
        aria-label="Trước"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>

      <button
        onClick={next}
        className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2
             bg-custom-green/60 rounded-full shadow w-10 h-10
             hover:bg-custom-green/70 transition
             border border-slate-200 text-white
             flex items-center justify-center"
        aria-label="Sau"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Chuyển tới slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full ${i === index ? "bg-slate-800" : "bg-slate-400/70"
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


  // \u2192 THÊM TÌM KIẾM THEO TÊN
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const userId = JSON.parse(localStorage.getItem("user_gowa"))?._id;
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
    (async () => {
      try {
        const data = await ProductService.getRecentProducts(userId);
        setRecentProducts(data || []);
      } catch (e) {
        console.error("Không thể tải sản phẩm đã mua", e);
      } finally {
        setLoadingRecent(false);
      }
    })();

    // Lấy sản phẩm đề xuất
    (async () => {
      try {
        const data = await ProductService.getRecommendedProducts(userId);
        setRecommendedProducts(data || []);
      } catch (e) {
        console.error("Không thể tải sản phẩm đề xuất", e);
      } finally {
        setLoadingRecommended(false);
      }
    })();
  }, []);

  // Gom nhóm theo category
  const rawGroups = useMemo(() => {
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

  // Áp dụng bộ lọc theo tên (không động tới dữ liệu gốc)
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rawGroups;
    return rawGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((p) => p?.name?.toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [rawGroups, query]);

  // Các trạng thái hiển thị
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

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Slide */}
      <HeroCarousel />

      {/* Thanh tìm kiếm toàn trang */}
      <section className="top-3 z-20 mb-8">
        <div className="backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/95 rounded-2xl border border-slate-200 shadow-lg ring-1 ring-slate-900/5 p-4">
          <div className="flex items-center gap-3">
            <div className="relative w-full">
              <label htmlFor="global-search" className="sr-only">
                Tìm kiếm theo tên
              </label>
              <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-search text-slate-400"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </span>
              <input
                id="global-search"
                ref={inputRef}
                type="text"
                placeholder="Tìm kiếm sản phẩm theo tên…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-10 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearQuery}
                  className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-lg px-2 text-slate-400 hover:text-slate-600"
                  aria-label="Xóa tìm kiếm"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-x"
                  >
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          {query && (
            <p className="mt-2 text-xs text-slate-500">
              Đang lọc theo:{" "}
              <span className="font-medium text-slate-700">“{query}”</span>
            </p>
          )}
        </div>
      </section>
      {/* Section: Sản phẩm đã mua */}
      {!loadingRecent && recentProducts.length > 0 && (
        <section className="mt-7 mb-10">
          <div className="flex items-center justify-between rounded-xl bg-custom-green px-5 py-4">
            <div>
              <h2 className="text-white font-bold tracking-wide text-base sm:text-lg">
                Sản phẩm đã mua
              </h2>
              <p className="text-green-100 text-xs sm:text-sm mt-1">
                Các sản phẩm bạn đã mua gần đây.
              </p>
            </div>
      
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-5">
            {recentProducts.slice(0, 10).map((p) => {
              const img = (Array.isArray(p.images) && p.images[0]?.url) || "";
              return (
                <Link
                  key={p._id || p.id}
                  to={`/product/:id`.replace(":id", p._id || p.id)}
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
                        <div className="text-slate-400 text-sm">(Không có ảnh)</div>
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
      )}

      {/* Section: Sản phẩm đề xuất */}
      {!loadingRecommended && recommendedProducts.length > 0 && (
        <section className="mt-7 mb-10">
          <div className="flex items-center justify-between rounded-xl bg-custom-green px-5 py-4">
            <div>
              <h2 className="text-white font-bold tracking-wide text-base sm:text-lg">
                Sản phẩm đề xuất
              </h2>
              <p className="text-green-100 text-xs sm:text-sm mt-1">
                Các sản phẩm được đề xuất dành cho bạn.
              </p>
            </div>
   
    
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-5">
            {recommendedProducts.slice(0, 10).map((p) => {
              const img = (Array.isArray(p.images) && p.images[0]?.url) || "";
              return (
                <Link
                  key={p._id || p.id}
                  to={`/product/:id`.replace(":id", p._id || p.id)}
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
                        <div className="text-slate-400 text-sm">(Không có ảnh)</div>
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
      )}

      {/* Section theo Category */}
      {groups.length === 0 ? (
        <div className="mx-auto max-w-md text-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <span className="text-2xl" role="img" aria-label="Tìm kiếm">
              🔎
            </span>
          </div>
          <p className="text-slate-700 font-medium">
            Không tìm thấy sản phẩm khớp từ khoá
          </p>
          <p className="mt-1 text-slate-500 text-sm">
            Hãy thử từ khoá khác hoặc xoá tìm kiếm để xem tất cả sản phẩm.
          </p>
          <button
            type="button"
            onClick={clearQuery}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm hover:shadow ring-1 ring-slate-900/5 transition"
          >
            Xoá bộ lọc
          </button>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.id} className="mt-7 mb-10">
            <div className="flex items-center justify-between rounded-xl bg-custom-green px-5 py-4">
              <div>
                <h2 className="text-white font-bold tracking-wide text-base sm:text-lg">
                  {g.name}
                </h2>
                <p className="text-green-100 text-xs sm:text-sm mt-1">
                  {g.desc}
                </p>
              </div>
              <Link
                to={`/food-by-category/${g.id}`}
                className="text-green-50/90 hover:text-white font-semibold text-sm inline-flex items-center gap-1"
              >
                Xem tất cả →
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-5">
              {g.items.slice(0, 10).map((p) => {
                const img = (Array.isArray(p.images) && p.images[0]?.url) || "";
                return (
                  <Link
                    key={p._id || p.id}
                    to={`/product/:id`.replace(":id", p._id || p.id)}
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
        ))
      )}

      {/* 3 USP cards */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-green-500 rounded-lg p-6 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center -mt-12 bg-white">
            <img src={banner1} alt="Banner 1" className="w-8 h-8" />
          </div>
          <h3 className="mt-6 text-green-700 font-semibold text-lg">
            Nguồn giống tiêu chuẩn
          </h3>
          <p className="mt-2 text-slate-600 text-sm leading-relaxed">
            Nguồn giống khỏe giúp cây trồng đạt năng suất và chất lượng tốt.
            Giống mới lạ đem đến trải nghiệm mới cho thực khách
          </p>
        </div>
        <div className="border border-green-500 rounded-lg p-6 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center -mt-12 bg-white">
            <img src={banner2} alt="Banner 2" className="w-8 h-8" />
          </div>
          <h3 className="mt-6 text-green-700 font-semibold text-lg">
            Tiêu chuẩn chất lượng
          </h3>
          <p className="mt-2 text-slate-600 text-sm leading-relaxed">
            Các vườn nông sản của Suni được ứng dụng nuôi trồng theo các tiêu
            chí an toàn hữu cơ tối thiểu theo chứng nhận của VietGap, GlobalGap
            & Organic USDA
          </p>
        </div>
        <div className="border border-green-500 rounded-lg p-6 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center -mt-12 bg-white">
            <img src={banner3} alt="Banner 3" className="w-8 h-8" />
          </div>
          <h3 className="mt-6 text-green-700 font-semibold text-lg">
            Sản phẩm dinh dưỡng
          </h3>
          <p className="mt-2 text-slate-600 text-sm leading-relaxed">
            Nông sản an toàn được đánh giá không chỉ an toàn và ngon mà còn có
            nhiều giá trị dinh dưỡng thiết thực
          </p>
        </div>
      </div>
    </div>
  );
}
