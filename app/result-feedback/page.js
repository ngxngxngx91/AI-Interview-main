"use client";

import React, { useState, useEffect, Suspense } from "react";
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
    BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { generateSessionPDF } from "@/utils/pdfGenerator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
        restDelta: 0.001
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState("");
    // Collapsed state for feedback cards (keyed by index)
    const [collapsedCards, setCollapsedCards] = useState({});

    useEffect(() => {
        const mockId = searchParams.get("mockId");
        if (mockId) {
            // Lấy dữ liệu phản hồi từ database
            fetch(`/api/interview-feedback?mockId=${mockId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch feedback data');
                    }
                    return response.json();
                })
                .then(data => {
                    // Chuyển đổi các chuỗi JSON thành đối tượng
                    const feedbackData = {
                        ...data,
                        conversation: JSON.parse(data.conversation),
                        strengths: JSON.parse(data.strengths),
                        weaknesses: JSON.parse(data.weaknesses),
                        detailedFeedback: JSON.parse(data.detailedFeedback),
                        messageAnalysis: JSON.parse(data.messageAnalysis),
                        // Dữ liệu kịch bản đã ở định dạng đúng
                        scenario: data.scenario
                    };
                    setSessionData(feedbackData);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching feedback data:", error);
                    router.push("/dashboard");
                });
        } else {
            router.push("/dashboard");
        }
    }, [searchParams, router]);

    const handleSavePDF = () => {
        generateSessionPDF(sessionData);
    };

    // Helper to open modal with content
    const openModal = (title, content) => {
        setModalTitle(title);
        setModalContent(content);
        setModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
                    <p className="text-gray-600">Đang tải kết quả buổi phỏng vấn...</p>
                </motion.div>
            </div>
        );
    }

    if (!sessionData) return null;

    // Tính điểm trung bình từ tất cả các tin nhắn của người dùng
    const averageScore = Math.round(
        sessionData.conversation
            .filter(msg => msg.type === 'user' && msg.analysis?.overallScore)
            .reduce((acc, msg) => acc + msg.analysis.overallScore, 0) /
        sessionData.conversation.filter(msg => msg.type === 'user' && msg.analysis?.overallScore).length
    );

    return (
        <div
            className="min-h-screen w-full flex flex-col items-center justify-center relative"
            style={{
                backgroundImage: 'url(/live-practice-arena-background_1.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Floating Score Circle */}
            <div className="w-full flex justify-center relative z-20" style={{ pointerEvents: 'none', minHeight: 0 }}>
                <div
                    className="bg-white rounded-full shadow-xl flex items-center justify-center"
                    style={{
                        width: 128,
                        height: 128,
                        position: 'absolute',
                        top: '-69px',
                        left: '50%',
                        transform: 'translate(-50%, 0)',
                        zIndex: 20,
                        pointerEvents: 'auto',
                    }}
                >
                    <svg width="100" height="100" viewBox="0 0 140 140">
                        <circle cx="70" cy="70" r="62" stroke="#E9E5DF" strokeWidth="12" fill="none" />
                        <path
                            d="M70 8 a 62 62 0 1 1 0 124 a 62 62 0 1 1 0 -124"
                            fill="none"
                            stroke="#E97B5A"
                            strokeWidth="12"
                            strokeDasharray={`${averageScore * 3.9}, 390`}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 0.6s' }}
                        />
                    </svg>
                    <span className="absolute text-3xl font-bold text-[#38423B]" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>{averageScore}</span>
                </div>
            </div>

            {/* Congratulation & Info Card */}
            <div
                className="bg-white rounded-3xl shadow-2xl flex flex-col items-center px-4 md:px-8 pt-8 pb-4 relative"
                style={{
                    width: 'min(747px, 98vw)',
                    minWidth: 0,
                    marginTop: 40,
                }}
            >
                <h2 className="text-lg md:text-xl font-bold text-[#38423B] text-center mb-2">Chúc mừng bạn đã hoàn thành buổi phỏng vấn!</h2>
                <p className="text-[#6B7A6C] text-center text-xs md:text-sm mb-6 max-w-xl">Đừng lo nếu kết quả chưa như mong đợi. Điều quan trọng là bạn đã dũng cảm bước vào thử thách và hoàn thành nó.</p>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <div className="flex flex-col items-center bg-[#F7F7F2] rounded-2xl py-4 cursor-pointer transition hover:shadow-md" onClick={() => openModal('Thời gian', `${Math.floor(sessionData.duration / 60)}m ${sessionData.duration % 60}s`)}>
                        <Clock className="w-5 h-5 text-[#6B7A6C] mb-1" />
                        <span className="text-[#6B7A6C] text-xs">Thời gian</span>
                        <span className="font-bold text-base text-[#38423B]">{Math.floor(sessionData.duration / 60)}m {sessionData.duration % 60}s</span>
                    </div>
                    <div className="flex flex-col items-center bg-[#F7F7F2] rounded-2xl py-4 cursor-pointer transition hover:shadow-md" onClick={() => openModal('Độ khó', sessionData.scenario.difficulty)}>
                        <Target className="w-5 h-5 text-[#6B7A6C] mb-1" />
                        <span className="text-[#6B7A6C] text-xs">Độ khó</span>
                        <span className="font-bold text-base text-[#38423B]">{sessionData.scenario.difficulty}</span>
                    </div>
                    <div className="flex flex-col items-center bg-[#F7F7F2] rounded-2xl py-4 cursor-pointer transition hover:shadow-md" onClick={() => openModal('Câu trả lời', `${sessionData.conversation.length}`)}>
                        <MessageSquare className="w-5 h-5 text-[#6B7A6C] mb-1" />
                        <span className="text-[#6B7A6C] text-xs">Câu trả lời</span>
                        <span className="font-bold text-base text-[#38423B]">{sessionData.conversation.length}</span>
                    </div>
                </div>
            </div>

            {/* Details & Tabs Card */}
            <div
                className="bg-white rounded-3xl shadow-2xl flex flex-col items-center px-4 md:px-8 pt-4 pb-6 mt-6 relative z-10"
                style={{
                    width: 'min(747px, 98vw)',
                    minWidth: 0,
                }}
            >
                {/* Tab Header */}
                <div className="flex gap-2 w-full font-semibold border-b border-[#E9E5DF] mb-4 overflow-x-auto">
                        {["overview", "conversation", "feedback", "recommendations"].map((tab) => (
                            <Button
                                key={tab}
                                variant={activeTab === tab ? "default" : "outline"}
                                onClick={() => setActiveTab(tab)}
                            className={`capitalize transition-all duration-300 font-semibold rounded-none px-4 py-2 text-base shadow-none border-b-2 whitespace-nowrap
                                    ${activeTab === tab
                                    ? 'bg-transparent text-[#38423B] border-[#38423B] border-b-4'
                                    : 'bg-transparent text-[#6B7A6C] border-transparent hover:text-[#38423B]'}
                                `}
                            >
                            {tab === "overview" ? "Tổng quan" :
                                tab === "conversation" ? "Hội thoại" :
                                tab === "feedback" ? "Đánh giá" :
                                tab === "recommendations" ? "Lời khuyên" : tab}
                            </Button>
                        ))}
                    </div>
                {/* Tab Content: Only Performance Overview for now */}
                        {activeTab === "overview" && (
                    <div className="w-full flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Strengths Box */}
                            {(() => {
                                const strengths = sessionData.conversation
                                    .filter(msg => msg.type === 'user' && msg.analysis?.strengths)
                                    .flatMap(msg => msg.analysis.strengths)
                                    .filter((strength, index, self) => self.indexOf(strength) === index);
                                const strengthsPreview = strengths.slice(0, 5);
                                const undisplayed = strengths.length > 5 ? strengths.length - 5 : 0;
                                const hasMore = strengths.length > 5;
                                return (
                                    <div className="flex-1 bg-[#E7F3DF] rounded-2xl p-4 cursor-pointer transition hover:shadow-md relative" onClick={() => openModal('Điểm mạnh', strengths.join('\n') || 'Chưa có dữ liệu')}>
                                        <div className="flex items-center mb-2 gap-2">
                                            <h4 className="font-bold text-[#38423B] text-sm">Điểm mạnh</h4>
                                            {hasMore && (
                                                <span className="text-[#3BA55D] text-xs font-medium cursor-pointer underline ml-2" onClick={e => { e.stopPropagation(); openModal('Điểm mạnh', strengths.join('\n')); }}>Bấm để xem đầy đủ ({undisplayed})</span>
                                            )}
                                        </div>
                                        <ul className="space-y-1 min-h-[64px] max-h-[12em] overflow-hidden relative text-sm" style={{ WebkitLineClamp: 8, display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                                            {strengthsPreview.map((strength, index) => (
                                                <li key={index} className="flex items-center gap-2 text-[#38423B]">
                                                    <CheckCircle2 className="w-4 h-4 text-[#3BA55D]" />
                                                                {strength}
                                                            </li>
                                            ))}
                                            {strengths.length === 0 && (
                                                <li className="text-[#6B7A6C]">Chưa có dữ liệu</li>
                                            )}
                                        </ul>
                                    </div>
                                );
                            })()}
                            {/* Weaknesses Box */}
                            {(() => {
                                const weaknesses = sessionData.conversation
                                    .filter(msg => msg.type === 'user' && msg.analysis?.weaknesses)
                                    .flatMap(msg => msg.analysis.weaknesses)
                                    .filter((weakness, index, self) => self.indexOf(weakness) === index);
                                const weaknessesPreview = weaknesses.slice(0, 5);
                                const undisplayed = weaknesses.length > 5 ? weaknesses.length - 5 : 0;
                                const hasMore = weaknesses.length > 5;
                                return (
                                    <div className="flex-1 bg-[#FBE9E6] rounded-2xl p-4 cursor-pointer transition hover:shadow-md relative" onClick={() => openModal('Có thể cải thiện', weaknesses.join('\n') || 'Chưa có dữ liệu')}>
                                        <div className="flex items-center mb-2 gap-2">
                                            <h4 className="font-bold text-[#38423B] text-sm">Có thể cải thiện</h4>
                                            {hasMore && (
                                                <span className="text-[#E24C4B] text-xs font-medium cursor-pointer underline ml-2" onClick={e => { e.stopPropagation(); openModal('Có thể cải thiện', weaknesses.join('\n')); }}>Bấm để xem đầy đủ ({undisplayed})</span>
                                            )}
                                        </div>
                                        <ul className="space-y-1 min-h-[64px] max-h-[12em] overflow-hidden relative text-sm" style={{ WebkitLineClamp: 8, display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                                            {weaknessesPreview.map((weakness, index) => (
                                                <li key={index} className="flex items-center gap-2 text-[#38423B]">
                                                    <XCircle className="w-4 h-4 text-[#E24C4B]" />
                                                                        {weakness}
                                                                    </li>
                                                                ))}
                                            {weaknesses.length === 0 && (
                                                <li className="text-[#6B7A6C]">Chưa có dữ liệu</li>
                                            )}
                                                            </ul>
                                                        </div>
                                );
                            })()}
                                                    </div>
                        {/* Detailed Analysis Box */}
                        {(() => {
                            const analysis = sessionData.conversation
                                .filter(msg => msg.type === 'user' && msg.analysis?.feedback)
                                .map(msg => msg.analysis.feedback);
                            const analysisPreview = analysis.slice(0, 4);
                            const undisplayed = analysis.length > 4 ? analysis.length - 4 : 0;
                            const hasMore = analysis.length > 4;
                            return (
                                <div className="bg-[#F7F7F2] rounded-2xl p-4 cursor-pointer transition hover:shadow-md relative" onClick={() => openModal('Phân tích chi tiết', analysis.join('\n') || 'Chưa có dữ liệu')}>
                                    <div className="flex items-center mb-2 gap-2">
                                        <h4 className="font-bold text-[#38423B] text-sm flex items-center gap-2"><span>Phân tích chi tiết</span></h4>
                                        {hasMore && (
                                            <span className="text-[#38423B] text-xs font-medium cursor-pointer underline ml-2" onClick={e => { e.stopPropagation(); openModal('Phân tích chi tiết', analysis.join('\n')); }}>Bấm để xem đầy đủ ({undisplayed})</span>
                                        )}
                                    </div>
                                    <ul className="list-disc pl-5 text-[#38423B] text-sm space-y-1 min-h-[64px] max-h-[12em] overflow-hidden relative" style={{ WebkitLineClamp: 8, display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
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
                                    <div key={message.id || index} className="flex flex-col items-end w-full">
                                        <div className="max-w-[80%] rounded-2xl bg-[#5B3A1B] text-white border border-white shadow-sm overflow-hidden">
                                            {/* Top: Message with scroll if too long */}
                                            <div className="px-6 pt-4 pb-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-[#B89B2B]/30 scrollbar-track-[#5B3A1B]/10">
                                                <span className="text-base leading-relaxed break-words block">{message.content}</span>
                                            </div>
                                            {/* Divider */}
                                            <div className="w-full h-px bg-white/30" />
                                            {/* Bottom: Mark */}
                                            <div className="flex justify-center items-center px-6 py-2">
                                                <span className="text-sm font-medium mr-1 text-white">Đánh giá:</span>
                                                <span className="text-[#FFD166] font-bold">{score}</span>
                                                <span className="text-[#FFD166] ml-0.5">/100</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={message.id || index} className="flex flex-col items-start w-full">
                                        <div className="relative max-w-[80%] rounded-2xl px-6 py-4 mb-1 bg-[#F7F3ED] text-[#5B3A1B] border border-[#E9E5DF] shadow-sm">
                                            <span className="text-base leading-relaxed break-words block">{message.content}</span>
                                            {typeof score === 'number' && (
                                                <div className="absolute left-4 bottom-3 flex items-center bg-white/10 rounded-xl px-3 py-1 mt-3" style={{backdropFilter: 'blur(2px)'}}>
                                                    <span className="text-sm font-medium mr-1" style={{color: '#5B3A1B'}}>Đánh giá:</span>
                                                    <span className="text-[#B89B2B] font-bold">{score}</span>
                                                    <span className="text-[#B89B2B] ml-0.5">/100</span>
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
                            .filter(msg => msg.type === 'user' && msg.analysis)
                            .map((msg, index) => {
                                const collapsed = collapsedCards[index] || false;
                                const toggleCollapsed = () => setCollapsedCards(prev => ({ ...prev, [index]: !prev[index] }));
                                return (
                                    <div key={index} className="bg-[#FCFAF6] rounded-3xl shadow flex flex-col gap-4 p-6 relative" style={{borderRadius: '32px'}}>
                                        {/* Top: Message and Score */}
                                        <div className="flex items-start justify-between gap-4">
                                            {/* Collapsed: Only show title and button, right-aligned */}
                                            {collapsed ? (
                                                <div className="flex flex-1 items-center justify-end w-full">
                                                    <div className="font-bold text-base text-[#38423B]">Tin nhắn thứ {index + 1}</div>
                                                    <button
                                                        className="ml-2 px-3 py-1 text-xs rounded bg-[#F7F7F2] text-[#38423B] border border-[#E9E5DF] hover:bg-[#E9E5DF] transition"
                                                        onClick={toggleCollapsed}
                                                    >
                                                        Mở rộng
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex-1 flex items-center">
                                                        <div className="font-bold text-base text-[#38423B]">Câu trả lời {index + 1}</div>
                                                        <button
                                                            className="ml-2 px-3 py-1 text-xs rounded bg-[#F7F7F2] text-[#38423B] border border-[#E9E5DF] hover:bg-[#E9E5DF] transition"
                                                            onClick={toggleCollapsed}
                                                        >
                                                            Thu Nhỏ
                                                        </button>
                                                    </div>
                                                    <div className="flex-shrink-0 flex items-center justify-center relative" style={{width: 72, height: 72}}>
                                                        <svg width="72" height="72" viewBox="0 0 36 36">
                                                            <circle cx="18" cy="18" r="16" fill="#F6F7F2" />
                                                            <path d="M18 4 a 14 14 0 1 1 0 28 a 14 14 0 1 1 0 -28" fill="none" stroke="#7ED957" strokeWidth="3.5" strokeDasharray={`${msg.analysis.overallScore * 0.88}, 88`} strokeLinecap="round" />
                                                        </svg>
                                                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-[#5B7D2A]">{msg.analysis.overallScore}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {/* Bottom: Strengths and Weaknesses (collapsible) */}
                                        {!collapsed && (
                                            <>
                                                {/* Message content with scroll if too long */}
                                                <div className="bg-transparent px-0 pt-0 pb-0">
                                                    <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-[#B89B2B]/30 scrollbar-track-[#F6F7F2]/10 px-1">
                                                        <div className="text-base text-[#38423B] leading-relaxed break-words">{msg.content}</div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-4 mt-2">
                                                    <div className="bg-[#EAF7E6] rounded-2xl p-4">
                                                        <div className="font-bold text-[#38423B] mb-2 text-base">Điểm mạnh</div>
                                                        <ul className="space-y-2">
                                                            {msg.analysis.strengths && msg.analysis.strengths.length > 0 ? (
                                                                msg.analysis.strengths.map((strength, idx) => (
                                                                    <li key={idx} className="flex items-center gap-2 text-[#38423B] text-base">
                                                                        <span className="inline-block w-2 h-2 rounded-full bg-[#7ED957]" />
                                                                        {strength}
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li className="text-[#6B7A6C] text-base">Chưa có dữ liệu</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <div className="bg-[#FDEDE7] rounded-2xl p-4">
                                                        <div className="font-bold text-[#38423B] mb-2 text-base">Có thể cải thiện</div>
                                                        <ul className="space-y-2">
                                                            {msg.analysis.weaknesses && msg.analysis.weaknesses.length > 0 ? (
                                                                msg.analysis.weaknesses.map((weakness, idx) => (
                                                                    <li key={idx} className="flex items-center gap-2 text-[#38423B] text-base">
                                                                        <span className="inline-block w-2 h-2 rounded-full bg-[#FF7F50]" />
                                                                        {weakness}
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li className="text-[#6B7A6C] text-base">Chưa có dữ liệu</li>
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
                    <div className="w-full flex flex-col gap-6 py-2 px-1">
                        <div className="max-h-[400px] overflow-y-auto pr-1">
                        {(sessionData.recommendations && sessionData.recommendations.length > 0
                            ? sessionData.recommendations
                            : [
                                {
                                    focus: "Câu trả lời thiếu mạch lạc",
                                    detail: "Hãy luyện tập điểm này trong buổi phỏng vấn tiếp theo để cải thiện hiệu suất của bạn."
                                },
                                {
                                    focus: "Thông tin không liên quan",
                                    detail: "Hãy luyện tập điểm này trong buổi phỏng vấn tiếp theo để cải thiện hiệu suất của bạn."
                                },
                                {
                                    focus: "Thiếu rõ ràng",
                                    detail: "Hãy luyện tập điểm này trong buổi phỏng vấn tiếp theo để cải thiện hiệu suất của bạn."
                                }
                            ]
                        ).map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-4 bg-[#E7F3DF] rounded-[2rem] px-6 py-4 w-full">
                                <CheckCircle2 className="w-7 h-7 text-[#6BAA4D] flex-shrink-0 mt-1" />
                                <div className="flex flex-col">
                                    <span className="font-bold text-[#2D332B] text-lg leading-snug">
                                        Tập trung vào: {rec.focus}
                                    </span>
                                    <span className="text-[#4B5C4A] text-base mt-1">
                                        {rec.detail}
                                    </span>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for full content */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border-none" style={{ boxShadow: '0 8px 32px 0 rgba(60,60,60,0.10)' }}>
                    <div className="bg-[#FFF9E3] rounded-2xl p-6 shadow-lg border border-[#F7E6A2]">
                        <h3 className="font-bold text-lg text-[#B89B2B] mb-4">{modalTitle}</h3>
                        <ul className="list-disc pl-5 text-base text-[#7A6A2F] space-y-2">
                            {modalContent.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                                <li key={idx}>{line}</li>
                            ))}
                        </ul>
                    </div>
                </DialogContent>
            </Dialog>

            {/* White Footer with Action Buttons */}
            <footer className="w-full fixed bottom-0 left-0 z-50 flex justify-center items-center" style={{ pointerEvents: 'auto' }}>
                <div className="w-full max-w-full bg-white flex justify-center items-center gap-6 py-4 px-2 md:px-0" style={{ borderTopLeftRadius: '2.5rem', borderTopRightRadius: '2.5rem', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, boxShadow: '0 0 0 0 transparent' }}>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 border border-[#D1D5D8] bg-white hover:bg-[#F6F7F9] text-[#38423B] font-medium rounded-full px-8 py-3 text-base shadow-none transition-colors"
                    >
                        <Home className="w-5 h-5 mr-1" />
                        Về dashboard
                    </Button>
                        <Button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 border border-[#C6F6D5] bg-[#F6FFF6] hover:bg-[#E9FCE9] text-[#38423B] font-medium rounded-full px-8 py-3 text-base shadow-none transition-colors"
                        >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A9 9 0 11 5.582 9M4 9h5m7 4v5h.582m-7.164 2A9 9 0 1118.418 15M20 15h-5" /></svg>
                        Làm lại
                        </Button>
                        <Button
                            onClick={handleSavePDF}
                        className="flex items-center gap-2 bg-[#B6E388] hover:bg-[#A0D468] text-[#38423B] font-semibold rounded-full px-8 py-3 text-base border-none shadow-none transition-colors"
                        >
                        <Download className="w-5 h-5 mr-1" />
                        Tải PDF
                        </Button>
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
                <div
                    className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
                    <div className="text-center">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Đang xử lý phân tích...</p>
                    </div>
                </div>
            }
        >
            <ResultFeedbackContent />
        </Suspense>
    );
} 