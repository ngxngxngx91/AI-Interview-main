"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Swords, Briefcase, Target, Sparkles, ArrowRight } from "lucide-react";
import ScenarioDesignModal from "./ScenarioDesignModal";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const LivePracticeModal = ({
  showLivePractice,
  setShowLivePractice
}) => {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [showScenarioDesign, setShowScenarioDesign] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Industry options with descriptions
  const industries = [
    {
      value: "sales",
      label: "Sales",
      description: "Thực hành kỹ thuật bán hàng và tương tác với khách hàng",
      icon: "💼"
    },
    {
      value: "customer-service",
      label: "Customer Service",
      description: "Xử lý thắc mắc khách hàng và giải quyết vấn đề",
      icon: "🎯"
    },
    {
      value: "business-analysis",
      label: "Business Analysis",
      description: "Phân tích vấn đề kinh doanh và đề xuất giải pháp",
      icon: "📊"
    },
    {
      value: "it",
      label: "IT",
      description: "Phỏng vấn kỹ thuật và tình huống giải quyết vấn đề",
      icon: "💻"
    },
    {
      value: "healthcare",
      label: "Healthcare",
      description: "Chăm sóc bệnh nhân và tình huống y khoa",
      icon: "🏥"
    },
  ];

  const handleGenerateScenario = () => {
    setIsLoading(true);
    setProgress(0);

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 20, 90));
    }, 500);

    // Simulate API call delay
    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setIsLoading(false);
      setShowScenarioDesign(true);
    }, 2000);
  };

  const handleScenarioProceed = (scenarioData) => {
    router.push(`/live-practice-arena?scenario=${encodeURIComponent(JSON.stringify(scenarioData))}`);
  };

  return (
    <>
      <AnimatePresence>
        {showLivePractice && (
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border-2 border-blue-500/20 dark:border-blue-400/20"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                      <Swords className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Phỏng Vấn Thực Chiến
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Nâng Tầm Kỹ Năng Phỏng Vấn Của Bạn 🚀
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowLivePractice(false)}
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      Chọn Công Việc Của Bạn
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {industries.map((industry) => (
                        <motion.button
                          key={industry.value}
                          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedIndustry(industry.value)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${selectedIndustry === industry.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500/50"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl transform transition-transform group-hover:scale-110">
                              {industry.icon}
                            </span>
                            <div className="text-left">
                              <p className="text-sm font-medium">{industry.label}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {industry.description}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-500" />
                      Hãy Cho AI-Interview Biết Về Công Việc Của Bạn
                    </label>
                    <Textarea
                      value={roleDescription}
                      onChange={(e) => setRoleDescription(e.target.value)}
                      placeholder="Mô Tả Vị Trí Bạn Đang Chuẩn Bị..."
                      className="min-h-[100px] border-2 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

                {isLoading && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        Đang Thiết Kế Buổi Phỏng Vấn Hoàn Hảo Cho Bạn...
                      </span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">
                        {progress}%
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-2 bg-gray-100 dark:bg-gray-700"
                    />
                  </div>
                )}

                <Button
                  className={`w-full h-12 rounded-lg transition-all duration-300 
                    ${!selectedIndustry || !roleDescription.trim() || isLoading
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl shadow-blue-500/20 hover:shadow-purple-500/30'
                    }`}
                  disabled={!selectedIndustry || !roleDescription.trim() || isLoading}
                  onClick={handleGenerateScenario}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      Đang Tạo Buổi Phỏng Vấn Của Bạn...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Bắt Đầu Thiết Kế
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScenarioDesignModal
        show={showScenarioDesign}
        onClose={() => setShowScenarioDesign(false)}
        selectedIndustry={selectedIndustry}
        roleDescription={roleDescription}
        onProceed={handleScenarioProceed}
      />
    </>
  );
};

export default LivePracticeModal; 