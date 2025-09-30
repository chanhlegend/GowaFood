import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { OrderStatusBadge } from "@/components/order-status-badge";
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
  BadgeDollarSign
} from "lucide-react";
import OrderService from "@/services/orderService";

// ===== Helpers =====
const formatVND = (n) => (n || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ";
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

// Back-end enum uses UPPERCASE: PENDING | SHIPPING | DELIVERED
// Map to UI label/icon/background
const STATUS = {
  PENDING:   { label: "Chờ xử lý",  icon: Package,    bg: "bg-yellow-50" },
  SHIPPING:  { label: "Đang giao",   icon: Truck,      bg: "bg-blue-50" },
  DELIVERED: { label: "Đã giao",     icon: CheckCircle,bg: "bg-green-50" },
  CANCELLED: { label: "Đã hủy",      icon: X,          bg: "bg-red-50" }, // đề phòng BE có trạng thái hủy
};

// Build timeline from status & timestamps if BE chưa cung cấp timeline
function buildTimeline(status, createdAt) {
  const now = new Date();
  const steps = [
    { status: "PENDING",   label: "Đơn hàng được tạo",     time: createdAt, completed: true },
    { status: "SHIPPING",  label: "Đang chuẩn bị / giao",  time: null,      completed: status !== "PENDING" },
    { status: "DELIVERED", label: "Giao hàng thành công",  time: null,      completed: status === "DELIVERED" },
  ];
  // If cancelled, mark all after PENDING as not completed
  if (status === "CANCELLED") {
    steps[1].completed = false; steps[2].completed = false;
  }
  return steps;
}

export default function OrderDetailPage() {
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

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

          // Normalize fields from OrderSchema
          const normalized = {
            id: o.id || o._id || orderId,
            status,
            createdAt,
            updatedAt: o.updatedAt,

            // Payment
            payment: {
              method: o.payment?.method || "COD",
              bankTransferNote: o.payment?.bankTransferNote || null,
            },

            // Shipping
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

            // Discount & Amounts
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

            // Products
            products: Array.isArray(o.products) ? o.products.map((p) => {
              // p.product may be id or populated doc
              const prod = p.product || {};
              const prodId = prod._id || prod.id || p.product;
              const name = prod.name || "Sản phẩm";
              const image = prod.images?.[0]?.url || prod.image || "/placeholder.svg";
              return {
                id: `${prodId}:${p.weight || '1KG'}`,
                productId: prodId,
                name,
                image,
                quantity: p.quantity || 0,
                price: p.price || 0,
                weight: p.weight || "1KG",
                unit: p.weight || "1KG",
              };
            }) : [],

            // Misc
            notes: o.notes || "",
            timeline: o.timeline || buildTimeline(status, createdAt),

            // Optional customer snapshot (populate user on BE if muốn)
            customer: {
              name: o.shipping?.address?.name || o.customerName || "",
              phone: o.shipping?.address?.phone || o.customerPhone || "",
              email: o.customerEmail || "",
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
    return () => { mounted = false; };
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      const res = await OrderService.cancelOrder(order.id, userId);
      if (res?.success) {
        setOrder((prev) => prev ? { ...prev, status: "CANCELLED" } : prev);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-muted-foreground mb-4">{loadError || `Đơn hàng ${orderId} không tồn tại`}</p>
          <Button onClick={() => navigate("/orders")}>Quay lại danh sách đơn hàng</Button>
        </div>
      </div>
    );
  }

  const cfg = STATUS[order.status] || STATUS.PENDING;
  const StatusIcon = cfg.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/orders")}> 
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </Button>
            <div className="flex-1 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${cfg.bg}`}>
                <StatusIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Đơn hàng {order.id}</h1>
                {order.createdAt && (
                  <p className="text-muted-foreground">Đặt lúc {formatDateTime(order.createdAt)}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} showPulse={order.status === "SHIPPING"} />
              {order.status === "PENDING" && (
                <Button variant="outline" className="text-destructive" onClick={() => setShowCancelDialog(true)}>
                  <X className="w-4 h-4 mr-2" /> Hủy đơn hàng
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Timeline + Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.timeline.map((step, idx) => {
                    const sc = STATUS[step.status] || STATUS.PENDING;
                    const Icon = sc.icon;
                    return (
                      <div key={idx} className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${step.completed ? sc.bg : "bg-muted"}`}>
                          <Icon className={`w-4 h-4 ${step.completed ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                          {step.time && (
                            <p className="text-sm text-muted-foreground">{formatDateTime(step.time)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Sản phẩm đã đặt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(order.products || []).map((item, index) => (
                    <div key={item.id || index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.quantity}x {item.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatVND((item.price || 0) * (item.quantity || 0))}</p>
                        {item.price ? (
                          <p className="text-sm text-muted-foreground">{formatVND(item.price)} / {item.unit}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Customer + Payment + Summary */}
          <div className="space-y-6">
            {/* Customer & Address */}
            <Card className="top-8">
              <CardHeader>
                <CardTitle>Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Phone className="w-4 h-4 text-primary" /></div>
                  <div>
                    <p className="font-medium">{order.customer?.name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer?.phone}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg mt-1"><MapPin className="w-4 h-4 text-primary" /></div>
                  <div>
                    <p className="font-medium">Địa chỉ giao hàng</p>
                    <p className="text-sm text-muted-foreground">
                      {order.shipping?.address?.address}
                      {order.shipping?.address?.ward ? ", " + order.shipping.address.ward : ""}
                      {order.shipping?.address?.city ? ", " + order.shipping.address.city : ""}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Calendar className="w-4 h-4 text-primary" /></div>
                  <div>
                    <p className="font-medium">Ngày đặt</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                  </div>
                </div>
                {order.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-medium mb-2">Ghi chú</p>
                      <p className="text-sm text-muted-foreground">{order.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment & Points */}
            <Card>
              <CardHeader>
                <CardTitle>Thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Phương thức</span>
                  <span className="font-medium">{order.payment?.method}</span>
                </div>
                {order.payment?.method === "BANK" && order.payment?.bankTransferNote && (
                  <div className="text-sm text-muted-foreground">
                    Ghi chú chuyển khoản: <span className="font-medium">{order.payment.bankTransferNote}</span>
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Percent className="w-4 h-4" /> Tỷ lệ quy đổi điểm
                    </div>
                    <span className="font-medium">{pointsInfo.percent}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BadgeDollarSign className="w-4 h-4" /> Điểm đã dùng
                    </div>
                    <span className="font-medium">{pointsInfo.used}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Giảm từ điểm</span>
                    <span className="font-medium">- {formatVND(pointsInfo.saved)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tổng kết đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{formatVND(order.amounts?.rawSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tạm tính sau điểm</span>
                  <span>{formatVND(order.amounts?.subtotalAfterPoints)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giảm từ điểm</span>
                  <span>- {formatVND(order.discount?.discountFromPoints)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatVND(order.amounts?.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Xác nhận hủy đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Bạn có chắc chắn muốn hủy đơn hàng {order.id}? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isCancelling}>Không</Button>
                <Button variant="destructive" onClick={handleCancelOrder} disabled={isCancelling}>
                  {isCancelling ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" /> Đang hủy...
                    </div>
                  ) : (
                    "Hủy đơn hàng"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
