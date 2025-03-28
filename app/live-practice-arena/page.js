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

  // Time options in minutes with descriptions
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
    // Parse scenario data from URL
    const scenarioParam = searchParams.get("scenario");
    if (scenarioParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(scenarioParam));
        setScenarioData(decodedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error parsing scenario data:", error);
        setError("Failed to load scenario. Please try again.");
        setIsLoading(false);
      }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang Khởi Tạo Buổi Phỏng Vấn...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-6"
        >
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Oops!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={() => router.push("/dashboard")}>
          Quay Lại Bảng Điều Khiển
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-4 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isPracticeMode ? "Back to Setup" : "Back to Dashboard"}
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {scenarioData.title}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {!isPracticeMode 
                  ? "Sẵn Sàng Để Tỏa Sáng? Chọn Giới Hạn Thời Gian Và Bắt Đầu Hành Trình."
                  : "Thể Hiện Kỹ Năng Của Bạn! Buổi Phỏng Vấn Đang Diễn Ra."
                }
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 px-3 py-1.5 transition-all duration-300
                ${scenarioData.difficulty === 'easy' 
                  ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20' 
                  : scenarioData.difficulty === 'medium'
                  ? 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20'
                }`}
            >
              <Target className="w-4 h-4" />
              {scenarioData.difficulty.charAt(0).toUpperCase() + scenarioData.difficulty.slice(1)}
            </Badge>
          </div>
        </motion.div>

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
              <Card className="bg-white dark:bg-gray-800 border-2 hover:border-blue-500/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <Brain className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Nội Dung Buổi Phỏng Vấn
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {scenarioData.description}
                  </p>
                  <div className="pl-4 border-l-2 border-blue-500">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {scenarioData.scenario.customerQuery}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Time Selection */}
              <Card className="bg-white dark:bg-gray-800 border-2 hover:border-purple-500/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
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
                        className={`p-4 rounded-lg border-2 transition-all duration-300${
                          selectedTime === option.value
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl transform transition-transform group-hover:scale-110">
                            {option.icon}
                          </span>
                          <div className="text-left">
                            <p className="text-sm font-bold">{option.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' 
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Đang Tải...</p>
          </div>
        </div>
      }
    >
      <LivePracticeArenaContent />
    </Suspense>
  );
} 