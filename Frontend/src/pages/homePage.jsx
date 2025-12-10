// src/pages/HomePage.jsx
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ProductService } from "../services/productService";

import banner1 from "../assets/images/banner_img_1.png";
import banner2 from "../assets/images/banner_img_2.png";
import banner3 from "../assets/images/banner_img_3.png";
import slideshow1 from "../assets/images/slideshow_1.png";
import slideshow2 from "../assets/images/slideshow_2.png";

import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

const slides = [
  {
    id: 1,
    title: "GOWA FARM",
    headline: "THAM GIA MEMBERSHIP",
    bullets: [
      "Giá thành viên ưu đãi lên đến 50%",
      "Freeship tận nơi",
      "Nông sản tươi trực tiếp từ farm",
    ],
    bg: slideshow1,
  },
  {
    id: 2,
    title: "ƯU ĐÃI ĐẶC BIỆT",
    headline: "CHỌN RAU LÀNH, SỐNG THÊM AN",
    bullets: [
      "Combo rau củ theo tuần",
      "Đảm bảo VietGAP",
      "Tươi ngon mỗi ngày",
    ],
    bg: slideshow2,
  },
  {
    id: 3,
    title: "FARM TO TABLE",
    headline: "AN TÂM CHẤT LƯỢNG  NHẸ GÁNH CHI TIÊU",
    bullets: [
      "Thu hoạch sáng – giao trong ngày",
      "Đổi trả trong 24h",
      "An toàn cho sức khỏe",
    ],
    bg: slideshow1,
  },
];

const CATE_DESCRIPTIONS = {
  default: "Rau sạch được làm mới hằng ngày, không bảo quản qua đêm",
};

const currencyVN = (n) =>
  typeof n === "number" ? new Intl.NumberFormat("vi-VN").format(n) + "đ" : n;

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

