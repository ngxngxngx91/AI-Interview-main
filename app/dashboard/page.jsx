"use client";
import { UserButton } from "@clerk/nextjs";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    FiActivity,
    FiClock,
    FiTarget,
    FiArrowRight
} from "react-icons/fi";
import { Trophy } from "lucide-react";
import LivePracticeModal from "./_components/LivePracticeModal";
import ScenarioDesignModal from "./_components/ScenarioDesignModal";
import InterviewList from "./_components/InterviewList";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function DashBoard() {
    const [showDesignModal, setShowDesignModal] = useState(false);
    const [showLivePractice, setShowLivePractice] = useState(false);
    const [scenario, setScenario] = useState(null);

    return (
        <div className="w-full min-h-screen bg-[#FAF8F6]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section (Welcome Message) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-5 mb-8"
                >
                    {/* Avatar placeholder */}
                    <div className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center shadow-md">
                        {/* You can replace this with an <img> or SVG later */}
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 text-left">
                            Chào mừng trở lại
                        </h1>
                        <p className="text-base md:text-lg text-gray-600 text-left">
                            Bạn đã sẵn sàng nâng cao kỹ năng phỏng vấn hôm nay chưa?
                        </p>
                    </div>
                </motion.div>

                {/* Main Content Grid: Practice Card (Left) and Features (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-16">

                    {/* Left Column - Live Practice Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="md:col-span-2 flex flex-col h-full"
                    >
                        <div className="relative h-full">
                            {/* Card shadow as a real card */}
                            <Card className="bg-lime-600 rounded-[2.5rem] overflow-hidden border-none h-full w-full absolute top-1.5 left-0 z-0" />
                            <Card className="bg-lime-400 rounded-[2rem] overflow-hidden shadow-2xl border border-lime-300 h-full flex flex-col z-10 relative">
                                <CardContent className="p-8 h-full flex text-gray-800 relative">
                                    {/* Placeholder for the person figure covering the right half */}
                                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-400/30 rounded-tl-full"></div>
                                    {/* Container for left-aligned text and button, moved closer to top-left */}
                                    <div className="flex flex-col justify-start h-full z-10 pr-4 w-3/4 items-start pt-2">
                                        {/* More prominent 'Nổi bật' label */}
                                        <div className="inline-flex items-center gap-2 bg-white text-lime-700 px-4 py-2 rounded-[1rem] text-lg font-semibold mb-4 shadow border border-lime-300">
                                            <FiActivity className="w-4 h-4" />
                                            Nổi bật
                                        </div>
                                        <h2 className="text-4xl font-bold text-gray-900 mb-3 text-left">
                                            Phỏng vấn thực chiến
                                        </h2>
                                        <p className="text-gray-800 text-left">
                                            Thực hành phỏng vấn thời gian thực với AI,
                                        </p>
                                        <p className="text-gray-800 mb-6 text-left">
                                            nhận phản hồi tức thì để phát triển!
                                        </p>
                                        {/* More rounded, prominent button */}
                                        <Button
                                            onClick={() => setShowDesignModal(true)}
                                            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white h-14 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group px-8 self-start border-2 border-white"
                                        >
                                            Bắt đầu ngay
                                            <FiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>

                    {/* Right Column - Features - Grouped into a single box */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="md:col-span-1 flex flex-col h-full relative"
                    >
                        {/* Card shadow as a real card for features */}
                        <Card className="bg-[#3a220f] rounded-[2rem] overflow-hidden border-none h-full w-full absolute top-1.5 left-0 z-0" />
                        <Card className="bg-amber-950 rounded-[2rem] p-6 shadow-xl border border-amber-900 h-full flex flex-col z-10 relative">
                            <h3 className="text-lg font-bold text-gray-100 mb-4">Tính năng nổi bật</h3>
                            <div className="space-y-6 flex-grow flex flex-col justify-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-md bg-blue-500/20"></div>
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-semibold text-gray-100">Phản hồi thời gian thực</h3>
                                        <p className="text-gray-300">Nhận ngay những nhận xét chi tiết về câu trả lời của bạn!</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-md bg-purple-500/20"></div>
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-semibold text-gray-100">Phản hồi từ AI</h3>
                                        <p className="text-gray-300">Trò chuyện tự nhiên, thoải mái cùng công nghệ Al tiên tiến!</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-md bg-emerald-500/20"></div>
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-semibold text-gray-100">Phân tích thể hiện</h3>
                                        <p className="text-gray-300">Điểm số chi tiết và bí quyết cải thiện dành riêng cho bạn!</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Interview History Section */}
                <InterviewList />

            </div>

            {/* Scenario Design Modal */}
            <ScenarioDesignModal
                show={showDesignModal}
                onClose={() => setShowDesignModal(false)}
                onProceed={(generatedScenario) => {
                    setScenario(generatedScenario);
                    setShowDesignModal(false);
                    setShowLivePractice(true);
                }}
            />

            {/* Live Practice Modal */}
            <LivePracticeModal
                showLivePractice={showLivePractice}
                setShowLivePractice={setShowLivePractice}
                scenario={scenario}
            />
        </div>
    );
}

export default DashBoard;
