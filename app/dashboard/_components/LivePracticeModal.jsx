"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Swords, Target, ArrowRight, RefreshCw, Loader2, Globe2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Danh sách các ngành nghề được hỗ trợ
const industries = [
  { value: "sales", label: "Sales", icon: "💼" },
  { value: "customer-service", label: "Customer Service", icon: "🎯" },
  { value: "business-analysis", label: "Business Analysis", icon: "📊" },
  { value: "it", label: "IT", icon: "💻" },
  { value: "healthcare", label: "Healthcare", icon: "🏥" },
];

// Danh sách các cấp độ khó dễ
const levels = [
  { value: "easy", label: "Easy", color: "bg-green-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "hard", label: "Hard", color: "bg-red-500" },
];

// Danh sách ngôn ngữ được hỗ trợ
const languages = [
  { value: "en", label: "English" },
  { value: "vi", label: "Vietnamese" },
];

// const mockScenario = (industry, role, level, language) => {
//   if (language === "vi") {
//     return {
//       scenario: `Bạn đang phỏng vấn cho vị trí ${role} trong ngành ${industry} ở cấp độ ${level}. Nhà tuyển dụng yêu cầu bạn mô tả cách tiếp cận một tình huống khó khăn.`,
//       customerQuery: "Bạn có thể kể về một lần bạn vượt qua thử thách lớn trong công việc không?",
//       expectedResponse: "Mô tả tình huống, hành động của bạn và kết quả.",
//       level: level,
//       language: language
//     };
//   }
//   return {
//     scenario: `You are interviewing for a ${role} in the ${industry} industry at ${level} level. The interviewer asks you to describe your approach to a challenging situation.`,
//     customerQuery: "Can you tell me about a time you overcame a major challenge at work?",
//     expectedResponse: "Describe the situation, your actions, and the outcome.",
//     level: level,
//     language: language
//   };
// };

const LivePracticeModal = ({ showLivePractice, setShowLivePractice, scenario }) => {
  const router = useRouter();

  // Xử lý khi người dùng muốn bắt đầu phỏng vấn
  const handleProceed = async () => {
    try {
      // Chuẩn bị dữ liệu kịch bản phỏng vấn
      const scenarioData = {
        title: scenario.title,
        description: scenario.description,
        difficulty: scenario.difficulty,
        scenario: scenario.scenario,
        customerQuery: scenario.customerQuery,
        expectedResponse: scenario.expectedResponse,
        language: scenario.language,
        industry: scenario.industry,
        role: scenario.role,
        createdBy: "user", // Sẽ được thay thế bằng ID/email người dùng thực tế
        createdAt: new Date().toISOString(),
        mockID: crypto.randomUUID() // Tạo ID duy nhất cho buổi phỏng vấn
      };

      // Lưu vào database
      const response = await fetch('/api/mock-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenarioData),
      });

      if (!response.ok) {
        throw new Error('Failed to save scenario');
      }

      // Chuyển hướng đến trang thực hành với dữ liệu kịch bản
      router.push(`/live-practice-arena?scenario=${encodeURIComponent(JSON.stringify(scenarioData))}`);
    } catch (error) {
      console.error('Error saving scenario:', error);
      // Xử lý lỗi phù hợp
    }
  };

  return (
    <>
      <AnimatePresence>
        {showLivePractice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-gray-900/95 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-blue-700/30"
            >
              {/* Header của modal */}
              <div className="p-5 border-b border-gray-800 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-600 text-white shadow-lg">
                      <Swords className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Live Interview Practice
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Practice real interviews with AI
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowLivePractice(false)}
                    className="hover:bg-gray-800 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-300" />
                  </Button>
                </div>
              </div>

              {/* Nội dung chính của modal */}
              <div className="p-6 space-y-6">
                {scenario && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Card hiển thị thông tin kịch bản */}
                    <div className="rounded-lg border border-blue-700/40 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <h3 className="font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          Your Interview Scenario
                        </h3>
                        {/* Badge hiển thị độ khó */}
                        <span className={`ml-auto px-2 py-0.5 rounded text-xs font-semibold uppercase ${scenario.difficulty === 'easy' ? 'bg-green-700 text-green-200' : scenario.difficulty === 'medium' ? 'bg-yellow-700 text-yellow-100' : 'bg-red-700 text-red-100'}`}>{scenario.difficulty}</span>
                        {/* Badge hiển thị ngôn ngữ */}
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold uppercase bg-emerald-700 text-emerald-100`}>{scenario.language === 'vi' ? 'VI' : 'EN'}</span>
                      </div>
                      {/* Tags hiển thị ngành và vai trò */}
                      <div className="flex gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-900/30 text-blue-200 border border-blue-700/40">
                          {scenario.industry}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-900/30 text-purple-200 border border-purple-700/40">
                          {scenario.role}
                        </span>
                      </div>
                      {/* Nội dung kịch bản */}
                      <p className="text-sm text-gray-300 mb-2">{scenario.scenario}</p>
                      <div className="pl-4 border-l-2 border-blue-500">
                        <p className="text-sm font-medium text-gray-100">{scenario.customerQuery}</p>
                        <p className="text-xs text-gray-400 mt-1">Expected: {scenario.expectedResponse}</p>
                      </div>
                    </div>
                    {/* Nút tiếp tục */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={handleProceed}
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LivePracticeModal; 