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
const Message = ({ message }) => {
    const isUser = message.type === 'user';
    const hasAnalysis = message.analysis && message.type === 'user';
    const [showAnalysis, setShowAnalysis] = useState(false);

    // Hàm xác định màu sắc dựa trên điểm số
    const getScoreColor = (score) => {
        if (score >= 80) return 'from-emerald-500 to-green-500';
        if (score >= 60) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-rose-500';
    };

    // Component hiển thị phần phân tích tin nhắn
    const renderAnalysis = () => {
        if (!hasAnalysis) return null;

        return (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-orange-400/40"
            >
                {/* Badge hiển thị điểm số */}
                <div className="flex items-center gap-3 mb-4">
                    <Badge
                        className={`bg-gradient-to-r ${getScoreColor(message.analysis.overallScore)} text-white px-3 py-1 shadow-md`}
                    >
                        <Star className="w-3.5 h-3.5 mr-1" />
                        Score: {message.analysis.overallScore}
                    </Badge>
                    <Progress
                        value={message.analysis.overallScore}
                        className={`h-2 w-24 bg-gray-800 [&>div]:bg-gradient-to-r ${getScoreColor(message.analysis.overallScore)}`}
                    />
                </div>

                {/* Phần hiển thị điểm mạnh */}
                {message.analysis.strengths.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 bg-emerald-900/30 rounded-xl p-3"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-emerald-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                            </div>
                            <span className="text-sm font-medium text-emerald-200">Key Strengths</span>
                        </div>
                        <ul className="space-y-2">
                            {message.analysis.strengths.map((strength, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="text-sm text-emerald-200 flex items-center gap-2"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {strength}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                {/* Phần hiển thị điểm cần cải thiện */}
                {message.analysis.weaknesses.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 bg-red-900/30 rounded-xl p-3"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-red-800">
                                <TrendingUp className="w-4 h-4 text-red-300" />
                            </div>
                            <span className="text-sm font-medium text-red-200">Growth Areas</span>
                        </div>
                        <ul className="space-y-2">
                            {message.analysis.weaknesses.map((weakness, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="text-sm text-red-200 flex items-center gap-2"
                                >
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {weakness}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                {/* Phần phản hồi chi tiết */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-blue-900/30 rounded-xl p-3"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-blue-800">
                            <Clock className="w-4 h-4 text-blue-300" />
                        </div>
                        <span className="text-sm font-medium text-blue-200">Personalized Feedback</span>
                    </div>
                    <p className="text-sm text-blue-200">{message.analysis.feedback}</p>
                </motion.div>
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
                    ${isUser ? 'bg-gradient-to-br from-orange-400 to-rose-400' : 'bg-gradient-to-br from-blue-400 to-purple-400'} text-white`}
            >
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </motion.div>

            {/* Nội dung tin nhắn */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`flex-1 max-w-[80%] rounded-2xl px-4 py-3 shadow-md
                    ${isUser ? 'bg-gradient-to-br from-orange-900/80 to-rose-900/80' : 'bg-gradient-to-br from-blue-900/80 to-purple-900/80'} border border-blue-700/30`}
            >
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${isUser ? 'text-orange-100' : 'text-blue-100'}`}>
                        {message.content}
                    </p>
                    {/* Nút mở/đóng phân tích cho tin nhắn của người dùng */}
                    {isUser && (
                        <div className="flex items-center gap-2">
                            {message.analysis === null ? (
                                <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                            ) : message.analysis.error ? (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowAnalysis(!showAnalysis)}
                                    className={`p-1.5 rounded-full transition-colors ${showAnalysis ? 'bg-orange-700/80' : 'hover:bg-orange-800/60'}`}
                                >
                                    {showAnalysis ? (
                                        <ChevronUp className="w-4 h-4 text-orange-200" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-orange-200" />
                                    )}
                                </motion.button>
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