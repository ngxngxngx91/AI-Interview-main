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
            // Lấy dữ liệu kịch bản từ database
            fetch(`/api/mock-interview?mockId=${mockId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch scenario data');
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
                    console.error("Error fetching scenario data:", error);
                    setError("Failed to load scenario. Please try again.");
                    setIsLoading(false);
                });
        } else {
            router.push("/dashboard");
        }
    }, [searchParams, router]);

    const handleStartPractice = () => {
        if (selectedTime) {
            setIsPracticeMode(true);
        }
    };

    const handleBack = () => {
        if (isPracticeMode) {
            setIsPracticeMode(false);
        } else {
            router.back();
        }
    };

    const handleInterviewComplete = async (feedbackData) => {
        try {
            // Nếu là phiên làm lại (có mockID), xóa phản hồi trước đó
            if (scenarioData.mockID) {
                const deleteResponse = await fetch(`/api/interview-feedback?mockId=${scenarioData.mockID}`, {
                    method: 'DELETE',
                });

                if (!deleteResponse.ok) {
                    console.error('Failed to delete previous feedback', await deleteResponse.text());
                    // Optionally, handle this error more gracefully
                }
            }

            // Chuẩn bị dữ liệu phản hồi để lưu
            const dataToSave = {
                mockIdRef: scenarioData.mockID,
                userEmail: "user@example.com", // Thay thế bằng email người dùng thực tế từ auth
                duration: feedbackData.duration,
                totalMessages: feedbackData.conversation.length,
                averageScore: feedbackData.averageScore,
                conversation: feedbackData.conversation,
                strengths: feedbackData.strengths,
                weaknesses: feedbackData.weaknesses,
                detailedFeedback: feedbackData.detailedFeedback,
                messageAnalysis: feedbackData.messageAnalysis
            };

            // Save to database (this will now save as a new record with the same mockIdRef)
            const response = await fetch('/api/interview-feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSave),
            });

            if (!response.ok) {
                throw new Error('Failed to save feedback');
            }

            // Redirect to feedback page with the session data
            router.push(`/result-feedback?mockId=${scenarioData.mockID}`);
        } catch (error) {
            console.error('Error saving feedback:', error);
            // Handle error appropriately
        }
    };

    // Debug print for scenarioData
    console.log("scenarioData", scenarioData);

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

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Blurred background image */}
            <img
                src="/live-practice-arena-background_1.png"
                alt="background"
                className="absolute inset-0 w-full h-full object-cover z-0 scale-105"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
            />
            {/* Overlay for darkening */}
            <div className="absolute inset-0 z-0" />
            <div className={`relative z-10 w-full ${isPracticeMode ? 'max-w-none' : 'max-w-2xl mx-auto'} flex flex-col gap-6 px-2 py-10`}>
                {/* Top area: Thoát button */}
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
                {/* Second area: Scenario info */}
                {!isPracticeMode && (
                    <div className="w-full bg-white rounded-[28px] shadow-lg px-8 py-7 flex flex-col gap-6 z-10 relative">
                        {/* Scenario Title */}
                        <h2 className="text-2xl font-bold text-[#374151] mb-2">{scenarioData.title || 'Tiêu đề kịch bản'}</h2>
                        {/* Badges row */}
                        <div className="flex items-center gap-3 mb-2">
                            {/* Industry badge */}
                            {scenarioData.industry && (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#F0F6FF] text-[#2563EB] text-sm font-medium">
                                    <span role="img" aria-label="industry">🛒</span>
                                    {scenarioData.industry}
                                </span>
                            )}
                            {/* Difficulty badge */}
                            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#E6F9E6] text-[#22C55E] text-sm font-medium">
                                <span role="img" aria-label="difficulty">✔️</span>
                                {scenarioData.difficulty.charAt(0).toUpperCase() + scenarioData.difficulty.slice(1)}
                            </span>
                        </div>
                        {/* Scenario Description */}
                        <p className="text-base text-[#374151] mb-2">{scenarioData.description || scenarioData.scenario || 'Mô tả kịch bản...'}</p>
                        {/* Divider */}
                        <div className="border-t border-[#E5E7EB] my-2" />
                        {/* Situation box */}
                        <div className="bg-[#F9F6ED] rounded-xl p-4 mb-2">
                            <div className="font-semibold text-[#7C5C2A] mb-1">Tình huống</div>
                            <div className="text-[#7C5C2A] text-base">{scenarioData.customerQuery || 'Mô tả tình huống...'}</div>
                        </div>
                        {/* Gợi ý trả lời checklist */}
                        {
                        (() => {
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
                        {/* (Optional) Action buttons or details toggle can be added here if needed */}
                    </div>
                )}
                {/* Third area: Timer selection */}
                {!isPracticeMode && (
                    <div className="w-full bg-white rounded-[28px] shadow-lg px-8 py-7 flex flex-col z-10 relative">
                        <div className="mb-4">
                            <span className="block text-xl font-bold text-[#232E23] mb-4">Thời gian</span>
                            <div className="flex flex-row gap-2 h-[104px] justify-center">
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
                {/* Fourth area: Start button */}
                {!isPracticeMode && (
                    <div>
                        <Button
                            className={`w-full h-12 rounded-[24px] text-lg transition-all duration-300 
                                ${!selectedTime
                                    ? 'bg-gray-200 text-gray-400'
                                    : 'bg-[#B5ED76] hover:bg-[#2F3C30] text-white shadow-lg hover:shadow-xl'
                                }`}
                            disabled={!selectedTime}
                            onClick={handleStartPractice}
                        >
                            <span className="flex items-center gap-2 text-black">
                                <Play className="w-5 h-5" />
                                Bắt Đầu
                                <Sparkles className="w-5 h-5" />
                            </span>
                        </Button>
                    </div>
                )}
                {/* Practice mode content remains unchanged */}
                {isPracticeMode && (
                    <motion.div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center">
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