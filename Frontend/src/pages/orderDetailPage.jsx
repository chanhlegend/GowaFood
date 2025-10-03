// src/pages/OrderDetailPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Phone,
  MapPin,
  Calendar,
  X,
  Percent,
  BadgeDollarSign,
} from "lucide-react";
import OrderService from "@/services/orderService";
import { UserService } from "../services/userService";
import { toast } from "sonner";

// ===== Helpers =====
const formatVND = (n) =>
  (n || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ";

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Back-end enum uses UPPERCASE: PENDING | SHIPPING | DELIVERED | CANCELLED
const STATUS = {
  PENDING: { label: "Chờ xử lý", icon: Package, bg: "bg-yellow-50" },
  SHIPPING: { label: "Đang giao", icon: Truck, bg: "bg-blue-50" },
  DELIVERED: { label: "Đã giao", icon: CheckCircle, bg: "bg-green-50" },
  CANCELLED: { label: "Đã hủy", icon: X, bg: "bg-red-50" },
};

// Build timeline if BE chưa cung cấp
function buildTimeline(status, createdAt) {
  const steps = [
    {
      status: "PENDING",
      label: "Đơn hàng được tạo",
      time: createdAt,
      completed: true,
    },
    {
      status: "SHIPPING",
      label: "Đang chuẩn bị / giao",
      time: null,
      completed: status !== "PENDING",
    },
    {
      status: "DELIVERED",
      label: "Giao hàng thành công",
      time: null,
      completed: status === "DELIVERED",
    },
  ];
  if (status === "CANCELLED") {
    steps[1].completed = false;
    steps[2].completed = false;
  }
  return steps;
}

// ===== Tiny local UI bits (không dùng components nội bộ) =====
function Spinner({ size = 24, className = "" }) {
  const borderWidth = Math.max(2, Math.round(size / 12));
  return (
    <span
      className={`inline-block rounded-full animate-spin border-solid border-neutral-300 border-t-green-600 ${className}`}
      style={{ width: size, height: size, borderWidth }}
      aria-label="loading"
      role="status"
    />
  );
}

function StatusPill({ status }) {
  const map = {
    PENDING: { label: "Đang chờ", cls: "bg-yellow-100 text-yellow-800" },
    SHIPPING: { label: "Đang giao", cls: "bg-blue-100 text-blue-800" },
    DELIVERED: { label: "Đã giao", cls: "bg-green-100 text-green-800" },
    CANCELLED: { label: "Đã hủy", cls: "bg-red-100 text-red-800" },
  };
  const it = map[status] || map.PENDING;
  return (
    <span
      className={`inline-block px-4 py-2 rounded-full text-[11px] sm:text-xs font-semibold ${it.cls}`}
    >
      {it.label}
    </span>
  );
}

function SectionCard({ title, right, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-neutral-200 bg-white shadow-sm ${className}`}
    >
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-neutral-200 flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        {right}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

const Divider = () => <div className="h-px bg-neutral-200" />;

export default function OrderDetailPage() {
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const user = JSON.parse(localStorage.getItem("user_gowa") || "{}");
  const userId = user?.id || user?._id;

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await OrderService.getOrderDetail(orderId);
        if (!mounted) return;
        if (res?.success) {
          const o = res.data || {};
          const status = (o.status || "PENDING").toUpperCase();
          const createdAt = o.createdAt || o.orderDate;

          const normalized = {
            id: o.id || o._id || orderId,
            status,
            createdAt,
            updatedAt: o.updatedAt,

            payment: {
              method: o.payment?.method || "COD",
              bankTransferNote: o.payment?.bankTransferNote || null,
            },

            shipping: {
              method: o.shipping?.method || "STORE",
              address: {
                name: o.shipping?.address?.name || "",
                phone: o.shipping?.address?.phone || "",
                address: o.shipping?.address?.address || "",
                ward: o.shipping?.address?.ward || "",
                city: o.shipping?.address?.city || "",
              },
            },

            discount: {
              pointsUsed: o.discount?.pointsUsed ?? 0,
              pointsPercent: o.discount?.pointsPercent ?? 0,
              discountFromPoints: o.discount?.discountFromPoints ?? 0,
            },
            amounts: {
              rawSubtotal: o.amounts?.rawSubtotal ?? 0,
              subtotalAfterPoints: o.amounts?.subtotalAfterPoints ?? 0,
              total: o.amounts?.total ?? 0,
            },

            products: Array.isArray(o.products)
              ? o.products.map((p) => {
                  const prod = p.product || {};
                  const prodId = prod._id || prod.id || p.product;
                  const name = prod.name || "Sản phẩm";
                  const image =
                    prod.images?.[0]?.url || prod.image || "/placeholder.svg";
                  return {
                    id: `${prodId}:${p.weight || "1KG"}`,
                    productId: prodId,
                    name,
                    image,
                    quantity: p.quantity || 0,
                    price: p.price || 0,
                    weight: p.weight || "1KG",
                    unit: p.weight || "1KG",
                  };
                })
              : [],

            notes: o.notes || "",
            timeline: o.timeline || buildTimeline(status, createdAt),

            customer: {
              name: o.shipping?.address?.name || o.user?.name || "",
              phone: o.shipping?.address?.phone || o.user?.phone || "",
              email: o.user?.email || "",
            },
          };

          setOrder(normalized);
        } else {
          setLoadError(res?.message || "Không thể tải chi tiết đơn hàng");
        }
      } catch (err) {
        console.error(err);
        setLoadError(err?.message || "Lỗi khi tải chi tiết đơn hàng");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      const res = await OrderService.cancelOrder(order.id);

      if (res?.success) {
        setOrder((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
        const pointsToRestore = order.discount?.pointsUsed || 0;
        // Lấy số tiền ban đầu chia cho 1000 để ra số điểm
        const orderTotal = order.amounts?.total || 0;
        const pointsFromMoney = Math.floor(orderTotal / 1000);
        const newPoints = pointsToRestore - pointsFromMoney;
        console.log(
          "Points to restore:",
          pointsToRestore,
          "Points from money:",
          pointsFromMoney,
          "New points balance:",
          newPoints
        );
        await UserService.updateRewardPoints(userId, newPoints);
        toast.success("Hủy đơn hàng thành công");
        // Cập nhật điểm thưởng cho user
      }
    } catch (e) {
      console.error(e);
    } finally {
      setShowCancelDialog(false);
      setIsCancelling(false);
    }
  };

  const pointsInfo = useMemo(() => {
    const used = order?.discount?.pointsUsed || 0;
    const percent = order?.discount?.pointsPercent || 0;
    const saved = order?.discount?.discountFromPoints || 0;
    return { used, percent, saved };
  }, [order]);

  // ===== Loading & Error =====
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-600">
          <Spinner size={28} />
          <span>Đang tải chi tiết đơn hàng...</span>
        </div>
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-neutral-500 mb-4">
            {loadError || `Đơn hàng ${orderId} không tồn tại`}
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="h-11 px-4 rounded-xl bg-green-700 text-white hover:bg-green-800 inline-flex items-center justify-center w-full sm:w-auto"
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  const cfg = STATUS[order.status] || STATUS.PENDING;
  const StatusIcon = cfg.icon;

  return (
    <div className="min-h-screen bg-neutral-50 pb-[env(safe-area-inset-bottom)]">
      {/* Header */}
      <div className="border-b bg-white/90 backdrop-blur sticky top-0 z-10 pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <button
            onClick={() => navigate("/orders")}
            className="h-10 px-3 mb-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </button>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${cfg.bg}`}>
                <StatusIcon className="w-6 h-6 text-green-700" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-sm lg:text-xl font-bold ">
                  Đơn hàng {order.id}
                </h1>
                {order.createdAt && (
                  <p className="text-neutral-500">
                    Đặt lúc {formatDateTime(order.createdAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 ml-auto mt-4">
            <StatusPill status={order.status} />
            {order.status === "PENDING" && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="h-10 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 w-full sm:w-auto"
              >
                <span className="inline-flex items-center">
                  <X className="w-4 h-4 mr-2" /> Hủy đơn hàng
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <SectionCard title="Trạng thái đơn hàng">
              <div className="space-y-3 sm:space-y-4">
                {order.timeline.map((step, idx) => {
                  const sc = STATUS[step.status] || STATUS.PENDING;
                  const Icon = sc.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3 sm:gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          step.completed ? sc.bg : "bg-neutral-100"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            step.completed
                              ? "text-green-700"
                              : "text-neutral-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            step.completed
                              ? "text-neutral-900"
                              : "text-neutral-500"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.time && (
                          <p className="text-xs sm:text-sm text-neutral-500">
                            {formatDateTime(step.time)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* Items */}
            <SectionCard title="Sản phẩm đã đặt">
              <div className="space-y-3 sm:space-y-4">
                {(order.products || []).map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-xl bg-white"
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[15px] sm:text-base line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        {item.quantity}x {item.unit}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">
                        {formatVND((item.price || 0) * (item.quantity || 0))}
                      </p>
                      {item.price ? (
                        <p className="text-xs sm:text-sm text-neutral-500">
                          {formatVND(item.price)} / {item.unit}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Right */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            {/* Customer & Address */}
            <SectionCard title="Thông tin khách hàng" className="top-0">
              <div className="space-y-4 text-sm sm:text-base">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Phone className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <p className="font-medium">{order.customer?.name}</p>
                    <p className="text-neutral-500">{order.customer?.phone}</p>
                  </div>
                </div>

                <Divider />

                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="p-2 bg-green-50 rounded-lg mt-0.5">
                    <MapPin className="w-4 h-4 text-green-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">Địa chỉ giao hàng</p>
                    <p className="text-neutral-600 break-words">
                      {order.shipping?.address?.address
                        ? order.shipping?.address?.address
                        : "Nhận tại cửa hàng"}
                      {order.shipping?.address?.ward
                        ? `, ${order.shipping.address.ward}`
                        : ""}
                      {order.shipping?.address?.city
                        ? `, ${order.shipping.address.city}`
                        : ""}
                    </p>
                  </div>
                </div>

                <Divider />

                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-green-700" />
                  </div>
                  <div>
                    <p className="font-medium">Ngày đặt</p>
                    <p className="text-neutral-600">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                </div>

                {order.notes && (
                  <>
                    <Divider />
                    <div>
                      <p className="font-medium mb-2">Ghi chú</p>
                      <p className="text-neutral-600 whitespace-pre-line">
                        {order.notes}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </SectionCard>

            {/* Payment & Points */}
            <SectionCard title="Thanh toán">
              <div className="space-y-3">
                <div className="flex justify-between gap-3">
                  <span className="text-neutral-600">Phương thức</span>
                  <span className="font-medium text-right">
                    {order.payment?.method}
                  </span>
                </div>

                {order.payment?.method === "BANK" &&
                  order.payment?.bankTransferNote && (
                    <div className="text-sm text-neutral-500">
                      Ghi chú chuyển khoản:{" "}
                      <span className="font-medium text-neutral-700">
                        {order.payment.bankTransferNote}
                      </span>
                    </div>
                  )}

                <Divider />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <Percent className="w-4 h-4" /> Tỷ lệ quy đổi điểm
                    </div>
                    <span className="font-medium">{pointsInfo.percent}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <BadgeDollarSign className="w-4 h-4" /> Điểm đã dùng
                    </div>
                    <span className="font-medium">{pointsInfo.used}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">
                      Giảm từ điểm
                    </span>
                    <span className="font-medium">
                      - {formatVND(pointsInfo.saved)}
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Summary */}
            <SectionCard title="Tổng kết đơn hàng">
              <div className="space-y-3">
                <div className="flex justify-between gap-3">
                  <span className="text-neutral-600">Tạm tính</span>
                  <span className="text-neutral-800">
                    {formatVND(order.amounts?.rawSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-neutral-600">Tạm tính sau điểm</span>
                  <span className="text-neutral-800">
                    {formatVND(order.amounts?.subtotalAfterPoints)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-neutral-600">Giảm từ điểm</span>
                  <span className="text-neutral-800">
                    - {formatVND(order.discount?.discountFromPoints)}
                  </span>
                </div>

                <Divider />

                <div className="flex justify-between font-bold text-base sm:text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-green-700">
                    {formatVND(order.amounts?.total)}
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Cancel Dialog (custom) */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-3">
          <div className="w-full max-w-md rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-xl">
            <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-neutral-200">
              <h3 className="text-base sm:text-lg font-semibold">
                Xác nhận hủy đơn hàng
              </h3>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-neutral-600 mb-5">
                Bạn có chắc chắn muốn hủy đơn hàng{" "}
                <span className="font-semibold">{order.id}</span>? Hành động này
                không thể hoàn tác.
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end">
                <button
                  onClick={() => setShowCancelDialog(false)}
                  disabled={isCancelling}
                  className="h-11 sm:h-10 px-4 rounded-xl border border-neutral-300 hover:bg-neutral-100"
                >
                  Không
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="h-11 sm:h-10 px-4 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-70"
                >
                  {isCancelling ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner size={16} /> Đang hủy...
                    </span>
                  ) : (
                    "Hủy đơn hàng"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
