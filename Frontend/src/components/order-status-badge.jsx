"use client";


import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";


const statusConfig = {
    pending: {
        label: "Chờ xử lý",
        icon: Package,
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        bgColor: "bg-yellow-50",
        pulseColor: "bg-yellow-400",
    },
    shipping: {
        label: "Đang giao",
        icon: Truck,
        color: "bg-blue-100 text-blue-800 border-blue-200",
        bgColor: "bg-blue-50",
        pulseColor: "bg-blue-400",
    },
    delivered: {
        label: "Đã giao",
        icon: CheckCircle,
        color: "bg-green-100 text-green-800 border-green-200",
        bgColor: "bg-green-50",
        pulseColor: "bg-green-400",
    },
    cancelled: {
        label: "Đã hủy",
        icon: X,
        color: "bg-red-100 text-red-800 border-red-200",
        bgColor: "bg-red-50",
        pulseColor: "bg-red-400",
    },
};


export function OrderStatusBadge({ status, showIcon = true, showPulse = false, className }) {
    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;


    return (
        <div className="relative">
            <Badge className={cn(config.color, "flex items-center gap-2", className)}>
                {showIcon && <StatusIcon className="w-4 h-4" />}
                {config.label}
            </Badge>
            {showPulse && status === "shipping" && (
                <div className={cn("absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping", config.pulseColor)} />
            )}
        </div>
    );
}