// src/pages/productDetailPage.jsx
import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductService } from "@/services/productService";
import { CartService } from "@/services/cartService";
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

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { id: productId } = useParams();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selected, setSelected] = useState("1KG");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [viewedProducts, setViewedProducts] = useState([]);

  const [checkOrderHistory, setCheckOrderHistory] = useState(false);

  const qrDots = useMemo(() => makeSeededGrid(8 * 8), []);
  const user = JSON.parse(localStorage.getItem("user_gowa")) || null;
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
        } catch (_) {}

        try {
          if (typeof ProductService.getRecentlyViewed === "function") {
            const viewed = await ProductService.getRecentlyViewed();
            if (mounted) setViewedProducts(Array.isArray(viewed) ? viewed : []);
          }
        } catch (_) {}
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

  if (!productId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Không có ID sản phẩm trong URL.
          </p>
          <Button className="mt-3" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 bg-white border-b">
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
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="h-[300px] sm:h-[380px] md:h-[520px] bg-gray-100 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-20 bg-gray-100 rounded w-full" />
            <div className="h-10 bg-gray-100 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 max-w-6xl mx-auto">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>
        </div>
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length
    ? product.images.map((i) => i.url ?? i)
    : ["/placeholder.svg"];
  const categoryName = product.category?.name || "Rau sạch";

  // === Giá theo trọng lượng ===
  const rawPrice = Number.isFinite(product.price) ? product.price : 0;
  const rawOriginal = Number.isFinite(product.originalPrice)
    ? product.originalPrice
    : Number.isFinite(product.compareAtPrice)
    ? product.compareAtPrice
    : 0;

  const weightFactor = selected === "500G" ? 0.5 : 1; // giảm nửa khi 500G
  const price = Math.max(0, Math.round(rawPrice * weightFactor));

  let originalPrice = 0;
  let discountPercent = 0;

  if (rawOriginal > rawPrice) {
    originalPrice = Math.round(rawOriginal * weightFactor);
    discountPercent = Math.max(
      0,
      Math.round((1 - rawPrice / rawOriginal) * 100)
    );
  } else {
    // fallback nếu không có originalPrice: giữ -27% như trước
    const fallbackPercent = 27;
    originalPrice =
      price > 0 ? Math.round(price / (1 - fallbackPercent / 100)) : 0;
    discountPercent = price > 0 ? fallbackPercent : 0;
  }

  const stock = Number.isFinite(product.stock) ? product.stock : undefined;
  const outOfStock = stock !== undefined && stock <= 0;

  const canInc = stock === undefined ? true : quantity < stock;
  const canDec = quantity > 1;

  // Origin/QR từ data (fallback nếu thiếu)
  const origin = product.origin || {};
  const farmName = origin.farmName || "Nông trại";
  const address = origin.address || "—";
  const harvestDate = origin.harvestDate || product.harvestDate || "—";
  const certs = Array.isArray(origin.certs)
    ? origin.certs.join(", ")
    : origin.certs || product.certs || "—";
  const qrImage = product.qrImage || origin.qrImage || "";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" /> Trang chủ
          </Button>
          <div className="hidden sm:flex gap-2 text-sm text-gray-500">
            <span>{categoryName}</span>
            <span>/</span>
            <span className="font-medium">{product.name}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Left: images */}
        <div className="space-y-4">
          <div className="relative aspect-square sm:aspect-[4/3] md:aspect-square border rounded-xl bg-gray-50 overflow-hidden">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* QR & Like */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/85 rounded-lg"
              onClick={() => setShowQRCode(true)}
              aria-label="Xem QR"
            >
              <QrCode className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/85 rounded-lg"
              onClick={() => setIsFavorite((v) => !v)}
              aria-label="Yêu thích"
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </Button>

            {/* Badge hết hàng */}
            {outOfStock && (
              <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-gray-900/85 text-white text-xs font-semibold px-3 py-1">
                Hết hàng
              </span>
            )}
          </div>

          {/* Thumbnails: trượt ngang trên mobile, grid trên md+ */}
          <div className="md:grid md:grid-cols-4 md:gap-3 flex gap-3 overflow-x-auto no-scrollbar">
            {images.slice(0, 8).map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`min-w-[88px] md:min-w-0 aspect-square rounded-xl overflow-hidden border transition-colors ${
                  selectedImage === i
                    ? "border-green-600"
                    : "border-gray-200 hover:border-green-300"
                }`}
                aria-label={`Ảnh ${i + 1}`}
              >
                <img
                  src={img}
                  alt={`${product.name} ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="text-sm text-gray-500">(24 đánh giá)</span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-green-700 tracking-tight">
              {price.toLocaleString("vi-VN")}₫
            </span>
            {originalPrice > price && (
              <span className="text-lg text-gray-400 line-through">
                {originalPrice.toLocaleString("vi-VN")}₫
              </span>
            )}
            {discountPercent > 0 && (
              <span className="inline-flex h-7 items-center rounded-full bg-red-500 px-3 text-xs font-semibold text-white leading-none">
                -{discountPercent}%
              </span>
            )}
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-green-800">
                  Nguồn gốc sản phẩm
                </h3>
                <p className="text-sm text-green-700 truncate">
                  Nông trại {farmName}{" "}
                  {address && `- ${String(address).split(",")[0]}`}
                </p>
                <p className="text-xs text-green-600">Chứng nhận {certs}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 rounded-lg"
                onClick={() => setShowQRCode(true)}
              >
                <QrCode className="h-4 w-4 mr-2" /> Xem QR
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Cân nặng:</h3>
            <div className="flex flex-wrap gap-2">
              {["1KG", "500G"].map((w) => (
                <button
                  key={w}
                  onClick={() => setSelected(w)}
                  className={`inline-flex h-9 items-center rounded-full px-3 text-sm font-medium ${
                    selected === w
                      ? "border-2 border-green-600 text-green-700 bg-white"
                      : "border bg-white"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Giá hiển thị đang áp dụng cho tuỳ chọn{" "}
              <span className="font-medium">{selected}</span>.
            </p>
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4">
            <span className="font-semibold">Số lượng:</span>
            <div className="flex items-center rounded-lg border w-full max-w-[220px]">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-l-lg"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={!canDec}
                aria-label="Giảm số lượng"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span
                className="min-w-[64px] flex-1 text-center font-medium"
                aria-live="polite"
              >
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-r-lg"
                onClick={() => setQuantity((q) => (canInc ? q + 1 : q))}
                disabled={!canInc}
                aria-label="Tăng số lượng"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {stock !== undefined && (
              <span className="text-sm text-gray-500 shrink-0">
                {outOfStock ? "Hết hàng" : `Còn ${stock} sp`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              size="lg"
              className="w-full h-12 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold disabled:opacity-60"
              onClick={handleAddToCart}
              disabled={outOfStock || adding}
            >
              {added ? (
                <Check className="h-5 w-5 mr-2" />
              ) : (
                <ShoppingCart className="h-5 w-5 mr-2" />
              )}
              {added ? "Đã thêm" : adding ? "Đang thêm..." : "THÊM VÀO GIỎ"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 rounded-lg"
              onClick={() => navigate("/cart")}
            >
              XEM GIỎ HÀNG
            </Button>
          </div>

          {product.description && (
            <div className="pt-6 border-t">
              <h3 className="font-semibold text-lg mb-2">Mô tả sản phẩm</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews block — đặt TRƯỚC Related */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <Reviews
          productId={product._id}
          checkOrderHistory={checkOrderHistory}
        />
      </div>

      {/* Related */}
      {relatedProducts?.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-10">
          <div className="bg-green-800 text-white text-center py-3 rounded-t-xl mb-6">
            <h2 className="text-lg font-semibold tracking-wide">
              SẢN PHẨM LIÊN QUAN
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => {
              const pImg =
                p.images?.[0]?.url ?? p.images?.[0] ?? "/placeholder.svg";
              const pPrice = Number.isFinite(p.price) ? p.price : 0;
              const pOrig = Number.isFinite(p.originalPrice)
                ? p.originalPrice
                : 0;
              return (
                <div
                  key={p._id || p.id}
                  className="rounded-xl border bg-white shadow-sm p-4"
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-3">
                    <img
                      src={pImg}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    {p.badge && (
                      <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-emerald-700 text-white text-xs font-semibold px-3 py-1">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-sm mb-2 line-clamp-2">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-emerald-700">
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
            })}
          </div>
        </div>
      )}

      {/* Viewed */}
      {viewedProducts?.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="bg-green-800 text-white text-center py-3 rounded-t-xl mb-6">
            <h2 className="text-lg font-semibold tracking-wide">
              SẢN PHẨM ĐÃ XEM
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {viewedProducts.map((p) => {
              const pImg =
                p.images?.[0]?.url ?? p.images?.[0] ?? "/placeholder.svg";
              const pPrice = Number.isFinite(p.price) ? p.price : 0;
              const pOrig = Number.isFinite(p.originalPrice)
                ? p.originalPrice
                : 0;
              return (
                <div
                  key={p._id || p.id}
                  className="rounded-xl border bg-white shadow-sm p-4"
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-3">
                    <img
                      src={pImg}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    {p.badge && (
                      <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-red-500 text-white text-xs font-semibold px-3 py-1">
                        {p.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-sm mb-2 line-clamp-2">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-emerald-700">
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
            })}
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRCode && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-center">
              Nguồn gốc sản phẩm
            </h3>

            <div className="mt-4 rounded-xl border bg-gray-50 p-4">
              <div className="w-48 h-48 mx-auto rounded-xl bg-white flex items-center justify-center">
                {qrImage ? (
                  <img
                    src={qrImage}
                    alt="Mã QR nguồn gốc"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="grid grid-cols-8 gap-[2px]">
                    {qrDots.map((on, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 ${on ? "bg-black" : "bg-white"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-sm text-center space-y-1">
              <p className="font-semibold text-emerald-700">
                Nông trại: {farmName}
              </p>
              <p className="text-gray-600">Địa chỉ: {address}</p>
              <p className="text-gray-600">Ngày thu hoạch: {harvestDate}</p>
              <p className="text-gray-600">Chứng nhận: {certs}</p>
            </div>

            <Button
              onClick={() => setShowQRCode(false)}
              className="mt-4 w-full h-11 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
            >
              Đóng
            </Button>
          </div>
        </div>
      )}

      {/* no-scrollbar utility (optional): thêm vào global css nếu cần
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      */}
    </div>
  );
}
