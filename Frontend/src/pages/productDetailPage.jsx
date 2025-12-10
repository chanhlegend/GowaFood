import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Star,
  ArrowLeft,
  QrCode,
  Check,
  Sprout,
  Box,
  Package,
  Calendar,
  Droplet,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductService } from "@/services/productService";
import { CartService } from "@/services/cartService";
import { ReviewService } from "@/services/reviewService";
import OrderService from "../services/orderService";
import Reviews from "@/components/Reviews";

function makeSeededGrid(count, seed = 98765) {
  let x = seed >>> 0,
    out = [];
  for (let i = 0; i < count; i++) {
    x = (1103515245 * x + 12345) % 2147483648;
    out.push((x & 1) === 1);
  }
  return out;
}

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

// Floating background shapes
function FloatingShapes() {
  return (
    <>
      <div className="absolute -right-32 top-20 w-64 h-64 bg-green-100/30 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute -left-20 bottom-40 w-48 h-48 bg-lime-100/40 rounded-full blur-2xl animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />
    </>
  );
}

// Skeleton Loading Card
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white border border-green-100 shadow-sm overflow-hidden">
      <div className="aspect-[4/3] w-full skeleton rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton rounded-lg w-3/4" />
        <div className="h-4 skeleton rounded-lg w-1/2" />
      </div>
    </div>
  );
}

