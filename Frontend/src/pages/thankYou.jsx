// src/pages/ThankYou.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE_PATH } from "../constants/routePath";

export default function ThankYou() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const orderId = state?.orderId || "";

  return (
    <div className="flex items-center justify-center px-4">
      <div className="bg-custom-green/4 shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-emerald-50 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
        {orderId && (
          <p className="text-gray-600 mb-4 text-sm">
            Mã đơn hàng của bạn: <span className="font-medium">{orderId}</span>
          </p>
        )}
        <p className="text-gray-500 text-sm mb-6">
          Cảm ơn bạn đã mua sắm tại cửa hàng. Chúng tôi sẽ sớm liên hệ và giao hàng
          trong thời gian sớm nhất.
        </p>

        <button
          onClick={() => navigate(ROUTE_PATH.HOME)}
          className="px-5 py-3 bg-custom-green text-white rounded-xl font-semibold hover:opacity-90 transition cursor-pointer"
        >
          Quay về Trang chủ
        </button>
      </div>
    </div>
  );
}
