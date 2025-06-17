"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { X, Wand2, Loader2, Sparkles, Target, Clock, AlertCircle, ArrowRight, RefreshCw, Globe2 } from "lucide-react";
import { chatSession } from "@/utils/GeminiAIModal";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

// Danh sách các ngành nghề được hỗ trợ
const industries = [
  { value: "sales", label: "Sales", icon: "💼" },
  { value: "customer-service", label: "Customer Service", icon: "🎯" },
  { value: "business-analysis", label: "Business Analysis", icon: "📊" },
  { value: "it", label: "IT", icon: "💻" },
  { value: "healthcare", label: "Healthcare", icon: "🏥" },
];

// Component modal thiết kế kịch bản phỏng vấn
const ScenarioDesignModal = ({
  show,
  onClose,
  selectedIndustry,
  roleDescription,
}) => {
  const router = useRouter();
  // State quản lý thông tin kịch bản phỏng vấn
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("");
  const [selectedLanguage, setSelectedLanguage] = React.useState("en");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedScenario, setGeneratedScenario] = React.useState(null);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState(null);
  const [selectedIndustryLocal, setSelectedIndustryLocal] = React.useState(selectedIndustry || "");
  const [roleDescriptionLocal, setRoleDescriptionLocal] = React.useState(roleDescription || "");
  const [expanded, setExpanded] = React.useState(false);

  // Danh sách các cấp độ khó dễ
  const difficulties = [
    { value: "easy", label: "Easy", description: "Phù Hợp Cho Người Mới", color: "bg-green-500" },
    { value: "medium", label: "Medium", description: "Có Tính Thử Thách", color: "bg-yellow-500" },
    { value: "hard", label: "Hard", description: "Phỏng Vấn Nâng Cao", color: "bg-red-500" },
  ];

  // Danh sách ngôn ngữ được hỗ trợ
  const languages = [
    { value: "en", label: "English" },
    { value: "vi", label: "Vietnamese" },
  ];

  // Hàm tạo kịch bản phỏng vấn bằng AI
  const generateScenario = async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);

    // Hiệu ứng loading với thanh tiến trình
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      // Tạo prompt cho AI để tạo kịch bản
      const prompt = `Create an interview scenario with these parameters:
Industry: ${selectedIndustryLocal}
Role: ${roleDescriptionLocal}
Difficulty: ${difficulty}
Context: ${description}
Language: ${selectedLanguage}

Requirements:
- Create a realistic interview scenario specific to the ${selectedIndustryLocal} industry
- Include a relevant question or situation for the ${roleDescriptionLocal} role
- Make it appropriate for ${difficulty} level
- For easy level: Focus on basic skills and straightforward situations
- For medium level: Include some complexity and decision-making
- For hard level: Create challenging, high-pressure scenarios
- For 'expectedResponse', provide 3-4 concise, numbered key points for the candidate to address. Each numbered point must be on a single line.

Example (DO NOT COPY, just use as inspiration):
{
  "scenario": "You are interviewing for a Software Engineer position in the IT industry. The interviewer wants to understand your problem-solving approach and technical skills.",
  "customerQuery": "Can you walk me through how you would approach debugging a critical production issue that's affecting multiple users?",
  "expectedResponse": "1. Outline your systematic debugging process. 2. Describe your communication strategy. 3. Explain preventive measures. 4. Mention tools and resources used."
}

Generate a realistic interview scenario in this exact JSON format:
{
  "scenario": "Initial situation description",
  "customerQuery": "What the interviewer says",
  "expectedResponse": "Key points to address"
}`;

      // Gửi prompt đến AI và xử lý kết quả
      const result = await chatSession.sendMessage(prompt);
      const responseText = result.response.text();

      try {
        const jsonResponse = JSON.parse(responseText);
        setGeneratedScenario({
          customerQuery: typeof jsonResponse.customerQuery === 'string' ? jsonResponse.customerQuery : JSON.stringify(jsonResponse.customerQuery),
          expectedResponse: typeof jsonResponse.expectedResponse === 'string' ? jsonResponse.expectedResponse : JSON.stringify(jsonResponse.expectedResponse),
          scenario: typeof jsonResponse.scenario === 'string' ? jsonResponse.scenario : JSON.stringify(jsonResponse.scenario),
          difficulty,
          language: selectedLanguage,
          title,
          description,
          industry: selectedIndustryLocal,
          role: roleDescriptionLocal
        });
        setProgress(100);
      } catch (jsonError) {
        // Xử lý lỗi parse JSON
        const cleanedResponse = responseText
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        try {
          const jsonResponse = JSON.parse(cleanedResponse);
          setGeneratedScenario({
            customerQuery: typeof jsonResponse.customerQuery === 'string' ? jsonResponse.customerQuery : JSON.stringify(jsonResponse.customerQuery),
            expectedResponse: typeof jsonResponse.expectedResponse === 'string' ? jsonResponse.expectedResponse : JSON.stringify(jsonResponse.expectedResponse),
            scenario: typeof jsonResponse.scenario === 'string' ? jsonResponse.scenario : JSON.stringify(jsonResponse.scenario),
            difficulty,
            language: selectedLanguage,
            title,
            description,
            industry: selectedIndustryLocal,
            role: roleDescriptionLocal
          });
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

  // Xử lý khi người dùng muốn tiếp tục với kịch bản đã tạo
  const handleProceed = async () => {
    try {
      // Chuẩn bị dữ liệu kịch bản phỏng vấn
      const mockID = crypto.randomUUID(); // Tạo ID duy nhất cho buổi phỏng vấn
      const scenarioData = {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        scenario: generatedScenario.scenario.trim(),
        customerQuery: generatedScenario.customerQuery.trim(),
        expectedResponse: generatedScenario.expectedResponse.trim(),
        language: selectedLanguage,
        industry: selectedIndustryLocal.trim(),
        role: roleDescriptionLocal.trim(),
        createdBy: "user", // Sẽ được thay thế bằng ID/email người dùng thực tế
        createdAt: new Date().toISOString(),
        mockID: mockID
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

      // Chuyển hướng đến trang thực hành với mockId
      router.push(`/live-practice-arena?mockId=${mockID}`);
    } catch (error) {
      console.error('Error saving scenario:', error);
      // Xử lý lỗi phù hợp
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Static blur background */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />
          {/* Modal container for stacking context, animated */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-xl px-2 sm:px-0 flex flex-col items-center z-10"
          >
            {/* X button as a separate area, outside the modal */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-11 right-[-4px] w-9 h-9 bg-white shadow-lg border border-gray-200 flex items-center justify-center rounded-r-full rounded-l-none z-40 hover:bg-gray-100 transition-all duration-150"
              style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)' }}
              aria-label="Đóng"
            >
              <X className="w-12 h-12 text-[#2D221B]" />
            </Button>
            {/* Header area (brown, rounded top) */}
            <div className="w-full max-w-lg rounded-t-[36px] bg-[#4B372E] pt-7 pb-4 px-8 flex flex-col relative z-20 overflow-hidden">
              {/* Background image for header */}
              <div className="absolute inset-0 w-full h-full bg-no-repeat bg-top-right bg-cover pointer-events-none" style={{ backgroundImage: 'url(/scenario_background_1.png)' }} />
              {/* Title and subtitle only */}
              <div className="relative z-20 flex flex-row items-start justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-white">Tạo buổi phòng vấn mới</h2>
                  <p className="text-sm text-[#E5D6C6]">Thiết kế kịch bản phòng vấn hoàn hảo theo ý bạn</p>
                </div>
              </div>
            </div>
            {/* Brown border effect (bottom, left, right) */}
            <div className="w-full max-w-lg h-full rounded-b-[36px] bg-[#4B372E] px-1 pb-1 flex flex-col items-center relative z-10" style={{ boxShadow: '0 8px 32px 0 rgba(75,55,46,0.12)' }}>
              {/* Front white layer (main content only, inset) */}
              <div
                className="relative z-20 w-full max-w-lg mx-auto rounded-[28px] bg-white flex flex-col overflow-hidden border border-transparent shadow-2xl max-h-[calc(100vh - 250px)] overflow-y-auto"
                style={{ top: 0, left: 0 }}
              >
                {/* Main content area (no header here) */}
                {generatedScenario ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center w-full"
                  >
                    {/* Scenario card (no white header, just content) */}
                    <div className="w-full bg-white rounded-[28px] shadow-lg px-8 py-7 flex flex-col gap-6 z-10 relative">
                      {/* Scenario Title */}
                      <h2 className="text-2xl font-bold text-[#374151] mb-2">{generatedScenario.title || 'Tiêu đề kịch bản'}</h2>
                      {/* Badges row */}
                      <div className="flex items-center gap-3 mb-2">
                        {/* Industry badge */}
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#F0F6FF] text-[#2563EB] text-sm font-medium">
                          {/* Placeholder for industry icon */}
                          <span role="img" aria-label="industry">🛒</span>
                          {generatedScenario.industry || 'Ngành'}
                        </span>
                        {/* Difficulty badge */}
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#E6F9E6] text-[#22C55E] text-sm font-medium">
                          {/* Placeholder for difficulty icon */}
                          <span role="img" aria-label="difficulty">✔️</span>
                          {generatedScenario.difficulty || 'Độ khó'}
                        </span>
                      </div>
                      {/* Scenario Description (fix: show scenario.description or scenario.scenario if missing) */}
                      <p className="text-base text-[#374151] mb-2">{generatedScenario.description || generatedScenario.scenario || 'Mô tả kịch bản...'}</p>
                      {/* Divider */}
                      <div className="border-t border-[#E5E7EB] my-2" />
                      {/* Situation box */}
                      <div className="bg-[#F9F6ED] rounded-xl p-4 mb-2">
                        <div className="font-semibold text-[#7C5C2A] mb-1">Tình huống</div>
                        <div className="text-[#7C5C2A] text-base">{generatedScenario.scenario || 'Mô tả tình huống...'}</div>
                      </div>
                      {/* Tasks checklist (expand/collapse) */}
                      {
                        (() => {
                          const tasks = (generatedScenario.expectedResponse || '').split(/\s*\d+\.\s*/).filter(Boolean);
                          const showToggle = tasks.length > 4;
                          const visibleTasks = showToggle && !expanded ? tasks.slice(0, 4) : tasks;
                          return (
                            <div>
                              <div className="font-bold text-[#374151] mb-2">Nhiệm vụ</div>
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
                                  {expanded ? 'Thu gọn' : `Xem thêm (${tasks.length - 4})`}
                                </button>
                              )}
                            </div>
                          );
                        })()
                      }
                      {/* Action buttons */}
                      <div className="flex gap-3 mt-6">
                        <Button
                          variant="outline"
                          className="flex-1 h-12 rounded-full border border-[#D1D5DB] text-[#374151] bg-white hover:bg-[#F3F4F6] text-lg font-semibold"
                          onClick={() => {
                            setGeneratedScenario(null);
                            setProgress(0);
                            setIsGenerating(false);
                          }}
                        >
                          <RefreshCw className="w-5 h-5 mr-2" />
                          Đổi kịch bản khác
                        </Button>
                        <Button
                          className="flex-1 h-12 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-white text-lg font-semibold shadow-none"
                          onClick={handleProceed}
                        >
                          Vào buổi phỏng vấn
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 bg-white px-7 py-6 flex flex-col gap-7">
                    {/* Section: Thông tin chung */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg"><Target className="w-5 h-5 text-[#3A2921]" /></span>
                        <h3 className="font-semibold text-[#2D221B] text-base">Thông tin chung</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs text-[#6B5B4A] mb-1.5 font-medium">Ngành nghề<span className="text-red-500">*</span></label>
                          <Select
                            value={selectedIndustryLocal}
                            onValueChange={setSelectedIndustryLocal}
                          >
                            <SelectTrigger className="w-full border border-[#E5E5E5] bg-white text-[#2D221B] focus:border-[#B6F09C] focus:ring-[#B6F09C]/20 rounded-xl h-12">
                              <SelectValue placeholder="Chọn ngành nghề" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-[#2D221B]">
                              {industries.map((industry) => (
                                <SelectItem
                                  key={industry.value}
                                  value={industry.value}
                                  className="flex items-center gap-2"
                                >
                                  <span className="text-lg mr-2">{industry.icon}</span>
                                  {industry.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs text-[#6B5B4A] mb-1.5 font-medium">Độ khó<span className="text-red-500">*</span></label>
                          <Select
                            value={difficulty}
                            onValueChange={setDifficulty}
                          >
                            <SelectTrigger className="w-full border border-[#E5E5E5] bg-white text-[#2D221B] focus:border-[#B6F09C] focus:ring-[#B6F09C]/20 rounded-xl h-12">
                              <SelectValue placeholder="Chọn độ khó" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-[#2D221B]">
                              {difficulties.map((level) => (
                                <SelectItem
                                  key={level.value}
                                  value={level.value}
                                  className="flex items-center gap-2"
                                >
                                  <span className={`w-2 h-2 rounded-full ${level.color} mr-2`}></span>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B5B4A] mb-1.5 font-medium">Mô tả về vị trí công việc<span className="text-red-500">*</span></label>
                        <Textarea
                          value={roleDescriptionLocal}
                          onChange={(e) => setRoleDescriptionLocal(e.target.value)}
                          placeholder="Nhập mô tả về vị trí công việc"
                          className="min-h-[80px] border border-[#E5E5E5] bg-white text-[#2D221B] focus:border-[#B6F09C] focus:ring-[#B6F09C]/20 rounded-xl"
                        />
                      </div>
                    </div>
                    {/* Divider */}
                    <div className="border-t border-[#E5D6C6] my-2" />
                    {/* Section: Thông tin khác */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg"><Globe2 className="w-5 h-5 text-[#3A2921]" /></span>
                        <h3 className="font-semibold text-[#2D221B] text-base">Thông tin khác</h3>
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs text-[#6B5B4A] mb-1.5 font-medium">Tên buổi phòng vấn<span className="text-red-500">*</span></label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Nhập tên buổi phòng vấn"
                          className="border border-[#E5E5E5] bg-white text-[#2D221B] focus:border-[#B6F09C] focus:ring-[#B6F09C]/20 rounded-xl h-12"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs text-[#6B5B4A] mb-1.5 font-medium">Ngôn ngữ kịch bản</label>
                        <Select
                          value={selectedLanguage}
                          onValueChange={setSelectedLanguage}
                        >
                          <SelectTrigger className="w-full border border-[#E5E5E5] bg-white text-[#2D221B] focus:border-[#B6F09C] focus:ring-[#B6F09C]/20 rounded-xl h-12 flex items-center pr-12 relative">
                            <SelectValue placeholder="Chọn ngôn ngữ" />
                            {/* Language icon on the right */}
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 ">
                              {selectedLanguage === 'vi' ? (
                                <span className="w-5 h-5 rounded-full bg-[#DA251D] flex items-center justify-center text-[#FFCD00] text-xs">★</span>
                              ) : (
                                <span className="w-5 h-5 rounded-full bg-[#1877F3] flex items-center justify-center text-white   text-base">🇬🇧</span>
                              )}
                            </span>
                          </SelectTrigger>
                          <SelectContent className="bg-white text-[#2D221B]">
                            <SelectItem value="vi">
                              <span className="inline-flex items-center">Tiếng Việt <span className="ml-2 w-5 h-5 rounded-full bg-[#DA251D] flex items-center justify-center text-[#FFCD00] text-xs">★</span></span>
                            </SelectItem>
                            <SelectItem value="en">
                              <span className="inline-flex items-center">English <span className="ml-2 w-5 h-5 rounded-full bg-[#1877F3] flex items-center justify-center text-white text-base">🇬🇧</span></span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B5B4A] mb-1.5 font-medium">Thông tin khác</label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Nhập thông tin khác về buổi phỏng vấn"
                          className="min-h-[80px] border border-[#E5E5E5] bg-white text-[#2D221B] focus:border-[#B6F09C] focus:ring-[#B6F09C]/20 rounded-xl"
                        />
                      </div>
                    </div>
                    {/* Error and loading states remain unchanged */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-900/20 border-2 border-red-700 rounded-lg flex items-center gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-sm text-red-400">{error}</p>
                      </motion.div>
                    )}
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                            Generating your interview scenario...
                          </span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-gray-800" />
                      </motion.div>
                    )}
                    {/* Action button at the bottom */}
                    <div className="mt-2">
                      <Button
                        className={`w-full h-12 rounded-full text-lg font-semibold transition-all duration-300 ${!difficulty || !selectedIndustryLocal || !roleDescriptionLocal || !title ? 'bg-[#E5D6C6] text-[#B0A08F]' : 'bg-[#B6F09C] text-[#2D221B] hover:bg-[#A0E07C]'} shadow-none`}
                        disabled={!difficulty || !selectedIndustryLocal || !roleDescriptionLocal || !title || isGenerating}
                        onClick={() => {
                          setIsGenerating(true);
                          setTimeout(() => {
                            generateScenario();
                          }, 200);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <Wand2 className="w-5 h-5" />
                          Khởi tạo cuộc phỏng vấn
                        </span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ScenarioDesignModal;