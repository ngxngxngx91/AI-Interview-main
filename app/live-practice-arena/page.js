"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
    ArrowLeft,
    Timer,
    Play,
    Target,
    Clock,
    AlertCircle,
    Sparkles,
    Trophy,
    Brain
} from "lucide-react";
import ScenarioContent from "./_components/ScenarioContent";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

function LivePracticeArenaContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPracticeMode, setIsPracticeMode] = useState(false);
    const [selectedTime, setSelectedTime] = useState("");
    const [scenarioData, setScenarioData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showScenarioDetails, setShowScenarioDetails] = useState(true);
    const [expanded, setExpanded] = React.useState(false);

    // Các tùy chọn thời gian cho buổi phỏng vấn (tính bằng phút)
    const timeOptions = [
        {
            value: "3",
            label: "3 phút",
            description: "Phỏng vấn nhanh",
            icon: "⚡"
        },
        {
            value: "5",
            label: "5 phút",
            description: "Phỏng vấn tiêu chuẩn",
            icon: "⏱️"
        },
        {
            value: "10",
            label: "10 phút",
            description: "Phỏng vấn chuyên sâu",
            icon: "🕒"
        },
    ];

    useEffect(() => {
        // Lấy mockId từ URL
        const mockId = searchParams.get("mockId");
        if (mockId) {
            // Gọi API để lấy dữ liệu kịch bản từ database dựa trên mockId
            fetch(`/api/mock-interview?mockId=${mockId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Không thể lấy dữ liệu kịch bản');
                    }
                    return response.json();
                })
                .then(data => {
                    setScenarioData({
                        title: data.title || "Interview Practice",
                        description: data.description || "",
                        difficulty: data.difficulty || "medium",
                        scenario: data.scenario || "",
                        customerQuery: data.customerQuery || "",
                        expectedResponse: data.expectedResponse || "",
                        language: data.language || "en",
                        industry: data.industry || "",
                        role: data.role || "",
                        mockID: data.mockID,
                    });
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error("Lỗi khi lấy dữ liệu kịch bản:", error);
                    setError("Không thể tải kịch bản. Vui lòng thử lại.");
                    setIsLoading(false);
                });
        } else {
            // Nếu không có mockId, chuyển hướng về dashboard
            router.push("/dashboard");
        }
    }, [searchParams, router]);

    // Xử lý khi người dùng nhấn nút bắt đầu luyện tập
    const handleStartPractice = () => {
        if (selectedTime) {
            setIsPracticeMode(true);
        }
    };

    // Xử lý khi người dùng nhấn nút quay lại
    const handleBack = () => {
        if (isPracticeMode) {
            setIsPracticeMode(false);
        } else {
            router.back();
        }
    };

    // Xử lý khi hoàn thành buổi phỏng vấn (nhận feedbackData từ ScenarioContent)
    const handleInterviewComplete = async (feedbackData) => {
        try {
            // Nếu là phiên làm lại (có mockID), xóa phản hồi trước đó để tránh trùng lặp
            if (scenarioData.mockID) {
                const deleteResponse = await fetch(`/api/interview-feedback?mockId=${scenarioData.mockID}`, {
                    method: 'DELETE',
                });

                if (!deleteResponse.ok) {
                    console.error('Không thể xóa phản hồi trước đó', await deleteResponse.text());
                    // Có thể xử lý lỗi này nếu cần
                }
            }

            // Chuẩn bị dữ liệu phản hồi để lưu vào database
            const dataToSave = {
                mockIdRef: scenarioData.mockID,
                userEmail: "user@example.com",
                duration: feedbackData.duration,
                totalMessages: feedbackData.conversation.length,
                averageScore: feedbackData.averageScore,
                conversation: feedbackData.conversation,
                strengths: feedbackData.strengths,
                weaknesses: feedbackData.weaknesses,
                detailedFeedback: feedbackData.detailedFeedback,
                messageAnalysis: feedbackData.messageAnalysis
            };

            // Lưu phản hồi vào database qua API
            const response = await fetch('/api/interview-feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSave),
            });

            if (!response.ok) {
                throw new Error('Không thể lưu phản hồi');
            }

            // Chuyển hướng sang trang kết quả sau khi lưu thành công
            router.push(`/result-feedback?mockId=${scenarioData.mockID}`);
        } catch (error) {
            console.error('Lỗi khi lưu phản hồi:', error);
            // Xử lý lỗi nếu có
        }
    };

    // Debug: In ra dữ liệu kịch bản để kiểm tra
    console.log("scenarioData", scenarioData);

    // Hiển thị màn hình loading khi đang tải dữ liệu
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Đang Khởi Tạo Buổi Phỏng Vấn...</p>
                </motion.div>
            </div>
        );
    }

    // Hiển thị thông báo lỗi nếu có lỗi khi tải dữ liệu
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md mx-auto p-6"
                >
                    <div className="p-3 bg-red-900/20 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-100 mb-2">Oops!</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <Button onClick={() => router.push("/dashboard")}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-xl">
                        Quay Lại Bảng Điều Khiển
                    </Button>
                </motion.div>
            </div>
        );
    }

    // Giao diện chính của trang luyện tập phỏng vấn
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Nền mờ phía sau */}
            <img
                src="/live-practice-arena-background_1.png"
                alt="background"
                className="absolute inset-0 w-full h-full object-cover z-0 scale-105"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
            />
            {/* Lớp phủ làm tối */}
            <div className="absolute inset-0 z-0" />
            <div className={`relative z-10 w-full ${isPracticeMode ? 'max-w-none' : 'max-w-2xl mx-auto'} flex flex-col gap-6 px-2 py-6 -mt-3`}>
                {/* Khu vực trên cùng: Nút Thoát */}
                {!isPracticeMode && (
                    <div className="mb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="rounded-full px-5 py-2 text-gray-700 bg-white/80 hover:bg-white/90 shadow border border-gray-200 font-semibold text-base"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Thoát
                        </Button>
                    </div>
                )}
                {/* Khu vực thứ hai: Thông tin kịch bản */}
                {!isPracticeMode && (
                    <div className="w-full bg-white rounded-[28px] shadow-lg px-8 py-7 flex flex-col gap-6 z-10 relative">
                        {/* Tiêu đề kịch bản */}
                        <h2 className="text-2xl font-bold text-[#374151] mb-2">{scenarioData.title || 'Tiêu đề kịch bản'}</h2>
                        {/* Dòng badge */}
                        <div className="flex items-center gap-3 mb-2">
                            {/* Badge ngành nghề */}
                            {scenarioData.industry && (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#F0F6FF] text-[#2563EB] text-sm font-medium">
                                    <span role="img" aria-label="industry">🛒</span>
                                    {scenarioData.industry}
                                </span>
                            )}
                            {/* Badge độ khó */}
                            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#E6F9E6] text-[#22C55E] text-sm font-medium">
                                <span role="img" aria-label="difficulty">✔️</span>
                                {scenarioData.difficulty.charAt(0).toUpperCase() + scenarioData.difficulty.slice(1)}
                            </span>
                        </div>
                        {/* Mô tả kịch bản */}
                        <p className="text-base text-[#374151] mb-2">{scenarioData.description || scenarioData.scenario || 'Mô tả kịch bản...'}</p>
                        {/* Đường kẻ phân cách */}
                        <div className="border-t border-[#E5E7EB] my-2" />
                        {/* Hộp tình huống */}
                        <div className="bg-[#F9F6ED] rounded-xl p-4 mb-2">
                            <div className="font-semibold text-[#7C5C2A] mb-1">Tình huống</div>
                            <div className="text-[#7C5C2A] text-base">{scenarioData.customerQuery || 'Mô tả tình huống...'}</div>
                        </div>
                        {/* Gợi ý trả lời checklist */}
                        {
                        (() => {
                          // Tách các gợi ý trả lời thành checklist dựa trên số thứ tự
                          const tasks = (scenarioData.expectedResponse || '').split(/\s*\d+\.\s*/).filter(Boolean);
                          const showToggle = tasks.length > 0;
                          const visibleTasks = showToggle && !expanded ? tasks.slice(0, 0) : tasks;
                          return (
                            <div>
                              <div className="font-bold text-[#374151] mb-2">Gợi ý trả lời</div>
                              <ul className="space-y-2">
                                {visibleTasks.map((task, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-[#374151] text-base">
                                    <span className="mt-1 text-green-500"><svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#D1FADF"/><path d="M6 10.5l2.5 2.5L14 8.5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                                    <span>{task.trim()}</span>
                                  </li>
                                ))}
                              </ul>
                              {showToggle && (
                                <button
                                  className="mt-2 text-[#2563EB] text-sm font-medium focus:outline-none hover:underline"
                                  onClick={() => setExpanded(e => !e)}
                                >
                                  {expanded ? 'Thu gọn' : `Xem thêm (${tasks.length - 0})`}
                                </button>
                              )}
                            </div>
                          );
                        })()
                      }
                        {/* (Có thể thêm các nút hành động hoặc toggle chi tiết ở đây nếu cần) */}
                    </div>
                )}
                {/* Khu vực thứ ba: Chọn thời gian */}
                {!isPracticeMode && (
                    <div className="w-full bg-white rounded-[28px] shadow-lg px-8 py-7 flex flex-col z-10 relative">
                        <div className="mb-4">
                            <span className="block text-xl font-bold text-[#232E23] mb-4">Thời gian</span>
                            <div className="flex flex-row flex-wrap md:flex-nowrap gap-2 min-h-[104px] justify-center">
                                {timeOptions.map((option) => {
                                    const isSelected = selectedTime === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => setSelectedTime(option.value)}
                                            className={`flex-1 flex flex-col items-start justify-center px-8 py-4 rounded-[24px] border transition-all duration-200 text-left
                                                ${isSelected
                                                    ? 'bg-[#F1FBEF] border-[#7FC241] shadow-sm'
                                                    : 'bg-white border-[#D1D5DB] hover:border-[#7FC241] hover:bg-[#F6FBF3]'}
                                            `}
                                            style={{ height: '100%' }}
                                        >
                                            <span className={`text-xl font-bold mb-1 ${isSelected ? 'text-[#232E23]' : 'text-[#232E23]'}`}>{option.label}</span>
                                            <span className={`text-sm font-normal whitespace-nowrap ${isSelected ? 'text-[#6B7A6B]' : 'text-[#6B7A6B]'}`}>{option.description}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
                {/* {!isPracticeMode && (
                    <div className="w-full bg-white rounded-[28px] shadow-lg px-8 py-4 flex flex-col z-10 relative">
                        <div className="mb-4">
                            <span className="block text-xl font-bold text-[#232E23] mb-4">Ngôn ngữ phỏng vấn</span>
                            <Select value="vi">
                                <SelectTrigger className="w-full border border-[#E5E5E5] bg-white text-[#2D221B] focus:border-[#B6F09C] focus:ring-[#B6F09C]/20 rounded-xl h-12 flex items-center pr-2 relative">
                                <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white text-[#2D221B]">
                                <SelectItem value="vi">
                                    <span className="inline-flex items-center"><span className="mr-2 w-5 h-5 rounded-full bg-[#DA251D] flex items-center justify-center text-[#FFCD00] text-xs">★</span> Tiếng Việt</span>
                                </SelectItem>
                                <SelectItem value="en">
                                    <span className="inline-flex items-center"><span className="mr-2 w-5 h-5 rounded-full bg-[#1877F3] flex items-center justify-center text-white text-base">🇬🇧</span> English</span>
                                </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )} */}
                {/* Khu vực thứ tư: Nút bắt đầu */}
                {!isPracticeMode && (
                    <div>
                        <Button
                            className={`w-full h-12 rounded-[24px] text-lg transition-all duration-300 
                                ${!selectedTime
                                    ? 'bg-gray-200 text-gray-400'
                                    : 'bg-[#B5ED76] hover:bg-[#97e046] text-white shadow-lg hover:shadow-xl'
                                }`}
                            disabled={!selectedTime}
                            onClick={handleStartPractice}
                        >
                            <span className="flex items-center gap-2 text-black">
                                <Play className="w-5 h-5" />
                                Bắt đầu
                                <Sparkles className="w-5 h-5" />
                            </span>
                        </Button>
                    </div>
                )}
                {/* Chế độ luyện tập: Hiển thị giao diện luyện tập khi đã chọn thời gian */}
                {isPracticeMode && (
                    <motion.div className="w-full h-[calc(100vh-7rem)] flex items-center justify-center">
                        <ScenarioContent
                            scenarioData={scenarioData}
                            timeLimit={parseInt(selectedTime)}
                            onInterviewComplete={handleInterviewComplete}
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default function LivePracticeArena() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Đang Tải...</p>
                    </div>
                </div>
            }
        >
            <LivePracticeArenaContent />
        </Suspense>
    );
} 