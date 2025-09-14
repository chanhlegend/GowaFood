// src/pages/productDetailPage.jsx
import { useEffect, useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Minus, Plus, ShoppingCart, Heart, Star, ArrowLeft, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductService } from "@/services/ProductService"

const QR_STATIC = {
  farmName: "Suni Green Farm",
  address: "Đà Lạt, Lâm Đồng",
  harvestDate: "15/12/2024",
  certs: "VietGAP, Hữu cơ",
  image: "/qr-celery.png",
}

const relatedProducts = [
  { id: 1, name: "Cải Kale Mỹ", price: "100,000", originalPrice: "120,000", image: "/placeholder-4d4pe.png", badge: "Hết hàng" },
  { id: 2, name: "Cải Bó Xôi Thủy Canh Việt Gap", price: "69,000", image: "/fresh-spinach.png", badge: null },
  { id: 3, name: "Cải bó xôi nhỏ cơ", price: "108,000", image: "/placeholder-7bzjs.png", badge: null },
  { id: 4, name: "Cà rốt mini", price: "129,000", image: "/placeholder-gvk5a.png", badge: null },
]

const viewedProducts = [
  { id: 101, name: "Cần tây", price: "109,000", originalPrice: "130,000", image: "/placeholder-m3uww.png", badge: "Sale" },
  { id: 102, name: "Nấm đùi gà", price: "195,000", image: "/placeholder-mia65.png", badge: null },
]

function makeSeededGrid(count, seed = 98765) {
  let x = seed >>> 0, out = []
  for (let i = 0; i < count; i++) {
    x = (1103515245 * x + 12345) % 2147483648
    out.push((x & 1) === 1)
  }
  return out
}

