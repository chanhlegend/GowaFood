import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { UserService } from "../services/userService";

/**
 * PaymentPage – polished UI/UX
 * - Responsive two-column layout with a sticky Order Summary
 * - Safer item math (supports {quantity|qty} & {unitPrice|price})
 * - Clear points + coupon flow, single source of truth for total
 * - Subtle shadows, rounded corners, consistent spacing
 */

/* ==== Minimal CSS for the range slider (kept tidy) ==== */


const Pill = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "px-3 py-2 rounded-2xl text-sm font-medium transition-all border",
      active
        ? "bg-black text-white border-black shadow-sm"
        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
    ].join(" ")}
  >
    {children}
  </button>
);

const Card = ({ title, right, children, className }) => (
  <section className={`bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl p-5 ${className || ""}`}>
    <header className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-base md:text-lg font-semibold tracking-tight">{title}</h2>
      {right}
    </header>
    {children}
  </section>
);

const Divider = () => <div className="h-px w-full bg-gray-100" />;

const formatVND = (n = 0) => Number(n).toLocaleString("vi-VN") + "₫";

const PaymentPage = () => {
  const location = useLocation();
  const {
    items: stateItems,
    subtotal: stateSubtotal,
    discount: stateDiscount,
    total: stateTotal,
    note: stateNote,
    coupon: stateCoupon
  } = location.state || {};

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD | BANK
  const [shippingMethod, setShippingMethod] = useState("STORE"); // STORE | HOME

  const [coupon, setCoupon] = useState(stateCoupon || "");
  const [couponDiscount, setCouponDiscount] = useState(Number(stateDiscount) || 0);
  const [pointsToUse, setPointsToUse] = useState(0); // raw points (e.g. 120)
  const [note, setNote] = useState(stateNote || "");

  // Try to read cached user from localStorage
  const userData = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user_gowa")); } catch { return null; }
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (userData && userData._id) {
          const userInfo = await UserService.getUserInfo(userData._id);
          setUser(userInfo);
          setAddresses(userInfo.addresses || []);
          const defIdx = (userInfo.addresses || []).findIndex((a) => a.isDefault);
          setSelectedAddressIdx(defIdx >= 0 ? defIdx : 0);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, [userData]);

  /* ===== Items & math safety ===== */
  const items = useMemo(() => (Array.isArray(stateItems) ? stateItems : []), [stateItems]);

  const normalizedItems = useMemo(() => {
    return items.map((it) => {
      const qty = Number(it.quantity ?? it.qty ?? 1);
      const unitPrice = Number(it.unitPrice ?? it.price ?? 0);
      const name = it.name || it.title || "Sản phẩm";
      const unit = it.unit || "";
      const lineTotal = unitPrice * qty;
      return { name, qty, unit, unitPrice, lineTotal, raw: it };
    });
  }, [items]);

  const rawSubtotal = useMemo(() => {
    if (typeof stateSubtotal === "number") return stateSubtotal;
    return normalizedItems.reduce((s, it) => s + it.lineTotal, 0);
  }, [normalizedItems, stateSubtotal]);

  /* ===== Rewards & discounts ===== */
  const availablePoints = user?.points ?? 100;
  const percentFromPoints = Math.floor(pointsToUse / 10); // 10 điểm = 1%
  const maxPercentFromPoints = Math.min(100, Math.floor(availablePoints / 10));
  const discountFromPoints = Math.floor((rawSubtotal * percentFromPoints) / 100);

  const subtotalAfterPoints = Math.max(0, rawSubtotal - discountFromPoints);
  const effectiveCoupon = Math.min(subtotalAfterPoints, couponDiscount || 0);
  const computedTotal = Math.max(0, typeof stateTotal === "number" ? stateTotal : subtotalAfterPoints - effectiveCoupon);

  const applyCoupon = () => {
    // Demo: if any code typed, apply fixed 20k. Replace with API validation.
    setCouponDiscount(coupon ? 20000 : 0);
  };

  /* ===== Handlers ===== */
  const handlePointsInput = (val10Step) => {
    let val = Number(val10Step);
    if (isNaN(val) || val < 0) val = 0;
    const calculatedPoints = Math.round(val * 10); // each 1 = 10 points
    if (calculatedPoints > availablePoints) return; // silently clamp in the UI below
    setPointsToUse(calculatedPoints);
  };

  const pointsPercentSlider = Math.min(percentFromPoints, maxPercentFromPoints);

  /* ===== UI ===== */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Thanh toán</h1>
          <p className="text-sm text-gray-500 mt-1">Hoàn tất đơn hàng của bạn chỉ với vài bước.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            {/* User info */}
            <Card title="Thông tin người dùng">
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <p><span className="text-gray-500">Tên:</span> <span className="font-medium">{user?.name || "—"}</span></p>
                <p><span className="text-gray-500">Email:</span> <span className="font-medium">{user?.email || "—"}</span></p>
                <p><span className="text-gray-500">SĐT:</span> <span className="font-medium">{user?.phone || "—"}</span></p>
                <p><span className="text-gray-500">Điểm:</span> <span className="font-semibold">{availablePoints}</span></p>
              </div>
            </Card>

            {/* Shipping method */}
            <Card title="Phương thức nhận hàng">
              <div className="flex flex-wrap gap-2">
                <Pill active={shippingMethod === "STORE"} onClick={() => setShippingMethod("STORE")}>Nhận tại cửa hàng</Pill>
                <Pill active={shippingMethod === "HOME"} onClick={() => setShippingMethod("HOME")}>Giao tận nhà</Pill>
              </div>
            </Card>

            {/* Address selection */}
            {shippingMethod === "HOME" && (
              <Card
                title="Chọn địa chỉ nhận hàng"
                right={<button className="text-sm text-gray-600 hover:text-black transition">+ Thêm địa chỉ</button>}
              >
                {addresses.length ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {addresses.map((addr, idx) => {
                      const active = selectedAddressIdx === idx;
                      return (
                        <label
                          key={idx}
                          className={[
                            "block rounded-xl border p-3 cursor-pointer transition-all",
                            active ? "border-black shadow-sm ring-1 ring-black/5" : "border-gray-200 hover:border-gray-300"
                          ].join(" ")}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              checked={active}
                              onChange={() => setSelectedAddressIdx(idx)}
                              className="mt-1 accent-black"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{addr.name}</span>
                                {addr.isDefault && (
                                  <span className="text-[10px] leading-4 bg-black text-white px-2 py-0.5 rounded">Mặc định</span>
                                )}
                              </div>
                              <div className="ml-0.5 text-sm text-gray-600">
                                <p>SĐT: {addr.phone}</p>
                                <p>
                                  {addr.address}
                                  {addr.ward ? `, ${addr.ward}` : ""}
                                  {addr.city ? `, ${addr.city}` : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Chưa có địa chỉ</p>
                )}
              </Card>
            )}

            {/* Payment method */}
            <Card title="Phương thức thanh toán">
              <div className="flex flex-wrap gap-2">
                <Pill active={paymentMethod === "COD"} onClick={() => setPaymentMethod("COD")}>COD</Pill>
                <Pill active={paymentMethod === "BANK"} onClick={() => setPaymentMethod("BANK")}>Chuyển khoản ngân hàng</Pill>
              </div>
              {paymentMethod === "BANK" && (
                <div className="mt-4 rounded-xl border border-gray-100 p-3 bg-gray-50">
                  <p className="text-sm text-gray-700 font-medium">Thông tin chuyển khoản (ví dụ):</p>
                  <ul className="mt-2 text-sm text-gray-600 space-y-1">
                    <li>Ngân hàng: Vietcombank</li>
                    <li>Chủ TK: CÔNG TY ABC</li>
                    <li>Số TK: 0123 456 789</li>
                    <li>Nội dung: <span className="font-medium">Thanh toan {user?.name || "khach"} #{Date.now().toString().slice(-6)}</span></li>
                  </ul>
                </div>
              )}
            </Card>

            {/* Items */}
            <Card title="Sản phẩm">
              {normalizedItems.length ? (
                <ul className="divide-y divide-gray-100">
                  {normalizedItems.map((it, i) => (
                    <li key={i} className="py-3 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{it.name}</p>
                        <p className="text-sm text-gray-500">SL: {it.qty}{it.unit ? ` / ${it.unit}` : ""}</p>
                      </div>
                      <div className="text-right w-36">
                        <p className="text-sm text-gray-500">Đơn giá</p>
                        <p className="font-medium">{formatVND(it.unitPrice)}</p>
                      </div>
                      <div className="text-right w-40">
                        <p className="text-sm text-gray-500">Thành tiền</p>
                        <p className="font-semibold">{formatVND(it.lineTotal)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Không có sản phẩm</p>
              )}
            </Card>

            {/* Coupon & Points */}
            <Card title="Mã giảm giá & Điểm thưởng">
              {/* Points */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-medium">Dùng điểm</label>
                  <span className="text-sm text-gray-500">(10 điểm = 1%)</span>
                </div>

                {/* Number input: each 1 = 10 points */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm text-gray-700">Nhập số (mỗi 1 = 10 điểm)</label>
                    <input
                      type="number"
                      min={0}
                      max={Math.floor(availablePoints / 10)}
                      step={1}
                      value={Math.floor(pointsToUse / 10)}
                      onChange={(e) => handlePointsInput(e.target.value)}
                      className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-gray-800 shadow-sm transition focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500">Tối đa: {Math.floor(availablePoints / 10)} (tương đương {availablePoints} điểm)</p>
                  </div>

                  {/* Slider mirrors percentage */}
                  <div className="space-y-1">
                    <label className="block text-sm text-gray-700">Hoặc kéo thanh (theo %)</label>
                    <input
                      type="range"
                      min={0}
                      max={maxPercentFromPoints}
                      value={pointsPercentSlider}
                      onChange={(e) => setPointsToUse(Number(e.target.value) * 10)}
                      className="w-full custom-range"
                      style={{
                        // visualize progress
                        ['--progress']: `${(pointsPercentSlider / (maxPercentFromPoints || 1)) * 100}%`,
                      }}
                    />
                    <p className="text-xs text-gray-500">Đang chọn: {pointsPercentSlider}%</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Đang dùng <span className="font-semibold text-indigo-600">{pointsToUse}</span> / {availablePoints} điểm →
                  <span className="font-semibold text-green-600"> {percentFromPoints}%</span>
                  {" "}(<span className="text-red-500">-{formatVND(discountFromPoints)}</span> tính vào tạm tính)
                </p>
              </div>
            </Card>

            {/* Note */}
            <Card title="Ghi chú">
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú cho shop..."
                className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
              />
            </Card>
          </div>

          {/* Right column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-60 space-y-5">
              <Card title="Tổng kết">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between"><span className="text-gray-600">Tạm tính</span><span className="font-medium">{formatVND(rawSubtotal)}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-600">Giảm từ điểm</span><span className="font-medium text-green-600">- {formatVND(discountFromPoints)}</span></div>
                  <Divider />
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-semibold">Tổng thanh toán</span>
                    <span className="font-extrabold">{formatVND(subtotalAfterPoints)}</span>
                  </div>
                </div>
                <button className="mt-4 w-full px-4 py-3 rounded-xl bg-black text-white font-semibold hover:opacity-90 transition">
                  Đặt hàng
                </button>
                <p className="mt-2 text-[11px] text-gray-500">Bằng cách đặt hàng, bạn đồng ý với Điều khoản & Chính sách của chúng tôi.</p>
              </Card>

              <Card title="Câu hỏi thường gặp">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-800 flex items-center justify-between">Điểm thưởng được tính thế nào?<span className="text-gray-400 group-open:rotate-180 transition">▾</span></summary>
                  <p className="mt-2 text-sm text-gray-600">10 điểm tương đương 1% giảm trên tạm tính. Bạn có thể dùng tối đa {maxPercentFromPoints}% (tương đương {availablePoints} điểm).</p>
                </details>
                <Divider />
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-800 flex items-center justify-between">Bao lâu nhận được hàng?<span className="text-gray-400 group-open:rotate-180 transition">▾</span></summary>
                  <p className="mt-2 text-sm text-gray-600">Đơn nội thành 1–2 ngày, tỉnh 2–5 ngày tùy khu vực và phương thức nhận hàng.</p>
                </details>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile bottom bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Tổng thanh toán</p>
            <p className="text-lg font-extrabold">{formatVND(computedTotal)}</p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-black text-white font-semibold">Đặt hàng</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
