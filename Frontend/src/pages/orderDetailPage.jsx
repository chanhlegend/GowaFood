"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Truck, CheckCircle, Phone, MapPin, Calendar, X } from "lucide-react";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import OrderService from "@/services/orderService";

const statusConfig = {
  pending: { label: "Chờ xử lý", icon: Package, bgColor: "bg-yellow-50" },
  shipping: { label: "Đang giao", icon: Truck, bgColor: "bg-blue-50" },
  delivered: { label: "Đã giao", icon: CheckCircle, bgColor: "bg-green-50" },
  cancelled: { label: "Đã hủy", icon: X, bgColor: "bg-red-50" },
};

export default function OrderDetailPage() {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Lấy userId tạm từ localStorage (tùy dự án có thể thay bằng auth context)
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const res = await OrderService.getOrderDetail(orderId);
      if (!mounted) return;
      if (res.success) {
        const o = res.data || {};
        const normalized = {
          id: o.id || o._id || o.code || orderId,
          customerName: o.customerName || o.customer?.name || "",
          customerPhone: o.customerPhone || o.customer?.phone || "",
          customerEmail: o.customerEmail || o.customer?.email || "",
          items: o.items || [],
          subtotal: o.subtotal ?? o.pricing?.subtotal ?? 0,
          shippingFee: o.shippingFee ?? o.pricing?.shippingFee ?? 0,
          total: o.total ?? o.pricing?.total ?? 0,
          status: o.status || "pending",
          orderDate: o.orderDate || o.createdAt,
          estimatedDelivery: o.estimatedDelivery,
          address: o.address || { full: o.shippingAddress?.full || "" },
          notes: o.notes || "",
          timeline:
            o.timeline ||
            [
              { status: "pending", label: "Đơn hàng được tạo", time: o.orderDate || o.createdAt, completed: true },
              { status: "shipping", label: "Đang chuẩn bị hàng", time: null, completed: o.status !== "pending" },
              { status: "delivered", label: "Giao hàng thành công", time: null, completed: o.status === "delivered" },
            ],
        };
        setOrder(normalized);
      } else {
        setLoadError(res.message || "Không thể tải chi tiết đơn hàng");
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [orderId]);

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

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    const res = await OrderService.cancelOrder(order.id, userId);
    if (res?.success) {
      setOrder((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
    }
    setShowCancelDialog(false);
    setIsCancelling(false);
  };

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
        <div className="text-center animate-in fade-in-50 duration-500">
          <h2 className="text-2xl font-bold text-foreground mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-muted-foreground mb-4">{loadError || `Đơn hàng ${orderId} không tồn tại`}</p>
          <Link href="/orders">
            <Button className="transition-all duration-200 hover:scale-105">Quay lại danh sách đơn hàng</Button>
          </Link>
        </div>
      </div>
    );
  }

  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 animate-in slide-in-from-left-5 duration-500">
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="transition-all duration-200 hover:scale-105">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.bgColor} transition-all duration-200 hover:scale-110`}>
                  <StatusIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Đơn hàng {order.id}</h1>
                  {order.orderDate && <p className="text-muted-foreground">Đặt lúc {formatDateTime(order.orderDate)}</p>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 animate-in slide-in-from-right-5 duration-500">
              <OrderStatusBadge status={order.status} showPulse={order.status === "shipping"} />
              {order.status === "pending" && (
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive transition-all duration-200 hover:scale-105 bg-transparent"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Hủy đơn hàng
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <Card className="animate-in slide-in-from-bottom-5 duration-500">
              <CardHeader>
                <CardTitle>Trạng thái đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.timeline.map((step, index) => {
                    const stepCfg = statusConfig[step.status] || statusConfig.pending;
                    const StepIcon = stepCfg.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 animate-in slide-in-from-left-3 duration-300"
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        <div
                          className={`p-2 rounded-full transition-all duration-300 ${
                            step.completed ? `${stepCfg.bgColor} scale-110` : "bg-muted hover:scale-105"
                          }`}
                        >
                          <StepIcon
                            className={`w-4 h-4 transition-colors duration-200 ${
                              step.completed ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-medium transition-colors duration-200 ${
                              step.completed ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </p>
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

            {/* Order Items */}
            <Card className="animate-in slide-in-from-bottom-5 duration-700">
              <CardHeader>
                <CardTitle>Sản phẩm đã đặt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(order.items || []).map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-bottom-3"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg transition-transform duration-200 hover:scale-110"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity}x {item.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium animate-pulse">
                          {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")}đ
                        </p>
                        {item.price ? (
                          <p className="text-sm text-muted-foreground">
                            {item.price.toLocaleString("vi-VN")}đ/{item.unit}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="animate-in slide-in-from-right-5 duration-500 sticky top-8">
              <CardHeader>
                <CardTitle>Thông tin khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 animate-in slide-in-from-right-3 duration-300">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3 animate-in slide-in-from-right-3 duration-500">
                  <div className="p-2 bg-primary/10 rounded-lg mt-1">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Địa chỉ giao hàng</p>
                    <p className="text-sm text-muted-foreground">{order.address?.full || order.address}</p>
                  </div>
                </div>

                <Separator />

                {order.estimatedDelivery && (
                  <div className="flex items-center gap-3 animate-in slide-in-from-right-3 duration-700">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Dự kiến giao hàng</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.estimatedDelivery).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                )}

                {order.notes ? (
                  <>
                    <Separator />
                    <div className="animate-in slide-in-from-right-3 duration-900">
                      <p className="font-medium mb-2">Ghi chú</p>
                      <p className="text-sm text-muted-foreground">{order.notes}</p>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="animate-in slide-in-from-right-5 duration-700">
              <CardHeader>
                <CardTitle>Tổng kết đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{(order.subtotal || 0).toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng</span>
                  <span>{(order.shippingFee || 0).toLocaleString("vi-VN")}đ</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-primary animate-pulse">
                    {(order.total || 0).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in-0 duration-300">
          <Card className="w-full max-w-md mx-4 animate-in zoom-in-95 duration-300">
            <CardHeader>
              <CardTitle>Xác nhận hủy đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Bạn có chắc chắn muốn hủy đơn hàng {order.id}? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelDialog(false)}
                  disabled={isCancelling}
                  className="transition-all duration-200 hover:scale-105"
                >
                  Không
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="transition-all duration-200 hover:scale-105"
                >
                  {isCancelling ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Đang hủy...
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
