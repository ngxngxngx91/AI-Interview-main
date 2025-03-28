"use client";
import { UserButton } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiGrid,
  FiList,
  FiTrendingUp,
  FiClock,
  FiTarget,
  FiActivity,
  FiSearch,
  FiFilter,
  FiRefreshCw
} from "react-icons/fi";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import LivePracticeModal from "./_components/LivePracticeModal";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  GraduationCap,
  Target,
  Trophy,
  Clock,
  TrendingUp,
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

function DashBoard() {
  const [selectedView, setSelectedView] = useState("grid");
  const [showLivePractice, setShowLivePractice] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalInterviews: 0,
    bestScore: 0,
    avgDuration: 0,
    improvement: 0
  });

  const interviewTips = [
    {
      icon: BookOpen,
      title: "Research",
      tip: "Research the company and role thoroughly",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: GraduationCap,
      title: "Practice",
      tip: "Practice common interview questions",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Target,
      title: "Focus",
      tip: "Stay focused on relevant experiences",
      color: "from-green-500 to-green-600"
    }
  ];

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateScenario = () => {
    console.log("Generating scenario for:", { selectedIndustry, roleDescription });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Làm Chủ Cuộc Phỏng Vấn Của Bạn
            </h1>
            <div className="space-y-1">
              <p className="text-lg text-gray-900 dark:text-white font-medium">
                Thực Hành Tạo Nên Sự Hoàn Hảo
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Biến đổi kỹ năng phỏng vấn của bạn với các buổi thực hành đỉnh cao cùng AI. Công việc mơ ước đang chờ đón bạn!
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 ${i === 0 ? 'bg-blue-500' :
                      i === 1 ? 'bg-emerald-500' :
                        'bg-purple-500'
                      }`}
                  />
                ))}
              </div>
              <span>Hãy gia nhập hàng ngàn ứng viên thành công!</span>
            </div>
          </div>
        </div>

        {/* Practice Options */}
        <div className="space-y-6 mb-8">
          {/* Live Practice Card */}
          <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group 
          border-2 hover:border-blue-500/50 dark:hover:border-blue-400/50">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-sm font-bold mb-4">
                    <FiActivity className="w-4 h-4" />
                    Đề Xuất
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Phỏng Vấn Thực Chiến
                  </h2>

                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Thực hành phỏng vấn thời gian thực với AI, nhận phản hồi tức thì để phát triển!
                  </p>

                  <Button
                    onClick={() => setShowLivePractice(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 gap-2 w-full sm:w-auto
                    group-hover:bg-blue-500 group-hover:shadow-blue-200 dark:group-hover:shadow-blue-900/20"
                  >
                    <FiActivity className="w-5 h-5" />
                    Bắt Đầu Thực Chiến
                  </Button>
                </div>

                <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 transition-colors duration-300">
                  {/* <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Lợi Ích Chính
                  </h3> */}
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-bold">Phản Hồi Thời Gian Thực</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Nhận ngay những nhận xét chi tiết về câu trả lời của bạn!</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-bold">Phản Hồi Từ AI</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Trò chuyện tự nhiên, thoải mái cùng công nghệ AI tiên tiến!</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Trophy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-bold">Phân Tích Thể Hiện</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Điểm số chi tiết và bí quyết cải thiện dành riêng cho bạn!</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Interview Card */}
          <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group
          border-2 hover:border-emerald-500/50 dark:hover:border-emerald-400/50">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-sm font-bold mb-4">
                    <BookOpen className="w-4 h-4" />
                    Tùy Chỉnh Linh Hoạt
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Tạo Phỏng Vấn Mới
                  </h2>

                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Tùy chỉnh và tạo buổi phỏng vấn của riêng bạn!
                  </p>

                  <div className="w-full sm:w-auto">
                    <AddNewInterview />
                  </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6 group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-900/10 transition-colors duration-300">
                  {/* <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Lợi ích chính
                  </h3> */}
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-bold">Câu Hỏi Tùy Chỉnh</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Thiết kế cuộc phỏng vấn hoàn hảo theo ý bạn!</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-bold">Tình Huống Đặc Thù</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Rèn luyện cho những tình huống đặc trưng của vai trò bạn chọn!</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-bold">Theo Dõi Tiến Độ</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Quan sát hành trình tiến bộ đầy ấn tượng của bạn!</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interview History */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Hành Trình Phỏng Vấn Của Bạn
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mỗi buổi thực hành là một bước gần hơn đến thành công. Không ngừng vươn lên!
                  </p>
                </div>

                {/* Stats Preview */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full">
                    <Trophy className="w-4 h-4" />
                    <span>Điểm Cao Nhất: {stats.bestScore}%</span>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full">
                    <TrendingUp className="w-4 h-4" />
                    <span>+{stats.improvement}% Tỷ Lệ Phát Triển</span>
                  </div>
                </div>
              </div>

              {/* Search and View Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search your interview history..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedView("grid")}
                      className={`rounded-none transition-colors duration-200 ${selectedView === "grid"
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : ""
                        }`}
                    >
                      <FiGrid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedView("list")}
                      className={`rounded-none transition-colors duration-200 ${selectedView === "list"
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : ""
                        }`}
                    >
                      <FiList className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="w-auto">
                    <AddNewInterview />
                  </div>
                </div>
              </div>

              {/* Interview List */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <InterviewList viewType={selectedView} searchQuery={searchQuery} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Practice Modal */}
        <LivePracticeModal
          showLivePractice={showLivePractice}
          setShowLivePractice={setShowLivePractice}
          selectedIndustry={selectedIndustry}
          setSelectedIndustry={setSelectedIndustry}
          roleDescription={roleDescription}
          setRoleDescription={setRoleDescription}
          handleGenerateScenario={handleGenerateScenario}
        />
      </div>
    </div>
  );
}

export default DashBoard;
