"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function PaymentPage() {
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  const originalPrice = 65000;
  const discountAmount = 30000;
  const totalPrice = discountApplied ? originalPrice - discountAmount : originalPrice;

  const applyDiscount = () => {
    if (discountCode === "GIAM30K") {
      setDiscountApplied(true);
    } else {
      alert("Mã giảm giá không hợp lệ.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f2e9] flex justify-center items-center p-4">
      {/* Button to return to pricing page */}
      <Link href="/pricing" className="absolute top-6 left-6 z-50">
        <button className="bg-white border border-gray-200 rounded-full px-4 py-2 shadow hover:bg-gray-100 font-semibold text-gray-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          Quay lại bảng giá
        </button>
      </Link>
      <div className="bg-white rounded-2xl shadow-lg p-8 grid md:grid-cols-2 gap-8 max-w-5xl w-full">
        {/* Thông tin đơn hàng */}
        <div  className="text-gray-800">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin đơn hàng</h2>
          <div className="bg-[#fff8f0] rounded-lg p-4 mb-4 shadow-inner">
            <div className="flex items-center gap-3 mb-2">
              <img src="/sun-icon.png" alt="icon" className="w-6 h-6" />
              <strong>AI.Interview</strong> - <span>Gói ngày</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                className="border px-3 py-2 rounded w-full text-sm"
                placeholder="Nhập mã giảm giá"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <button
                onClick={applyDiscount}
                className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded"
              >
                Áp dụng
              </button>
            </div>

            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Thành tiền</span>
                <span>{originalPrice.toLocaleString()} VND</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá</span>
                <span className="text-green-500">- {discountApplied ? discountAmount.toLocaleString() : "0"} VND</span>
              </div>
              <div className="flex justify-between font-semibold text-green-600 pt-2 border-t mt-2">
                <span>Tổng tiền</span>
                <span>{totalPrice.toLocaleString()} VND</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin thanh toán */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Thông tin thanh toán</h2>
          <p className="text-sm text-gray-600 mb-3">
            Vui lòng quét mã QR dưới đây để tiến hành thanh toán
          </p>
          <div className="bg-white border border-green-300 rounded-xl p-4 text-center">
            <img
              src="/qr-example.png"
              alt="QR Code"
              className="mx-auto w-40 h-40"
            />
            <p className="text-sm text-gray-700 mt-2 mb-1">Mở ứng dụng ngân hàng số và quét mã QR dưới đây</p>
            <div className="flex justify-center items-center gap-4 mt-2 text-xs text-gray-500">
              <span>napas 24/7</span>
              <span>MB</span>
              <span>VietQR</span>
            </div>
            <button className="bg-green-400 hover:bg-green-500 text-white mt-4 px-4 py-2 rounded-full">
              Tải QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
