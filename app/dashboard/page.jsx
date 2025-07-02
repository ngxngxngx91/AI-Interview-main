"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    FiActivity,
    FiClock,
    FiTarget,
    FiArrowRight
} from "react-icons/fi";
import { Trophy } from "lucide-react";
import Image from "next/image";
import ScenarioDesignModal from "./_components/ScenarioDesignModal";
import InterviewList from "./_components/InterviewList";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function DashBoard() {
    const [showDesignModal, setShowDesignModal] = useState(false);

    return (
        <div className="w-full min-h-screen bg-[#FAF8F6]">
            <div className="max-w-7xl mx-auto px-4 sm:px-2 lg:px-4 py-12">
                {/* Phần Hero - Thông điệp chào mừng với animation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-5 mb-8"
                >
                    {/* Avatar người dùng */}
                    <div className="w-24 h-24 flex items-center justify-center relative overflow-hidden">
                        <Image
                            src="/dasboard_icon_1.png"
                            alt="User Avatar"
                            layout="fill"
                            objectFit="cover"
                            className="absolute inset-0"
                            quality={100}
                        />
                    </div>
                    {/* Thông tin chào mừng */}
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 text-left">
                            Chào mừng trở lại
                        </h1>
                        <p className="text-base md:text-lg text-gray-600 text-left">
                            Bạn đã sẵn sàng nâng cao kỹ năng phỏng vấn hôm nay chưa?
                        </p>
                    </div>
                </motion.div>

                {/* Grid chính: Card thực hành (trái) và Tính năng (phải) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-16">

                    {/* Cột trái - Card thực hành trực tiếp */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 flex flex-col h-full"
                    >
                        <div className="relative h-full">
                            {/* Hiệu ứng bóng đổ cho card */}
                            <Card className="bg-lime-600 max-[580px]:bg-[#b6ed76] rounded-[2.5rem] overflow-hidden border-none h-full w-full absolute top-1.5 left-0 z-0" />
                            {/* Card chính với nội dung */}
                            <Image
                                src="/dasboard_background_1.png"
                                alt="Background"
                                layout="fill"
                                objectFit="cover"
                                quality={100}
                                className="absolute inset-0 rounded-[2rem] max-[580px]:hidden"
                            />
                            <CardContent className="p-8 h-full flex text-gray-800 relative z-10">
                                {/* Container cho nội dung bên trái */}
                                <div className="flex flex-col justify-start h-full z-10 pr-4 w-3/4 max-[580px]:w-full items-start pt-2">
                                    {/* Label "Nổi bật" */}
                                    <div className="inline-flex items-center gap-2 bg-white text-lime-700 px-4 py-2 rounded-[1rem] text-lg font-semibold mb-4 shadow border border-lime-300">
                                        <FiActivity className="w-4 h-4" />
                                        Nổi bật
                                    </div>
                                    {/* Tiêu đề và mô tả */}
                                    <h2 className="text-4xl font-bold text-gray-900 mb-3 text-left">
                                        Phỏng vấn thực chiến
                                    </h2>
                                    <p className="text-gray-800 text-left">
                                        Thực hành phỏng vấn thời gian thực với AI,
                                    </p>
                                    <p className="text-gray-800 mb-6 text-left">
                                        nhận phản hồi tức thì để phát triển!
                                    </p>
                                    {/* Nút CTA với hiệu ứng hover */}
                                    <Button
                                        onClick={() => setShowDesignModal(true)}
                                        className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white h-14 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group px-8 self-start border-2 border-white"
                                    >
                                        Bắt đầu ngay
                                        <FiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </CardContent>
                        </div>
                    </motion.div>

                    {/* Cột phải - Danh sách tính năng */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 flex flex-col h-full relative sm:mx-auto sm:w-full"
                    >
                        {/* Hiệu ứng bóng đổ cho card tính năng */}
                        <Card className="bg-[#3a220f] rounded-[2rem] overflow-hidden border-none h-full w-full absolute top-1.5 left-0 z-0" />
                        {/* Card tính năng chính */}
                        <Card className="bg-[#4F3422] rounded-[2rem] p-6 shadow-xl border border-amber-900 h-full flex flex-col z-10 relative">
                            <h3 className="text-lg font-bold text-gray-100 mb-4">Tính năng nổi bật</h3>
                            {/* Danh sách các tính năng */}
                            <div className="space-y-6 flex-grow flex flex-col justify-center">
                                {/* Tính năng 1: Phản hồi thời gian thực */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-12 rounded-xl bg-[#684B38] flex items-center justify-center">
                                        <Image
                                            src="/dasboard_icon_2.png"
                                            alt="Real-time feedback icon"
                                            width={32}
                                            height={32}
                                            quality={100}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-semibold text-gray-100">Phản hồi thời gian thực</h3>
                                        <p className="text-gray-300">Nhận ngay những nhận xét chi tiết về câu trả lời của bạn!</p>
                                    </div>
                                </div>

                                {/* Tính năng 2: Phản hồi từ AI */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-12 rounded-xl bg-[#684B38] flex items-center justify-center">
                                        <Image
                                            src="/dasboard_icon_3.png"
                                            alt="AI feedback icon"
                                            width={32}
                                            height={32}
                                            quality={100}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-semibold text-gray-100">Phản hồi từ AI</h3>
                                        <p className="text-gray-300">Trò chuyện tự nhiên, thoải mái cùng công nghệ Al tiên tiến!</p>
                                    </div>
                                </div>

                                {/* Tính năng 3: Phân tích thể hiện */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-12 rounded-xl bg-[#684B38] flex items-center justify-center">
                                        <Image
                                            src="/dasboard_icon_4.png"
                                            alt="Performance analysis icon"
                                            width={32}
                                            height={32}
                                            quality={100}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-semibold text-gray-100">Phân tích thể hiện</h3>
                                        <p className="text-gray-300">Điểm số chi tiết và bí quyết cải thiện dành riêng cho bạn!</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Phần lịch sử phỏng vấn */}
                <InterviewList setShowDesignModal={setShowDesignModal} />

            </div>

            {/* Modal thiết kế kịch bản phỏng vấn */}
            <ScenarioDesignModal
                show={showDesignModal}
                onClose={() => setShowDesignModal(false)}
            />
        </div>
    );
}

export default DashBoard;
