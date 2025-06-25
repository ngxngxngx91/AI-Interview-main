"use client";

import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {AlertCircle, Bell, ChevronDown, Clock, Mic, PauseCircle, PlayCircle, Sparkles, XCircle} from 'lucide-react';
import Message from './Message';
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import Image from "next/image";

// Component chính hiển thị hộp thoại phỏng vấn
const ConversationBox = ({
                             messages,
                             isListening,
                             onToggleListening,
                             isPaused,
                             isTimeUp,
                             onTogglePause,
                             timeRemaining,
                             selectedLanguage,
                             onLanguageChange,
                             availableLanguages,
                             scenarioData,
                             onStopInterview,
                             scenarioTitle,
                             scenarioIndustry,
                             scenarioDifficulty,
                             onToggleScenarioPanel,
                             showScenarioPanel,
                             hideControlBar
                         }) => {
    // Refs và state quản lý UI
    const messagesEndRef = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef(null);
    const [showWarning, setShowWarning] = useState(false);
    const [showBeep, setShowBeep] = useState(false);
    const audioContext = useRef(null);
    const [showConfirm, setShowConfirm] = useState(false);

    // Khởi tạo AudioContext cho âm thanh cảnh báo
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return () => audioContext.current?.close();
    }, []);

    // Hàm phát âm thanh cảnh báo
    const playBeep = () => {
        if (!audioContext.current) return;
        const oscillator = audioContext.current.createOscillator();
        const gainNode = audioContext.current.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.current.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.current.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.current.currentTime + 0.1);
    };

    // Hiển thị cảnh báo và phát âm thanh khi còn 30 giây
    useEffect(() => {
        if (timeRemaining === 30 && !isPaused && !isTimeUp) {
            setShowWarning(true);
            setShowBeep(true);
            playBeep();
            setTimeout(() => setShowBeep(false), 1000);
        }
    }, [timeRemaining, isPaused, isTimeUp]);

    // Xử lý cuộn trang
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
        setShowScrollButton(false);
    };
    const handleScroll = () => {
        if (!containerRef.current) return;
        const {scrollTop, scrollHeight, clientHeight} = containerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
    };
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);
    useEffect(() => {
        if (messages.length === 0) return;
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
            scrollToBottom();
        }, 200);
        return () => clearTimeout(timer);
    }, [messages]);

    // Định dạng và style cho bộ đếm thời gian
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    const getTimerStyles = () => {
        if (isTimeUp) return 'text-red-500';
        if (timeRemaining <= 30) return 'text-red-500 animate-pulse';
        return 'text-[#B77B2B]';
    };

    // Hiển thị trạng thái trống
    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-4">
                <Sparkles className="w-6 h-6 text-blue-400"/>
            </div>
        </div>
    );

    // Hiển thị danh sách tin nhắn
    const renderMessages = () => {
        // Find the index of the first user message
        const firstUserMsgIndex = messages.findIndex(msg => msg.type === 'user');
        return (
            <div className="space-y-4 p-4">
                <AnimatePresence mode="popLayout">
                    {messages.map((message, index) => (
                        <motion.div
                            key={message.id}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -20}}
                            transition={{delay: index * 0.05, type: "spring", stiffness: 100, damping: 15}}
                        >
                            <Message message={message}
                                     isFirstUserMessage={message.type === 'user' && index === firstUserMsgIndex}/>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef}/>
            </div>
        );
    };

    // Set default language to Vietnamese on mount
    useEffect(() => {
        if (availableLanguages && availableLanguages.some(lang => lang.code === 'vi')) {
            if (selectedLanguage !== 'vi') {
                onLanguageChange('vi');
            }
        }
    }, [availableLanguages]);

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="relative bg-[#F8F6F2] backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-[#E0D6C3] flex flex-col h-full min-w-0 font-sans"
            style={{maxHeight: '900px'}}
        >
            {/* Header - Thanh điều khiển */}
            <div
                className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[#E0D6C3] bg-[#FDFBF7] rounded-t-3xl">
                {/* Bên trái: Tiêu đề và trạng thái */}
                <div className="flex items-center gap-3 flex-1 w-full">
                    <div className="flex flex-col max-[450px]:flex-row max-[450px]:justify-between max-[450px]:w-full min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <h3 className="text-lg font-bold text-[#5B4636] truncate overflow-hidden text-ellipsis w-full">
                                {scenarioTitle || "Interview"}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            {scenarioIndustry && (
                                <span
                                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#E6F4EA] text-[#3B7A57] border border-[#B6D9C7]">{scenarioIndustry}</span>
                            )}
                            |
                            {scenarioDifficulty && (
                                <span
                                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#FFF3E0] text-[#B77B2B] border border-[#F5D7A1]">{scenarioDifficulty.charAt(0).toUpperCase() + scenarioDifficulty.slice(1)}</span>
                            )}
                        </div>
                    </div>
                </div>
                {/* Bên phải: Bộ đếm thời gian và nút chi tiết */}
                <div className="flex items-center gap-3">
                    <div
                        className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-[#E0D6C3] shadow-sm h-[40px] w-[92px]">
                        <Image src={'/chat-clock.png'} alt={'Chat clock'} width={20} height={20} />
                        <motion.span
                            key={timeRemaining}
                            initial={{scale: 1.2, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            className={`text-base font-semibold ${getTimerStyles()} text-[#2F3C30]`}
                        >
                            {formatTime(timeRemaining)}
                        </motion.span>
                        <AnimatePresence>
                            {showBeep && (
                                <motion.div
                                    initial={{scale: 0}}
                                    animate={{scale: 1}}
                                    exit={{scale: 0}}
                                >
                                    <Bell className="w-4 h-4 text-[#E57373] animate-bounce"/>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className={'text-[#F0EAE7]'}>|</div>
                    <div
                        onClick={onToggleScenarioPanel}
                        className="flex gap-1 hover:text-[#B77B2B] font-semibold text-[#607362] hover:cursor-pointer"
                    >
                        Chi tiết
                        <Image alt={'arrow'} src={'/right-arrow.png'} width={25} height={10}/>
                    </div>
                </div>
            </div>

            {/* Cảnh báo thời gian sắp hết */}
            <AnimatePresence>
                {showWarning && timeRemaining <= 30 && !isTimeUp && (
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: 10}}
                        className="flex items-center gap-2 text-[#E57373] bg-[#FFF3E0] border border-[#F5D7A1] rounded-xl px-3 py-2 mx-4 mt-3 shadow-sm"
                    >
                        <AlertCircle className="w-4 h-4"/>
                        <span className="text-xs font-medium">Còn dưới 30 giây!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Khu vực hiển thị tin nhắn */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto scroll-smooth relative"
                style={{
                    backgroundImage: "url('/live-practice-arena-background_2.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {messages.length === 0 ? renderEmptyState() : renderMessages()}
            </div>

            {/* Nút cuộn xuống dưới cùng */}
            <AnimatePresence>
                {showScrollButton && (
                    <motion.div
                        initial={{opacity: 0, scale: 0.9}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.9}}
                        className="absolute bottom-4 right-4"
                    >
                        <Button
                            size="icon"
                            onClick={scrollToBottom}
                            className="h-9 w-9 rounded-full shadow-lg bg-[#B77B2B] hover:bg-[#A66A1F] text-white"
                        >
                            <ChevronDown className="w-4 h-4"/>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hộp thoại xác nhận kết thúc phỏng vấn */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="max-w-sm bg-[#FFF9F3] border border-[#E0D6C3] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[#B77B2B]">Kết thúc phỏng vấn?</DialogTitle>
                        <DialogDescription className="text-[#5B4636]">
                            Bạn có chắc chắn muốn kết thúc? Bạn sẽ được chuyển sang trang đánh giá và không thể quay lại
                            phiên này.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirm(false)}
                                className="rounded-xl border-[#E0D6C3] text-[#5B4636] bg-[#F8F6F2]">Huỷ</Button>
                        <Button variant="destructive" onClick={() => {
                            setShowConfirm(false);
                            onStopInterview();
                        }} className="rounded-xl bg-[#E57373] text-white">Kết thúc</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Thanh điều khiển dưới cùng (nếu không ẩn) */}
            {!hideControlBar && (
                <div className="flex flex-row justify-center items-end gap-8 mt-6 mb-4 shrink-0">
                    {/* Bên trái: Kết thúc */}
                    <Button
                        onClick={onStopInterview}
                        disabled={isTimeUp}
                        className="flex items-center justify-center bg-[#F37C5A] hover:bg-[#e45a5a] text-white font-semibold text-lg rounded-full px-10 py-5 shadow-md transition-all duration-150 min-w-[180px] min-h-[64px]"
                    >
                        <XCircle className="w-7 h-7 mr-3"/>
                        Kết thúc
                    </Button>
                    {/* Ở giữa: Ghi âm (nút lớn, xanh, tròn, tooltip) */}
                    <div className="flex flex-col items-center">
                        <div className="mb-2">
                            <div
                                className="bg-[#232B22] text-white text-base px-6 py-2 rounded-2xl shadow-lg relative z-10">
                                Bấm để ghi âm và trả lời
                                <span
                                    className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-[#232B22] rotate-45 z-0"
                                    style={{clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'}}></span>
                            </div>
                        </div>
                        <Button
                            onClick={onToggleListening}
                            disabled={isTimeUp || isPaused || !selectedLanguage}
                            className={`flex items-center justify-center rounded-full bg-[#C6F89C] hover:bg-[#A8E063] text-[#232B22] shadow-xl transition-all duration-150 min-w-[320px] min-h-[120px] text-4xl p-0 border-none ${isListening ? 'ring-4 ring-[#7ED957]' : ''}`}
                            style={{fontSize: '2.5rem'}}
                        >
                            <Mic className="w-14 h-14"/>
                        </Button>
                    </div>
                    {/* Bên phải: Tạm dừng/Bắt đầu */}
                    <Button
                        onClick={onTogglePause}
                        disabled={!selectedLanguage}
                        className="flex items-center justify-center bg-white hover:bg-[#F8F6F2] text-[#232B22] font-semibold text-lg rounded-full px-10 py-5 shadow-md border border-[#E0D6C3] min-w-[180px] min-h-[64px]"
                    >
                        {isPaused ? <><PlayCircle className="w-7 h-7 mr-3"/>Bắt đầu</> : <><PauseCircle
                            className="w-7 h-7 mr-3"/>Tạm dừng</>}
                    </Button>
                </div>
            )}
        </motion.div>
    );
};

export default ConversationBox; 