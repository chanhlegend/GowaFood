// src/pages/ProcessPaymentPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import napas247 from "../assets/images/napas247.png";
import mbbank from "../assets/images/mbbank.jpg";
import vietQR from "../assets/images/vietQR.png";

import QRCode from "qrcode";

import { PayOSService } from "../services/payosService";
import OrderService from "../services/orderService";

import { toast } from "sonner";

/**
 * ProcessPaymentPage
 * - Đọc `order` từ location.state
 * - Nếu COD: hiện nút Xác nhận đặt hàng
 * - Nếu BANK: gọi backend tạo link PayOS, lấy qrCode → hiển thị ảnh QR
 */

const Card = ({ title, right, children, className }) => (
  <section
    className={`bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm rounded-2xl p-5 ${
      className || ""
    }`}
  >
    <header className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-base md:text-lg font-semibold tracking-tight">
        {title}
      </h2>
      {right}
    </header>
    {children}
  </section>
);

const Divider = () => <div className="h-px w-full bg-gray-100" />;
const formatVND = (n = 0) => Number(n).toLocaleString("vi-VN") + "₫";

// tránh truyền src=""
const safeSrc = (v) => (typeof v === "string" && v.trim() ? v : null);

export default function ProcessPaymentPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const order = state?.order || null;

  const [checking, setChecking] = useState(false);
  const [qrUrl, setQrUrl] = useState(null); // quan trọng: KHÔNG để ""
  const [orderCode, setOrderCode] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [qrError, setQrError] = useState("");

  const isBank = order?.payment?.method === "BANK";
  const isCOD = order?.payment?.method === "COD";

  const amount = useMemo(() => order?.amounts?.total ?? 0, [order]);
  const orderData = {
    user: order.user._id,
    products: order.items.map((it) => ({
      product: it._id,
      quantity: it.qty,
      price: it.unitPrice,
    })),
    discount: {
      pointsUsed: order.discount?.pointsUsed || 0,
      pointsPercent: order.discount?.pointsPercent || 0,
      discountFromPoints: order.discount?.discountFromPoints || 0,
    },
    amounts: {
      rawSubtotal: order.amounts?.rawSubtotal || 0,
      subtotalAfterPoints: order.amounts?.subtotalAfterPoints || 0,
      total: order.amounts?.total || 0,
    },
    payment: {
      method: "BANK",
      bankTransferNote: order.payment?.bankTransferNote || "",
    },
    shipping: {
      method: order.shipping?.method || "STORE",
      address: order.shipping?.address || null,
    },
    notes: order.note || "",
  };

  const handleConfirmCOD = async () => {
    const result = await OrderService.createOrder(orderData);
    console.log(result);
    
    toast.success("Đơn hàng đã được tạo thành công!");
    navigate("/thank-you", { state: { orderId: result.data?._id } });
  };

  const handleCheckBankPayment = async () => {
    if (!orderCode) return;

    try {
      setChecking(true);
      const response = await PayOSService.verifyPayment(orderCode);

      if (response.status === "PAID") {
        // giả lập thành công
        try {
          // setPaid(true);

          await OrderService.createOrder(orderData);
          toast.success("Đơn hàng đã được tạo thành công!");
          navigate("/thank-you", { state: { orderId: `OD${Date.now()}` } });
        } catch (err) {
          console.error("Lỗi tạo đơn hàng:", err);
          toast.error(
            err?.message || "Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại."
          );
        }
      } else {
        console.log("Thanh toán chưa hoàn tất");
      }
    } catch (err) {
      toast.error("Thanh toán chưa hoàn tất");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    console.log("Order data:", order);

    const fetchPayOSAndGenerateQR = async () => {
      setLoadingQR(true);
      setQrError("");
      try {
        // sinh orderCode ngẫu nhiên (bạn có thể chuyển sang backend tạo để đảm bảo duy nhất)
        const newOrderCode =
          (Date.now() % 10_000_000_000_000) +
          Math.floor(Math.random() * 10_000);

        const paymentData = {
          orderCode: newOrderCode,
          amount:
            order?.amounts?.total ?? order?.amounts?.subtotalAfterPoints ?? 0,
          description: order?.payment?.bankTransferNote,
          returnUrl: window.location.origin + "/payment-success",
          cancelUrl: window.location.origin + "/payment-cancel",
        };

        const result = await PayOSService.createPayment(paymentData);
        setOrderCode(newOrderCode);

        const code = result?.qrCode;

        if (typeof code === "string") {
          // Nếu đã là http(s) hoặc dataURL → dùng trực tiếp
          if (code.startsWith("http") || code.startsWith("data:image")) {
            setQrUrl(code);
          } else {
            // raw content → encode thành dataURL
            const qrImageUrl = await QRCode.toDataURL(code);
            setQrUrl(qrImageUrl);
          }
        } else {
          setQrUrl(null);
          setQrError("Mã QR không hợp lệ từ máy chủ.");
          console.error("qrCode không hợp lệ:", code);
        }
      } catch (error) {
        setQrUrl(null);
        setQrError(error?.message || "Không thể tạo thanh toán.");
        console.error("Error creating payment or generating QR:", error);
      } finally {
        setLoadingQR(false);
      }
    };

    if (order && isBank) {
      fetchPayOSAndGenerateQR();
    }
  }, [order, isBank]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
          <Card title="Không tìm thấy đơn hàng">
            <p className="text-sm text-gray-600">
              Thiếu dữ liệu thanh toán. Vui lòng quay lại trang trước.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 rounded-xl bg-black text-white font-semibold"
            >
              Quay lại
            </button>
          </Card>
        </div>
      </div>
    );
  }

  const bankInfo = {
    bankName: "Vietcombank (VCB)",
    accountName: "CÔNG TY ABC",
    accountNumber: "0123 456 789",
    content:
      order?.payment?.bankTransferNote ||
      `Thanh toan ${order?.user?.name || "khach"}`,
    // Placeholder dùng làm fallback nếu chưa có QR thật
    qrUrl: `https://placehold.co/320x320/png?text=QR%20${encodeURIComponent(
      formatVND(amount)
    )}`,
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-1 md:py-1">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Xử lý thanh toán
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Vui lòng kiểm tra lại thông tin trước khi hoàn tất.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-5">
            <Card title="Thông tin đơn hàng">
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
                <p>
                  <span className="text-gray-500">Khách hàng:</span>{" "}
                  <span className="font-medium">
                    {order?.user?.name || "—"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Email:</span>{" "}
                  <span className="font-medium">
                    {order?.user?.email || "—"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Phương thức thanh toán:</span>{" "}
                  <span className="font-medium">
                    {order?.payment?.method === "BANK"
                      ? "Chuyển khoản"
                      : "Thanh toán khi nhận hàng"}
                  </span>
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  <span className="text-gray-500">Phương thức nhận hàng:</span>{" "}
                  <span className="font-medium">
                    {order?.shipping?.method === "HOME"
                      ? "Giao tận nhà"
                      : "Nhận tại cửa hàng"}
                  </span>
                </p>

                {/* Nếu nhận tại cửa hàng: hiển thị block riêng */}
                {order?.shipping?.method !== "HOME" && (
                  <div className="mt-1 mt-2 text-sm text-gray-600 mb-3">
                    <p className="text-gray-500">
                      Địa chỉ cửa hàng: 80 Trần Văn Trà, Xã Sơn Hà, Quảng Ngãi
                    </p>
                  </div>
                )}
              </div>

              {/* Nếu giao nhà: hiển thị địa chỉ người nhận */}
              {order?.shipping?.method === "HOME" &&
                order?.shipping?.address && (
                  <div className="mt-2 text-sm text-gray-600 space-y-2 mb-3">
                    <p>
                      <span className="text-gray-500">Người nhận:</span>{" "}
                      <span className="font-medium">
                        {order.shipping.address.name}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">SĐT:</span>{" "}
                      <span className="font-medium">
                        {order.shipping.address.phone}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Địa chỉ:</span>{" "}
                      <span className="font-medium">
                        {order.shipping.address.address}
                        {order.shipping.address.ward
                          ? `, ${order.shipping.address.ward}`
                          : ""}
                        {order.shipping.address.city
                          ? `, ${order.shipping.address.city}`
                          : ""}
                      </span>
                    </p>
                  </div>
                )}
              <Divider />
              <div className="mt-3">
                {order.items?.length ? (
                  <ul className="divide-y divide-gray-100">
                    {order.items.map((it, idx) => (
                      <li key={idx} className="py-3 flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={it.images[0] || "/placeholder.png"}
                            alt={it.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{it.name}</p>
                          <p className="text-sm text-gray-500">
                            Số lượng: {it.qty}
                          </p>
                        </div>
                        <div className="text-right w-36">
                          <p className="text-sm text-gray-500">Đơn giá</p>
                          <p className="font-medium">
                            {formatVND(it.unitPrice)}
                          </p>
                        </div>
                        <div className="text-right w-40">
                          <p className="text-sm text-gray-500">Thành tiền</p>
                          <p className="font-semibold">
                            {formatVND(it.lineTotal)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Không có sản phẩm</p>
                )}
              </div>
              <Divider />
              {/* Ghi chú */}
              {order?.note && (
                <div className="mt-2">
                  <h3 className="text-sm font-medium mb-1">Ghi chú:</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {order.note}
                  </p>
                </div>
              )}
            </Card>

            {isBank && (
              <Card title="Thanh toán chuyển khoản">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <div className="mt-4 flex justify-center">
                      <div className="w-[220px] p-4 bg-white rounded-xl shadow border text-center">
                        {/* Logo trên */}
                        <img
                          src={vietQR}
                          alt="VietQR PRO"
                          className="mx-auto mb-2 w-[120px]"
                        />

                        {/* QR Code */}
                        {loadingQR ? (
                          <div className="w-full aspect-square rounded bg-gray-100 grid place-items-center text-xs text-gray-500">
                            Đang tạo mã QR…
                          </div>
                        ) : qrError ? (
                          <div className="w-full aspect-square rounded bg-rose-50 border border-rose-100 grid place-items-center text-xs text-rose-600">
                            {qrError}
                          </div>
                        ) : (
                          <img
                            src={safeSrc(qrUrl) ?? bankInfo.qrUrl}
                            alt="QR Code"
                            className="w-full rounded"
                          />
                        )}

                        {/* Footer ngân hàng */}
                        <div className="mt-1 flex justify-center items-center space-x-2">
                          <img src={napas247} alt="napas247" className="h-5" />
                          <span>|</span>
                          <img src={mbbank} alt="MB" className="h-10" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500">Ngân hàng:</span>{" "}
                      <span className="font-medium">{bankInfo.bankName}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">Chủ Tài khoản:</span>{" "}
                      <span className="font-medium">
                        {bankInfo.accountName}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Số Tài khoản:</span>{" "}
                      <span className="font-medium">
                        {bankInfo.accountNumber}
                      </span>
                    </p>
                    <p className="break-all">
                      <span className="text-gray-500">Nội dung:</span>{" "}
                      <span className="font-medium">{bankInfo.content}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">Số tiền:</span>{" "}
                      <span className="font-semibold">{formatVND(amount)}</span>
                    </p>
                    <Divider />
                    <p className="text-xs text-red-500">
                      Vui lòng chuyển đúng số tiền và nội dung sau đó nhấn vào
                      nút kiểm tra thanh toán để xác nhận.
                    </p>
                    <p className="text-xs text-gray-500">
                      Nếu có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ khách
                      hàng.
                    </p>
                    {/* số điện thoại hỗ trợ */}
                    <p className="text-xs text-gray-500">
                      Số điện thoại hỗ trợ: 1900 1234
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-60 space-y-5">
              <Card title="Tổng kết">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium">
                      {formatVND(order?.amounts?.rawSubtotal || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Giảm từ điểm</span>
                    <span className="font-medium text-green-600">
                      - {formatVND(order?.discounts?.discountFromPoints || 0)}
                    </span>
                  </div>
                  {order?.discounts?.couponDiscount ? (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Mã giảm giá</span>
                      <span className="font-medium text-green-600">
                        - {formatVND(order?.discounts?.couponDiscount)}
                      </span>
                    </div>
                  ) : null}
                  <Divider />
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-semibold">Tổng thanh toán</span>
                    <span className="font-extrabold">
                      {formatVND(
                        order?.amounts?.total ??
                          order?.amounts?.subtotalAfterPoints ??
                          0
                      )}
                    </span>
                  </div>
                </div>

                {isCOD && (
                  <button
                    onClick={handleConfirmCOD}
                    className="mt-4 w-full px-4 py-3 rounded-xl bg-custom-green cursor-pointer text-white font-semibold hover:opacity-90 transition"
                  >
                    Xác nhận đặt hàng (COD)
                  </button>
                )}

                {isBank && (
                  <div className="mt-4 w-full rounded-xl bg-custom-green text-white font-semibold hover:opacity-90 transition  space-y-2">
                    <button
                      onClick={handleCheckBankPayment}
                      disabled={checking}
                      className={`px-4 py-2 rounded-xl text-white font-semibold transition w-full disabled:opacity-60`}
                    >
                      {checking ? "Đang kiểm tra..." : "Kiểm tra thanh toán"}
                    </button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
