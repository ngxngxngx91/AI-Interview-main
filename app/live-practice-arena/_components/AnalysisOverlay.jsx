"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

// Component hiển thị màn hình overlay khi đang phân tích kết quả phỏng vấn
const AnalysisOverlay = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg"
        >
            {/* Card chứa thông tin trạng thái phân tích */}
            <div className="bg-[#7B4F27] rounded-2xl shadow-2xl p-10 max-w-md mx-4 text-center border border-[#A97B5D]">
                <div className="flex flex-col items-center gap-4">
                    {/* Icon loading xoay tròn */}
                    <div className="p-4 rounded-full bg-[#A97B5D] mb-2">
                        <Loader2 className="w-12 h-12 text-white animate-spin" />
                    </div>
                    {/* Nội dung thông báo */}
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">
                            Đang phân tích phỏng vấn
                        </h3>
                        <p className="text-base text-white/90">
                            Đang xử lý cuộc hội thoại và chuẩn bị phản hồi...
                        </p>
                        {/* Icon hiệu ứng nhấp nháy */}
                        <div className="flex justify-center mt-2">
                            <Sparkles className="w-6 h-6 text-white/80 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AnalysisOverlay; 