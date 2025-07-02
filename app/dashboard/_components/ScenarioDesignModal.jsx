"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    X,
    Wand2,
    Loader2,
    Sparkles,
    Target,
    Clock,
    AlertCircle,
    ArrowRight,
    RefreshCw,
    Globe2,
} from "lucide-react";
import { generateWithRetry } from "@/utils/GeminiAIModal";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';

// Danh sách các ngành nghề được hỗ trợ
const industries = [
    { value: "It", label: "IT", icon: "💻" },
    { value: "Marketing", label: "Marketing", icon: "💰" },
    { value: "Communication", label: "Communication", icon: "📢" },
    { value: "Data Science", label: "Data Science", icon: "📈" },
    { value: "Business Analysis", label: "Business Analysis", icon: "📊" },
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
  const [selectedLanguage, setSelectedLanguage] = React.useState("vi");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedScenario, setGeneratedScenario] = React.useState(null);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState(null);
  const [selectedIndustryLocal, setSelectedIndustryLocal] = React.useState(selectedIndustry || "");
  const [roleDescriptionLocal, setRoleDescriptionLocal] = React.useState(roleDescription || "");
  const [expanded, setExpanded] = React.useState(false);
  const [isProceeding, setIsProceeding] = React.useState(false);
  const [focusArea, setFocusArea] = React.useState("");
  const [retryCount, setRetryCount] = React.useState(0);

    // Danh sách các cấp độ khó dễ
    const difficulties = [
        { value: "Intern", label: "Intern" },
        { value: "Fresher", label: "Fresher" },
        { value: "Junior", label: "Junior" },
        { value: "Senior", label: "Senior" },
    ];

    // Danh sách ngôn ngữ được hỗ trợ
    const languages = [
        { value: "en", label: "English" },
        { value: "vi", label: "Vietnamese" },
    ];

    // Danh sách loại phỏng vấn (focus area)
    const focusAreas = [
        { value: "Kiến thức", label: "Kiến thức" },
        { value: "Hành vi", label: "Hành vi" },
        { value: "Tình huống", label: "Tình huống" },
        { value: "Khác", label: "Khác" },
    ];

    // Hàm ánh xạ độ khó sang cấu hình gợi ý (số lượng và phong cách)
    function getSuggestionConfig(difficulty) {
        switch (difficulty) {
            case "Intern":
                return {
                    count: 5,
                    style: "Frame each suggestion as a reflective question or prompt to help the user think through the situation step by step. Avoid giving direct instructions; instead, encourage the user to consider what actions they might take and why.",
                };
            case "Fresher":
                return {
                    count: 4,
                    style: "Provide clear coaching prompts or questions that encourage the user to consider their options and possible consequences, with some gentle guidance. Avoid direct instructions.",
                };
            case "Junior":
                return {
                    count: 3,
                    style: "Offer concise, open-ended prompts that encourage independent analysis and decision-making. Focus on helping the user reflect on their approach.",
                };
            case "Senior":
                return {
                    count: 2,
                    style: "Give high-level, strategic coaching prompts or challenging questions that stimulate critical thinking and autonomy. Do not provide direct instructions or step-by-step guidance.",
                };
            default:
                return {
                    count: 4,
                    style: "Provide coaching prompts or reflective questions that help the user think through the situation.",
                };
        }
    }

    // Xây dựng focusInstructions dựa trên loại phỏng vấn
    let focusInstructions = "";
    if (focusArea === "Kiến thức") {
        focusInstructions = `\nIMPORTANT: This is a technical knowledge interview. The scenario and customerQuery must directly test the user's knowledge in their field (for example, for a Tester: ask about types of testing, testing strategies, tools, or best practices). The customerQuery should be a direct technical question or challenge, not a soft skill or behavioral situation. The expectedResponse should be coaching prompts that help the user recall, explain, or structure their technical answer.\n\nExample:\n- scenario: Bạn là một Tester thực tập tại một công ty phần mềm. Trong buổi phỏng vấn, bạn được yêu cầu trình bày về các loại kiểm thử phần mềm và khi nào nên sử dụng từng loại.\n- customerQuery: Bạn có thể liệt kê và giải thích các loại kiểm thử phần mềm phổ biến không? Khi nào thì nên sử dụng kiểm thử chức năng so với kiểm thử phi chức năng?`;
    } else if (focusArea === "Hành vi") {
        focusInstructions = `\nIMPORTANT: This is a behavioral interview. The scenario and customerQuery must focus on the user's past behaviors, attitudes, or soft skills in the workplace.\n\nExample:\n- scenario: Bạn từng gặp phải xung đột với đồng nghiệp trong một dự án quan trọng. Hãy kể lại cách bạn xử lý tình huống đó.\n- customerQuery: Khi bạn không đồng ý với ý kiến của đồng nghiệp, bạn thường làm gì?`;
    } else if (focusArea === "Tình huống") {
        focusInstructions = `\nIMPORTANT: This is a situational interview. The scenario and customerQuery must present a hypothetical situation that tests the user's problem-solving or decision-making skills.\n\nExample:\n- scenario: Bạn là nhân viên chăm sóc khách hàng và nhận được một cuộc gọi từ khách hàng đang rất tức giận vì sản phẩm bị lỗi.\n- customerQuery: Nếu bạn là tôi, bạn sẽ xử lý tình huống này như thế nào?`;
    } else if (focusArea === "Khác") {
        focusInstructions = `\nIMPORTANT: Use the context provided to create a relevant scenario and customerQuery.`;
    }

    // Hàm tạo kịch bản phỏng vấn bằng AI
    const generateScenario = async (autoRetry = false) => {
        setIsGenerating(true);
        setError(null);
        setProgress(0);

        // Hiệu ứng loading với thanh tiến trình
        const progressInterval = setInterval(() => {
            setProgress((prev) => Math.min(prev + 10, 90));
        }, 500);

        try {
            // Tạo prompt cho AI để tạo kịch bản
            const { count, style } = getSuggestionConfig(difficulty);
            const prompt = `You are an API that generates interview scenarios.
${focusInstructions}
Respond ONLY with a valid JSON object, and nothing else.
DO NOT include any explanations, markdown, or extra text.

The JSON object must have these keys (all values must be strings):
- scenario
- customerQuery
- expectedResponse

- The 'scenario' should describe the situation and context for the user (the interviewee).
- The 'customerQuery' must be a direct quote or message from the customer, written in the customer's voice (for example: "I'm extremely disappointed with this software! It keeps crashing and wasting my time. I want a refund now!"). Do NOT write the customerQuery as if the user is speaking; it must always be from the customer's perspective.

IMPORTANT: The entire scenario, customerQuery, and coaching prompts MUST focus specifically on the aspect: '${focusArea}'. Do NOT generate a general scenario. For example, if focusArea is 'Kiến thức', the scenario must test knowledge; if 'Hành vi', it must test behavior; if 'Tình huống', it must be situational; if 'Khác', use the context provided.

Imagine you are a world-class interview coach. For 'expectedResponse', provide a creative, human, and actionable numbered list of exactly ${count} coaching prompts or reflective questions (not instructions) to help the user think through how to handle this situation. Write as if you are speaking directly to the user, using empathetic, conversational, and thought-provoking language. Your prompts should spark curiosity, self-reflection, and deeper thinking, not just checklist questions. Be creative: offer open-ended, sometimes challenging prompts that help the user see the situation from new perspectives. Avoid generic or robotic phrasing—use natural, engaging language that feels like a real coach guiding a real person.

${style}

Do NOT provide a sample answer or script, and do NOT tell the user exactly what to do. Make the suggestions as if you are a real, empathetic, and helpful professional coach, not a robot. Always follow the JSON format.

For example:

"expectedResponse": "1. If you were in the shoes of a senior team member, what questions would you ask to fully understand this issue?\n2. How might you approach your colleagues to ensure everyone feels heard and supported?\n3. What creative solutions could you propose to turn this challenge into an opportunity for growth?"

If language is 'vi', generate the entire response in Vietnamese. If 'en', generate in English.

Return ONLY the JSON object, e.g.
{
  "scenario": "...",
  "customerQuery": "...",
  "expectedResponse": "1. ...\n2. ...\n3. ..."
}

Parameters for this scenario:
Industry: ${selectedIndustryLocal}
Role: ${roleDescriptionLocal}
Difficulty: ${difficulty}
Focus: ${focusArea}
Context: ${description}
Language: ${selectedLanguage}`;

            // Gửi prompt đến AI và xử lý kết quả với retry
            const responseText = await generateWithRetry(prompt);
            // Strict validation and parsing
            let jsonResponse;
            let cleanedResponse;
            try {
                jsonResponse = JSON.parse(responseText);
            } catch (err) {
                cleanedResponse = responseText
                    .replace(/```json/g, "")
                    .replace(/```/g, "")
                    .trim();
                try {
                    jsonResponse = JSON.parse(cleanedResponse);
                } catch (parseErr) {
                    // Nếu lỗi, thử lại tối đa 2 lần
                    if (retryCount < 2) {
                        if (!autoRetry) {
                            toast(
                                "Đã xảy ra lỗi khi tạo kịch bản. Hệ thống đang tự động tạo lại kịch bản mới, vui lòng chờ...",
                                { style: { color: "#000" } }
                            );
                        }
                        setRetryCount(retryCount + 1);
                        clearInterval(progressInterval);
                        setTimeout(() => generateScenario(true), 500);
                        return;
                    } else {
                        setRetryCount(0);
                        throw new Error("AI response is not valid JSON."); // Nếu vượt quá số lần thử, báo lỗi dữ liệu AI trả về không hợp lệ
                    }
                }
            }
            // Kiểm tra dữ liệu trả về từ AI có hợp lệ không (phải có đủ các trường cần thiết)
            if (
                !jsonResponse.scenario ||
                !jsonResponse.customerQuery ||
                !jsonResponse.expectedResponse ||
                typeof jsonResponse.scenario !== "string" ||
                typeof jsonResponse.customerQuery !== "string" ||
                typeof jsonResponse.expectedResponse !== "string"
            ) {
                // Nếu dữ liệu không hợp lệ, thử lại tối đa 2 lần
                if (retryCount < 2) {
                    if (!autoRetry) {
                        toast(
                            "Đã xảy ra lỗi khi tạo kịch bản. Hệ thống đang tự động tạo lại kịch bản mới, vui lòng chờ...",
                            { style: { color: "#000" } }
                        );
                    }
                    setRetryCount(retryCount + 1);
                    clearInterval(progressInterval);
                    setTimeout(() => generateScenario(true), 500);
                    return;
                } else {
                    setRetryCount(0);
                    throw new Error(
                        "AI response missing required fields. Please try again."
                    );
                }
            }
            setGeneratedScenario({
                customerQuery: jsonResponse.customerQuery,
                expectedResponse: jsonResponse.expectedResponse,
                scenario: jsonResponse.scenario,
                difficulty,
                language: selectedLanguage,
                title,
                description,
                industry: selectedIndustryLocal,
                role: roleDescriptionLocal,
                focusArea,
            });
            setProgress(100);
            setRetryCount(0);
        } catch (error) {
            setError(
                error.message ||
                    "Failed to generate scenario. Please try again."
            );
            setGeneratedScenario(null);
            if (typeof responseText !== "undefined") {
                console.error("Scenario generation error:", error);
                console.log("Raw AI response:", responseText); // Debug log
                if (typeof cleanedResponse !== "undefined") {
                    console.log("Cleaned AI response:", cleanedResponse); // Debug log
                }
            }
        } finally {
            clearInterval(progressInterval);
            setIsGenerating(false);
        }
    };

    // Xử lý khi người dùng muốn tiếp tục với kịch bản đã tạo
    const handleProceed = async () => {
        console.log("handleProceed called");
        setIsProceeding(true);
        try {
            // Generate mockID with fallback
            let mockID;
            try {
                mockID = crypto.randomUUID();
            } catch (e) {
                mockID = Math.random().toString(36).substring(2, 15);
                console.warn(
                    "crypto.randomUUID() not available, using fallback mockID:",
                    mockID
                );
            }
            console.log("mockID:", mockID);
            // Chuẩn bị dữ liệu kịch bản phỏng vấn
            console.log("Preparing scenarioData...");
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
                focusArea: focusArea,
                createdBy: "user", // Sẽ được thay thế bằng ID/email người dùng thực tế
                createdAt: new Date().toISOString(),
                mockID: mockID,
            };
            console.log("Scenario data to save:", scenarioData);

            // Lưu vào database
            console.log("Sending fetch to /api/mock-interview...");
            const response = await fetch("/api/mock-interview", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(scenarioData),
            });

            console.log("API response status:", response.status);
            if (!response.ok) {
                setError("Không thể lưu kịch bản. Vui lòng thử lại.");
                setIsProceeding(false);
                return;
            }

            console.log(
                "Redirecting to:",
                `/live-practice-arena?mockId=${mockID}`
            );
            // Chỉ chuyển hướng nếu lưu thành công
            router.push(`/live-practice-arena?mockId=${mockID}`);
        } catch (error) {
            console.error("Error saving scenario:", error);
            setError("Đã xảy ra lỗi khi lưu kịch bản. Vui lòng thử lại.");
            setIsProceeding(false);
            // Không chuyển hướng nếu có lỗi
        }
    };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Nền mờ và hiệu ứng blur */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />
          {/* Modal chính, có hiệu ứng động */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-xl px-2 sm:px-0 flex flex-col items-center z-10 max-h-[90vh]"
          >
            {/* Nút đóng modal */}
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
            {/* Header của modal */}
            <div className="w-full max-w-lg rounded-t-[36px] bg-[#4B372E] pt-7 pb-4 px-8 flex flex-col relative z-20 overflow-hidden">
              {/* Ảnh nền header */}
              <div className="absolute inset-0 w-full h-full bg-no-repeat bg-top-right bg-cover pointer-events-none" style={{ backgroundImage: 'url(/scenario_background_1.png)' }} />
              {/* Tiêu đề và mô tả ngắn */}
              <div className="relative z-20 flex flex-row items-start justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-white">Tạo buổi phòng vấn mới</h2>
                  <p className="text-sm text-[#E5D6C6]">Thiết kế kịch bản phòng vấn hoàn hảo theo ý bạn</p>
                </div>
              </div>
            </div>
            {/* Viền nâu phía dưới, trái, phải */}
            <div className="w-full max-w-lg h-full rounded-b-[36px] bg-[#4B372E] px-1 pb-1 flex flex-col items-center relative z-10" style={{ boxShadow: '0 8px 32px 0 rgba(75,55,46,0.12)' }}>
              {/* Lớp trắng phía trước (nội dung chính) */}
              <div
                className="relative z-20 w-full max-w-lg mx-auto rounded-[28px] bg-white flex flex-col overflow-hidden border border-transparent shadow-2xl"
                style={{
                  maxHeight: 'calc(90vh - 120px)', // Trừ chiều cao header
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#E5D6C6 #FFFFFF'
                }}
              >
                {/* Nội dung chính của modal */}
                {generatedScenario ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center w-full"
                  >
                    {/* Thẻ kịch bản đã tạo */}
                    <div className="w-full bg-white rounded-[28px] shadow-lg px-8 py-7 flex flex-col gap-6 z-10 relative">
                      {/* Tiêu đề kịch bản */}
                      <h2 className="text-2xl font-bold text-[#374151] mb-2">{generatedScenario.title || 'Tiêu đề kịch bản'}</h2>
                      {/* Dòng badge */}
                      <div className="flex items-center gap-3 mb-2">
                        {/* Badge ngành nghề */}
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#F0F6FF] text-[#2563EB] text-sm font-medium">
                          {/* Icon ngành nghề */}
                          <span role="img" aria-label="industry">🛒</span>
                          {generatedScenario.industry || 'Ngành'}
                        </span>
                        {/* Badge độ khó */}
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#E6F9E6] text-[#22C55E] text-sm font-medium">
                          {/* Icon độ khó */}
                          <span role="img" aria-label="difficulty">✔️</span>
                          {generatedScenario.difficulty || 'Độ khó'}
                        </span>
                        {/* Badge loại phỏng vấn */}
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF7ED] text-[#F59E42] text-sm font-medium">
                          <span role="img" aria-label="focus">🎯</span>
                          {generatedScenario.focusArea || 'Loại phỏng vấn'}
                        </span>
                      </div>
                      {/* Mô tả kịch bản */}
                      <p className="text-base text-[#374151] mb-2">{generatedScenario.scenario || 'Mô tả kịch bản...'}</p>
                      {/* Đường kẻ phân cách */}
                      <div className="border-t border-[#E5E7EB] my-2" />
                      {/* Hộp tình huống từ khách hàng */}
                      <div className="bg-[#F9F6ED] rounded-xl p-4 mb-2">
                        <div className="font-semibold text-[#7C5C2A] mb-1">Tình huống từ khách hàng</div>
                        <div className="text-[#7C5C2A] text-base">{generatedScenario.customerQuery || 'Mô tả tình huống...'}</div>
                      </div>
                      {/* Gợi ý trả lời checklist (có thể thu gọn/mở rộng) */}
                      {
                        (() => {
                          const tasks = (generatedScenario.expectedResponse || '').split(/\s*\d+\.\s*/).filter(Boolean);
                          const showToggle = tasks.length > 0;
                          const visibleTasks = showToggle && !expanded ? tasks.slice(0, 0) : tasks;
                          return (
                            <div>
                              <div className="font-bold text-[#374151] mb-2">Gợi ý trả lời</div>
                              <ul className="space-y-2">
                                {visibleTasks.map((task, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-[#374151] text-base">
                                    <span className="mt-1 text-green-500"><svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#D1FADF" /><path d="M6 10.5l2.5 2.5L14 8.5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                                    <span>{task.trim()}</span>
                                  </li>
                                ))}
                              </ul>
                              {showToggle && (
                                <button
                                  className="mt-2 text-[#2563EB] text-base font-semibold focus:outline-none hover:underline"
                                  onClick={() => setExpanded(e => !e)}
                                >
                                  {expanded ? 'Thu gọn' : `Xem thêm (${tasks.length - 0})`}
                                </button>
                              )}
                            </div>
                          );
                        })()
                      }
                      {/* Nút hành động: Đổi kịch bản, Vào buổi phỏng vấn */}
                      <div className="grid grid-cols-2 gap-3 mt-6 max-sm:grid-cols-1">
                        <Button
                          variant="outline"
                          className="flex-1 h-12 rounded-full border border-[#D1D5DB] text-[#374151] bg-white hover:bg-[#F3F4F6] text-base font-semibold"
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
                          className="flex-1 h-12 rounded-full bg-[#B5ED76] hover:bg-[#16A34A] text-black text-base font-semibold shadow-none"
                          onClick={handleProceed}
                          disabled={
                            !generatedScenario?.scenario ||
                            !generatedScenario?.customerQuery ||
                            !generatedScenario?.expectedResponse
                          }
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
                        {/* Focus Area field */}
                        <div className="col-span-2">
                          <label className="block text-xs text-[#6B5B4A] mb-1.5 font-medium">Loại phỏng vấn<span className="text-red-500">*</span></label>
                          <Select
                            value={focusArea}
                            onValueChange={setFocusArea}
                          >
                            <SelectTrigger className="w-full border border-[#E5E5E5] bg-white text-[#2D221B] focus:border-[#B6F09C] focus:ring-[#B6F09C]/20 rounded-xl h-12">
                              <SelectValue placeholder="Chọn loại phỏng vấn" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-[#2D221B]">
                              {focusAreas.map((area) => (
                                <SelectItem key={area.value} value={area.value}>
                                  {area.label}
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
                    {/* Đường kẻ phân cách */}
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
                    {/* Hiển thị lỗi và trạng thái loading */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-900/20 border-2 border-red-700 rounded-lg flex flex-col items-center gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <p className="text-sm text-red-400">{error}</p>
                        </div>
                        <Button
                          variant="outline"
                          className="mt-2"
                          onClick={() => {
                            setError(null);
                            generateScenario();
                          }}
                        >
                          Thử lại
                        </Button>
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
                            Hệ thống đang tiến hành khởi tạo buổi phỏng vấn cho bạn ...
                          </span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-gray-800" />
                      </motion.div>
                    )}
                    {/* Nút khởi tạo cuộc phỏng vấn */}
                    <div className="mt-2">
                      <Button
                        className={`w-full h-12 rounded-full text-lg font-semibold transition-all duration-300 ${!difficulty || !selectedIndustryLocal || !roleDescriptionLocal || !title || !focusArea
                            ? 'bg-[#E5D6C6] text-[#B0A08F]'
                            : 'bg-[#B6F09C] text-[#2D221B] hover:bg-[#A0E07C]'
                          } shadow-none`}
                        disabled={
                          !difficulty ||
                          !selectedIndustryLocal ||
                          !roleDescriptionLocal ||
                          !title ||
                          !focusArea ||
                          isGenerating
                        }
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
          {/* Loading overlay khi chuyển sang phòng phỏng vấn */}
          {isProceeding && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4 bg-white/90 rounded-2xl px-8 py-10 shadow-2xl border border-gray-200">
                <svg className="animate-spin h-10 w-10 text-green-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <div className="text-lg font-semibold text-[#2D221B]">Đang chuyển sang phòng phỏng vấn...</div>
                <div className="text-sm text-gray-500">Vui lòng chờ trong giây lát</div>
              </div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default ScenarioDesignModal;
