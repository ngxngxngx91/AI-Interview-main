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

    // Các tùy chọn thời gian cho buổi phỏng vấn (tính bằng phút)
    const timeOptions = [
        {
            value: "3",
            label: "3 phút",
            description: "Buổi Phỏng Vấn Nhanh",
            icon: "⚡"
        },
        {
            value: "5",
            label: "5 phút",
            description: "Độ Dài Phỏng Vấn Tiêu Chuẩn",
            icon: "⏱️"
        },
        {
            value: "10",
            label: "10 phút",
            description: "Thời Gian Phỏng Vấn Kéo Dài",
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
            router.push(`/result-feedback?session=${encodeURIComponent(JSON.stringify(feedbackData))}`);
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
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section - Only show when not in practice mode */}
                {!isPracticeMode && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="mb-4 hover:bg-gray-800/80 text-gray-200 border border-gray-700/40 rounded-full px-4 py-2 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                                    {scenarioData.title || "Interview Practice"}
                                </h1>
                                <p className="mt-2 text-gray-400">
                                    Sẵn Sàng Để Tỏa Sáng? Chọn Giới Hạn Thời Gian Và Bắt Đầu Hành Trình.
                                </p>
                            </div>
                            <div className="flex gap-2 items-center">
                                <Badge
                                    variant="outline"
                                    className={`flex items-center gap-1 px-3 py-1.5 transition-all duration-300
                                    ${scenarioData.difficulty === 'easy'
                                            ? 'border-green-500 text-green-200 bg-green-900/20'
                                            : scenarioData.difficulty === 'medium'
                                                ? 'border-yellow-500 text-yellow-100 bg-yellow-900/20'
                                                : 'border-red-500 text-red-100 bg-red-900/20'
                                        }`}
                                >
                                    <Target className="w-4 h-4" />
                                    {scenarioData.difficulty.charAt(0).toUpperCase() + scenarioData.difficulty.slice(1)}
                                </Badge>
                                {scenarioData.language && (
                                    <Badge className="flex items-center gap-1 px-3 py-1.5 bg-emerald-900/20 text-emerald-200 border-emerald-500 uppercase font-semibold">
                                        {scenarioData.language === 'vi' ? 'VI' : 'EN'}
                                    </Badge>
                                )}
                                {scenarioData.industry && (
                                    <Badge className="flex items-center gap-1 px-3 py-1.5 bg-blue-900/20 text-blue-200 border-blue-500">
                                        {scenarioData.industry}
                                    </Badge>
                                )}
                                {scenarioData.role && (
                                    <Badge className="flex items-center gap-1 px-3 py-1.5 bg-purple-900/20 text-purple-200 border-purple-500">
                                        {scenarioData.role}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Minimal Header for Practice Mode */}
                {isPracticeMode && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="hover:bg-gray-800/80 text-gray-200 border border-gray-700/40 rounded-full px-4 py-2 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            End Interview
                        </Button>
                    </motion.div>
                )}

                {/* Main Content */}
                <AnimatePresence mode="wait">
                    {!isPracticeMode ? (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Scenario Overview */}
                            <Card className="bg-gray-800/80 backdrop-blur-lg border border-blue-700/40 rounded-2xl shadow-xl hover:border-blue-500/40 transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                            <Brain className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                            Nội Dung Buổi Phỏng Vấn
                                        </h2>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowScenarioDetails((prev) => !prev)}
                                            className="ml-auto text-blue-400 hover:text-blue-200 px-2 py-1 rounded-full"
                                        >
                                            {showScenarioDetails ? "Hide Details" : "Show Details"}
                                        </Button>
                                    </div>
                                    <p className="text-gray-400 mb-4">
                                        {scenarioData.description}
                                    </p>
                                    <div className="pl-4 border-l-2 border-blue-500 mb-2">
                                        <p className="text-sm font-medium text-gray-100">
                                            {scenarioData.customerQuery}
                                        </p>
                                    </div>
                                    {showScenarioDetails && (
                                        <div className="mt-4 space-y-2 bg-gray-900/70 rounded-lg p-4 border border-blue-700/30">
                                            <div>
                                                <span className="block text-xs text-blue-400 font-semibold mb-1">Scenario Intro</span>
                                                <p className="text-sm text-gray-300">
                                                    {scenarioData.scenario}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-purple-400 font-semibold mb-1">Expected Response</span>
                                                <p className="text-sm text-gray-300">
                                                    {scenarioData.expectedResponse}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push("/dashboard")}
                                        className="mt-4 text-gray-400 hover:text-white border border-gray-700/40 rounded-full px-4 py-2"
                                    >
                                        Restart
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Time Selection */}
                            <Card className="bg-gray-800/80 backdrop-blur-lg border border-purple-700/40 rounded-2xl shadow-xl hover:border-purple-500/40 transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                            Thiết Lập Thời Gian
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {timeOptions.map((option) => (
                                            <motion.button
                                                key={option.value}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedTime(option.value)}
                                                className={`p-4 rounded-lg border transition-all duration-300${selectedTime === option.value
                                                    ? " border-purple-500 bg-purple-900/20 text-purple-100 shadow"
                                                    : " border-gray-700 bg-gray-800/60 text-gray-300 hover:border-purple-400 hover:text-purple-100"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl transform transition-transform group-hover:scale-110">
                                                        {option.icon}
                                                    </span>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold">{option.label}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {option.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Start Button */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Button
                                    className={`w-full h-12 rounded-lg transition-all duration-300 
                    ${!selectedTime
                                            ? 'bg-gray-800 text-gray-500'
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl'
                                        }`}
                                    disabled={!selectedTime}
                                    onClick={handleStartPractice}
                                >
                                    <span className="flex items-center gap-2">
                                        <Play className="w-5 h-5" />
                                        Bắt Đầu
                                        <Sparkles className="w-5 h-5" />
                                    </span>
                                </Button>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="practice"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <ScenarioContent
                                scenarioData={scenarioData}
                                timeLimit={parseInt(selectedTime)}
                                onInterviewComplete={handleInterviewComplete}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
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