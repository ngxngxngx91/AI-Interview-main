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
import { useState, useEffect, useRef } from "react";
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
        <div className="min-h-screen" style={{ background: '#FCF9F2' }}>
            {/* Hero Section - Vietnamese Redesign */}
            <div
                className="relative overflow-hidden min-h-[654px] h-[654px] flex items-center"
                style={{
                    backgroundImage: 'url(/landing_page_1.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full justify-center">
                    {/* Header Row */}
                    <div className="flex justify-between items-center w-full" style={{ minHeight: '80px' }}>
                        <div className="flex items-center gap-3">
                            <Image src="/Logo.png" alt="AI.Interview Logo" width={88} height={88} quality={100} priority/>
                            <span className="font-bold text-2xl text-[#22372B]" style={{ fontFamily: 'Inter, sans-serif' }}>AI.Interview</span>
                        </div>
                        <nav className="hidden md:flex gap-16 text-lg">
                            <Link href="#how-it-works" className="text-[#4B6358] hover:text-[#22372B] transition-colors font-normal">Cách hoạt động</Link>
                            <Link href="#pricing" className="text-[#4B6358] hover:text-[#22372B] transition-colors font-normal">Bảng giá</Link>
                            <Link href="#affiliate" className="text-[#4B6358] hover:text-[#22372B] transition-colors font-normal">Affiliate</Link>
                        </nav>
                        <Link href="/dashboard">
                            <button
                                className="bg-gradient-to-r from-[#F97C7C] to-[#D72660] text-white font-bold rounded-full px-8 py-2 shadow-md text-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                                style={{ borderRadius: '999px', minWidth: '150px' }}
                            >
                                Bắt đầu ngay
                            </button>
                        </Link>
                    </div>
                    {/* Main Content: 2-column layout */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 flex-1">
                        {/* Left Section: Text and Buttons */}
                        <div className="flex-1 flex flex-col items-start justify-center gap-8 min-w-[462px] min-h-[390px]">
                            <h1 className="text-[56px] leading-[1.1] font-bold text-[#22372B] mb-4" style={{ letterSpacing: '-2px' }}>
                                Chinh phục<br />
                                nhà tuyển dụng<br />
                                cùng <span className="bg-gradient-to-r from-[#3DC47E] to-[#1E9C5A] bg-clip-text text-transparent">AI-Interview</span>
                            </h1>
                            <p className="text-xl text-[#6B7A6A] font-normal mb-8 max-w-xl">
                                Nhận phản hồi tức thì, cải thiện kỹ năng của bạn và <br />
                                tăng cường sự tự tin cho cuộc phỏng vấn tiếp theo
                            </p>
                            <div className="flex gap-4">
                                <Link href="/dashboard">
                                    <button
                                        className="relative flex items-center h-[56px] pr-5 pl-7 rounded-full font-semibold text-white text-base shadow-md transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
                                        style={{
                                            background: 'linear-gradient(90deg, #F97C7C 0%, #D72660 100%)',
                                            border: 'none',
                                            outline: 'none',
                                            boxShadow: '0 2px 8px 0 rgba(215,38,96,0.10)',
                                            borderRadius: '999px',
                                        }}
                                    >
                                        Khám phá ngay
                                        <span
                                            className="ml-4 flex items-center justify-center rounded-full shadow-md"
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                background: 'linear-gradient(135deg, #F97C7C 0%, #D72660 100%)',
                                                border: '4px solid #F7F5E8',
                                                position: 'relative',
                                                right: '-8px',
                                                boxShadow: '0 2px 8px 0 rgba(215,38,96,0.10)',
                                            }}
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </span>
                                    </button>
                                </Link>
                                <button
                                    className="flex items-center h-[56px] px-7 rounded-full font-semibold text-[#22372B] text-base bg-white border border-[#a4b1ca] shadow-sm gap-2 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
                                    style={{ minWidth: '180px', borderRadius: '999px' }}
                                >
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#F6F6ED] mr-2">
                                        <PlayCircle className="w-5 h-5 text-[#22372B]" />
                                    </span>
                                    Cách hoạt động
                                </button>
                            </div>
                        </div>
                        {/* Right Section: Welcome Image */}
                        <div className="flex-1 flex flex-col items-center justify-center min-w-[340px] ml-9">
                            <Image
                                src="/landing_page_section_welcome_1.png"
                                alt="Welcome Section"
                                width={559}
                                height={452}
                                quality={100}
                                unoptimized={true}
                                priority
                                className="w-auto h-auto max-w-full max-h-[600px]"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Benefits Section - Vietnamese Redesign */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" style={{ height: '928px', minHeight: '928px' }}>
                <div className="text-center mb-12">
                    <h2 className="text-5xl font-bold text-[#22372B] mb-6">Tính năng nổi bật</h2>
                    <p className="text-[#7A8576] text-lg">Mọi thứ bạn cần để thể hiện tốt nhất trong các cuộc phỏng vấn</p>
                </div>
                {/* Auto-scrolling vertical gallery */}
                <AutoScrollGallery />
            </div>

            {/* Free Interview Experience Section - Vietnamese Redesign */}
            <div className="w-full" style={{ background: 'url(/landing_page_4.png) center/cover no-repeat', height: '752px', minHeight: '752px', position: 'relative' }}>
                <div className="flex justify-center items-center relative h-full">
                    {/* Decorative block image at top left */}
                    <Image
                        src="/landing_page_section_try_3.png"
                        alt="Decorative block"
                        width={195}
                        height={165}
                        quality={100}
                        unoptimized={true}
                        priority
                        className="hidden md:block absolute left-64 top-48 z-10 w-[110px] h-auto"
                    />
                    <div className="w-full max-w-3xl flex flex-col items-center justify-center mx-auto">
                        <h2 className="text-5xl font-bold text-[#22372B] mb-2 mt-0 text-center">Trải nghiệm phỏng vấn miễn phí</h2>
                        <p className="text-[#7A8576] text-lg mt-3 mb-12 text-center">Thử sức với những câu hỏi thực tế và nhận phản hồi tức thì từ AI</p>
                        <div className="bg-white rounded-2xl px-8 py-8 w-full relative z-10 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-[#22372B]">Câu hỏi phỏng vấn</h3>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={getRandomQuestion}
                                    className="border border-[#7ED957] text-[#22372B] font-semibold rounded-full px-4 py-2 hover:bg-[#EAF5E3] transition"
                                >
                                    <RefreshCcw className="w-4 h-4 mr-2 inline-block" />
                                    Đổi câu hỏi
                                </Button>
                            </div>
                            <div className="mb-4">
                                <div
                                    className="w-full h-[96px] rounded-xl flex items-center justify-center text-[#22372B] text-xl font-bold border border-[#8a531f] mb-2"
                                    style={{
                                        background: 'url(/landing_page_section_try_1.png) center/cover no-repeat',
                                    }}
                                >
                                    {currentQuestion || "Câu hỏi sẽ xuất hiện ở đây"}
                                </div>
                            </div>
                            <Textarea
                                placeholder="Nhập câu trả lời của bạn..."
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="min-h-[100px] bg-[#f3faf5] border border-[#E5E7EB] text-[#22372B] placeholder:text-[#B0B7A1] rounded-xl"
                            />
                        </div>
                        <Button
                            onClick={getFeedback}
                            disabled={!answer.trim() || isLoading}
                            className="w-full max-w-3xl mt-4 bg-[#BDF77B] text-[#22372B] rounded-full flex items-center justify-center transition"
                            style={{
                                borderRadius: '999px',
                                height: '56px',
                                fontSize: '20px',
                                fontWeight: 400,
                                boxShadow: 'none',
                                paddingLeft: '0',
                                paddingRight: '0',
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <LoaderCircle className="w-5 h-5 animate-spin" />
                                    Đang nhận phản hồi...
                                </>
                            ) : (
                                <>Nhận phản hồi</>
                            )}
                        </Button>
                        {feedback && (
                            <div className="mt-6 p-4 bg-[#EAF5E3] rounded-xl border border-[#B6F57D] text-[#22372B] w-full max-w-2xl">
                                <div className="font-bold mb-2">Phản hồi:</div>
                                <div className="whitespace-pre-line">{feedback}</div>
                            </div>
                        )}
                    </div>
                    {/* Character image at bottom right */}
                    <Image
                        src="/landing_page_section_try_2.png"
                        alt="Woman character"
                        width={616}
                        height={778}
                        quality={100}
                        unoptimized={true}
                        priority
                        className="hidden md:block absolute right-28 bottom-0 z-15 w-[308px] h-auto"
                    />
                </div>
            </div>

            {/* Why Choose AI.Interview Section - Vietnamese Redesign */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[660px] h-[660px] flex items-center justify-center overflow-visible">
                {/* Decorative shapes inside section */}
                <div className="pointer-events-none absolute z-0 w-full h-full left-0 top-0">
                    {/* Top left orange pill */}
                    <div className="absolute left-12 top-8 w-24 h-6 bg-[#FF7A59] rounded-full rotate-12 opacity-80" style={{ transform: 'rotate(-20deg)' }} />
                    {/* Top right green circle */}
                    <div className="absolute right-24 top-16 w-8 h-8 bg-[#B6E2C6] rounded-full opacity-70" />
                    {/* Bottom left brown dot */}
                    <div className="absolute left-24 bottom-16 w-5 h-5 bg-[#4B3B2B] rounded-full opacity-60" />
                    {/* Bottom right yellow block */}
                    <div className="absolute right-16 bottom-12 w-16 h-4 bg-[#FFD966] rounded-lg opacity-70" />
                    {/* Center faint green ring */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-[#B6E2C6]/30 rounded-full" />
                </div>
                <div className="relative z-10 w-full">
                    <h2 className="text-5xl font-bold text-[#22372B] text-center mb-2">Tại sao nên chọn</h2>
                    <h2 className="text-5xl font-bold text-[#22372B] text-center mt-2">AI-Interview?</h2>
                    <p className="text-[#7A8576] text-lg text-center mb-12 mt-4">Mọi thứ bạn cần để thể hiện tốt nhất trong các cuộc phỏng vấn</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                        {/* Card 1 */}
                        <motion.div
                            initial={{ y: 0 }}
                            animate={{ y: [0, -24, 0, 24, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                            className="rounded-2xl bg-[#FFF3EF] p-8 flex flex-col items-start shadow-xl w-full max-w-s"
                        >
                            <div className="w-12 h-12 flex items-center justify-center mb-4">
                                <Image src="/landing_page_section_feature_point.png" alt="Điểm nổi bật" width={48} height={48} quality={100} unoptimized={true} />
                            </div>
                            <div className="font-bold text-xl text-[#22372B] mb-2">Cải thiện sự tự tin</div>
                            <div className="text-[#7A8576] text-base">Xây dựng sự tự tin trong phỏng vấn thông qua việc thực hành thường xuyên</div>
                        </motion.div>
                        {/* Card 2 */}
                        <motion.div
                            initial={{ y: 0 }}
                            animate={{ y: [0, 24, 0, -24, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                            className="rounded-2xl bg-[#EAF5E3] p-8 flex flex-col items-start shadow-xl w-full max-w-s"
                        >
                            <div className="w-12 h-12 flex items-center justify-center mb-4">
                                <Image src="/landing_page_section_feature_time.png" alt="Quản lý thời gian" width={48} height={48} quality={100} unoptimized={true} />
                            </div>
                            <div className="font-bold text-xl text-[#22372B] mb-2">Quản lý thời gian</div>
                            <div className="text-[#7A8576] text-base">Học cách sắp xếp câu trả lời của bạn trong giới hạn thời gian</div>
                        </motion.div>
                        {/* Card 3 */}
                        <motion.div
                            initial={{ y: 0 }}
                            animate={{ y: [0, -18, 0, 18, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                            className="rounded-2xl bg-[#FCFAE6] p-8 flex flex-col items-start shadow-xl w-full max-w-s"
                        >
                            <div className="w-12 h-12 flex items-center justify-center mb-4">
                                <Image src="/landing_page_section_feature_tiendo.png" alt="Theo dõi tiến độ" width={48} height={48} quality={100} unoptimized={true} />
                            </div>
                            <div className="font-bold text-xl text-[#22372B] mb-2">Theo dõi tiến độ</div>
                            <div className="text-[#7A8576] text-base">Theo dõi sự tiến bộ của bạn theo thời gian</div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Success CTA Section - Vietnamese Redesign */}
            <div
                className="w-full"
                style={{
                    background: '#B6F57D',
                    minHeight: '696px',
                    height: '696px',
                    position: 'relative',
                }}
            >
                <div className="w-full h-full flex flex-col lg:flex-row items-center justify-between gap-0" style={{ height: '696px' }}>
                    {/* Left Section: Text and Button */}
                    <div className="flex flex-col justify-center gap-6 min-w-[220px] max-w-full lg:max-w-[700px] w-full lg:w-[48vw] items-center z-10 h-full mx-auto px-4 py-8 lg:py-0">
                        <h2 className="text-4xl lg:text-5xl font-bold text-[#22372B] leading-tight text-center">
                            Bạn đã sẵn sàng<br />
                            để thành công trong lần<br />
                            phỏng vấn tiếp theo?
                        </h2>
                        <p className="text-base lg:text-lg text-[#4B6358] mb-4 text-center">
                            Cùng AI-Interviews xây dựng sự tự tin ngay hôm nay
                        </p>
                        <Link href="/dashboard">
                            <button
                                className="relative flex items-center h-[48px] lg:h-[56px] pr-5 pl-7 rounded-full font-semibold text-white text-base shadow-md transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 mt-2"
                                style={{
                                    background: 'linear-gradient(90deg, #F97C7C 0%, #D72660 100%)',
                                    border: 'none',
                                    outline: 'none',
                                    boxShadow: '0 2px 8px 0 rgba(215,38,96,0.10)',
                                    borderRadius: '999px',
                                }}
                            >
                                Khám phá ngay
                                <span
                                    className="ml-4 flex items-center justify-center rounded-full shadow-md"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        background: 'linear-gradient(135deg, #F97C7C 0%, #D72660 100%)',
                                        border: '4px solid #F7F5E8',
                                        position: 'relative',
                                        right: '-8px',
                                        boxShadow: '0 2px 8px 0 rgba(215,38,96,0.10)',
                                    }}
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </span>
                            </button>
                        </Link>
                    </div>
                    {/* Right Section: Chat UI + Character Image */}
                    <div className="relative h-[320px] sm:h-[420px] md:h-[520px] lg:h-[744px] w-full lg:w-[52vw] min-w-[180px] flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
                        <Image
                            src="/landing_page_section_start_1.png"
                            alt="Chat UI and Character"
                            width={600}
                            height={400}
                            quality={100}
                            unoptimized={true}
                            priority
                            className="w-[90%] sm:w-[80%] md:w-[70%] lg:w-[81%] h-auto object-contain -translate-y-2 sm:-translate-y-4 md:-translate-y-6 lg:-translate-y-[4%] lg:-translate-x-[1%]"
                        />
                    </div>
                </div>
            </div>

            {/* Footer Section - Vietnamese Redesign */}
            <footer className="w-full bg-[#FCF9F2] pt-12 pb-4 mt-12 border-t-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start gap-8">
                    {/* Left: Logo and Description */}
                    <div className="flex-1 min-w-[220px] flex flex-col gap-3 items-start justify-start">
                        <div className="flex items-center gap-2 mb-2">
                            <Image src="/Logo.png" alt="AI.Interview Logo" width={88} height={88} quality={100} priority/>
                            <span className="font-bold text-2xl text-[#22372B]">AI.Interview</span>
                        </div>
                        <p className="text-[#4B6358] text-base">
                            AI Interview là nền tảng phỏng vấn thử ứng dụng trí tuệ nhân tạo, giúp bạn luyện tập kỹ năng trả lời phỏng vấn mọi lúc, mọi nơi
                        </p>
                    </div>
                    {/* Right: All Links */}
                    <div className="flex-1 min-w-[320px] flex flex-col md:flex-row gap-8 items-start justify-end">
                        {/* Product Links */}
                        <div className="min-w-[150px]">
                            <div className="font-bold text-[#22372B] mb-3">Sản phẩm</div>
                            <ul className="space-y-2">
                                <li><a href="#how-it-works" className="text-[#4B6358] hover:underline">Cách hoạt động</a></li>
                                <li><a href="#pricing" className="text-[#4B6358] hover:underline">Bảng giá</a></li>
                                <li><a href="#affiliate" className="text-[#4B6358] hover:underline">Affiliate</a></li>
                            </ul>
                        </div>
                        {/* About Links */}
                        <div className="min-w-[150px]">
                            <div className="font-bold text-[#22372B] mb-3">Về AI.Interview</div>
                            <ul className="space-y-2">
                                <li><a href="#policy" className="text-[#4B6358] hover:underline">Chính sách</a></li>
                                <li><a href="#terms" className="text-[#4B6358] hover:underline">Điều khoản và dịch vụ</a></li>
                                <li><a href="#payment-policy" className="text-[#4B6358] hover:underline">Chính sách thanh toán</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <hr className="my-8 border-[#F0F0E0]" />
                <div className="text-center text-[#7A8576] text-sm">
                    Copyright © AI.Interview 2025. All Rights Reserved
                </div>
            </footer>
        </div>
    );
}

function AutoScrollGallery() {
    const images = [
        '/landing_page_section_feature_1.png',
        '/landing_page_section_feature_2.png',
        '/landing_page_section_feature_3.png',
        '/landing_page_section_feature_4.png',
    ];
    const [current, setCurrent] = useState(0);
    const timeoutRef = useRef(null);

    useEffect(() => {
        timeoutRef.current = setTimeout(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 3000);
        return () => clearTimeout(timeoutRef.current);
    }, [current]);

    // Use the natural size of your images
    const imgWidth = 1200;
    const imgHeight = 600;
    const peekOffset = 48;
    const next = (current + 1) % images.length;

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-0">
            <div className="relative" style={{ width: imgWidth, height: imgHeight + peekOffset }}>
                <AnimatePresence initial={false}>
                    {/* Current image (top card) */}
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.7, ease: 'easeInOut' }}
                        className="absolute left-0 top-0 w-full h-auto"
                        style={{ zIndex: 2 }}
                    >
                        <Image
                            src={images[current]}
                            alt={`Feature ${current + 1}`}
                            width={imgWidth}
                            height={imgHeight}
                            quality={100}
                            unoptimized={true}
                            className="rounded-3xl w-full h-auto object-cover"
                            style={{ boxShadow: 'none', border: 'none', background: 'none', display: 'block' }}
                        />
                    </motion.div>
                    {/* Next image (peeking below) */}
                    <motion.div
                        key={next + '-peek'}
                        initial={{ opacity: 0, y: peekOffset }}
                        animate={{ opacity: 0.7, y: peekOffset }}
                        exit={{ opacity: 0, y: peekOffset }}
                        transition={{ duration: 0.7, ease: 'easeInOut' }}
                        className="absolute left-0 top-0 w-full h-auto"
                        style={{ zIndex: 1 }}
                    >
                        <Image
                            src={images[next]}
                            alt={`Feature ${next + 1}`}
                            width={imgWidth}
                            height={imgHeight}
                            quality={100}
                            unoptimized={true}
                            className="rounded-3xl w-full h-auto object-cover"
                            style={{ boxShadow: 'none', border: 'none', background: 'none', display: 'block' }}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
