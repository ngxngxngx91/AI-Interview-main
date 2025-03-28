"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Target,
  Users,
  Zap,
  Send,
  RefreshCcw,
  Sparkles,
  CheckCircle2,
  Star,
  Timer,
  TrendingUp,
  ChevronRight,
  PlayCircle,
  Mic,
  MessageSquare,
  Target2,
  BrainCircuit
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Home() {
  const [showTryNow, setShowTryNow] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  // Common interview questions
  const commonQuestions = [
    "Hãy kể cho tôi về bản thân bạn và lý lịch của bạn.",
    "Điểm mạnh lớn nhất và điểm yếu của bạn là gì?",
    "Bạn thấy mình ở đâu trong 5 năm tới?",
    "Tại sao chúng tôi nên tuyển dụng bạn?",
    "Bạn xử lý căng thẳng và áp lực như thế nào?",
    "Điều gì thúc đẩy bạn làm việc tốt nhất?",
    "Hãy mô tả một tình huống thử thách và cách bạn đã xử lý nó.",
    "Kỳ vọng lương của bạn là gì?",
  ];

  const getRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * commonQuestions.length);
    setCurrentQuestion(commonQuestions[randomIndex]);
    setAnswer("");
    setFeedback("");
  };

  const getFeedback = async () => {
    if (!answer.trim()) return;

    setIsLoading(true);
    try {
      const feedbackPrompt = `As an interview coach, provide a brief, constructive feedback for this interview question and answer. Return the feedback in the following JSON format:
      {
        "strengths": "Key strengths of the answer (1-2 points)",
        "improvement": "One specific area for improvement"
      }
      
      Question: ${currentQuestion}
      Answer: ${answer}`;

      const result = await chatSession.sendMessage(feedbackPrompt);
      const responseText = result.response.text();

      try {
        const jsonResponse = JSON.parse(responseText);
        const formattedFeedback = `Strengths: ${jsonResponse.strengths}\n\nArea for Improvement: ${jsonResponse.improvement}`;
        setFeedback(formattedFeedback);
      } catch (jsonError) {
        const cleanedResponse = responseText
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        try {
          const jsonResponse = JSON.parse(cleanedResponse);
          const formattedFeedback = `Strengths: ${jsonResponse.strengths}\n\nArea for Improvement: ${jsonResponse.improvement}`;
          setFeedback(formattedFeedback);
        } catch {
          setFeedback(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
        }
      }
    } catch (error) {
      console.error("Error getting feedback:", error);
      setFeedback("Sorry, there was an error generating feedback. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Interview",
      description: "Thực hành với AI-Interview, thích nghi với câu trả lời của bạn",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Target,
      title: "Phản Hồi Cá Nhân Hóa",
      description: "Nhận phản hồi chi tiết về câu trả lời, ngôn ngữ cơ thể và kỹ năng giao tiếp của bạn",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Cụ Thể Theo Ngành",
      description: "Các câu hỏi được tùy chỉnh theo vai trò và cấp độ kinh nghiệm của bạn",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Zap,
      title: "Kết Quả Tức Thì",
      description: "Nhận phản hồi và gợi ý cải thiện ngay lập tức",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const benefits = [
    {
      icon: Star,
      title: "Cải thiện sự tự tin",
      description: "Xây dựng sự tự tin trong phỏng vấn thông qua việc thực hành thường xuyên"
    },
    {
      icon: Timer,
      title: "Quản lý thời gian",
      description: "Học cách sắp xếp câu trả lời của bạn trong giới hạn thời gian"
    },
    {
      icon: TrendingUp,
      title: "Theo dõi tiến độ",
      description: "Theo dõi sự tiến bộ của bạn theo thời gian"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-gray-900/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="secondary"
                className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 border-black"
              >
                <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                Làm Chủ Kỹ Năng Phỏng Vấn Của Bạn
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                Làm Chủ Cuộc Phỏng Vấn Cùng
                <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI-Interview
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Nhận phản hồi tức thì, cải thiện kỹ năng của bạn và tăng cường sự tự tin cho cuộc phỏng vấn tiếp theo
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/dashboard">
                <Button size="lg" className="group gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-bold">
                  Bắt Đầu Hành Trình Thành Công Của Bạn
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowDemo(true)}
                className="group gap-2 border-2 hover:border-blue-500/50 transition-all duration-300"
              >
                <PlayCircle className="w-4 h-4" />
                Cách AI-Interview Hoạt Động
              </Button>
            </motion.div>

            {/* Enhanced Preview Image */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative mt-10 px-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-2xl" />
              <div className="relative w-full max-w-4xl mx-auto">
                <div className="aspect-[16/9] rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-900/10 transition-all duration-300 hover:shadow-blue-500/10">
                  <video
                    src="/Preview.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tại Sao Nên Chọn AI-Interview?
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-bold">
            AI-Interview Cá Nhân Hóa Cho Riêng Bạn, Sẵn Sàng 24/7
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Card className="h-full relative group hover:shadow-lg transition-all duration-300 border-black">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                      <benefit.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className=" text-gray-900 dark:text-white font-bold">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Enhanced Try Now Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Trải Nghiệm Ngay Bây Giờ - Miễn Phí
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Thử một câu hỏi phỏng vấn mẫu và nhận phản hồi AI tức thì
          </p>

          {!showTryNow ? (
            <Button
              size="lg"
              onClick={() => {
                setShowTryNow(true);
                getRandomQuestion();
              }}
              className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
            >
              Thực Hành Miễn Phí
              <Sparkles className="w-4 h-4" />
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Câu Hỏi Thực Hành
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={getRandomQuestion}
                      className="gap-2"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Câu Hỏi Mới
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {currentQuestion}
                      </p>
                    </div>

                    <Textarea
                      placeholder="Nhập Câu Trả Lời Của Bạn..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="min-h-[120px]"
                    />

                    <div className="flex justify-end">
                      <Button
                        onClick={getFeedback}
                        disabled={!answer.trim() || isLoading}
                        className="gap-2"
                      >
                        {isLoading ? (
                          <>
                            <LoaderCircle className="w-4 h-4 animate-spin" />
                            Đang Nhận Phản Hồi...
                          </>
                        ) : (
                          <>
                            Nhận Phản Hồi
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>

                    <AnimatePresence mode="wait">
                      {feedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-4 bg-primary/10 rounded-lg"
                        >
                          <h4 className="font-medium text-primary mb-2">Phản Hồi:</h4>
                          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                            {feedback}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 font-bold">
                Bạn Muốn Trải Nghiệm Thêm Tính Năng? Đăng Ký Để Nhận Các Cuộc Phỏng Vấn Cá Nhân Hóa, Phản Hồi Chi Tiết Và Theo Dõi Tiến Độ.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Enhanced Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tính Năng Tuyệt Vời
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-bold">
            Mọi thứ bạn cần để thể hiện tốt nhất trong các cuộc phỏng vấn
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <Card className="relative h-full hover:shadow-lg transition-all duration-300 border-black">
                <CardContent className="p-6">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 w-fit mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
          <div className="relative max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Bạn Đã Sẵn Sàng Để Thành Công Trong Cuộc Phỏng Vấn Tiếp Theo?
            </h2>
            <p className="mt-4 text-lg text-white/90">
              Cùng AI-Interviews xây dựng sự tự tin ngay hôm nay
            </p>
            <Link href="/dashboard" className="mt-8 inline-block">
              <Button
                size="lg"
                variant="secondary"
                className="group gap-2 hover:bg-white/95 transition-all duration-300 font-bold"
              >
                Bắt Đầu Hành Trình Thành Công Của Bạn
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
