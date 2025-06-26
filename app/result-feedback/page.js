"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    XCircle,
    Download,
    ArrowLeft,
    Clock,
    Target,
    MessageSquare,
    Home,
    GraduationCap,
    Star,
    TrendingUp,
    Lightbulb,
    BarChart3,
} from "lucide-react";
import { format } from "date-fns";
import { generateSessionPDF } from "@/utils/pdfGenerator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";

// Hàm lấy và hiển thị kết quả phản hồi phỏng vấn
function ResultFeedbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [sessionData, setSessionData] = useState(null);
    const [isConversationOpen, setIsConversationOpen] = useState(true);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState("");
    // State quản lý trạng thái thu gọn của từng card đánh giá (theo index)
    const [collapsedCards, setCollapsedCards] = useState({});
    // Dynamic AI suggestions state (must be at top level)
    const [dynamicSuggestions, setDynamicSuggestions] = useState({});
    // Add state for improvement suggestion popup
    const [improvementDialogOpen, setImprovementDialogOpen] = useState(false);
    const [improvementDialogContent, setImprovementDialogContent] = useState("");
    const [improvementDialogTitle, setImprovementDialogTitle] = useState("");

    // Compute weaknessCounts and sortedWeaknesses with useMemo
    const { weaknessCounts, sortedWeaknesses } = useMemo(() => {
        const weaknessCounts = {};
        if (sessionData && sessionData.conversation) {
            sessionData.conversation
                .filter(
                    (msg) =>
                        msg.type === "user" &&
                        msg.analysis?.weaknesses
                )
                .flatMap((msg) => msg.analysis.weaknesses)
                .forEach((w) => {
                    weaknessCounts[w] = (weaknessCounts[w] || 0) + 1;
                });
        }
        const sortedWeaknesses = Object.entries(weaknessCounts)
            .sort((a, b) => b[1] - a[1]);
        return { weaknessCounts, sortedWeaknesses };
    }, [sessionData]);

    // Actionable suggestions mapping
    const suggestionMap = {
        "Chưa trả lời đúng trọng tâm": "Hãy đọc kỹ câu hỏi và trả lời trực tiếp vào trọng tâm.",
        "Thiếu ví dụ minh họa": "Thêm ví dụ thực tế để làm rõ ý của bạn.",
        "Câu trả lời còn chung chung": "Cố gắng cụ thể hóa câu trả lời bằng số liệu hoặc trải nghiệm cá nhân.",
        "Thiếu tự tin khi trình bày": "Luyện tập nói trước gương hoặc ghi âm để tăng sự tự tin.",
        "Chưa nêu bật kỹ năng mềm": "Đề cập đến các kỹ năng mềm liên quan như giao tiếp, làm việc nhóm...",
        // ... add more mappings as needed
    };

    // Fetch dynamic suggestions for weaknesses not in the static map
    useEffect(() => {
        sortedWeaknesses.forEach(([weakness]) => {
            if (!suggestionMap[weakness] && !dynamicSuggestions[weakness]) {
                fetch("/api/interview-feedback/generate-suggestion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ weakness }),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.suggestion) {
                            setDynamicSuggestions((prev) => ({ ...prev, [weakness]: data.suggestion }));
                        } else {
                            setDynamicSuggestions((prev) => ({ ...prev, [weakness]: "Không thể tạo gợi ý." }));
                        }
                    })
                    .catch(() => {
                        setDynamicSuggestions((prev) => ({ ...prev, [weakness]: "Không thể tạo gợi ý." }));
                    });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(sortedWeaknesses)]);

    useEffect(() => {
        const mockId = searchParams.get("mockId");
        if (mockId) {
            // Lấy dữ liệu phản hồi từ database dựa trên mockId
            fetch(`/api/interview-feedback?mockId=${mockId}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Không thể lấy dữ liệu phản hồi");
                    }
                    return response.json();
                })
                .then((data) => {
                    // Chuyển đổi các chuỗi JSON thành đối tượng
                    const feedbackData = {
                        ...data,
                        conversation: JSON.parse(data.conversation),
                        strengths: JSON.parse(data.strengths),
                        weaknesses: JSON.parse(data.weaknesses),
                        detailedFeedback: JSON.parse(data.detailedFeedback),
                        messageAnalysis: JSON.parse(data.messageAnalysis),
                        // Dữ liệu kịch bản đã ở định dạng đúng
                        scenario: data.scenario,
                    };
                    setSessionData(feedbackData);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error("Lỗi khi lấy dữ liệu phản hồi:", error);
                    router.push("/dashboard");
                });
        } else {
            // Nếu không có mockId, chuyển hướng về dashboard
            router.push("/dashboard");
        }
    }, [searchParams, router]);

    // Hàm xử lý lưu file PDF
    const handleSavePDF = () => {
        generateSessionPDF(sessionData);
    };

    // Hàm mở modal hiển thị nội dung chi tiết
    const openModal = (title, content) => {
        setModalTitle(title);
        setModalContent(content);
        setModalOpen(true);
    };

    // Hiển thị loading khi đang tải dữ liệu
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
                    <p className="text-gray-600">
                        Đang tải kết quả buổi phỏng vấn...
                    </p>
                </motion.div>
            </div>
        );
    }

    if (!sessionData) return null;

    // Calculate new overallScore factoring in time and answers
    const numAnswers = sessionData.conversation.filter(
        (msg) => msg.type === "user" && msg.analysis?.overallScore
    ).length;
    const avgScore =
        numAnswers > 0
            ? sessionData.conversation
                  .filter((msg) => msg.type === "user" && msg.analysis?.overallScore)
                  .reduce((acc, msg) => acc + msg.analysis.overallScore, 0) /
              numAnswers
            : 0;
    const durationUsed = sessionData.duration; // in seconds
    const expectedDuration = 180; // 3 minutes default
    const expectedAnswers = 3; // default
    const timeFactor = Math.min(1, Math.max(0.7, durationUsed / expectedDuration));
    const answerFactor = Math.min(1, Math.max(0.7, numAnswers / expectedAnswers));
    const overallScore = Math.round(avgScore * timeFactor * answerFactor);

    // Giao diện chính của trang kết quả phản hồi
    return (
        <div
            className="min-h-screen w-full flex flex-col items-center justify-center relative pb-28 pt-32 max-md:px-4 max-sm:px-2"
            style={{
                backgroundImage: "url(/live-practice-arena-background_1.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Vòng tròn điểm số nổi bật */}
            <div
                className="w-full flex justify-center relative z-20"
                style={{ pointerEvents: "none", minHeight: 0 }}
            >
                <Image
                    src={"/stars.png"}
                    alt={"Stars"}
                    width={200}
                    height={200}
                    className={"absolute top-[-90px] translate-x-[4px]"}
                />
                <div
                    className="bg-white rounded-full flex items-center justify-center"
                    style={{
                        width: 128,
                        height: 128,
                        position: "absolute",
                        top: "-45px",
                        left: "50%",
                        transform: "translate(-50%, 0)",
                        zIndex: 20,
                        pointerEvents: "auto",
                    }}
                >
                    <svg width="100" height="100" viewBox="0 0 140 140">
                        <circle
                            cx="70"
                            cy="70"
                            r="62"
                            stroke="#E9E5DF"
                            strokeWidth="12"
                            fill="none"
                        />
                        <path
                            d="M70 8 a 62 62 0 1 1 0 124 a 62 62 0 1 1 0 -124"
                            fill="none"
                            stroke="#E97B5A"
                            strokeWidth="12"
                            strokeDasharray={`${overallScore * 3.9}, 390`}
                            strokeLinecap="round"
                            style={{ transition: "stroke-dasharray 0.6s" }}
                        />
                    </svg>
                    <span
                        className="absolute text-3xl font-bold text-[#38423B]"
                        style={{
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        {overallScore}
                    </span>
                </div>
            </div>

            {/* Thông báo chúc mừng & thông tin tổng quan */}
            <div
                className="justify-end bg-white rounded-3xl shadow-2xl flex flex-col items-center px-4 md:px-8 py-8 relative max-md:!w-full max-md:!h-auto max-md:!pt-10"
                style={{
                    width: "min(747px, 98vw)",
                    minWidth: 0,
                    marginTop: 40,
                    height: 350,
                }}
            >
                <Image
                    src={"/feedback-left-icon.png"}
                    alt="Feedback Left Icon"
                    width={100}
                    height={100}
                    className="absolute left-0 top-[20px]"
                />
                <Image
                    src={"/feedback-right-icon.png"}
                    alt="Feedback Left Icon"
                    width={80}
                    height={120}
                    className="absolute right-0 top-[20px]"
                />
                <h2 className="text-lg md:text-xl font-bold text-[#38423B] text-center mb-4 px-48 max-md:!px-12">
                    Chúc mừng bạn đã hoàn thành buổi phỏng vấn!
                </h2>
                <p className="text-[#6B7A6C] text-center text-xs md:text-sm mb-6 max-w-xl px-20 max-md:!px-14">
                    Đừng lo nếu kết quả chưa như mong đợi. Điều quan trọng là
                    bạn đã dũng cảm bước vào thử thách và hoàn thành nó.
                </p>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    {/* Thời gian, độ khó, số câu trả lời */}
                    <div
                        className="flex flex-col items-center justify-between bg-[#F7F5EF] rounded-2xl py-4 cursor-pointer transition hover:shadow-md h-[110px]"
                        onClick={() =>
                            openModal(
                                "Thời gian",
                                `${Math.floor(sessionData.duration / 60)}m ${
                                    sessionData.duration % 60
                                }s`
                            )
                        }
                    >
                        <Image
                            src="/alarm_2_fill.png"
                            alt="Time Icon"
                            width={25}
                            height={25}
                            className="mb-1"
                        />
                        <span className="text-[#6B7A6C] text-xs">
                            Thời gian
                        </span>
                        <span className="font-bold text-base text-[#38423B]">
                            {Math.floor(sessionData.duration / 60)}m{" "}
                            {sessionData.duration % 60}s
                        </span>
                    </div>
                    <div
                        className="flex flex-col items-center justify-between bg-[#F7F5EF] rounded-2xl py-4 cursor-pointer transition hover:shadow-md h-[110px]"
                        onClick={() =>
                            openModal("Độ khó", sessionData.scenario.difficulty)
                        }
                    >
                        <Image
                            src="/difficulty.png"
                            alt="Difficulty Icon"
                            width={25}
                            height={25}
                            className="mb-1"
                        />
                        <span className="text-[#6B7A6C] text-xs">Độ khó</span>
                        <span className="font-bold text-base text-[#38423B]">
                            {sessionData.scenario.difficulty}
                        </span>
                    </div>
                    <div
                        className="flex flex-col items-center justify-between bg-[#F7F5EF] rounded-2xl py-4 cursor-pointer transition hover:shadow-md h-[110px]"
                        onClick={() =>
                            openModal(
                                "Câu trả lời",
                                `${sessionData.conversation.length}`
                            )
                        }
                    >
                        <Image
                            src="/response.png"
                            alt="Response Icon"
                            width={25}
                            height={25}
                            className="mb-1"
                        />
                        <span className="text-[#6B7A6C] text-xs">
                            Câu trả lời
                        </span>
                        <span className="font-bold text-base text-[#38423B]">
                            {sessionData.conversation.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Thẻ chi tiết & Tabs */}
            <div
                className="bg-white rounded-3xl shadow-2xl flex flex-col items-center px-4 md:px-8 pt-4 pb-6 mt-6 relative z-10 max-md:!w-full max-md:!h-auto"
                style={{
                    width: "min(747px, 98vw)",
                    minWidth: 0,
                }}
            >
                {/* Tabs chuyển đổi giữa các phần: Tổng quan, hội thoại, đánh giá, lời khuyên */}
                <div className="flex gap-2 w-full font-semibold border-b border-[#E9E5DF] mb-4 overflow-x-auto">
                    {[
                        "overview",
                        "conversation",
                        "feedback",
                        "recommendations",
                    ].map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? "default" : "outline"}
                            onClick={() => setActiveTab(tab)}
                            className={`capitalize transition-all duration-300 font-semibold rounded-none px-4 py-2 text-base shadow-none border-b-2 whitespace-nowrap
                                    ${
                                        activeTab === tab
                                            ? "bg-transparent text-[#38423B] border-[#38423B] border-b-4"
                                            : "bg-transparent text-[#6B7A6C] border-transparent hover:text-[#38423B]"
                                    }
                                `}
                        >
                            {tab === "overview"
                                ? "Tổng quan"
                                : tab === "conversation"
                                ? "Hội thoại"
                                : tab === "feedback"
                                ? "Đánh giá"
                                : tab === "recommendations"
                                ? "Lời khuyên"
                                : tab}
                        </Button>
                    ))}
                </div>
                {/* Nội dung từng tab */}
                {activeTab === "overview" && (
                    <div className="w-full flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Box điểm mạnh */}
                            {(() => {
                                // Lấy danh sách điểm mạnh duy nhất từ các tin nhắn của người dùng
                                const strengths = sessionData.conversation
                                    .filter(
                                        (msg) =>
                                            msg.type === "user" &&
                                            msg.analysis?.strengths
                                    )
                                    .flatMap((msg) => msg.analysis.strengths)
                                    .filter(
                                        (strength, index, self) =>
                                            self.indexOf(strength) === index
                                    );
                                const strengthsPreview = strengths.slice(0, 5);
                                const undisplayed =
                                    strengths.length > 5
                                        ? strengths.length - 5
                                        : 0;
                                const hasMore = strengths.length > 5;
                                return (
                                    <div
                                        className="flex-1 bg-[#E7F3DF] rounded-2xl p-4 cursor-pointer transition hover:shadow-md relative"
                                        onClick={() =>
                                            openModal(
                                                "Điểm mạnh",
                                                strengths.join("\n") ||
                                                    "Chưa có dữ liệu"
                                            )
                                        }
                                    >
                                        <div className="flex items-center mb-2 gap-2">
                                            <h4 className="font-bold text-[#38423B] text-sm">
                                                Điểm mạnh
                                            </h4>
                                            {hasMore && (
                                                <span
                                                    className="text-[#3BA55D] text-xs font-medium cursor-pointer underline ml-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openModal(
                                                            "Điểm mạnh",
                                                            strengths.join("\n")
                                                        );
                                                    }}
                                                >
                                                    Bấm để xem đầy đủ (
                                                    {undisplayed})
                                                </span>
                                            )}
                                        </div>
                                        <ul
                                            className="space-y-1 min-h-[64px] max-h-[12em] overflow-hidden relative text-sm"
                                            style={{
                                                WebkitLineClamp: 8,
                                                display: "-webkit-box",
                                                WebkitBoxOrient: "vertical",
                                            }}
                                        >
                                            {strengthsPreview.map(
                                                (strength, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-center gap-2 text-[#38423B]"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 text-[#3BA55D]" />
                                                        {strength}
                                                    </li>
                                                )
                                            )}
                                            {strengths.length === 0 && (
                                                <li className="text-[#6B7A6C]">
                                                    Chưa có dữ liệu
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                );
                            })()}
                            {/* Box điểm cần cải thiện */}
                            {(() => {
                                // Lấy danh sách điểm yếu duy nhất từ các tin nhắn của người dùng
                                const weaknesses = sessionData.conversation
                                    .filter(
                                        (msg) =>
                                            msg.type === "user" &&
                                            msg.analysis?.weaknesses
                                    )
                                    .flatMap((msg) => msg.analysis.weaknesses)
                                    .filter(
                                        (weakness, index, self) =>
                                            self.indexOf(weakness) === index
                                    );
                                const weaknessesPreview = weaknesses.slice(
                                    0,
                                    5
                                );
                                const undisplayed =
                                    weaknesses.length > 5
                                        ? weaknesses.length - 5
                                        : 0;
                                const hasMore = weaknesses.length > 5;
                                return (
                                    <div
                                        className="flex-1 bg-[#FBE9E6] rounded-2xl p-4 cursor-pointer transition hover:shadow-md relative"
                                        onClick={() =>
                                            openModal(
                                                "Có thể cải thiện",
                                                weaknesses.join("\n") ||
                                                    "Chưa có dữ liệu"
                                            )
                                        }
                                    >
                                        <div className="flex items-center mb-2 gap-2">
                                            <h4 className="font-bold text-[#38423B] text-sm">
                                                Có thể cải thiện
                                            </h4>
                                            {hasMore && (
                                                <span
                                                    className="text-[#E24C4B] text-xs font-medium cursor-pointer underline ml-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openModal(
                                                            "Có thể cải thiện",
                                                            weaknesses.join(
                                                                "\n"
                                                            )
                                                        );
                                                    }}
                                                >
                                                    Bấm để xem đầy đủ (
                                                    {undisplayed})
                                                </span>
                                            )}
                                        </div>
                                        <ul
                                            className="space-y-1 min-h-[64px] max-h-[12em] overflow-hidden relative text-sm"
                                            style={{
                                                WebkitLineClamp: 8,
                                                display: "-webkit-box",
                                                WebkitBoxOrient: "vertical",
                                            }}
                                        >
                                            {weaknessesPreview.map(
                                                (weakness, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-center gap-3 text-[#38423B]"
                                                    >
                                                        <Image
                                                            src="/x-mark.png"
                                                            alt="Time Icon"
                                                            width={15}
                                                            height={15}
                                                        />
                                                        {weakness}
                                                    </li>
                                                )
                                            )}
                                            {weaknesses.length === 0 && (
                                                <li className="text-[#6B7A6C]">
                                                    Chưa có dữ liệu
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                );
                            })()}
                        </div>
                        {/* Box phân tích chi tiết */}
                        {(() => {
                            // Lấy danh sách phân tích chi tiết từ các tin nhắn của người dùng
                            const analysis = sessionData.conversation
                                .filter(
                                    (msg) =>
                                        msg.type === "user" &&
                                        msg.analysis?.feedback
                                )
                                .map((msg) => msg.analysis.feedback);
                            const analysisPreview = analysis.slice(0, 2);
                            const undisplayed =
                                analysis.length > 2 ? analysis.length - 2 : 0;
                            const hasMore = analysis.length > 2;
                            return (
                                <div
                                    className="bg-[#F7F7F2] rounded-2xl p-4 cursor-pointer transition hover:shadow-md relative"
                                    onClick={() =>
                                        openModal(
                                            "Phân tích chi tiết",
                                            analysis.join("\n") ||
                                                "Chưa có dữ liệu"
                                        )
                                    }
                                >
                                    <div className="flex items-center mb-2 gap-2">
                                        <h4 className="font-bold text-[#38423B] text-sm flex items-center gap-2">
                                            <Image
                                                src="/detail.png"
                                                alt="Time Icon"
                                                width={25}
                                                height={25}
                                            />
                                            <span>Phân tích chi tiết</span>
                                        </h4>
                                        {hasMore && (
                                            <span
                                                className="text-[#38423B] text-xs font-medium cursor-pointer underline ml-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openModal(
                                                        "Phân tích chi tiết",
                                                        analysis.join("\n")
                                                    );
                                                }}
                                            >
                                                Bấm để xem đầy đủ ({undisplayed}
                                                )
                                            </span>
                                        )}
                                    </div>
                                    <ul
                                        className="list-disc pl-5 text-[#38423B] text-sm space-y-1 min-h-[64px] max-h-[12em] overflow-hidden relative"
                                        style={{
                                            WebkitLineClamp: 8,
                                            display: "-webkit-box",
                                            WebkitBoxOrient: "vertical",
                                        }}
                                    >
                                        {analysisPreview.map((item, index) => (
                                            <li key={index}>{item}</li>
                                        ))}
                                        {analysis.length === 0 && (
                                            <li>Chưa có dữ liệu</li>
                                        )}
                                    </ul>
                                </div>
                            );
                        })()}
                    </div>
                )}
                {activeTab === "conversation" && (
                    <div className="w-full flex flex-col gap-4 py-2 px-1">
                        <div className="max-h-[400px] overflow-y-auto pr-1">
                            {sessionData.conversation.map((message, index) => {
                                const isUser = message.type === "user";
                                const score = message.analysis?.overallScore;
                                if (isUser) {
                                    return (
                                        <div
                                            key={message.id || index}
                                            className="flex flex-col items-end w-full"
                                        >
                                            <div className="max-w-[80%] rounded-2xl bg-[#5B3A1B] text-white border border-white shadow-sm overflow-hidden">
                                                {/* Top: Message with scroll if too long */}
                                                <div className="px-6 pt-4 pb-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-[#B89B2B]/30 scrollbar-track-[#5B3A1B]/10">
                                                    <span className="text-base leading-relaxed break-words block">
                                                        {message.content}
                                                    </span>
                                                </div>
                                                {/* Bottom: Mark */}
                                                <div className="flex justify-start items-center pr-6 pl-4 pb-4">
                                                    <div
                                                        className={
                                                            "border-[#684B38] border-solid rounded-[999px] border px-4 py-[6px]"
                                                        }
                                                    >
                                                        <span className="text-sm font-medium mr-1 text-white">
                                                            Đánh giá:
                                                        </span>
                                                        <span
                                                            className={`${
                                                                parseInt(
                                                                    score
                                                                ) < 50
                                                                    ? "text-[#E97A58]"
                                                                    : "text-[#FFD166]"
                                                            } text-sm`}
                                                        >
                                                            {score}
                                                        </span>
                                                        <span className="ml-0.5 text-sm text-[#B9A89D]">
                                                            /100
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div
                                            key={message.id || index}
                                            className="flex flex-col items-start w-full"
                                        >
                                            <div className="relative max-w-[80%] rounded-2xl px-6 py-4 mb-2 mt-2 bg-[#F7F3ED] text-[#5B3A1B] border border-[#E9E5DF] shadow-sm">
                                                <span className="text-base leading-relaxed break-words block">
                                                    {message.content}
                                                </span>
                                                {typeof score === "number" && (
                                                    <div
                                                        className="absolute left-4 bottom-3 flex items-center bg-white/10 rounded-xl px-3 py-1 mt-3"
                                                        style={{
                                                            backdropFilter:
                                                                "blur(2px)",
                                                        }}
                                                    >
                                                        <span
                                                            className="text-sm font-medium mr-1"
                                                            style={{
                                                                color: "#5B3A1B",
                                                            }}
                                                        >
                                                            Đánh giá:
                                                        </span>
                                                        <span className="text-[#B89B2B] font-bold">
                                                            {score}
                                                        </span>
                                                        <span className="text-[#B89B2B] ml-0.5">
                                                            /100
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </div>
                )}
                {activeTab === "feedback" && (
                    <div className="w-full flex flex-col gap-6 py-2 px-1">
                        <div className="max-h-[400px] overflow-y-auto pr-1">
                            {sessionData.conversation
                                .filter(
                                    (msg) => msg.type === "user" && msg.analysis
                                )
                                .map((msg, index) => {
                                    const collapsed =
                                        collapsedCards[index] || false;
                                    const toggleCollapsed = () =>
                                        setCollapsedCards((prev) => ({
                                            ...prev,
                                            [index]: !prev[index],
                                        }));
                                    return (
                                        <div
                                            key={index}
                                            className="bg-[#FCFAF6] rounded-3xl shadow flex flex-col gap-4 p-6 relative border border-[#E9E5DF] mb-4"
                                            style={{ borderRadius: "32px" }}
                                        >
                                            {/* Top: Message and Score */}
                                            <div className="flex items-start justify-between gap-4">
                                                {/* Collapsed: Only show title and button, right-aligned */}
                                                {collapsed ? (
                                                    <div className="flex flex-1 items-center justify-end w-full">
                                                        <div className="font-bold text-base text-[#38423B]">
                                                            Tin nhắn thứ{" "}
                                                            {index + 1}
                                                        </div>
                                                        <button
                                                            className="ml-2 px-3 py-1 text-xs rounded bg-[#F7F7F2] text-[#38423B] border border-[#E9E5DF] hover:bg-[#E9E5DF] transition"
                                                            onClick={
                                                                toggleCollapsed
                                                            }
                                                        >
                                                            Mở rộng
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between w-full gap-5 max-md:flex-wrap max-md:!justify-center">
                                                        <div className="flex flex-col gap-2 w-full">
                                                            <div className="flex-1 flex items-center">
                                                                <div className="font-bold text-base text-[#38423B]">
                                                                    Câu trả lời{" "}
                                                                    {index + 1}
                                                                </div>
                                                                <button
                                                                    className="ml-2 px-3 py-1 text-xs rounded bg-[#F7F7F2] text-[#38423B] border border-[#E9E5DF] hover:bg-[#E9E5DF] transition"
                                                                    onClick={
                                                                        toggleCollapsed
                                                                    }
                                                                >
                                                                    Thu Nhỏ
                                                                </button>
                                                            </div>
                                                            {/* Message content with scroll if too long */}
                                                            {!collapsed && (
                                                                <div className="bg-transparent px-0 pt-0 pb-0">
                                                                    <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-[#B89B2B]/30 scrollbar-track-[#F6F7F2]/10 px-1">
                                                                        <div className="text-base text-[#38423B] leading-relaxed break-words overflow-hidden text-ellipsis w-full">
                                                                            {
                                                                                msg.content
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div
                                                            className="flex-shrink-0 flex items-center justify-center relative"
                                                            style={{
                                                                width: 72,
                                                                height: 72,
                                                            }}
                                                        >
                                                            <svg
                                                                width="72"
                                                                height="72"
                                                                viewBox="0 0 36 36"
                                                            >
                                                                <circle
                                                                    cx="18"
                                                                    cy="18"
                                                                    r="16"
                                                                    fill="#F6F7F2"
                                                                />
                                                                <path
                                                                    d="M18 4 a 14 14 0 1 1 0 28 a 14 14 0 1 1 0 -28"
                                                                    fill="none"
                                                                    stroke="#7ED957"
                                                                    strokeWidth="3.5"
                                                                    strokeDasharray={`${
                                                                        msg
                                                                            .analysis
                                                                            .overallScore *
                                                                        0.88
                                                                    }, 88`}
                                                                    strokeLinecap="round"
                                                                />
                                                            </svg>
                                                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-[#5B7D2A]">
                                                                {
                                                                    msg.analysis
                                                                        .overallScore
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Bottom: Strengths and Weaknesses (collapsible) */}
                                            {!collapsed && (
                                                <>
                                                    <div className="flex flex-col gap-4 mt-2">
                                                        <div className="bg-[#EAF7E6] rounded-2xl p-4">
                                                            <div className="font-bold text-[#38423B] mb-2 text-base">
                                                                Điểm mạnh
                                                            </div>
                                                            <ul className="space-y-2">
                                                                {msg.analysis
                                                                    .strengths &&
                                                                msg.analysis
                                                                    .strengths
                                                                    .length >
                                                                    0 ? (
                                                                    msg.analysis.strengths.map(
                                                                        (
                                                                            strength,
                                                                            idx
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="flex items-center gap-2 text-[#38423B] text-base"
                                                                            >
                                                                                <span className="inline-block w-2 h-2 rounded-full bg-[#7ED957]" />
                                                                                {
                                                                                    strength
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )
                                                                ) : (
                                                                    <li className="text-[#6B7A6C] text-base">
                                                                        Chưa có
                                                                        dữ liệu
                                                                    </li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                        <div className="bg-[#FDEDE7] rounded-2xl p-4">
                                                            <div className="font-bold text-[#38423B] mb-2 text-base">
                                                                Có thể cải thiện
                                                            </div>
                                                            <ul className="space-y-2">
                                                                {msg.analysis
                                                                    .weaknesses &&
                                                                msg.analysis
                                                                    .weaknesses
                                                                    .length >
                                                                    0 ? (
                                                                    msg.analysis.weaknesses.map(
                                                                        (
                                                                            weakness,
                                                                            idx
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="flex items-center gap-2 text-[#38423B] text-base"
                                                                            >
                                                                                <Image
                                                                                    src="/x-mark.png"
                                                                                    alt="Weakness Icon"
                                                                                    width={
                                                                                        18
                                                                                    }
                                                                                    height={
                                                                                        18
                                                                                    }
                                                                                />
                                                                                {
                                                                                    weakness
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )
                                                                ) : (
                                                                    <li className="text-[#6B7A6C] text-base">
                                                                        Chưa có
                                                                        dữ liệu
                                                                    </li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}
                {activeTab === "recommendations" && (
                    <div className="w-full flex flex-col gap-4 py-2 px-1">
                        <div className="max-h-[400px] overflow-y-auto pr-1">
                            {(() => {
                                // Assign priority and color
                                const getPriority = (idx) => {
                                    if (idx === 0) return { label: "Rất quan trọng", color: "#E24C4B", bg: "#FDEDE7" };
                                    if (idx === 1 || idx === 2) return { label: "Nên cải thiện sớm", color: "#FFD166", bg: "#FFF9E3" };
                                    return { label: "Có thể cải thiện dần", color: "#6BAA4D", bg: "#E7F3DF" };
                                };

                                if (sortedWeaknesses.length === 0) {
                                    return (
                                        <div className="text-gray-500 text-center py-8">
                                            Không có lời khuyên nào.
                                        </div>
                                    );
                                }
                                return sortedWeaknesses.map(([weakness, count], idx) => {
                                    const { label, color, bg } = getPriority(idx);
                                    const suggestionRaw =
                                        suggestionMap[weakness] ||
                                        dynamicSuggestions[weakness] ||
                                        "Đang tạo gợi ý...";

                                    // Parse suggestion if it's a JSON array or object with suggestion/reason
                                    let suggestion = "";
                                    let reason = "";
                                    try {
                                        const parsed = JSON.parse(suggestionRaw);
                                        if (Array.isArray(parsed) && parsed[0]?.suggestion) {
                                            suggestion = parsed[0].suggestion;
                                            reason = parsed[0].reason || "";
                                        } else if (parsed && typeof parsed === 'object' && parsed.suggestion) {
                                            suggestion = parsed.suggestion;
                                            reason = parsed.reason || "";
                                        } else {
                                            suggestion = suggestionRaw;
                                        }
                                    } catch {
                                        suggestion = suggestionRaw;
                                    }

                                    return (
                                        <div
                                            key={weakness}
                                            className="flex items-start gap-4 rounded-[2rem] px-6 py-4 w-full border mb-4"
                                            style={{ background: bg, borderColor: color }}
                                        >
                                            <div className="flex flex-col min-w-[120px] items-center justify-center mr-2">
                                                <span
                                                    className="font-bold text-base mb-1 px-3 py-1 rounded-full"
                                                    style={{ color: color, background: '#fff', border: `1px solid ${color}` }}
                                                >
                                                    {label}
                                                </span>
                                                <span className="text-xs text-[#7A6A2F] mt-1">({count} lần)</span>
                                            </div>
                                            <div className="flex flex-col flex-1">
                                                <span className="font-bold text-[#2D332B] text-lg leading-snug mb-2">
                                                    {weakness}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    className="w-fit px-4 py-1 text-sm rounded-full border border-[#B89B2B] text-[#B89B2B]"
                                                    onClick={() => {
                                                        setImprovementDialogTitle(`Đề xuất cải thiện cho: ${weakness}`);
                                                        setImprovementDialogContent(
                                                            reason
                                                                ? `<b>Gợi ý:</b> ${suggestion}<br/><b>Lý do:</b> ${reason}`
                                                                : suggestion
                                                        );
                                                        setImprovementDialogOpen(true);
                                                    }}
                                                    disabled={suggestionRaw === "Đang tạo gợi ý..."}
                                                >
                                                    Xem Đề Xuất Cải Thiện
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                        {/* Improvement Suggestion Dialog */}
                        <Dialog open={improvementDialogOpen} onOpenChange={setImprovementDialogOpen}>
                            <DialogContent className="max-w-lg w-full">
                                <DialogTitle className="font-bold text-lg text-[#B89B2B] mb-2">
                                    {improvementDialogTitle}
                                </DialogTitle>
                                <div
                                    className="text-base text-[#7A6A2F] mt-2"
                                    dangerouslySetInnerHTML={{ __html: improvementDialogContent }}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* Modal hiển thị nội dung đầy đủ */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent
                    className="max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border-none"
                    style={{ boxShadow: "0 8px 32px 0 rgba(60,60,60,0.10)" }}
                >
                    <DialogTitle className="font-bold text-lg text-[#B89B2B] mb-4">
                        {modalTitle}
                    </DialogTitle>
                    <div className="bg-[#FFF9E3] rounded-2xl p-6 shadow-lg border border-[#F7E6A2]">
                        <ul className="list-disc pl-5 text-base text-[#7A6A2F] space-y-2">
                            {modalContent
                                .split("\n")
                                .filter((line) => line.trim() !== "")
                                .map((line, idx) => (
                                    <li key={idx}>{line}</li>
                                ))}
                        </ul>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Footer trắng với các nút hành động */}
            <footer
                className="w-full fixed bottom-0 left-0 z-50 flex justify-center items-center"
                style={{ pointerEvents: "auto" }}
            >
                <div
                    className="w-full max-w-full bg-white flex justify-center items-center sm: gap-4 md:gap-48 py-4"
                    style={{
                        borderTopLeftRadius: "2.5rem",
                        borderTopRightRadius: "2.5rem",
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                        boxShadow: "0 0 0 0 transparent",
                    }}
                >
                    <Button
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center h-[48px] gap-2 border border-[#D1D5D8] bg-white hover:bg-[#F6F7F9] text-[#38423B] font-medium rounded-full px-8 py-3 text-base shadow-none transition-colors"
                    >
                        <Image
                            src="/home-icon.png"
                            alt="Dashboard Icon"
                            width={20}
                            height={20}
                            className="-mt-1"
                        />
                        <span className="max-sm:hidden block">
                            Về dashboard
                        </span>
                    </Button>
                    <div className="flex items-center gap-4">
                        <Button className="flex items-center h-[48px] gap-2 bg-[#F8FEF2] border border-solid border-[#CDF7A2] hover:bg-[#eef7e6] text-[#38423B] font-semibold rounded-full px-8 py-3 text-base shadow-none transition-colors">
                            <Image
                                src="/redo.png"
                                alt="Redo Icon"
                                width={20}
                                height={20}
                                className="-mt-1"
                            />
                            <span className="max-sm:hidden block">Làm lại</span>
                        </Button>
                        <Button
                            onClick={handleSavePDF}
                            className="flex items-center h-[48px] gap-2 bg-[#B6E388] hover:bg-[#A0D468] text-[#38423B] font-semibold rounded-full px-8 py-3 text-base border-none shadow-none transition-colors"
                        >
                            <Image
                                src="/download.png"
                                alt="Download Icon"
                                width={20}
                                height={20}
                                className="-mt-1"
                            />
                            <span className="max-sm:hidden block">Tải PDF</span>
                        </Button>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Component hiển thị tiến trình dạng vòng tròn
const CircularProgress = ({ value }) => (
    <div className="relative w-full h-full">
        <svg className="w-full h-full" viewBox="0 0 36 36">
            {/* Đường viền nền của vòng tròn */}
            <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#eee"
                strokeWidth="3"
                className="dark:stroke-gray-700"
            />
            {/* Đường viền tiến trình với gradient */}
            <path
                d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeDasharray={`${value}, 100`}
                className="transform origin-center -rotate-90"
            />
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
            </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                /100
            </span>
        </div>
    </div>
);

export default function ResultFeedback() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Đang xử lý phân tích...
                        </p>
                    </div>
                </div>
            }
        >
            <ResultFeedbackContent />
        </Suspense>
    );
}
