// "use client";
// import React from "react";
// 




"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Target,
  Users,
  Zap,
  Send,
  RefreshCcw,
  Sparkles,
  CheckCircle2,
  Star,
  Timer,
  TrendingUp,
  ChevronRight,
  PlayCircle,
  Mic,
  MessageSquare,
  Target2,
  BrainCircuit
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const [showTryNow, setShowTryNow] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
const plans = [
  {
    name: "Gói ngày",
    price: "35.000 VNĐ/ngày",
    features: [
      "Cá nhân hóa theo ngành nghề",
      "Điều chỉnh theo mức độ kinh nghiệm",
      "Gợi ý câu hỏi phỏng vấn dựa trên JD",
      "Phân tích giọng nói, nội dung cơ bản",
    ],
    extraFeatures: [false, false, false, false, false, false, false, false],
    highlight: false,
  },
  {
    name: "Gói tuần",
    price: "89.000 VNĐ/tuần",
    features: [
      "Cá nhân hóa theo ngành nghề",
      "Điều chỉnh theo mức độ kinh nghiệm",
      "Gợi ý câu hỏi phỏng vấn dựa trên JD",
      "Phân tích giọng nói, nội dung cơ bản",
      "Mở phòng tập lưu thời gian",
      "Phân tích đa chiều (giọng nói, ngôn ngữ cơ thể, nội dung chi tiết)",
    ],
    extraFeatures: [false, false, false, false, false, false, false, false],
    highlight: false,
  },
  {
    name: "Gói tháng",
    price: "249.000 VNĐ/tháng",
    features: [
      "Cá nhân hóa theo ngành nghề",
      "Điều chỉnh theo mức độ kinh nghiệm",
      "Gợi ý câu hỏi phỏng vấn dựa trên JD",
      "Phân tích giọng nói, nội dung cơ bản",
      "Mở phòng tập lưu thời gian",
      "Phân tích đa chiều (giọng nói, ngôn ngữ cơ thể, nội dung chi tiết)",
      "Phân tích đa chiều chuyên sâu, đề xuất cá nhân hóa",
      "Thư viện câu hỏi mẫu",
      "Lưu lịch sử phỏng vấn",
    ],
    extraFeatures: [true, true, true, false, false, false, false, false],
    highlight: true,
  },
  {
    name: "Gói V-VIP",
    price: "Sắp ra mắt",
    features: [
      "Cá nhân hóa theo ngành nghề",
      "Điều chỉnh theo mức độ kinh nghiệm",
      "Gợi ý câu hỏi phỏng vấn dựa trên JD",
      "Phân tích giọng nói, nội dung cơ bản",
      "Mở phòng tập lưu thời gian",
      "Phân tích đa chiều (giọng nói, ngôn ngữ cơ thể, nội dung chi tiết)",
      "Phân tích đa chiều chuyên sâu, đề xuất cá nhân hóa",
      "Thư viện câu hỏi mẫu",
      "Lưu lịch sử phỏng vấn",
      "Có chuyên gia tư vấn 1 - 1 (Phỏng vấn trực tiếp)",
      "Có chuyên gia (Sửa CV)",
      "Chia sẻ cơ hội nghề nghiệp tương ứng với người dùng",
    ],
    extraFeatures: [true, true, true, true, true, true, true, true],
    highlight: false,
  },
];
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FCF9F2] to-white">
      {/* Hero Section với Navigation */}
      <div className="relative bg-[#FCF9F2] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation */}
          <div className="flex justify-between items-center w-full mb-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image src="/Logo.png" alt="AI.Interview Logo" width={40} height={40} quality={100} priority />
              <span className="font-bold text-2xl text-[#22372B] hidden sm:inline">AI.Interview</span>
            </Link>
            {/* Menu */}
            <nav className="hidden md:flex max-lg:gap-7 gap-16 text-lg">
              <Link href="#how-it-works" className="text-[#4B6358] hover:text-[#22372B] transition-colors font-normal">Cách hoạt động</Link>
              <Link href="/pricing" className="text-[#4B6358] hover:text-[#22372B] transition-colors font-normal">Bảng giá</Link>
              <Link href="#affiliate" className="text-[#4B6358] hover:text-[#22372B] transition-colors font-normal">Affiliate</Link>
            </nav>
            {/* CTA Button */}
            <Link href="/dashboard">
              <button className="bg-gradient-to-r from-[#F97C7C] to-[#D72660] text-white font-bold rounded-full px-8 py-2 shadow-md text-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95">
                Bắt đầu ngay
              </button>
            </Link>
          </div>

          {/* Pricing Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#22372B] mb-6">
              Chọn Gói Phù Hợp Với Bạn
            </h1>
            <p className="text-lg text-[#4B6358]">
              Đầu tư cho sự nghiệp của bạn với các gói dịch vụ được thiết kế phù hợp với nhu cầu của bạn
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-3xl p-8 shadow-lg transition-all duration-300 hover:shadow-2xl ${
                  plan.highlight 
                    ? "bg-gradient-to-b from-white to-pink-50 border-2 border-pink-500 transform hover:-translate-y-2" 
                    : "bg-white hover:-translate-y-1"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#F97C7C] to-[#D72660] text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Phổ biến nhất
                    </span>
                  </div>
                )}
                  <div className="flex flex-col h-full">
                  <h3 className="text-2xl font-bold text-[#22372B] mb-3">{plan.name}</h3>
                  <p className="text-2xl font-bold text-pink-600 mb-6">{plan.price}</p>
                  
                  <ul className="space-y-4 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-[#4B6358]">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/checkout" className="block mt-8">
                    <button
                      className={`w-full py-3 rounded-full font-semibold transition-all duration-200 ${
                        plan.price === "Sắp ra mắt"
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : plan.highlight
                          ? "bg-gradient-to-r from-[#F97C7C] to-[#D72660] text-white hover:shadow-lg"
                          : "bg-pink-100 text-pink-600 hover:bg-pink-200"
                      }`}
                      disabled={plan.price === "Sắp ra mắt"}
                    >
                      {plan.price === "Sắp ra mắt" ? "Sắp ra mắt" : "Đăng ký ngay"}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Comparison */}
          <div className="mt-24 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#22372B] mb-4">So Sánh Tính Năng Chi Tiết</h2>
              <p className="text-[#4B6358]">Xem chi tiết các tính năng có trong từng gói dịch vụ</p>
            </div>
            
            <div className="overflow-x-auto rounded-2xl shadow-lg bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#22372B]">Tính năng</th>
                    {plans.map((plan, idx) => (
                      <th key={idx} className="px-6 py-4 text-center">
                        <div className="font-semibold text-[#22372B]">{plan.name}</div>
                        <div className="text-pink-600 text-sm mt-1">{plan.price}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {/*
                    "Phân tích đa chiều chuyên sâu, đề xuất cải thiện cá nhân hóa",
                    "Thư viện câu hỏi mẫu",
                    "Lưu lịch sử phỏng vấn",
                    "Có chuyên gia tư vấn 1 - 1 (Phỏng vấn trực tiếp)",
                    "Có chuyên gia (Sửa CV)",
                    "Chia sẻ cơ hội nghề nghiệp tương ứng với người dùng",
                  */ plans[2].features.map((feature, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-[#4B6358]">{feature}</td>
                      {plans.map((plan, j) => (
                        <td key={j} className="px-6 py-4 text-center">
                          {plan.extraFeatures[i] ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-24 mb-16 text-center max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-[#22372B] mb-12">Tại sao nên chọn AI.Interview?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-6">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#22372B] mb-4">Cải thiện sự tự tin</h3>
                <p className="text-[#4B6358]">Thực hành thường xuyên giúp bạn tự tin hơn trong các cuộc phỏng vấn thực tế</p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
                  <Timer className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#22372B] mb-4">Quản lý thời gian</h3>
                <p className="text-[#4B6358]">Học cách trình bày câu trả lời một cách ngắn gọn, đầy đủ trong thời gian cho phép</p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#22372B] mb-4">Theo dõi tiến độ</h3>
                <p className="text-[#4B6358]">Xem lại lịch sử phỏng vấn và đánh giá sự tiến bộ của bạn theo thời gian</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section - Vietnamese Redesign */}
      <footer className="w-full bg-[#FCF9F2] pt-12 pb-4 mt-12 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Left: Logo and Description */}
          <div className="flex-1 min-w-[220px] flex flex-col gap-3 items-start justify-start">
            <div className="flex items-center gap-2 mb-2">
              <Image src="/Logo.png" alt="AI.Interview Logo" width={88} height={88} quality={100} priority />
              <span className="font-bold text-2xl text-[#22372B]">AI.Interview</span>
            </div>
            <p className="text-[#4B6358] text-base">
              AI Interview là nền tảng phỏng vấn thử ứng dụng trí tuệ nhân tạo, giúp bạn luyện tập kỹ năng trả lời phỏng vấn mọi lúc, mọi nơi
            </p>
          </div>
          {/* Right: All Links */}
          <div className="flex-1 min-w-[320px] flex flex-col md:flex-row gap-8 items-start justify-end">
            {/* Product Links */}
            <div className="min-w-[150px]">
              <div className="font-bold text-[#22372B] mb-3">Sản phẩm</div>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-[#4B6358] hover:underline">Cách hoạt động</a></li>
                <li><a href="#pricing" className="text-[#4B6358] hover:underline">Bảng giá</a></li>
                <li><a href="#affiliate" className="text-[#4B6358] hover:underline">Affiliate</a></li>
              </ul>
            </div>
            {/* About Links */}
            <div className="min-w-[150px]">
              <div className="font-bold text-[#22372B] mb-3">Về AI.Interview</div>
              <ul className="space-y-2">
                <li><a href="#policy" className="text-[#4B6358] hover:underline">Chính sách</a></li>
                <li><a href="#terms" className="text-[#4B6358] hover:underline">Điều khoản và dịch vụ</a></li>
                <li><a href="#payment-policy" className="text-[#4B6358] hover:underline">Chính sách thanh toán</a></li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-8 border-[#F0F0E0]" />
        <div className="text-center text-[#7A8576] text-sm">
          Copyright © AI.Interview 2025. All Rights Reserved
        </div>
      </footer>
    </div>
  );
}