// Product Card with enhanced animations
function ProductCard({ product, index = 0 }) {
  const img = (Array.isArray(product.images) && product.images[0]?.url) || "";

  return (
    <Link
      to={`/product/:id`.replace(":id", product._id || product.id)}
      className="group stagger-item"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="product-card-hover rounded-2xl bg-white border border-green-100 shadow-sm overflow-hidden">
        <div className="aspect-square w-full bg-gradient-to-br from-green-50 to-emerald-50 border-b border-green-100 flex items-center justify-center overflow-hidden rounded-t-2xl relative">
          {/* Shimmer overlay on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 shimmer-bg pointer-events-none transition-opacity duration-300" />
          {img ? (
            <img
              src={img}
              alt={product.name}
              className="max-h-[78%] max-w-[90%] object-contain transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="text-slate-400 text-sm">(Không có ảnh)</div>
          )}
        </div>
        <div className="p-4">
          <div className="text-slate-800 font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-green-700 transition-colors duration-300">
            {product.name}
          </div>
          <div className="mt-1 text-green-700 font-bold text-sm group-hover:scale-105 transition-transform duration-300 origin-left">
            {currencyVN(product.price)}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton Loading Card
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white border border-green-100 shadow-sm overflow-hidden">
      <div className="aspect-square w-full skeleton rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton rounded-lg w-3/4" />
        <div className="h-4 skeleton rounded-lg w-1/2" />
      </div>
    </div>
  );
}

function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
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
      onMouseEnter={() => { stop(); setIsHovered(true); }}
      onMouseLeave={() => { start(); setIsHovered(false); }}
      className="relative w-full h-[340px] md:h-[420px] rounded-2xl overflow-hidden mb-10 shadow-xl animate-fade-in-scale parallax-wrapper"
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 pointer-events-none z-10" />

      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, slideIndex) => (
          <div
            key={s.id}
            className="w-full flex-shrink-0 h-full bg-gradient-to-br from-white via-green-50/30 to-white flex items-center px-6 md:px-12 relative overflow-hidden"
          >
            {/* Animated background shapes */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-100/30 rounded-full blur-3xl animate-float" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-lime-100/40 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />

            <div className={`flex-1 relative z-10 transition-all duration-500 ${index === slideIndex ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <span className="inline-block bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg animate-bounce-in">
                {s.title}
              </span>
              <h2 className="mt-4 text-3xl md:text-5xl font-bold text-slate-800 leading-tight">
                {s.headline.split(' ').map((word, i) => (
                  <span
                    key={i}
                    className="inline-block animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {word}&nbsp;
                  </span>
                ))}
              </h2>
              <ul className="mt-4 text-slate-700 space-y-2 text-sm md:text-base">
                {s.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 animate-fade-in-up"
                    style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {b}
                  </li>
                ))}
              </ul>
              <button className="cta-pulse mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-lime-400 to-green-400 hover:from-lime-500 hover:to-green-500 text-slate-900 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 animate-pulse-glow">
                {s.cta}
              </button>
            </div>
            <div className={`hidden md:flex flex-1 h-full items-center justify-center relative z-10 transition-all duration-700 ${index === slideIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <img
                src={s.bg}
                alt={s.headline}
                className="w-full h-[90%] object-contain drop-shadow-2xl animate-float"
                style={{ animationDelay: '0.5s' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced prev/next buttons */}
      <button
        onClick={prev}
        className={`cursor-pointer absolute left-3 top-1/2 -translate-y-1/2
             bg-white/80 backdrop-blur-sm rounded-full shadow-lg w-12 h-12
             hover:bg-white hover:scale-110 transition-all duration-300
             border border-green-200 text-green-700
             flex items-center justify-center
             ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
        aria-label="Trước"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>

      <button
        onClick={next}
        className={`cursor-pointer absolute right-3 top-1/2 -translate-y-1/2
             bg-white/80 backdrop-blur-sm rounded-full shadow-lg w-12 h-12
             hover:bg-white hover:scale-110 transition-all duration-300
             border border-green-200 text-green-700
             flex items-center justify-center
             ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
        aria-label="Sau"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>

      {/* Animated Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-full">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Chuyển tới slide ${i + 1}`}
            className={`carousel-dot h-2.5 rounded-full transition-all duration-300 ${i === index
              ? "active bg-gradient-to-r from-green-500 to-emerald-500 w-6"
              : "bg-slate-400/70 w-2.5 hover:bg-slate-500"
              }`}
          />
        ))}
      </div>
    </div>
  );
}

// Section Header with shimmer effect
function SectionHeader({ title, description, showLink = false, linkTo = "", linkText = "Xem tất cả →" }) {
  return (
    <div className="animated-header flex items-center justify-between rounded-xl bg-gradient-to-r from-custom-green via-emerald-600 to-custom-green px-5 py-4 shadow-lg">
      <div>
        <h2 className="text-white font-bold tracking-wide text-base sm:text-lg flex items-center gap-2">
          <span className="w-1 h-6 bg-lime-400 rounded-full" />
          {title}
        </h2>
        <p className="text-green-100 text-xs sm:text-sm mt-1">
          {description}
        </p>
      </div>
      {showLink && (
        <Link
          to={linkTo}
          className="text-green-50/90 hover:text-white font-semibold text-sm inline-flex items-center gap-1 transition-all duration-300 hover:gap-2"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);


  // → THÊM TÌM KIẾM THEO TÊN
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const userObj = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user_gowa")); } catch { return null; }
  }, []);
  const userId = userObj?._id;

  // Redirect admin to dashboard if on homepage
  useEffect(() => {
    const roleLike = userObj?.role ?? userObj?.roles ?? userObj?.isAdmin;
    let isAdmin = false;
    if (typeof roleLike === "string") isAdmin = roleLike.toLowerCase() === "admin";
    else if (typeof roleLike === "boolean") isAdmin = roleLike;
    if (isAdmin) navigate("/admin-dashboard");
  }, [userObj, navigate]);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Skeleton Carousel */}
        <div className="w-full h-[340px] md:h-[420px] rounded-2xl skeleton mb-10" />

        {/* Skeleton Search */}
        <div className="h-16 skeleton rounded-2xl mb-8" />

        {/* Skeleton Products Grid */}
        <div className="mt-7 mb-10">
          <div className="h-20 skeleton rounded-xl mb-5" />
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-5">
            {[...Array(10)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center text-slate-600 animate-fade-in-up">
        <div className="text-6xl mb-4">🥬</div>
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
      <AnimatedSection className="top-3 z-20 mb-8">
        <div className="backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/95 rounded-2xl border border-slate-200 shadow-lg ring-1 ring-slate-900/5 p-4 transition-all duration-300 hover:shadow-xl hover:border-green-200">
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
                  className="lucide lucide-search text-slate-400 transition-colors duration-300 group-focus-within:text-green-500"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-10 py-2.5 text-slate-800 shadow-sm outline-none transition-all duration-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 focus:shadow-lg"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearQuery}
                  className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-lg px-2 text-slate-400 hover:text-slate-600 transition-colors duration-200 hover:scale-110"
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
            <p className="mt-2 text-xs text-slate-500 animate-fade-in-up">
              Đang lọc theo:{" "}
              <span className="font-medium text-slate-700">"{query}"</span>
            </p>
          )}
        </div>
      </AnimatedSection>

      {/* Section: Sản phẩm đã mua */}
      {!loadingRecent && recentProducts.length > 0 && query.length === 0 && (
        <AnimatedSection className="mt-7 mb-10" delay={100}>
          <SectionHeader
            title="Sản phẩm đã mua"
            description="Các sản phẩm bạn đã mua gần đây."
          />
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-5">
            {recentProducts.slice(0, 10).map((p, index) => (
              <ProductCard key={p._id || p.id} product={p} index={index} />
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* Section: Sản phẩm đề xuất */}
      {!loadingRecommended && recommendedProducts.length > 0 && query.length === 0 && (
        <AnimatedSection className="mt-7 mb-10" delay={200}>
          <SectionHeader
            title="Sản phẩm đề xuất"
            description="Các sản phẩm được đề xuất dành cho bạn."
          />
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-5">
            {recommendedProducts.slice(0, 10).map((p, index) => (
              <ProductCard key={p._id || p.id} product={p} index={index} />
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* Section theo Category */}
      {groups.length === 0 ? (
        <AnimatedSection className="mx-auto max-w-md text-center">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 animate-bounce-in">
              <span className="text-3xl" role="img" aria-label="Tìm kiếm">
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
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm hover:shadow-lg hover:border-green-300 hover:scale-105 ring-1 ring-slate-900/5 transition-all duration-300"
            >
              Xoá bộ lọc
            </button>
          </div>
        </AnimatedSection>
      ) : (
        groups.map((g, groupIndex) => (
          <AnimatedSection key={g.id} className="mt-7 mb-10" delay={groupIndex * 100}>
            <SectionHeader
              title={g.name}
              description={g.desc}
              showLink={true}
              linkTo={`/food-by-category/${g.id}`}
            />
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-5">
              {g.items.slice(0, 10).map((p, index) => (
                <ProductCard key={p._id || p.id} product={p} index={index} />
              ))}
            </div>
          </AnimatedSection>
        ))
      )}

      {/* 3 USP cards */}
      <AnimatedSection delay={300}>
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { img: banner1, title: "Nguồn giống tiêu chuẩn", desc: "Nguồn giống khỏe giúp cây trồng đạt năng suất và chất lượng tốt. Giống mới lạ đem đến trải nghiệm mới cho thực khách" },
            { img: banner2, title: "Tiêu chuẩn chất lượng", desc: "Các vườn nông sản của Gowa được ứng dụng nuôi trồng theo các tiêu chí an toàn hữu cơ tối thiểu theo chứng nhận của VietGap" },
            { img: banner3, title: "Sản phẩm dinh dưỡng", desc: "Nông sản an toàn được đánh giá không chỉ an toàn và ngon mà còn có nhiều giá trị dinh dưỡng thiết thực" },
          ].map((item, i) => (
            <div
              key={i}
              className="usp-card border-2 border-green-500/50 hover:border-green-500 rounded-2xl p-6 text-center flex flex-col items-center bg-white shadow-sm"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="usp-icon w-20 h-20 rounded-full border-2 border-green-500 flex items-center justify-center -mt-14 bg-gradient-to-br from-white to-green-50 shadow-lg">
                <img src={item.img} alt={item.title} className="w-10 h-10" />
              </div>
              <h3 className="mt-6 text-green-700 font-bold text-lg">
                {item.title}
              </h3>
              <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}
