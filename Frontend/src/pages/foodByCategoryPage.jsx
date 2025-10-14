// src/pages/FoodByCategoryPage.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ProductService } from "../services/productService";

const FoodByCategoryPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

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
    <div className="min-h-screen ">
      {/* Nền gradient nhẹ để giao diện "mềm" hơn */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="mb-6">
          {/* Breadcrumb đơn giản */}
          <nav className="mb-3 text-sm text-slate-500 flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1 hover:text-slate-700 transition"
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
            <span>/</span>
            <span className="text-slate-700">Danh mục</span>
            {categoryName ? (
              <>
                <span>/</span>
                <span className="font-medium text-slate-800">
                  {categoryName}
                </span>
              </>
            ) : null}
          </nav>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              Sản phẩm trong danh mục {categoryName}
            </h1>
          </div>
        </header>

        {/* Bộ lọc & Tìm kiếm (giữ nguyên lưới sản phẩm bên dưới) */}
        <section className="sticky top-3 z-20 mb-8">
          <div className="backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/95 rounded-2xl border border-slate-200 shadow-lg ring-1 ring-slate-900/5 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* Ô tìm kiếm với icon & nút xóa */}
              <div className="relative w-full md:w-2/3">
                <label htmlFor="search" className="sr-only">
                  Tìm kiếm sản phẩm
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
                  id="search"
                  ref={inputRef}
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-10 py-2.5 text-slate-800 shadow-sm outline-none ring-0 transition focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
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

              {/* Sắp xếp với biểu tượng */}
              <div className="w-full md:w-1/3">
                <div className="relative">
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
                      className="lucide lucide-sort-asc text-slate-400"
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
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-10 py-2.5 text-slate-800 shadow-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/30"
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
          </div>
        </section>

        {/* Trạng thái tải */}
        {loading && (
          <div className="space-y-6">
            {/* Skeleton cho bộ lọc đã có, thêm skeleton cho lưới */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="aspect-square rounded-t-xl bg-slate-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-100" />
                    <div className="h-4 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lỗi */}
        {!loading && error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Không có sản phẩm */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="mx-auto max-w-md text-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <span className="text-2xl" role="img" aria-label="Tìm kiếm">
                🔎
              </span>
            </div>
            <p className="text-slate-700 font-medium">
              Không tìm thấy sản phẩm nào
            </p>
            <p className="mt-1 text-slate-500 text-sm">
              Thử xoá từ khoá hoặc thay đổi phương thức sắp xếp.
            </p>
            {query && (
              <button
                type="button"
                onClick={clearQuery}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm hover:shadow ring-1 ring-slate-900/5 transition"
              >
                Xoá từ khoá "{query}"
              </button>
            )}
          </div>
        )}

        {/* Lưới sản phẩm (GIỮ NGUYÊN PHẦN SẢN PHẨM) */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-5">
          {filteredProducts.map((product) => (
            <Link
              key={product._id || product.id}
              to={`/product/:id`.replace(":id", product._id || product.id)}
              className="group"
            >
              <div
                key={product._id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition duration-150 overflow-hidden"
              >
                <div className="aspect-square bg-slate-50 flex items-center justify-center">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="max-h-[80%] max-w-[90%] object-contain"
                    />
                  ) : (
                    <span className="text-slate-400 text-sm">
                      (Không có ảnh)
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-slate-800 text-sm md:text-base line-clamp-2">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-green-700 font-bold text-sm">
                    {new Intl.NumberFormat("vi-VN").format(product.price)}đ
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

       
      </div>
    </div>
  );
};

export default FoodByCategoryPage;
