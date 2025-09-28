// src/pages/orderListPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

// UI
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import { OrderStatusBadge } from "../components/order-status-badge";

// Icons
import {
    Search,
    Package,
    Truck,
    CheckCircle,
    Plus,
    X,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
} from "lucide-react";

// App
import OrderService from "../services/orderService";
import { ROUTE_PATH } from "../constants/routePath";

const statusConfig = {
    pending: { label: "Chờ xử lý", icon: Package, bgColor: "bg-yellow-50" },
    shipping: { label: "Đang giao", icon: Truck, bgColor: "bg-blue-50" },
    delivered: { label: "Đã giao", icon: CheckCircle, bgColor: "bg-green-50" },
    cancelled: { label: "Đã hủy", icon: X, bgColor: "bg-red-50" },
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function OrderListPage() {
    // filters
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    // data
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    // actions
    const [cancellingOrder, setCancellingOrder] = useState(null);

    // pagination (client-side)
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // ===== fetch orders =====
    useEffect(() => {
        let mounted = true;
        (async () => {
            setIsLoading(true);
            setLoadError("");
            const res = await OrderService.getOrders(); // service tự lấy user từ localStorage
            if (!mounted) return;

            if (res?.success) {
                const list = Array.isArray(res.data) ? res.data : res.data?.orders || [];
                const normalized = list.map((o) => ({
                    id: o.id || o._id || o.code || o.orderId,
                    customerName: o.customerName || o.customer?.name || "",
                    customerPhone: o.customerPhone || o.customer?.phone || "",
                    items: o.items || [],
                    total: o.total ?? o.pricing?.total ?? 0,
                    status: String(o.status || "pending").toLowerCase(),
                    orderDate: o.orderDate || o.createdAt,
                    address:
                        (o.address && (o.address.full || o.address)) ||
                        (o.shippingAddress && (o.shippingAddress.full || o.shippingAddress)) ||
                        "",
                }));
                setOrders(normalized);
            } else {
                setLoadError(res?.message || "Lỗi khi lấy danh sách đơn hàng");
            }
            setIsLoading(false);
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // ===== cancel order =====
    const handleCancelOrder = async (orderId) => {
        if (!orderId) return;
        const u = JSON.parse(localStorage.getItem("user_gowa"));
        const userId = u?.id || u?._id;

        setCancellingOrder(orderId);
        const res = await OrderService.cancelOrder(orderId, userId);
        if (res?.success) {
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId && o.status === "pending" ? { ...o, status: "cancelled" } : o))
            );
        }
        setCancellingOrder(null);
    };

    // ===== filter & counts =====
    const filteredOrders = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return orders.filter((o) => {
            const matchSearch =
                !term ||
                (o.id && String(o.id).toLowerCase().includes(term)) ||
                (o.customerName && o.customerName.toLowerCase().includes(term));
            const matchTab = activeTab === "all" ? true : o.status === activeTab;
            return matchSearch && matchTab;
        });
    }, [orders, searchTerm, activeTab]);

    const counts = useMemo(() => {
        const c = { all: orders.length, pending: 0, shipping: 0, delivered: 0, cancelled: 0 };
        for (const o of orders) if (c[o.status] !== undefined) c[o.status]++;
        return c;
    }, [orders]);

    // reset page khi filter/search/pageSize đổi
    useEffect(() => {
        setPage(1);
    }, [searchTerm, activeTab, pageSize]);

    // ===== client pagination slice =====
    const total = filteredOrders.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, total);
    const pageItems = filteredOrders.slice(startIdx, endIdx);

    // ===== renders =====
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-muted-foreground">Đang tải danh sách đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-destructive font-medium">{loadError}</p>
                    <Button className="bg-green-700 hover:bg-green-800 text-white" onClick={() => window.location.reload()}>
                        Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 md:py-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="animate-in slide-in-from-left-5 duration-500">
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quản lý đơn hàng</h1>
                            <p className="text-muted-foreground mt-1 md:mt-2">
                                Theo dõi và quản lý tất cả đơn hàng của bạn
                            </p>
                        </div>
                        <div className="animate-in slide-in-from-right-5 duration-500">
                            <Link to={ROUTE_PATH.ORDER_NEW}>
                                <Button className="bg-green-700 hover:bg-green-800 text-white transition-all duration-200 hover:scale-105">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Đơn hàng mới
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="container mx-auto px-4 py-6 md:py-8">
                {/* Search + page size */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground hidden sm:inline">Hiển thị</span>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            {PAGE_SIZE_OPTIONS.map((n) => (
                                <option key={n} value={n}>
                                    {n} / trang
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tabs đẹp + tương tác */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList className="flex w-full flex-wrap gap-2 rounded-2xl bg-muted/60 p-2 backdrop-blur supports-[backdrop-filter]:bg-muted/40">
                        {[
                            { key: "all", label: "Tất cả", icon: null, count: counts.all },
                            { key: "pending", label: "Chờ xử lý", icon: Package, count: counts.pending },
                            { key: "shipping", label: "Đang giao", icon: Truck, count: counts.shipping },
                            { key: "delivered", label: "Đã giao", icon: CheckCircle, count: counts.delivered },
                            { key: "cancelled", label: "Đã hủy", icon: X, count: counts.cancelled },
                        ].map((t) => {
                            const Icon = t.icon;
                            const active = activeTab === t.key;

                            return (
                                <TabsTrigger
                                    key={t.key}
                                    value={t.key}
                                    className={[
                                        // layout
                                        "group inline-flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-sm font-medium",
                                        // borders + bg + colors
                                        active
                                            ? "border border-green-700/30 bg-green-700/10 text-green-800 shadow-green-hover ring-1 ring-green-700/10"
                                            : "border border-transparent text-foreground/80 hover:text-foreground",
                                        // hover/press effects
                                        "transition-all duration-200 hover:scale-[1.02] hover:shadow-green-hover-sm",
                                        "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/40",
                                    ].join(" ")}
                                >
                                    {Icon && (
                                        <Icon
                                            className={[
                                                "h-4 w-4 transition-opacity",
                                                active ? "opacity-100 text-green-700" : "opacity-70 group-hover:opacity-90",
                                            ].join(" ")}
                                        />
                                    )}
                                    <span>{t.label}</span>
                                    <span
                                        className={[
                                            "ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors",
                                            active ? "bg-green-700/15 text-green-800" : "bg-foreground/5 text-foreground/70 group-hover:bg-foreground/10",
                                        ].join(" ")}
                                    >
                                        {t.count}
                                    </span>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-4 sm:mt-6">
                        {/* Grid responsive: 1 cột mobile, 2 cột md, 3 cột xl */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {pageItems.map((order, index) => {
                                const config = statusConfig[order.status] || statusConfig.pending;
                                const StatusIcon = config.icon;

                                return (
                                    <Card
                                        key={order.id || index}
                                        className="hover:shadow-lg transition-all duration-300 hover:scale-[1.01] animate-in slide-in-from-bottom-5"
                                    >
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`p-2 rounded-lg ${config.bgColor} shrink-0`}>
                                                        <StatusIcon className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <CardTitle className="text-base sm:text-lg truncate">{order.id}</CardTitle>
                                                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                            {order.customerName} • {order.customerPhone}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                                    <OrderStatusBadge status={order.status} showPulse={order.status === "shipping"} />
                                                    {order.status === "pending" && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive bg-transparent"
                                                            onClick={() => handleCancelOrder(order.id)}
                                                            disabled={cancellingOrder === order.id}
                                                            title="Hủy đơn"
                                                        >
                                                            {cancellingOrder === order.id ? (
                                                                <LoadingSpinner size="sm" className="mr-1" />
                                                            ) : (
                                                                <X className="w-4 h-4 mr-1" />
                                                            )}
                                                            {cancellingOrder === order.id ? "Đang hủy..." : "Hủy"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="grid gap-4 sm:grid-cols-3">
                                                <div className="sm:col-span-1">
                                                    <h4 className="font-medium mb-2">Sản phẩm</h4>
                                                    <div className="space-y-1">
                                                        {(order.items || []).slice(0, 3).map((item, i) => (
                                                            <p key={i} className="text-sm text-muted-foreground">
                                                                {item.quantity}x {item.name} {item.unit ? `(${item.unit})` : ""}
                                                            </p>
                                                        ))}
                                                        {(order.items || []).length > 3 && (
                                                            <p className="text-xs text-muted-foreground">… và thêm sản phẩm khác</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="sm:col-span-1">
                                                    <h4 className="font-medium mb-2">Địa chỉ giao hàng</h4>
                                                    <p className="text-sm text-muted-foreground line-clamp-3">{order.address}</p>
                                                </div>

                                                <div className="sm:col-span-1 flex sm:flex-col items-end justify-between gap-3">
                                                    <div className="text-right w-full sm:w-auto">
                                                        <h4 className="font-medium mb-2 sm:text-right">Tổng tiền</h4>
                                                        <p className="text-lg font-bold text-primary">
                                                            {(order.total || 0).toLocaleString("vi-VN")}đ
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {order.orderDate ? new Date(order.orderDate).toLocaleString("vi-VN") : "--"}
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Link to={ROUTE_PATH.ORDER_DETAIL.replace(":id", order.id)}>
                                                            <Button variant="outline" size="sm" className="bg-transparent">
                                                                Chi tiết
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator className="my-4" />
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Empty state */}
                        {pageItems.length === 0 && (
                            <div className="text-center py-12">
                                <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                <h3 className="text-base sm:text-lg font-medium text-foreground mb-1">Không tìm thấy đơn hàng</h3>
                                <p className="text-sm text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                            </div>
                        )}

                        {/* Pagination bar */}
                        {total > 0 && (
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Hiển thị <span className="font-medium">{startIdx + 1}</span>–
                                    <span className="font-medium">{endIdx}</span> trong{" "}
                                    <span className="font-medium">{total}</span> đơn hàng
                                </p>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-transparent"
                                        onClick={() => setPage(1)}
                                        disabled={currentPage === 1}
                                        title="Trang đầu"
                                    >
                                        <ChevronsLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-transparent"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        title="Trang trước"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>

                                    <span className="mx-2 text-sm">
                                        Trang <span className="font-medium">{currentPage}</span> / {totalPages}
                                    </span>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-transparent"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        title="Trang sau"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-transparent"
                                        onClick={() => setPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        title="Trang cuối"
                                    >
                                        <ChevronsRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
