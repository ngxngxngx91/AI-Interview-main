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
            <div className="bg-gray-900/95 rounded-2xl shadow-2xl p-10 max-w-md mx-4 text-center border border-blue-700/30">
                <div className="flex flex-col items-center gap-4">
                    {/* Icon loading xoay tròn */}
                    <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-2">
                        <Loader2 className="w-12 h-12 text-white animate-spin" />
                    </div>
                    {/* Nội dung thông báo */}
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Analyzing Your Interview
                        </h3>
                        <p className="text-base text-gray-300">
                            Processing your conversation and preparing feedback...
                        </p>
                        {/* Icon hiệu ứng nhấp nháy */}
                        <div className="flex justify-center mt-2">
                            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AnalysisOverlay; 