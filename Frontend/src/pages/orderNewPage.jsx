"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Minus, ShoppingCart, CheckCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Link, useNavigate } from "react-router-dom";
import { ROUTE_PATH } from "@/constants/routePath";
import OrderService from "@/services/orderService";

// Available products (demo)
const availableProducts = [
    { id: 1, name: "Cải xanh", unit: "500g", price: 15000, image: "/fresh-green-vegetables.jpg" },
    { id: 2, name: "Cà chua", unit: "1kg", price: 25000, image: "/fresh-red-tomatoes.jpg" },
    { id: 3, name: "Rau muống", unit: "300g", price: 12000, image: "/water-spinach.jpg" },
    { id: 4, name: "Củ cải trắng", unit: "800g", price: 18000, image: "/white-radish.jpg" },
    { id: 5, name: "Xà lách xoăn", unit: "400g", price: 20000, image: "/curly-lettuce.jpg" },
    { id: 6, name: "Cà rốt", unit: "600g", price: 16000, image: "/bunch-of-carrots.png" },
];

export default function OrderNewPage() {
    const navigate = useNavigate();

    const [orderItems, setOrderItems] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const addItem = (productId) => {
        const existingItem = orderItems.find((item) => item.productId === productId);
        if (existingItem) {
            setOrderItems(
                orderItems.map((item) =>
                    item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
                )
            );
        } else {
            setOrderItems([...orderItems, { productId, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            setOrderItems(orderItems.filter((item) => item.productId !== productId));
        } else {
            setOrderItems(
                orderItems.map((item) => (item.productId === productId ? { ...item, quantity } : item))
            );
        }
    };

    const getOrderTotal = () => {
        return orderItems.reduce((total, item) => {
            const product = availableProducts.find((p) => p.id === item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    };

    const getShippingFee = () => {
        const subtotal = getOrderTotal();
        return subtotal >= 100000 ? 0 : 15000; // free ship >= 100k
    };

    const isFormValid = () =>
        customerInfo.name && customerInfo.phone && customerInfo.address && orderItems.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) return;

        setIsSubmitting(true);
        setSubmitError("");

        // build payload theo backend bạn đang có
        const itemsPayload = orderItems.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
        }));

        const subtotal = getOrderTotal();
        const shippingFee = getShippingFee();
        const total = subtotal + shippingFee;

        const payload = {
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            customerEmail: customerInfo.email || undefined,
            address: customerInfo.address,
            notes: customerInfo.notes || undefined,
            items: itemsPayload,
            pricing: {
                subtotal,
                shippingFee,
                total,
            },
        };

        // Nếu backend yêu cầu userId, bạn có thể lấy từ localStorage:
        // const userId = localStorage.getItem("userId");

        const res = await OrderService.createOrder(payload);

        if (res?.success) {
            const created = res.data || {};
            // cố gắng lấy id từ nhiều khả năng
            const newId = created.id || created._id || created.code || created.orderId;

            setShowSuccess(true);

            setTimeout(() => {
                if (newId) {
                    navigate(ROUTE_PATH.ORDER_DETAIL.replace(":id", newId));
                } else {
                    // fallback: quay về danh sách nếu không có id
                    navigate(ROUTE_PATH.ORDERS);
                }
            }, 1200);
        } else {
            setSubmitError(res?.message || "Tạo đơn thất bại");
            setIsSubmitting(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-6 animate-in zoom-in-50 duration-500">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Đơn hàng đã được tạo!</h2>
                        <p className="text-muted-foreground">Đang chuyển hướng đến trang chi tiết...</p>
                    </div>
                    <LoadingSpinner size="md" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 animate-in slide-in-from-left-5 duration-500">
                        <Link to={ROUTE_PATH.ORDERS}>
                            <Button variant="ghost" size="sm" className="transition-all duration-200 hover:scale-105">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground text-balance">Tạo đơn hàng mới</h1>
                            <p className="text-muted-foreground mt-2">Chọn sản phẩm và điền thông tin khách hàng</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Product Selection */}
                            <Card className="animate-in slide-in-from-bottom-5 duration-500">
                                <CardHeader>
                                    <CardTitle>Chọn sản phẩm</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {availableProducts.map((product, index) => {
                                            const orderItem = orderItems.find((item) => item.productId === product.id);
                                            const quantity = orderItem?.quantity || 0;

                                            return (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-bottom-5"
                                                    style={{ animationDelay: `${index * 100}ms` }}
                                                >
                                                    <img
                                                        src={product.image || "/placeholder.svg"}
                                                        alt={product.name}
                                                        className="w-16 h-16 object-cover rounded-lg transition-transform duration-200 hover:scale-110"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium">{product.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{product.unit}</p>
                                                        <p className="font-medium text-primary">{product.price.toLocaleString("vi-VN")}đ</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {quantity > 0 ? (
                                                            <div className="flex items-center gap-2 animate-in zoom-in-50 duration-300">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => updateQuantity(product.id, quantity - 1)}
                                                                    className="transition-all duration-200 hover:scale-110"
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </Button>
                                                                <span className="w-8 text-center font-medium animate-pulse">{quantity}</span>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => updateQuantity(product.id, quantity + 1)}
                                                                    className="transition-all duration-200 hover:scale-110"
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => addItem(product.id)}
                                                                className="transition-all duration-200 hover:scale-105"
                                                            >
                                                                <Plus className="w-4 h-4 mr-1" />
                                                                Thêm
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Customer Information */}
                            <Card className="animate-in slide-in-from-bottom-5 duration-700">
                                <CardHeader>
                                    <CardTitle>Thông tin khách hàng</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Họ và tên *</Label>
                                            <Input
                                                id="name"
                                                value={customerInfo.name}
                                                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                                placeholder="Nhập họ và tên"
                                                required
                                                className="transition-all duration-200 focus:scale-[1.02]"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Số điện thoại *</Label>
                                            <Input
                                                id="phone"
                                                value={customerInfo.phone}
                                                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                                placeholder="Nhập số điện thoại"
                                                required
                                                className="transition-all duration-200 focus:scale-[1.02]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={customerInfo.email}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                            placeholder="Nhập email (tùy chọn)"
                                            className="transition-all duration-200 focus:scale-[1.02]"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="address">Địa chỉ giao hàng *</Label>
                                        <Textarea
                                            id="address"
                                            value={customerInfo.address}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                            placeholder="Nhập địa chỉ giao hàng đầy đủ"
                                            required
                                            className="transition-all duration-200 focus:scale-[1.02]"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="notes">Ghi chú</Label>
                                        <Textarea
                                            id="notes"
                                            value={customerInfo.notes}
                                            onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                                            placeholder="Ghi chú thêm về đơn hàng (tùy chọn)"
                                            className="transition-all duration-200 focus:scale-[1.02]"
                                        />
                                    </div>

                                    {submitError ? (
                                        <p className="text-sm text-destructive">{submitError}</p>
                                    ) : null}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="space-y-6">
                            <Card className="animate-in slide-in-from-right-5 duration-500 sticky top-8">
                                <CardHeader>
                                    <CardTitle>Tóm tắt đơn hàng</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {orderItems.length === 0 ? (
                                        <div className="text-center py-8">
                                            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-bounce" />
                                            <p className="text-muted-foreground">Chưa có sản phẩm nào</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orderItems.map((item) => {
                                                const product = availableProducts.find((p) => p.id === item.productId);
                                                if (!product) return null;

                                                return (
                                                    <div
                                                        key={item.productId}
                                                        className="flex justify-between items-center animate-in slide-in-from-right-3 duration-300"
                                                    >
                                                        <div>
                                                            <p className="font-medium">{product.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {item.quantity}x {product.unit}
                                                            </p>
                                                        </div>
                                                        <p className="font-medium animate-pulse">
                                                            {(product.price * item.quantity).toLocaleString("vi-VN")}đ
                                                        </p>
                                                    </div>
                                                );
                                            })}

                                            <Separator />

                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Tạm tính</span>
                                                    <span>{getOrderTotal().toLocaleString("vi-VN")}đ</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Phí giao hàng</span>
                                                    <span>
                                                        {getShippingFee() === 0 ? (
                                                            <span className="text-green-600 animate-pulse">Miễn phí</span>
                                                        ) : (
                                                            `${getShippingFee().toLocaleString("vi-VN")}đ`
                                                        )}
                                                    </span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between font-bold text-lg">
                                                    <span>Tổng cộng</span>
                                                    <span className="text-primary animate-pulse">
                                                        {(getOrderTotal() + getShippingFee()).toLocaleString("vi-VN")}đ
                                                    </span>
                                                </div>
                                            </div>

                                            {getOrderTotal() < 100000 && (
                                                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg animate-pulse">
                                                    Mua thêm {(100000 - getOrderTotal()).toLocaleString("vi-VN")}đ để được miễn phí giao hàng
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Button
                                type="submit"
                                className="w-full bg-green-700 hover:bg-green-800 text-white transition-all duration-200 hover:scale-105"
                                disabled={!isFormValid() || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <LoadingSpinner size="sm" />
                                        Đang tạo đơn hàng...
                                    </div>
                                ) : (
                                    "Tạo đơn hàng"
                                )}
                            </Button>

                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
