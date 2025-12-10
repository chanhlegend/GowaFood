// src/pages/FoodByCategoryPage.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ProductService } from "../services/productService";

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
            {new Intl.NumberFormat("vi-VN").format(product.price)}đ
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton Loading Card with shimmer effect
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

// Floating background shapes
function FloatingShapes() {
  return (
    <>
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-100/30 rounded-full blur-3xl animate-float" />
      <div className="absolute -left-10 bottom-20 w-48 h-48 bg-lime-100/40 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
    </>
  );
}

const FoodByCategoryPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    // Trigger page animation after mount
    const timer = setTimeout(() => setPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await ProductService.getProductsByCategory(categoryId);
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  // Lọc & sắp xếp sản phẩm
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) =>
      p.name?.toLowerCase().includes(query.toLowerCase())
    );

    if (sort === "asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === "desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, query, sort]);

  // UI helpers
  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const categoryName = products[0]?.category?.name || "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white relative overflow-hidden">
      {/* Floating background shapes */}
      <FloatingShapes />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Header with animation */}
        <header className={`mb-6 transition-all duration-700 ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          {/* Breadcrumb đơn giản */}
          <nav className="mb-3 text-sm text-slate-500 flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1 hover:text-green-600 transition-colors duration-300 hover:scale-105"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-home"
              >
                <path d="M3 9l9-7 9 7" />
                <path d="M9 22V12h6v10" />
              </svg>
              Trang chủ
            </Link>
            <span className="text-green-400">/</span>
            <span className="text-slate-700">Danh mục</span>
            {categoryName ? (
              <>
                <span className="text-green-400">/</span>
                <span className="font-medium text-green-700 animate-fade-in-up">
                  {categoryName}
                </span>
              </>
            ) : null}
          </nav>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full" />
              <span>
                Sản phẩm trong danh mục{" "}
                <span className="text-green-700 relative">
                  {categoryName}
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-green-500 to-transparent rounded-full" />
                </span>
              </span>
            </h1>
          </div>
        </header>

        {/* Bộ lọc & Tìm kiếm với animation */}
        <section className={`sticky top-3 z-20 mb-8 transition-all duration-700 delay-100 ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/95 rounded-2xl border border-slate-200 shadow-lg ring-1 ring-slate-900/5 p-4 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* Ô tìm kiếm với icon & nút xóa */}
              <div className="relative w-full md:w-2/3 group">
                <label htmlFor="search" className="sr-only">
                  Tìm kiếm sản phẩm
                </label>
                <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center transition-transform duration-300 group-focus-within:scale-110">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-search text-slate-400 group-focus-within:text-green-500 transition-colors duration-300"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                </span>
                <input
                  id="search"
                  ref={inputRef}
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-10 py-2.5 text-slate-800 shadow-sm outline-none ring-0 transition-all duration-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 focus:shadow-lg"
                />
                {query && (
                  <button
                    type="button"
                    onClick={clearQuery}
                    className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-lg px-2 text-slate-400 hover:text-slate-600 hover:scale-110 transition-all duration-300"
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

              {/* Sắp xếp với biểu tượng */}
              <div className="w-full md:w-1/3">
                <div className="relative group">
                  <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center transition-transform duration-300 group-focus-within:scale-110">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-sort-asc text-slate-400 group-focus-within:text-green-500 transition-colors duration-300"
                    >
                      <path d="M11 11h4" />
                      <path d="M11 7h7" />
                      <path d="M11 15h1" />
                      <path d="M7 3v18" />
                      <path d="M3 19l4 4 4-4" />
                    </svg>
                  </span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-10 py-2.5 text-slate-800 shadow-sm outline-none transition-all duration-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 focus:shadow-lg cursor-pointer"
                  >
                    <option value="default">Sắp xếp: Mặc định</option>
                    <option value="asc">Giá: Thấp → Cao</option>
                    <option value="desc">Giá: Cao → Thấp</option>
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-chevron-down text-slate-400"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Search result count with animation */}
            {!loading && filteredProducts.length > 0 && (
              <div className="mt-3 text-sm text-slate-500 animate-fade-in-up">
                Hiển thị <span className="font-semibold text-green-700">{filteredProducts.length}</span> sản phẩm
                {query && <span> cho từ khóa "<span className="font-medium text-slate-700">{query}</span>"</span>}
              </div>
            )}
          </div>
        </section>

        {/* Trạng thái tải với skeleton animation */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                  <SkeletonCard />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lỗi với animation */}
        {!loading && error && (
          <AnimatedSection>
            <div className="mt-4 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-6 text-red-700 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⚠️</span>
                </div>
                <div>
                  <p className="font-semibold">Đã xảy ra lỗi</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Không có sản phẩm với animation */}
        {!loading && !error && filteredProducts.length === 0 && (
          <AnimatedSection className="mx-auto max-w-md text-center">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 animate-bounce-in">
                <span className="text-3xl" role="img" aria-label="Tìm kiếm">
                  🔎
                </span>
              </div>
              <p className="text-slate-700 font-semibold text-lg">
                Không tìm thấy sản phẩm nào
              </p>
              <p className="mt-2 text-slate-500 text-sm">
                Thử xoá từ khoá hoặc thay đổi phương thức sắp xếp.
              </p>
              {query && (
                <button
                  type="button"
                  onClick={clearQuery}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium shadow-sm hover:shadow-lg hover:border-green-300 hover:scale-105 ring-1 ring-slate-900/5 transition-all duration-300"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Xoá từ khoá "{query}"
                </button>
              )}
            </div>
          </AnimatedSection>
        )}

        {/* Lưới sản phẩm với stagger animation */}
        {!loading && !error && filteredProducts.length > 0 && (
          <AnimatedSection delay={200}>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Back to top button */}
        {!loading && filteredProducts.length > 10 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-pulse-glow"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              Về đầu trang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodByCategoryPage;
