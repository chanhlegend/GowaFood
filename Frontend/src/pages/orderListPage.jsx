// src/pages/orderListPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ReactModal from "react-modal"; // npm i react-modal
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
  MoreHorizontal,
} from "lucide-react";

// App
import OrderService from "../services/orderService";
import { ROUTE_PATH } from "../constants/routePath";

// ===== small, local UI bits (không dùng component nội bộ) =====
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
  console.log(status);
  
  const map = {
    pending: { label: "Chờ xử lý", cls: "bg-yellow-100 text-yellow-800" },
    shipping: { label: "Đang giao", cls: "bg-blue-100 text-blue-800" },
    delivered: { label: "Đã giao", cls: "bg-green-100 text-green-800" },
    cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-800" },
  };
  const it = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${it.cls}`}>
      {it.label}
    </span>
  );
}

const statusConfig = {
  pending: { label: "Chờ xử lý", icon: Package, bgColor: "bg-yellow-50" },
  shipping: { label: "Đang giao", icon: Truck, bgColor: "bg-blue-50" },
  delivered: { label: "Đã giao", icon: CheckCircle, bgColor: "bg-green-50" },
  cancelled: { label: "Đã hủy", icon: X, bgColor: "bg-red-50" },
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function ItemTag({ item }) {
  const unit = item?.unit ? ` (${item.unit})` : "";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] sm:text-xs bg-neutral-100 text-neutral-700">
      <span className="font-medium">{item?.quantity ?? 1}×</span>
      <span className="truncate max-w-[10rem]">{item?.name || "Sản phẩm"}{unit}</span>
    </span>
  );
}

function ItemListModal({ isOpen, onClose, order }) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const totalLines = items.length;
  const totalQty = items.reduce((s, it) => s + (Number(it?.quantity) || 0), 0);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="max-w-lg w-[92vw] sm:w-[90vw] bg-white rounded-2xl p-4 sm:p-5 shadow-xl outline-none mx-auto mt-4 sm:mt-24 h-[calc(100dvh-2rem)] sm:h-auto flex flex-col"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Sản phẩm của đơn {order?.id}</h3>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100" aria-label="Đóng">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-2 sm:mt-3 pr-1 overflow-y-auto sm:max-h-[60vh] flex-1">
        {totalLines === 0 ? (
          <p className="text-sm text-neutral-500">Không có sản phẩm.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it, idx) => (
              <li key={idx} className="flex items-start justify-between rounded-xl border bg-neutral-50 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-5 truncate">
                    {it?.name || "Sản phẩm"}
                    {it?.unit ? <span className="text-neutral-500"> ({it.unit})</span> : null}
                  </p>
                  {it?.note ? <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">{it.note}</p> : null}
                </div>
                <div className="shrink-0 pl-3 text-sm font-semibold">{it?.quantity ?? 1}×</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-px bg-neutral-200 my-3" />
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500">Tổng dòng</span>
        <span className="font-semibold">{totalLines}</span>
      </div>
      <div className="flex items-center justify-between text-sm mt-1">
        <span className="text-neutral-500">Tổng số lượng</span>
        <span className="font-semibold">{totalQty}</span>
      </div>
    </ReactModal>
  );
}

export default function OrderListPage() {
  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // data
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // actions
  // pagination (client-side)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // modal
  const [modalOrder, setModalOrder] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      setLoadError("");
      const res = await OrderService.getOrders();
      if (!mounted) return;

      if (res?.success) {
        const list = Array.isArray(res.data) ? res.data : res.data?.orders || [];
        const normalized = list.map((o) => {
          const shippingAddr = o?.shipping?.address || {};
          const user = o?.user || {};
          const products = Array.isArray(o?.products) ? o.products : [];
          return {
            id: o.id || o._id || o.code || o.orderId,
            customerName: shippingAddr?.name || user?.name || "",
            customerPhone: shippingAddr?.phone || user?.phone || "",
            items: products.map((p) => ({
              id: p?.id || p?._id,
              name: p?.product?.name || p?.name || "Sản phẩm",
              quantity: p?.quantity ?? 1,
              unit: p?.unit,
              note: p?.note,
            })),
            total: o?.amounts?.total ?? 0,
            status: String(o?.status || "pending").toLowerCase(),
            orderDate: o?.orderDate || o?.createdAt,
            address: shippingAddr?.address
              ? `${shippingAddr?.address} ${shippingAddr?.ward || ""} ${shippingAddr?.city || ""}`.trim()
              : "Nhận tại cửa hàng",
          };
        });
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

  // filters
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

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeTab, pageSize]);

  // pagination slice
  const total = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageItems = filteredOrders.slice(startIdx, endIdx);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size={32} />
          <p className="text-neutral-500">Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-medium">{loadError}</p>
          <button
            className="px-4 py-2 rounded-xl bg-green-700 text-white hover:bg-green-800"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-[env(safe-area-inset-bottom)]">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur sticky top-0 z-10 pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="animate-in slide-in-from-left-5 duration-500">
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Quản lý đơn hàng</h1>
              <p className="text-neutral-500 mt-1 md:mt-2">Theo dõi và quản lý tất cả đơn hàng của bạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Search + page size */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 w-full rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 hidden sm:inline">Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} / trang
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs (custom, kéo ngang trên mobile) */}
        <div className="mb-4 flex w-full gap-2 rounded-2xl bg-neutral-100 p-2 overflow-x-auto">
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
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`inline-flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2.5 text-[13px] sm:text-sm font-medium transition-all ${
                  active
                    ? "border border-green-700/30 bg-green-700/10 text-green-800 ring-1 ring-green-700/10"
                    : "border border-transparent text-neutral-700 hover:text-neutral-900"
                }`}
              >
                {Icon ? (
                  <Icon className={`h-4 w-4 ${active ? "text-green-700" : "text-neutral-500"}`} />
                ) : null}
                <span>{t.label}</span>
                <span
                  className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    active ? "bg-green-700/15 text-green-800" : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid cards */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((order, index) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const items = Array.isArray(order.items) ? order.items : [];
            const display = items.slice(0, 2);
            const hiddenCount = Math.max(0, items.length - display.length);

            return (
              <div
                key={order.id || index}
                className="rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="p-3.5 sm:p-4 border-b border-neutral-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg ${config.bgColor} shrink-0`}>
                        <StatusIcon className="w-5 h-5 text-green-700" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[15px] sm:text-lg font-semibold truncate">{order.id}</h3>
                        <p className="text-[11px] sm:text-sm text-neutral-500 truncate">
                          {order.customerName} • {order.customerPhone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <StatusPill status={order.status} />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
                    {/* SẢN PHẨM — rút gọn & đẹp hơn, không dùng component */}
                    <div className="sm:col-span-1">
                      <h4 className="font-medium mb-2">Sản phẩm</h4>
                      {items.length === 0 ? (
                        <p className="text-sm text-neutral-500">—</p>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {display.map((it, i) => (
                            <ItemTag key={i} item={it} />
                          ))}
                          {hiddenCount > 0 && (
                            <button
                              onClick={() => setModalOrder(order)}
                              className="h-8 px-2.5 rounded-full text-[12px] sm:text-sm inline-flex items-center border border-neutral-300 hover:bg-neutral-100 active:scale-[0.98]"
                            >
                              <MoreHorizontal className="w-4 h-4 mr-1" />+{hiddenCount}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-1">
                      <h4 className="font-medium mb-2">Địa chỉ giao hàng</h4>
                      <p className="text-[13px] sm:text-sm text-neutral-600 line-clamp-3 break-words">{order.address}</p>
                    </div>

                    <div className="sm:col-span-1 flex sm:flex-col items-end justify-between gap-2 sm:gap-3">
                      <div className="text-right w-full sm:w-auto">
                        <h4 className="font-medium mb-2 sm:text-right">Tổng tiền</h4>
                        <p className="text-lg font-bold text-green-700">{(order.total || 0).toLocaleString("vi-VN")}đ</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {order.orderDate ? new Date(order.orderDate).toLocaleString("vi-VN") : "--"}
                        </p>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <Link className="w-full sm:w-auto" to={ROUTE_PATH.ORDER_DETAIL.replace(":id", order.id)}>
                          <button className="h-10 px-3 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-sm w-full sm:w-auto">
                            Chi tiết
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-neutral-200 my-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {pageItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-medium text-neutral-900 mb-1">Không tìm thấy đơn hàng</h3>
            <p className="text-sm text-neutral-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}

        {/* Pagination bar */}
        {total > 0 && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">
              Hiển thị <span className="font-medium">{startIdx + 1}</span>–<span className="font-medium">{endIdx}</span> trong{" "}
              <span className="font-medium">{total}</span> đơn hàng
            </p>
            <div className="flex items-center gap-1">
              <button
                className="h-10 w-10 rounded-xl border border-neutral-300 hover:bg-neutral-100 grid place-items-center"
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                title="Trang đầu"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                className="h-10 w-10 rounded-xl border border-neutral-300 hover:bg-neutral-100 grid place-items-center"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="mx-2 text-sm">
                Trang <span className="font-medium">{currentPage}</span> / {totalPages}
              </span>
              <button
                className="h-10 w-10 rounded-xl border border-neutral-300 hover:bg-neutral-100 grid place-items-center"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                className="h-10 w-10 rounded-xl border border-neutral-300 hover:bg-neutral-100 grid place-items-center"
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
                title="Trang cuối"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal hiển thị toàn bộ sản phẩm */}
      <ItemListModal isOpen={!!modalOrder} onClose={() => setModalOrder(null)} order={modalOrder} />
    </div>
  );
}