export default function ProductDetailPage() {
  const navigate = useNavigate()
  const { id: productId } = useParams()

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [product, setProduct] = useState(null)

  const qrDots = useMemo(() => makeSeededGrid(8 * 8), [])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        setError("")
        const data = await ProductService.getProductById(productId)
        if (!mounted) return
        setProduct(data)
      } catch (e) {
        if (!mounted) return
        setError(e?.message || "Không thể tải sản phẩm")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (productId) load()
    return () => { mounted = false }
  }, [productId])

  if (!productId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">Không có ID sản phẩm trong URL.</p>
          <Button className="mt-3" onClick={() => navigate("/")}>Về trang chủ</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-50 bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" /> Trang chủ
            </Button>
            <div className="flex gap-2 text-sm text-gray-500">
              <span>Rau sạch</span><span>/</span><span className="font-medium">Đang tải...</span>
            </div>
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="h-[420px] md:h-[520px] bg-gray-100 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-20 bg-gray-100 rounded w-full" />
            <div className="h-10 bg-gray-100 rounded w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 max-w-6xl mx-auto">
        <div className="mb-4">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Button>
        </div>
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">{error}</div>
      </div>
    )
  }

  if (!product) return null

  const images = product.images?.length ? product.images.map(i => i.url) : ["/placeholder.svg"]
  const categoryName = product.category?.name || "Rau sạch"
  const price = typeof product.price === "number" ? product.price : 0
  const discountPercent = 27
  const originalPrice = price > 0 ? Math.round(price / (1 - discountPercent / 100)) : 0

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" /> Trang chủ
          </Button>
          <div className="flex gap-2 text-sm text-gray-500">
            <span>{categoryName}</span><span>/</span><span className="font-medium">{product.name}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: images */}
        <div className="space-y-4">
          <div className="relative aspect-square border rounded-xl bg-gray-50 overflow-hidden">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 bg-white/85 rounded-lg"
              onClick={() => setShowQRCode(true)}
              aria-label="Xem QR"
            >
              <QrCode className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/85 rounded-lg"
              onClick={() => setIsFavorite(v => !v)}
              aria-label="Yêu thích"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {images.slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`aspect-square rounded-xl overflow-hidden border transition-colors ${
                  selectedImage === i ? "border-green-600" : "border-gray-200 hover:border-green-300"
                }`}
                aria-label={`Ảnh ${i + 1}`}
              >
                <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm text-gray-500">(24 đánh giá)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-green-700 tracking-tight">
              {price.toLocaleString("vi-VN")}₫
            </span>
            {originalPrice > price && (
              <span className="text-lg text-gray-400 line-through">
                {originalPrice.toLocaleString("vi-VN")}₫
              </span>
            )}
            <span className="inline-flex h-7 items-center rounded-full bg-red-500 px-3 text-xs font-semibold text-white leading-none">
              -{discountPercent}%
            </span>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-green-800">Nguồn gốc sản phẩm</h3>
                <p className="text-sm text-green-700">Nông trại {QR_STATIC.farmName} - {QR_STATIC.address.split(",")[0]}</p>
                <p className="text-xs text-green-600">Chứng nhận {QR_STATIC.certs}</p>
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
            <h3 className="font-semibold mb-2">Tiêu đề:</h3>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex h-8 items-center rounded-full border-2 border-green-600 px-3 text-sm font-medium text-green-700 bg-white">1KG</button>
              <button className="inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium bg-white">500G</button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Loại:</h3>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex h-8 items-center rounded-full border-2 border-green-600 px-3 text-sm font-semibold text-green-700 bg-white">KG - MEMBERSHIP</button>
              <button className="inline-flex h-8 items-center rounded-full border px-3 text-sm font-semibold bg-white">CẦN TÂY HỮU CƠ - MEMBERSHIP</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-semibold">Số lượng:</span>
            <div className="flex items-center rounded-lg border">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-l-lg"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                aria-label="Giảm số lượng"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-[64px] text-center font-medium" aria-live="polite">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-r-lg"
                onClick={() => setQuantity(q => q + 1)}
                aria-label="Tăng số lượng"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button size="lg" className="w-full h-12 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold">
            <ShoppingCart className="h-5 w-5 mr-2" />
            THÊM VÀO GIỎ
          </Button>

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

      {/* Related */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <div className="bg-green-800 text-white text-center py-3 rounded-t-xl mb-6">
          <h2 className="text-lg font-semibold tracking-wide">SẢN PHẨM LIÊN QUAN</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <div key={p.id} className="rounded-xl border bg-white shadow-sm p-4">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-3">
                <img src={p.image || "/placeholder.svg"} alt={p.name} className="w-full h-full object-cover" />
                {!!p.badge && (
                  <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-emerald-700 text-white text-xs font-semibold px-3 py-1">
                    {p.badge}
                  </span>
                )}
              </div>
              <h3 className="font-medium text-sm mb-2 line-clamp-2">{p.name}</h3>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-700">{p.price}₫</span>
                {p.originalPrice && (
                  <span className="text-xs text-gray-400 line-through">{p.originalPrice}₫</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Viewed */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-green-800 text-white text-center py-3 rounded-t-xl mb-6">
          <h2 className="text-lg font-semibold tracking-wide">SẢN PHẨM ĐÃ XEM</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {viewedProducts.map((p) => (
            <div key={p.id} className="rounded-xl border bg-white shadow-sm p-4">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-3">
                <img src={p.image || "/placeholder.svg"} alt={p.name} className="w-full h-full object-cover" />
                {!!p.badge && (
                  <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-red-500 text-white text-xs font-semibold px-3 py-1">
                    {p.badge}
                  </span>
                )}
              </div>
              <h3 className="font-medium text-sm mb-2">{p.name}</h3>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-700">{p.price}₫</span>
                {p.originalPrice && (
                  <span className="text-xs text-gray-400 line-through">{p.originalPrice}₫</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-center">Nguồn gốc sản phẩm</h3>

            <div className="mt-4 rounded-xl border bg-gray-50 p-4">
              <div className="w-48 h-48 mx-auto rounded-xl bg-white flex items-center justify-center">
                {QR_STATIC.image ? (
                  <img src={QR_STATIC.image} alt="Mã QR nguồn gốc" className="w-full h-full object-contain" />
                ) : (
                  <div className="grid grid-cols-8 gap-[2px]">
                    {qrDots.map((on, i) => (
                      <div key={i} className={`w-2 h-2 ${on ? "bg-black" : "bg-white"}`} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-sm text-center space-y-1">
              <p className="font-semibold text-emerald-700">Nông trại: {QR_STATIC.farmName}</p>
              <p className="text-gray-600">Địa chỉ: {QR_STATIC.address}</p>
              <p className="text-gray-600">Ngày thu hoạch: {QR_STATIC.harvestDate}</p>
              <p className="text-gray-600">Chứng nhận: {QR_STATIC.certs}</p>
            </div>

            <Button onClick={() => setShowQRCode(false)} className="mt-4 w-full h-11 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold">
              Đóng
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}