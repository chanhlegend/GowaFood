// src/pages/CartPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Minus, Plus, X, Trash2, ChevronRight,
  Tag, Truck, ShieldCheck, Phone, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartService } from "@/services/cartService";

// === Cấu hình (tuỳ môi trường) ===
// Nếu server đã có auth -> để null (server lấy req.user)
// Nếu CHƯA auth -> điền tạm userId test để controller nhận req.body.userId
const DEMO_USER_ID = null; // ví dụ: "6655aa...e12"

const formatVND = (n) =>
  (n || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫";

const FREE_SHIP_THRESHOLD = 299000;

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [note, setNote] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null); // chặn spam cho từng item

  // ---- Load cart từ API ----
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await CartService.getCart(DEMO_USER_ID || undefined);
        if (!mounted) return;
        setItems(mapCartItems(data));
      } catch (e) {
        console.error(e);
        if (mounted) alert(e?.message || "Không thể tải giỏ hàng");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Map dữ liệu từ response controller -> UI
  function mapCartItems(resp) {
  const list = Array.isArray(resp?.items) ? resp.items : [];
  return list.map((it) => {
    const p = it.product || {};
    const productId = p._id || it.product;
    const weight = it.weight || "1KG"; // từ BE trả về
    return {
      // id duy nhất theo biến thể (product + weight)
      id: `${productId}`,
      productId,
      weight,
      name: p.name || "Sản phẩm",
      unit: weight, // hiển thị luôn cân nặng
      price: p.price || 0,
      image: p.images?.[0]?.url || "/placeholder.svg",
      stock: Number.isFinite(p.stock) ? p.stock : 99,
      qty: it.quantity || 1,
    };
  });
}

  // ---- Tính toán tiền tệ động ----
  const subtotal = useMemo(
    () => items.reduce((s, it) => s + it.price * (it.qty || 1), 0),
    [items]
  );
  const discount = useMemo(() => {
    if (!couponApplied) return 0;
    if (couponApplied.type === "percent") return Math.round(subtotal * couponApplied.value);
    return couponApplied.value;
  }, [couponApplied, subtotal]);
  const total = Math.max(0, subtotal - discount);
  const shipProgress = Math.min(100, Math.round((total / FREE_SHIP_THRESHOLD) * 100));
  const shipRemain = Math.max(0, FREE_SHIP_THRESHOLD - total);

  // ---- Handlers (optimistic updates) ----
  const setQtyLocal = (id, q) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: Math.max(1, Math.min(q, it.stock || 99)) } : it))
    );
  };

  const updateQty = async (id, quantity) => {
  const prev = items.find((i) => i.id === id);
  const nextQty = Math.max(1, Math.min(quantity, prev?.stock || 99));
  if (!prev || prev.qty === nextQty) return;

  setUpdatingId(id);
  setQtyLocal(id, nextQty); // optimistic
  try {
    await CartService.updateItem({
      productId: prev.productId,
      quantity: nextQty,
      weight: prev.weight,
      userId: DEMO_USER_ID || undefined,
    });
  } catch (e) {
    console.error(e);
    setQtyLocal(id, prev.qty); // rollback
    alert(e?.message || "Cập nhật số lượng thất bại");
  } finally {
    setUpdatingId(null);
  }
};

  const inc = (id) => {
    const it = items.find((i) => i.id === id);
    updateQty(id, (it?.qty || 1) + 1);
  };
  const dec = (id) => {
    const it = items.find((i) => i.id === id);
    updateQty(id, (it?.qty || 1) - 1);
  };

  const removeItem = async (id) => {
  const prevList = items;
  const target = items.find((it) => it.id === id);
  setItems((p) => p.filter((it) => it.id !== id)); // optimistic
  try {
    if (!target) throw new Error("Không tìm thấy sản phẩm trong giỏ");
    await CartService.removeItem({
      productId: target.productId,
      weight: target.weight,
      userId: DEMO_USER_ID || undefined,
    });
  } catch (e) {
    console.error(e);
    setItems(prevList); // rollback
    alert(e?.message || "Xóa sản phẩm thất bại");
  }
};

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return setCouponApplied(null);
    if (code === "SUNI10") setCouponApplied({ code, type: "percent", value: 0.1 });
    else if (code === "SAVE20K") setCouponApplied({ code, type: "amount", value: 20000 });
    else setCouponApplied(null);
  };

  const handlePayment = () => {
    // Chuyển đến trang thanh toán với các thông tin cần thiết
    navigate("/payment", { state: { items, subtotal, discount, total, note, coupon: couponApplied } });
  }

  const continueShopping = () => navigate("/");

  // ---- Empty state ----
  if (!loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
            <Link to="/" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium">Giỏ hàng</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 grid place-content-center mb-4">
            <CartIcon />
          </div>
          <h1 className="text-2xl font-bold mb-1">Giỏ hàng trống</h1>
          <p className="text-gray-500 mb-6">Hãy thêm vài sản phẩm yêu thích để bắt đầu nhé!</p>
          <Button onClick={continueShopping} className="h-11 px-6 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
            Mua sắm ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
          <Link to="/" className="hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Trang chủ
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="font-medium">Giỏ hàng ({items.length})</span>
        </div>
      </div>

      {/* Title banner */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="mt-6 rounded-xl bg-lime-200/50 text-center py-5">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-wide text-custom-green">
            GIỎ HÀNG CỦA BẠN
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: items + notes + policies */}
        <div className="lg:col-span-2 space-y-4">
          {/* Hint bar */}
          <div className="rounded-full bg-lime-200/50 text-emerald-900 px-4 py-2 text-sm">
            {loading ? "Đang tải giỏ hàng..." : <>Bạn đang có <b>{items.length}</b> sản phẩm trong giỏ hàng</>}
          </div>

          {/* List items */}
          <div className="divide-y rounded-xl border bg-white">
            {items.map((it) => (
              <div key={it.id} className="p-4 sm:p-5 flex gap-3 sm:gap-4 items-start">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-50 border shrink-0">
                  <img src={it.image || "/placeholder.svg"} alt={it.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-snug line-clamp-2">{it.name}</h3>
                      <div className="mt-1 text-xs sm:text-sm text-gray-500">Cân nặng: {it.weight}</div>
                    </div>
                    <button
                      onClick={() => removeItem(it.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Xóa sản phẩm"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Qty + price row */}
                  <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center rounded-full border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-l-full"
                        onClick={() => dec(it.id)}
                        disabled={updatingId === it.id || (it.qty || 1) <= 1}
                        aria-label="Giảm số lượng"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-4 min-w-[44px] text-center font-medium">
                        {updatingId === it.id ? "…" : (it.qty || 1)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-r-full"
                        onClick={() => inc(it.id)}
                        disabled={updatingId === it.id || (it.qty || 1) >= (it.stock || 99)}
                        aria-label="Tăng số lượng"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <div className="text-emerald-700 font-extrabold">
                        {it.weight === "1KG" ? formatVND(it.price * (it.qty || 1)) : `${formatVND(it.price*0.5 * (it.qty || 1))}`}
                      </div>
                      <button
                        onClick={() => removeItem(it.id)}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT: order summary */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* Summary Card */}
            <div className="rounded-xl border bg-white overflow-hidden">
              <div className="px-4 py-3 bg-emerald-50/80 border-b font-semibold text-emerald-900">
                Thông tin đơn hàng
              </div>
              {/* Totals */}
              <div className="px-4 py-3 border-t space-y-1 text-sm">
                <Row label="Tạm tính" value={formatVND(subtotal)} />
                <Row
                  label="Giảm giá"
                  value={discount > 0 ? `- ${formatVND(discount)}` : formatVND(0)}
                />
                <Row label="Phí vận chuyển" value="Tính ở bước thanh toán" />
              </div>

              <div className="px-4 py-3 border-t flex items-center justify-between">
                <span className="font-semibold">Tổng tiền</span>
                <span className="text-emerald-700 text-xl font-extrabold">{formatVND(total)}</span>
              </div>

              <div className="px-4 pb-4">
                <Button
                  onClick ={ () => handlePayment() }
                className="w-full h-12 rounded-lg bg-custom-green text-white hover:bg-emerald-800">
                  THANH TOÁN
                </Button>
                <button
                  onClick={continueShopping}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-emerald-700"
                >
                  <ChevronLeftSmall /> Tiếp tục mua hàng
                </button>
              </div>
            </div>

            {/* Mobile collapse (optional) */}
            <details className="lg:hidden rounded-xl border bg-white p-4 group">
              <summary className="list-none flex items-center justify-between cursor-pointer">
                <span className="font-medium">Câu hỏi thường gặp</span>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3 text-sm text-gray-600 space-y-2">
                <p>• Thời gian giao hàng dự kiến 2–4 giờ trong nội thành.</p>
                <p>• Đổi trả 1-đổi-1 trong vòng 24h nếu hàng hư hỏng.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
function PolicyItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-emerald-600">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
function ChevronLeftSmall() {
  return <svg width="16" height="16" viewBox="0 0 24 24" className="fill-current"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>;
}
function CartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" className="text-emerald-600">
      <path fill="currentColor" d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2m10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2M7.17 14h9.66c.75 0 1.41-.41 1.75-1.03L21.82 7H6.21l-.94-2H2v2h2l3.6 7.59L6.25 17c-.14.23-.25.49-.25.78 0 .83.67 1.5 1.5 1.5H20v-2H7l1.1-2h8.57c.55 0 1.05-.3 1.3-.78L21 9H7.42z"/>
    </svg>
  );
}
