"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Bot,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Star,
    TrendingUp,
    Clock,
    ChevronDown,
    ChevronUp,
    Loader2,
    Sparkles
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Component hiển thị tin nhắn trong cuộc phỏng vấn
const Message = ({ message, isFirstUserMessage }) => {
    const isUser = message.type === 'user';
    const hasAnalysis = message.analysis && message.type === 'user';
    const [showAnalysis, setShowAnalysis] = useState(false);

    // Hàm xác định màu sắc dựa trên điểm số
    const getScoreColor = (score) => {
        if (score >= 80) return 'from-emerald-500 to-green-500';
        if (score >= 60) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-rose-500';
    };

    // Component hiển thị phần phân tích tin nhắn (NEW UI)
    const renderAnalysis = () => {
        if (!hasAnalysis) return null;
        const diemCanCaiThien = message.analysis.diem_can_cai_thien || message.analysis.weaknesses || [];
        const diemSo = message.analysis.diem_so ?? message.analysis.overallScore ?? 0;
        const phanHoi = message.analysis.phan_hoi || message.analysis.feedback || '';

        // Score color for circle
        const getScoreColor = (score) => {
            if (score < 30) return '#e88a7d'; // đỏ
            if (score < 65) return '#eac36b'; // vàng
            return '#8bc34a'; // xanh lá
        };

        return (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 rounded-2xl bg-[#4B372E] bg-gradient-to-b from-[#4B372E] to-[#7B4F27] px-6 pb-6 border border-[#A97B5D] shadow-lg"
            >
                {/* Top: Score circle + Feedback */}
                <div className="flex items-center gap-6 mb-6">
                    {/* Vòng tròn điểm số */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center">
                        <svg width="64" height="64" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e5e5" strokeWidth="6" />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke={getScoreColor(diemSo)}
                                strokeWidth="6"
                                strokeDasharray={2 * Math.PI * 28}
                                strokeDashoffset={2 * Math.PI * 28 * (1 - (diemSo / 100))}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.5s' }}
                            />
                            <text x="32" y="40" textAnchor="middle" fontSize="20" fill="#E5D6C6" fontWeight="bold">{diemSo}</text>
                        </svg>
                        <span className="text-xs text-[#E5D6C6] mt-1">Điểm</span>
                    </div>
                    {/* Nội dung phản hồi */}
                    <div className="flex-1">
                        <p className="text-sm text-[#F5E9DD] leading-relaxed">{phanHoi}</p>
                    </div>
                </div>
                {/* Bottom: Điểm cần cải thiện */}
                <div className="bg-[#7B4F27]/80 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-base font-semibold text-[#FFD6B0]">Các điểm cần cải thiện</span>
                    </div>
                    <ul className="space-y-2">
                        {diemCanCaiThien.length === 0 ? (
                            <li className="text-sm text-[#FFD6B0]">Không có điểm cần cải thiện.</li>
                        ) : (
                            diemCanCaiThien.map((weakness, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-[#FFD6B0]">
                                    <span className="inline-block w-2 h-2 rounded-full bg-[#FFD6B0] mr-2" />
                                    {weakness}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </motion.div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
        >
            {/* Avatar người dùng hoặc bot */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md
                    ${isUser ? 'bg-[#7B4F27]' : 'bg-[#F8F6F2]'} text-white`}
            >
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-[#7B4F27]" />}
            </motion.div>

            {/* Nội dung tin nhắn */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`flex-1 max-w-[80%] rounded-2xl px-5 py-3 shadow-md font-sans
                    ${isUser ? 'bg-[#7B4F27] text-white' : 'bg-[#F8F6F2] text-[#2D2D2D]'} `}
            >
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-base leading-relaxed ${isUser ? '' : ''}`}>
                        {message.content}
                    </p>
                    {/* Nút mở/đóng phân tích cho tin nhắn của người dùng */}
                    {isUser && (
                        <div className="flex items-center gap-2 relative">
                            {message.analysis === null ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                            ) : message.analysis.error ? (
                                <AlertCircle className="w-4 h-4 text-red-200" />
                            ) : (
                                <>
                                    {isFirstUserMessage && !showAnalysis && (
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                                            <div className="bg-[#232B22] text-white text-xs px-3 py-1 rounded-2xl shadow-lg text-center whitespace-nowrap">
                                                Nhấn để xem phân tích câu trả lời
                                            </div>
                                            <div className="w-3 h-3 bg-[#232B22] rotate-45 -mt-1" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}></div>
                                        </div>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowAnalysis(!showAnalysis)}
                                        className={`p-1.5 rounded-full transition-colors ${showAnalysis ? 'bg-[#A97B5D]' : 'hover:bg-[#A97B5D]/80'}`}
                                    >
                                        {showAnalysis ? (
                                            <ChevronUp className="w-4 h-4 text-white" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-white" />
                                        )}
                                    </motion.button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Phần phân tích tin nhắn */}
                <AnimatePresence>
                    {showAnalysis && renderAnalysis()}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default Message; 