// Related/Viewed Product Card with animations
function ProductCard({ product, index = 0 }) {
  const pImg = product.images?.[0]?.url ?? product.images?.[0] ?? "/placeholder.svg";
  const pPrice = Number.isFinite(product.price) ? product.price : 0;
  const pOrig = Number.isFinite(product.originalPrice) ? product.originalPrice : 0;
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/product/${product._id || product.id}`)}
      className="product-card-hover rounded-xl border bg-white shadow-sm p-4 cursor-pointer stagger-item group"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 mb-3">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 shimmer-bg pointer-events-none transition-opacity duration-300 z-10" />
        <img
          src={pImg}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-emerald-700 text-white text-xs font-semibold px-3 py-1 animate-bounce-in">
            {product.badge}
          </span>
        )}
      </div>
      <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-green-700 transition-colors duration-300">
        {product.name}
      </h3>
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-emerald-700 group-hover:scale-105 transition-transform duration-300 origin-left">
          {pPrice.toLocaleString("vi-VN")}₫
        </span>
        {pOrig > pPrice && (
          <span className="text-xs text-gray-400 line-through">
            {pOrig.toLocaleString("vi-VN")}₫
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { id: productId } = useParams();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selected, setSelected] = useState("1KG");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [viewedProducts, setViewedProducts] = useState([]);

  const [checkOrderHistory, setCheckOrderHistory] = useState(false);

  const [reviewStats, setReviewStats] = useState({ average: 0, total: 0 });

  const qrDots = useMemo(() => makeSeededGrid(8 * 8), []);
  const user = JSON.parse(localStorage.getItem("user_gowa")) || null;

  // Trigger page animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Load product + related + viewed
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await ProductService.getProductById(productId);
        if (!mounted) return;
        setProduct(data);
        setQuantity(1);
        setAdded(false);

        const checkOrder = await OrderService.getOrderByProductAndUser(
          productId,
          user?.id || user?._id
        );
        if (checkOrder.success) {
          console.log(checkOrder);
          if (checkOrder.data.length > 0) {
            setCheckOrderHistory(true);
          } else {
            setCheckOrderHistory(false);
          }
        } else {
          setCheckOrderHistory(false);
        }

        // Optional calls – chỉ chạy nếu service có
        try {
          if (typeof ProductService.getRelated === "function") {
            const rel = await ProductService.getRelated(productId);
            if (mounted) setRelatedProducts(Array.isArray(rel) ? rel : []);
          }
        } catch (_) { }

        try {
          if (typeof ProductService.getRecentlyViewed === "function") {
            const viewed = await ProductService.getRecentlyViewed();
            if (mounted) setViewedProducts(Array.isArray(viewed) ? viewed : []);
          }
        } catch (_) { }
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Không thể tải sản phẩm");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (productId) load();
    return () => {
      mounted = false;
    };
  }, [productId]);

  // Load thống kê đánh giá để hiển thị giống block Reviews
  useEffect(() => {
    if (!productId) return;
    let mounted = true;
    (async () => {
      try {
        const s = await ReviewService.stats(productId);
        if (!mounted) return;
        setReviewStats({
          average: s?.average || 0,
          total: s?.total || 0,
        });
      } catch (e) {
        // im lặng nếu lỗi, dùng fallback từ product
      }
    })();
    return () => {
      mounted = false;
    };
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product?._id || adding) return;
    setAdding(true);
    setAdded(false);
    try {
      await CartService.addItem({
        productId: product._id,
        quantity,
        weight: selected,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (e) {
      alert(e?.message || "Thêm vào giỏ thất bại");
    } finally {
      setAdding(false);
    }
  };

  const reviewsRef = useRef(null);

  const handleScrollToReviews = () => {
    if (reviewsRef.current) {
      reviewsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };
  if (!productId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-green-50 to-white">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center animate-bounce-in">
            <span className="text-3xl">🔍</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Không có ID sản phẩm trong URL.
          </p>
          <Button
            className="bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-300"
            onClick={() => navigate("/")}
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white">
        <header className="sticky top-0 bg-white/90 backdrop-blur border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" /> Trang chủ
            </Button>
            <div className="flex gap-2 text-sm text-gray-500">
              <span>Rau sạch</span>
              <span>/</span>
              <span className="font-medium">Đang tải...</span>
            </div>
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[300px] sm:h-[380px] md:h-[520px] skeleton rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 skeleton rounded w-2/3" />
            <div className="h-4 skeleton rounded w-1/3" />
            <div className="h-6 skeleton rounded w-1/4" />
            <div className="h-20 skeleton rounded w-full" />
            <div className="h-12 skeleton rounded w-full" />
            <div className="h-12 skeleton rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 max-w-6xl mx-auto bg-gradient-to-b from-green-50/50 to-white">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:scale-105 transition-transform duration-300"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>
        </div>
        <AnimatedSection>
          <div className="p-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 animate-bounce-in">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <p className="font-semibold text-lg">Đã xảy ra lỗi</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length
    ? product.images.map((i) => i.url ?? i)
    : ["/placeholder.svg"];
  const categoryName = product.category?.name || "Rau sạch";

  const ratingValue = reviewStats.average || product.rating || 0;
  const reviewCount = reviewStats.total || product.reviewCount || 0;

  // === Giá theo trọng lượng ===
  const rawPrice = Number.isFinite(product.price) ? product.price : 0;


  const weightFactor = selected === "500G" ? 0.5 : 1; // giảm nửa khi 500G
  const price = Math.max(0, Math.round(rawPrice * weightFactor));

  let originalPrice = 0;
  let discountPercent = 0;



  const stock = Number.isFinite(product.stock) ? product.stock : undefined;
  const outOfStock = stock !== undefined && stock <= 0;

  const canInc = stock === undefined ? true : quantity < stock;
  const canDec = quantity > 1;

  // Tính toán ngày thu hoạch và ngày gieo trồng
  const today = new Date();
  const harvestDate = new Date(today);
  harvestDate.setDate(today.getDate() - 1); // Ngày hôm qua

  const plantingDate = new Date(today);
  const harvestDays = product.description?.numberOfHarvestDays || 0;
  plantingDate.setDate(today.getDate() - harvestDays); // Ngày hôm nay trừ số ngày thu hoạch

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white relative overflow-hidden">
      {/* Floating background shapes */}
      <FloatingShapes />

      {/* Header with animation */}
      <header className={`sticky top-0 z-50 bg-white/90 backdrop-blur border-b transition-all duration-500 ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 hover:scale-105 hover:text-green-700 transition-all duration-300"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" /> Trang chủ
          </Button>
          <div className="hidden sm:flex gap-2 text-sm text-gray-500">
            <span className="hover:text-green-600 transition-colors duration-300 cursor-pointer">{categoryName}</span>
            <span className="text-green-400">/</span>
            <span className="font-medium text-green-700">{product.name}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
        {/* Left: images with animation */}
        <div className={`space-y-4 transition-all duration-700 ${pageLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
          <div className="relative aspect-square sm:aspect-[4/3] md:aspect-square border rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden shadow-lg group">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Shimmer overlay on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 shimmer-bg pointer-events-none transition-opacity duration-500" />

            {/* QR & Like with animation */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:scale-110 hover:bg-white transition-all duration-300"
              onClick={() => setShowQRCode(true)}
              aria-label="Xem mã QR"
            >
              <QrCode className="h-5 w-5 text-green-700" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:scale-110 hover:bg-white transition-all duration-300"
              onClick={() => setIsFavorite((v) => !v)}
              aria-label="Yêu thích"
            >
              <Heart
                className={`h-5 w-5 transition-all duration-300 ${isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-gray-600 hover:text-red-400"
                  }`}
              />
            </Button>

            {/* Badge hết hàng */}
            {outOfStock && (
              <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-gray-900/90 text-white text-xs font-semibold px-4 py-1.5 animate-bounce-in">
                Hết hàng
              </span>
            )}
          </div>

          {/* Image thumbnails with animation */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${selectedImage === idx
                      ? 'border-green-500 shadow-lg shadow-green-200'
                      : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: info with animation */}
        <div className={`space-y-6 transition-all duration-700 delay-100 ${pageLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              {/* Rating với animation */}
              <div className="flex items-center gap-2 group">
                <span className="text-xl font-extrabold text-emerald-700 group-hover:scale-110 transition-transform duration-300">
                  {Number(ratingValue).toFixed(1)}
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 transition-all duration-300 ${i < Math.round(ratingValue)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                        }`}
                      style={{ transitionDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>
              </div>
              {/* Text scroll to reviews */}
              <span
                className="text-sm text-gray-500 cursor-pointer hover:text-green-600 hover:underline transition-all duration-300"
                onClick={handleScrollToReviews}
              >
                Dựa trên {reviewCount} đánh giá
              </span>
            </div>
          </div>

          {/* Price với animation */}
          <div className="flex items-center flex-wrap gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <span className="text-2xl sm:text-3xl font-extrabold text-green-700 tracking-tight animate-pulse-glow">
              {price.toLocaleString("vi-VN")}₫
            </span>
            {originalPrice > price && (
              <span className="text-lg text-gray-400 line-through">
                {originalPrice.toLocaleString("vi-VN")}₫
              </span>
            )}
            {discountPercent > 0 && (
              <span className="inline-flex h-7 items-center rounded-full bg-red-500 px-3 text-xs font-semibold text-white leading-none animate-bounce-in">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Weight selector với animation */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-green-600" />
              Cân nặng:
            </h3>
            <div className="flex flex-wrap gap-2">
              {["1KG", "500G"].map((w) => (
                <button
                  key={w}
                  onClick={() => setSelected(w)}
                  className={`inline-flex h-10 items-center rounded-full px-5 text-sm font-medium transition-all duration-300 hover:scale-105 ${selected === w
                    ? "border-2 border-green-600 text-green-700 bg-green-50 shadow-lg shadow-green-100"
                    : "border bg-white hover:border-green-300 hover:bg-green-50"
                    }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Giá hiển thị đang áp dụng cho tuỳ chọn{" "}
              <span className="font-medium text-green-700">{selected}</span>.
            </p>
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4">
            <span className="font-semibold">Số lượng:</span>
            <div className="flex items-center rounded-xl border w-full max-w-[220px] shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-l-xl hover:bg-green-50 hover:text-green-700 transition-all duration-300"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={!canDec}
                aria-label="Giảm số lượng"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span
                className="min-w-[64px] flex-1 text-center font-bold text-lg"
                aria-live="polite"
              >
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-r-xl hover:bg-green-50 hover:text-green-700 transition-all duration-300"
                onClick={() => setQuantity((q) => (canInc ? q + 1 : q))}
                disabled={!canInc}
                aria-label="Tăng số lượng"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {stock !== undefined && (
              <span className={`text-sm shrink-0 font-medium ${outOfStock ? 'text-red-500' : 'text-green-600'}`}>
                {outOfStock ? "Hết hàng" : `Còn ${stock} kg`}
              </span>
            )}
          </div>

          {/* Action buttons với animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              size="lg"
              className={`cta-pulse w-full h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-semibold disabled:opacity-60 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${added ? 'animate-bounce-in' : ''}`}
              onClick={handleAddToCart}
              disabled={outOfStock || adding}
            >
              {added ? (
                <Check className="h-5 w-5 mr-2 animate-bounce-in" />
              ) : (
                <ShoppingCart className="h-5 w-5 mr-2" />
              )}
              {added ? "Đã thêm" : adding ? "Đang thêm..." : "THÊM VÀO GIỎ"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 rounded-xl border-2 hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-all duration-300 hover:scale-[1.02]"
              onClick={() => navigate("/cart")}
            >
              XEM GIỎ HÀNG
            </Button>
          </div>

          {/* Product description with animation */}
          {product.description && (
            <AnimatedSection delay={200}>
              <div className="pt-8 border-t w-full">
                <h3 className="font-extrabold text-2xl text-gray-900 mb-4 flex items-center gap-2">
                  <Sprout className="w-6 h-6 text-green-600" />
                  Thông tin sản phẩm
                </h3>

                <div className="mb-4">
                  <button className="py-3 text-green-700 border-b border-green-200 w-full text-left font-medium hover:text-green-800 hover:bg-green-50 rounded-lg px-3 transition-all duration-300">
                    Xem chi tiết nguồn gốc và quy trình sản xuất
                  </button>
                </div>

                {/* Subsection with animation */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Sprout className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-xl text-gray-800">Thông tin truy xuất nguồn gốc</h3>
                </div>

                {/* Table with details */}
                <div className="overflow-hidden rounded-xl border border-green-200 bg-white shadow-lg">
                  <table className="w-full table-auto">
                    <tbody className="divide-y divide-green-100">
                      {/* Tên sản phẩm */}
                      {product.name && (
                        <tr className="hover:bg-green-50 transition-colors duration-300">
                          <td className="py-3 px-4 font-medium text-gray-700 w-1/3 bg-green-50">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-white rounded-lg border-2 border-green-200 shadow-sm" style={{
                                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                              }}>
                                <Package className="w-5 h-5 text-green-600" />
                              </div>
                              Tên sản phẩm
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700 font-semibold">{product.name}</td>
                        </tr>
                      )}

                      {/* Lô số */}
                      {product.description.lotNumber && (
                        <tr className="hover:bg-green-50 transition-colors duration-300">
                          <td className="py-3 px-4 font-medium text-gray-700 w-1/3 bg-green-50">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-white rounded-lg border-2 border-green-200 shadow-sm" style={{
                                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                              }}>
                                <Box className="w-5 h-5 text-green-600" />
                              </div>
                              Lô số
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">{product.description.lotNumber}</td>
                        </tr>
                      )}

                      {/* Giống */}
                      {product.description.variety && (
                        <tr className="hover:bg-green-50 transition-colors duration-300">
                          <td className="py-3 px-4 font-medium text-gray-700 w-1/3 bg-green-50">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-white rounded-lg border-2 border-green-200 shadow-sm" style={{
                                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                              }}>
                                <Sprout className="w-5 h-5 text-green-600" />
                              </div>
                              Giống
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">{product.description.variety}</td>
                        </tr>
                      )}

                      {/* Ngày gieo trồng */}
                      {product.description?.numberOfHarvestDays && (
                        <tr className="hover:bg-green-50 transition-colors duration-300">
                          <td className="py-3 px-4 font-medium text-gray-700 w-1/3 bg-green-50">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-white rounded-lg border-2 border-green-200 shadow-sm" style={{
                                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                              }}>
                                <Calendar className="w-5 h-5 text-green-600" />
                              </div>
                              Ngày gieo trồng
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {plantingDate.toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      )}

                      {/* Phân bón */}
                      {product.description.fertilizer && product.description.fertilizer.length > 0 && (
                        <tr className="hover:bg-green-50 transition-colors duration-300">
                          <td className="py-3 px-4 font-medium text-gray-700 w-1/3 bg-green-50">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-white rounded-lg border-2 border-green-200 shadow-sm" style={{
                                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                              }}>
                                <Droplet className="w-5 h-5 text-green-600" />
                              </div>
                              Phân bón
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            <div className="flex flex-wrap gap-1.5">
                              {product.description.fertilizer.map((item, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-300">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Thuốc BVTV */}
                      {product.description.pesticide && product.description.pesticide.length > 0 && (
                        <tr className="hover:bg-green-50 transition-colors duration-300">
                          <td className="py-3 px-4 font-medium text-gray-700 w-1/3 bg-green-50">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-white rounded-lg border-2 border-green-200 shadow-sm" style={{
                                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                              }}>
                                <Shield className="w-5 h-5 text-green-600" />
                              </div>
                              Thuốc BVTV
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            <div className="flex flex-wrap gap-1.5">
                              {product.description.pesticide.map((item, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-300">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Ngày thu hoạch */}
                      {product.description?.numberOfHarvestDays && (
                        <tr className="hover:bg-green-50 transition-colors duration-300">
                          <td className="py-3 px-4 font-medium text-gray-700 w-1/3 bg-green-50">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-white rounded-lg border-2 border-green-200 shadow-sm" style={{
                                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                              }}>
                                <Calendar className="w-5 h-5 text-green-600" />
                              </div>
                              Ngày thu hoạch
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {harvestDate.toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      )}

                      {/* Đóng gói tại */}
                      {product.description.packaging && (
                        <tr className="hover:bg-green-50 transition-colors duration-300">
                          <td className="py-3 px-4 font-medium text-gray-700 w-1/3 bg-green-50">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-white rounded-lg border-2 border-green-200 shadow-sm" style={{
                                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                              }}>
                                <Package className="w-5 h-5 text-green-600" />
                              </div>
                              Đóng gói tại
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {product.description.packaging}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimatedSection>
          )}

        </div>
      </div>

      {/* Reviews block — đặt TRƯỚC Related */}
      <AnimatedSection delay={300} className="max-w-6xl mx-auto px-4 pb-10">
        <div ref={reviewsRef}>
          <Reviews
            productId={product._id}
            checkOrderHistory={checkOrderHistory}
          />
        </div>
      </AnimatedSection>

      {/* Related Products with animation */}
      {relatedProducts?.length > 0 && (
        <AnimatedSection delay={400} className="max-w-6xl mx-auto px-4 pb-10">
          <div className="animated-header bg-gradient-to-r from-green-700 via-emerald-600 to-green-700 text-white text-center py-4 rounded-t-xl mb-6 shadow-lg">
            <h2 className="text-lg font-semibold tracking-wide flex items-center justify-center gap-2">
              <span className="w-8 h-0.5 bg-white/50 rounded-full" />
              SẢN PHẨM LIÊN QUAN
              <span className="w-8 h-0.5 bg-white/50 rounded-full" />
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p, index) => (
              <ProductCard key={p._id || p.id} product={p} index={index} />
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* Viewed Products with animation */}
      {viewedProducts?.length > 0 && (
        <AnimatedSection delay={500} className="max-w-6xl mx-auto px-4 pb-16">
          <div className="animated-header bg-gradient-to-r from-green-700 via-emerald-600 to-green-700 text-white text-center py-4 rounded-t-xl mb-6 shadow-lg">
            <h2 className="text-lg font-semibold tracking-wide flex items-center justify-center gap-2">
              <span className="w-8 h-0.5 bg-white/50 rounded-full" />
              SẢN PHẨM ĐÃ XEM
              <span className="w-8 h-0.5 bg-white/50 rounded-full" />
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {viewedProducts.map((p, index) => (
              <ProductCard key={p._id || p.id} product={p} index={index} />
            ))}
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}