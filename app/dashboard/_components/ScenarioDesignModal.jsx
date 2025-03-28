"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { X, Wand2, Loader2, Sparkles, Target, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { chatSession } from "@/utils/GeminiAIModal";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ScenarioDesignModal = ({
  show,
  onClose,
  selectedIndustry,
  roleDescription,
  onProceed
}) => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedScenario, setGeneratedScenario] = React.useState(null);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState(null);

  const difficulties = [
    { value: "easy", label: "Easy", description: "Phù Hợp Cho Người Mới", color: "bg-green-500" },
    { value: "medium", label: "Medium", description: "Có Tính Thử Thách", color: "bg-yellow-500" },
    { value: "hard", label: "Hard", description: "Phỏng Vấn Nâng Cao", color: "bg-red-500" },
  ];

  const generateScenario = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const prompt = `Create an interview scenario with the following parameters:
Industry: ${selectedIndustry}
Role: ${roleDescription}
Difficulty: ${difficulty}
Context: ${description}

Generate a realistic interview scenario in the following JSON format:
{
  "scenario": "Initial situation description",
  "customerQuery": "What the interviewer/customer says",
  "expectedResponse": "Key points to address"
}`;

      const result = await chatSession.sendMessage(prompt);
      const responseText = result.response.text();

      try {
        const jsonResponse = JSON.parse(responseText);
        setGeneratedScenario(jsonResponse);
        setProgress(100);
      } catch (jsonError) {
        const cleanedResponse = responseText
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        try {
          const jsonResponse = JSON.parse(cleanedResponse);
          setGeneratedScenario(jsonResponse);
          setProgress(100);
        } catch {
          throw new Error("Failed to parse AI response");
        }
      }
    } catch (error) {
      console.error("Error generating scenario:", error);
      setError("Failed to generate scenario. Please try again.");
      setGeneratedScenario(null);
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  const handleProceed = () => {
    onProceed({
      title,
      description,
      difficulty,
      scenario: generatedScenario
    });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border-2 border-purple-500/20 dark:border-purple-400/20"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Thiết Kế Buổi Phỏng Vấn Của Bạn
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tùy Chỉnh Kịch Bản Phỏng Vấn Hoàn Hảo Của Bạn ✨
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    Tiêu Đề Phỏng Vấn
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Kịch Bản Phỏng Vấn..."
                    className="border-2 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Bối Cảnh Phỏng Vấn
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô Tả Bối Cảnh Cho Buổi Phỏng Vấn..."
                    className="min-h-[100px] border-2 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    Cấp Độ Phỏng Vấn
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {difficulties.map((level) => {
                      const bgColor = level.value === 'easy'
                        ? 'bg-green-50'
                        : level.value === 'medium'
                          ? 'bg-yellow-50'
                          : 'bg-red-50';

                      const dotColor = level.value === 'easy'
                        ? 'bg-green-500'
                        : level.value === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-red-500';

                      const borderColor = level.value === 'easy'
                        ? 'border-green-200'
                        : level.value === 'medium'
                          ? 'border-yellow-200'
                          : 'border-red-200';

                      return (
                        <motion.button
                          key={level.value}
                          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setDifficulty(level.value)}
                          className={`p-4 rounded-lg border transition-all duration-300 relative
                            ${difficulty === level.value
                              ? `${bgColor} ${borderColor}`
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                            }
                          `}
                        >
                          <div className="flex flex-col items-center">
                            <div className={`w-2 h-2 rounded-full ${dotColor} mb-2`} />
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {level.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {level.description}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 rounded-lg flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}

              {isGenerating && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      Đang Thiết Kế Buổi Phỏng Vấn Hoàn Hảo Của Bạn...
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-bold">
                      {progress}%
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-2 bg-gray-100 dark:bg-gray-700"
                  />
                </div>
              )}

              {!generatedScenario ? (
                <Button
                  className={`w-full h-12 rounded-lg transition-all duration-300 
                    ${!difficulty || isGenerating
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg hover:shadow-xl shadow-purple-500/20 hover:shadow-blue-500/30'
                    }`}
                  disabled={!difficulty || isGenerating}
                  onClick={generateScenario}
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang Tạo Buổi Phỏng Vấn Của Bạn...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      Tạo Kịch Bản Cùng AI
                    </span>
                  )}
                </Button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="rounded-lg border-2 border-purple-200 dark:border-purple-800 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <h3 className="font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Buổi Phỏng Vấn Của Bạn Đã Sẵn Sàng
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{generatedScenario.scenario}</p>
                    <div className="pl-4 border-l-2 border-purple-500">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{generatedScenario.customerQuery}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handleProceed}
                  >
                    <span className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Bắt Đầu Thực Chiến
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScenarioDesignModal; 