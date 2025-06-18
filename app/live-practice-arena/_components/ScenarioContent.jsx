"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ChevronUp, ChevronDown, PlayCircle, PauseCircle, Mic, MicOff, XCircle } from "lucide-react";
import { chatSession } from "@/utils/GeminiAIModal";
import { analyzeResponse } from "@/utils/responseAnalyzer";
import ConversationBox from "./ConversationBox";
import AnalysisOverlay from "./AnalysisOverlay";

// Danh sách các ngôn ngữ được hỗ trợ cho cuộc phỏng vấn
const availableLanguages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'vi-VN', name: 'Vietnamese' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' }
];

const ScenarioContent = ({ scenarioData, timeLimit, onInterviewComplete }) => {
    // Khởi tạo các state và refs cần thiết
    const router = useRouter();
    const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [messages, setMessages] = useState([]);
    const [recognition, setRecognition] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [hasInitialMessage, setHasInitialMessage] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showScenarioPanel, setShowScenarioPanel] = useState(false);

    // Refs để lưu trữ transcript tạm thời và cuối cùng
    const finalTranscriptRef = useRef('');
    const transcriptBufferRef = useRef('');

    // Khởi tạo Web Speech API để nhận diện giọng nói
    useEffect(() => {
        if (typeof window === 'undefined' || !selectedLanguage) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage;

        // Xử lý các sự kiện của Speech Recognition
        recognition.onstart = () => {
            setIsListening(true);
            finalTranscriptRef.current = '';
            transcriptBufferRef.current = '';
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        // Xử lý kết quả nhận diện giọng nói
        recognition.onresult = (event) => {
            const results = Array.from(event.results);
            let currentTranscript = '';
            let isFinal = false;

            results.forEach((result, index) => {
                const transcript = result[0].transcript;
                currentTranscript += transcript + ' ';

                if (index === results.length - 1 && result.isFinal) {
                    isFinal = true;
                }
            });

            currentTranscript = currentTranscript.trim();

            if (currentTranscript) {
                finalTranscriptRef.current = currentTranscript;
                if (isFinal) {
                    if (!transcriptBufferRef.current.includes(currentTranscript)) {
                        transcriptBufferRef.current += (transcriptBufferRef.current ? ' ' : '') + currentTranscript;
                    }
                }
            }
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        setRecognition(recognition);
    }, [selectedLanguage]);

    // Xử lý đếm ngược thời gian phỏng vấn
    useEffect(() => {
        if (timeRemaining <= 0 || isTimeUp || isPaused) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    setIsTimeUp(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, isTimeUp, isPaused]);

    // Hàm xử lý và làm sạch phản hồi từ AI
    const cleanResponse = (text) => {
        try {
            const jsonResponse = JSON.parse(text);

            if (Array.isArray(jsonResponse)) {
                const firstItem = jsonResponse[0];
                return firstItem?.openingLine ||
                    firstItem?.response ||
                    firstItem?.utterance ||
                    firstItem?.speech ||
                    firstItem?.text ||
                    firstItem?.Vietnamese_Response ||
                    firstItem ||
                    text;
            }

            return jsonResponse.openingLine ||
                jsonResponse.response ||
                jsonResponse.utterance ||
                jsonResponse.speech ||
                jsonResponse.text ||
                jsonResponse.Vietnamese_Response ||
                text;
        } catch {
            return text
                .replace(/^\[|\]$/g, '')
                .replace(/^\{|\}$/g, '')
                .replace(/"openingLine":\s*"/g, '')
                .replace(/"response":\s*"/g, '')
                .replace(/"utterance":\s*"/g, '')
                .replace(/"speech":\s*"/g, '')
                .replace(/"text":\s*"/g, '')
                .replace(/"Vietnamese_Response":\s*"/g, '')
                .replace(/"scenario":\s*"/g, '')
                .replace(/"customerQuery":\s*"/g, '')
                .replace(/"expectedResponse":\s*"/g, '')
                .replace(/"$/, '')
                .trim();
        }
    };

    // Xử lý kết thúc phỏng vấn và phân tích kết quả
    const handleStopInterview = useCallback(async () => {
        if (isAnalyzing) return;
        setIsAnalyzing(true);
        if (isListening) {
            recognition?.stop();
        }

        try {
            // Phân tích tất cả tin nhắn của người dùng
            const analysisPromises = messages
                .filter(msg => msg.type === 'user')
                .map(async (msg) => {
                    const analysis = await analyzeResponse(msg.content, scenarioData);
                    return {
                        ...msg,
                        analysis
                    };
                });

            const analyzedMessages = await Promise.all(analysisPromises);

            // Tính điểm trung bình
            const scores = analyzedMessages
                .map(msg => msg.analysis?.overallScore || 0)
                .filter(score => score > 0);
            
            const averageScore = scores.length > 0 
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : 0;

            // Thu thập tất cả điểm mạnh và điểm yếu
            const strengths = analyzedMessages
                .flatMap(msg => msg.analysis?.strengths || [])
                .filter((value, index, self) => self.indexOf(value) === index);

            const weaknesses = analyzedMessages
                .flatMap(msg => msg.analysis?.weaknesses || [])
                .filter((value, index, self) => self.indexOf(value) === index);

            // Chuẩn bị dữ liệu phản hồi
            const feedbackData = {
                scenario: scenarioData,
                conversation: analyzedMessages,
                duration: timeLimit * 60 - timeRemaining,
                timestamp: new Date().toISOString(),
                averageScore,
                strengths,
                weaknesses,
                detailedFeedback: analyzedMessages.map(msg => msg.analysis?.feedback).filter(Boolean),
                messageAnalysis: analyzedMessages.map(msg => ({
                    message: msg.content,
                    analysis: msg.analysis
                }))
            };

            // Gọi callback khi hoàn thành phỏng vấn
            await onInterviewComplete(feedbackData);

        } catch (error) {
            console.error('Error analyzing interview:', error);
            // Xử lý lỗi phù hợp
        }
    }, [isAnalyzing, isListening, recognition, scenarioData, messages, timeLimit, timeRemaining, onInterviewComplete]);

    // Tự động kết thúc khi hết thời gian
    useEffect(() => {
        if (isTimeUp) handleStopInterview();
    }, [isTimeUp, handleStopInterview]);

    // Xử lý thay đổi ngôn ngữ và tạo câu chào đầu tiên
    const handleLanguageChange = useCallback(async (languageCode) => {
        setSelectedLanguage(languageCode);
        if (hasInitialMessage) return;

        try {
            const rolePrompt = `You are conducting an interview for a ${scenarioData.role || 'position'}. 
            Start the interview with a natural greeting and opening question in ${availableLanguages.find(lang => lang.code === languageCode)?.name}.

            CRITICAL: 
            - You must respond with ONLY the interview greeting and question
            - DO NOT include any scenario data, context, or metadata
            - DO NOT include any JSON formatting
            - DO NOT mention that you are an AI or interviewer
            - DO NOT include any fields like "scenario", "customerQuery", or "expectedResponse"
            - Just write your response directly as if in a natural conversation
            - Keep your response concise and focused`;

            const result = await chatSession.sendMessage(rolePrompt);
            let initialMessage = result.response.text();

            initialMessage = cleanResponse(initialMessage);

            if (initialMessage.includes('scenario') ||
                initialMessage.includes('customerQuery') ||
                initialMessage.includes('expectedResponse')) {
                const lines = initialMessage.split('\n');
                const validResponse = lines.find(line =>
                    !line.includes('scenario') &&
                    !line.includes('customerQuery') &&
                    !line.includes('expectedResponse') &&
                    line.trim().length > 0
                );
                if (validResponse) {
                    initialMessage = validResponse.trim();
                }
            }

            setMessages([{
                id: Date.now(),
                type: 'ai',
                content: initialMessage,
                timestamp: new Date()
            }]);
            setHasInitialMessage(true);
        } catch (error) {
            console.error('Error generating initial response:', error);
        }
    }, [hasInitialMessage, scenarioData]);

    // Xử lý tin nhắn từ người dùng và phản hồi từ AI
    const handleUserMessage = useCallback(async (transcript) => {
        if (!transcript.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: transcript,
            timestamp: new Date(),
            analysis: null
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            const result = await chatSession.sendMessage(
                `You are conducting an interview for a ${scenarioData.role || 'position'}. 
                The candidate just said: "${transcript}"

                As a professional interviewer:
                1. Respond naturally as if you are the interviewer
                2. Stay focused on the interview topic
                3. If the response is off-topic, politely redirect the conversation back to the interview context
                4. Ask relevant follow-up questions
                5. Maintain a professional but conversational tone
                6. Respond in ${availableLanguages.find(lang => lang.code === selectedLanguage)?.name || 'English'}

                CRITICAL: 
                - You must respond with ONLY the interview question or statement
                - DO NOT include any scenario data, context, or metadata
                - DO NOT include any JSON formatting
                - DO NOT mention that you are an AI or interviewer
                - DO NOT include any fields like "scenario", "customerQuery", or "expectedResponse"
                - Just write your response directly as if in a natural conversation
                - Keep your response concise and focused`
            );
            let aiResponse = result.response.text();

            aiResponse = cleanResponse(aiResponse);

            if (aiResponse.includes('scenario') ||
                aiResponse.includes('customerQuery') ||
                aiResponse.includes('expectedResponse')) {
                const lines = aiResponse.split('\n');
                const validResponse = lines.find(line =>
                    !line.includes('scenario') &&
                    !line.includes('customerQuery') &&
                    !line.includes('expectedResponse') &&
                    line.trim().length > 0
                );
                if (validResponse) {
                    aiResponse = validResponse.trim();
                }
            }

            setMessages(prev => [...prev, {
                id: Date.now(),
                type: 'ai',
                content: aiResponse,
                timestamp: new Date()
            }]);

            const analysis = await analyzeResponse(transcript, scenarioData.scenario.scenario);
            setMessages(prev => prev.map(msg =>
                msg.id === userMessage.id
                    ? { ...msg, analysis }
                    : msg
            ));
        } catch (error) {
            console.error('Error in message handling:', error);
            setMessages(prev => prev.map(msg =>
                msg.id === userMessage.id
                    ? { ...msg, analysis: { error: 'Failed to process response' } }
                    : msg
            ));
        }
    }, [scenarioData, selectedLanguage]);

    // Xử lý bắt đầu/dừng nhận diện giọng nói
    const toggleListening = useCallback(async () => {
        if (isListening) {
            recognition?.stop();
            const finalTranscript = transcriptBufferRef.current || finalTranscriptRef.current;
            if (finalTranscript) {
                await handleUserMessage(finalTranscript);
            }
            transcriptBufferRef.current = '';
            finalTranscriptRef.current = '';
        } else {
            try {
                transcriptBufferRef.current = '';
                finalTranscriptRef.current = '';
                await recognition?.start();
            } catch (error) {
                console.error('Error starting recognition:', error);
                setIsListening(false);
            }
        }
    }, [isListening, recognition, handleUserMessage]);

    // Xử lý tạm dừng/tiếp tục phỏng vấn
    const togglePause = useCallback(() => {
        setIsPaused(prev => !prev);
        if (isListening) {
            recognition?.stop();
        }
    }, [isListening, recognition]);

    // Set default language to Vietnamese and trigger greeting on mount
    useEffect(() => {
        if (!selectedLanguage && !hasInitialMessage) {
            handleLanguageChange('vi-VN');
        }
    }, [selectedLanguage, hasInitialMessage, handleLanguageChange]);

    return (
        <div className="w-full h-full flex flex-col justify-center items-center">
            <div className="flex flex-col w-full max-w-screen-2xl h-full justify-center items-stretch transition-all duration-300">
                {/* Main content row: ConversationBox + SidePanel */}
                <div className="flex flex-row flex-1 min-h-0 w-full justify-center items-stretch transition-all duration-300">
                    {/* Main Conversation Area */}
                    <motion.div
                        className={`flex-1 flex flex-col w-full min-w-[320px] max-w-[1000px] transition-all duration-300 ${showScenarioPanel ? 'md:mr-4' : ''} h-[300px] sm:h-[500px] lg:h-[800px] lg:max-h-[800px] lg:min-h-[800px] ${!showScenarioPanel ? 'mx-auto' : ''}`}
                        style={{ minWidth: 0 }}
                    >
                        <ConversationBox
                            messages={messages}
                            isListening={isListening}
                            onToggleListening={toggleListening}
                            isPaused={isPaused}
                            isTimeUp={isTimeUp}
                            onTogglePause={togglePause}
                            timeRemaining={timeRemaining}
                            selectedLanguage={selectedLanguage}
                            onLanguageChange={handleLanguageChange}
                            availableLanguages={availableLanguages}
                            scenarioData={scenarioData}
                            onStopInterview={handleStopInterview}
                            scenarioTitle={scenarioData.title}
                            scenarioIndustry={scenarioData.industry}
                            scenarioDifficulty={scenarioData.difficulty}
                            onToggleScenarioPanel={() => setShowScenarioPanel((v) => !v)}
                            showScenarioPanel={showScenarioPanel}
                            hideControlBar
                        />
                    </motion.div>
                    {/* Scenario Info Side Panel (Desktop) */}
                    <AnimatePresence>
                        {showScenarioPanel && (
                            <motion.div
                                initial={{ x: 300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 300, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="md:block w-[450px] max-w-full bg-white rounded-[28px] shadow-lg flex flex-col z-20 h-[300px] sm:h-[500px] lg:h-[800px] lg:max-h-[800px] lg:min-h-[800px] min-h-0"
                                style={{ minWidth: 0 }}
                            >
                                <div className="flex flex-col flex-1 min-h-0 h-full">
                                    {/* Scenario Title */}
                                    <h2 className="text-2xl font-bold text-[#374151] mb-2 px-8 pt-8">{scenarioData.title || 'Tiêu đề kịch bản'}</h2>
                                    {/* Badges row */}
                                    <div className="flex items-center gap-3 mb-2 px-8">
                                        {/* Industry badge */}
                                        {scenarioData.industry && (
                                            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#F0F6FF] text-[#2563EB] text-sm font-medium">
                                                <span role="img" aria-label="industry">🛒</span>
                                                {scenarioData.industry}
                                            </span>
                                        )}
                                        {/* Difficulty badge */}
                                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#E6F9E6] text-[#22C55E] text-sm font-medium">
                                            <span role="img" aria-label="difficulty">✔️</span>
                                            {scenarioData.difficulty.charAt(0).toUpperCase() + scenarioData.difficulty.slice(1)}
                                        </span>
                                    </div>
                                    {/* Scenario Description */}
                                    <p className="text-base text-[#374151] mb-2 px-8">{scenarioData.description || scenarioData.scenario || 'Mô tả kịch bản...'}</p>
                                    {/* Divider */}
                                    <div className="border-t border-[#E5E7EB] my-2 mx-8" />
                                    {/* Situation box */}
                                    <div className="bg-[#F9F6ED] rounded-xl p-4 mb-2 mx-8">
                                        <div className="font-semibold text-[#7C5C2A] mb-1">Tình huống</div>
                                        <div className="text-[#7C5C2A] text-base">{scenarioData.customerQuery || 'Mô tả tình huống...'}</div>
                                    </div>
                                    {/* Checklist and expand/collapse */}
                                    <div className="flex flex-col flex-1 min-h-0 h-full px-8">
                                        <div className="font-bold text-[#374151] mb-2">Gợi ý trả lời</div>
                                        <div className={`transition-all duration-300 ${isExpanded ? 'flex-1 overflow-y-auto' : ''}`} style={{ maxHeight: isExpanded ? '300px' : '0', overflowY: isExpanded ? 'auto' : 'hidden' }}>
                                            <ul className="space-y-2">
                                                {(() => {
                                                    const checklistTasks = (scenarioData.expectedResponse || '').split(/\s*\d+\.\s*/).filter(Boolean);
                                                    const visibleChecklistTasks = isExpanded ? checklistTasks : [];
                                                    return visibleChecklistTasks.map((task, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-[#374151] text-base">
                                                            <span className="mt-1 text-green-500">
                                                                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                                                                    <circle cx="10" cy="10" r="10" fill="#D1FADF"/>
                                                                    <path d="M6 10.5l2.5 2.5L14 8.5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                </svg>
                                                            </span>
                                                            <span>{task.trim()}</span>
                                                        </li>
                                                    ));
                                                })()}
                                            </ul>
                                        </div>
                                        {/* Expand/Collapse Button always at bottom */}
                                        <div className="mt-2 flex-shrink-0 pb-4">
                                            {(() => {
                                                const checklistTasks = (scenarioData.expectedResponse || '').split(/\s*\d+\.\s*/).filter(Boolean);
                                                if (checklistTasks.length > 0) {
                                                    return (
                                                        <button
                                                            className="text-[#2563EB] text-sm font-medium focus:outline-none hover:underline"
                                                            onClick={() => setIsExpanded(e => !e)}
                                                        >
                                                            {isExpanded ? 'Thu gọn' : `Xem thêm (${checklistTasks.length})`}
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Scenario Info Drawer (Mobile) */}
                    <AnimatePresence>
                        {showScenarioPanel && (
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ duration: 0.25 }}
                                className="fixed md:hidden top-0 right-0 w-full h-full z-40 bg-black/60 flex justify-end"
                                style={{ backdropFilter: 'blur(4px)' }}
                            >
                                <div className="w-[90vw] max-w-xs h-full bg-white rounded-l-2xl shadow-2xl flex flex-col min-h-0">
                                    <div className="p-6 flex flex-col flex-1 min-h-0 h-full overflow-hidden">
                                        {/* Scenario Title */}
                                        <h2 className="text-2xl font-bold text-[#374151] mb-2">{scenarioData.title || 'Tiêu đề kịch bản'}</h2>
                                        {/* Badges row */}
                                        <div className="flex items-center gap-3 mb-2">
                                            {/* Industry badge */}
                                            {scenarioData.industry && (
                                                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#F0F6FF] text-[#2563EB] text-sm font-medium">
                                                    <span role="img" aria-label="industry">🛒</span>
                                                    {scenarioData.industry}
                                                </span>
                                            )}
                                            {/* Difficulty badge */}
                                            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#E6F9E6] text-[#22C55E] text-sm font-medium">
                                                <span role="img" aria-label="difficulty">✔️</span>
                                                {scenarioData.difficulty.charAt(0).toUpperCase() + scenarioData.difficulty.slice(1)}
                                            </span>
                                        </div>
                                        {/* Scenario Description */}
                                        <p className="text-base text-[#374151] mb-2">{scenarioData.description || scenarioData.scenario || 'Mô tả kịch bản...'}</p>
                                        {/* Divider */}
                                        <div className="border-t border-[#E5E7EB] my-2" />
                                        {/* Situation box */}
                                        <div className="bg-[#F9F6ED] rounded-xl p-4 mb-2">
                                            <div className="font-semibold text-[#7C5C2A] mb-1">Tình huống</div>
                                            <div className="text-[#7C5C2A] text-base">{scenarioData.customerQuery || 'Mô tả tình huống...'}</div>
                                        </div>
                                        {/* Checklist and expand/collapse */}
                                        <div className="flex flex-col flex-1 min-h-0 h-full">
                                            <div className="font-bold text-[#374151] mb-2">Gợi ý trả lời</div>
                                            <div className={`transition-all duration-300 ${isExpanded ? 'flex-1 overflow-y-auto' : ''}`} style={{ maxHeight: isExpanded ? '200px' : '0', overflowY: isExpanded ? 'auto' : 'hidden' }}>
                                                <ul className="space-y-2">
                                                    {(() => {
                                                        const checklistTasks = (scenarioData.expectedResponse || '').split(/\s*\d+\.\s*/).filter(Boolean);
                                                        const visibleChecklistTasks = isExpanded ? checklistTasks : [];
                                                        return visibleChecklistTasks.map((task, idx) => (
                                                            <li key={idx} className="flex items-start gap-2 text-[#374151] text-base">
                                                                <span className="mt-1 text-green-500">
                                                                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                                                                        <circle cx="10" cy="10" r="10" fill="#D1FADF"/>
                                                                        <path d="M6 10.5l2.5 2.5L14 8.5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                    </svg>
                                                                </span>
                                                                <span>{task.trim()}</span>
                                                            </li>
                                                        ));
                                                    })()}
                                                </ul>
                                            </div>
                                            {/* Expand/Collapse Button always at bottom */}
                                            <div className="mt-2 flex-shrink-0 pb-4">
                                                {(() => {
                                                    const checklistTasks = (scenarioData.expectedResponse || '').split(/\s*\d+\.\s*/).filter(Boolean);
                                                    if (checklistTasks.length > 0) {
                                                        return (
                                                            <button
                                                                className="text-[#2563EB] text-sm font-medium focus:outline-none hover:underline"
                                                                onClick={() => setIsExpanded(e => !e)}
                                                            >
                                                                {isExpanded ? 'Thu gọn' : `Xem thêm (${checklistTasks.length})`}
                                                            </button>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {/* Control Bar below ConversationBox and SidePanel */}
                    <div className="flex flex-row justify-center items-center gap-9 mt-4 w-full mx-auto">
                        {/* Left: Kết thúc */}
                        <Button
                            onClick={handleStopInterview}
                            disabled={isTimeUp}
                            className="flex items-center justify-center bg-[#F37C5A] hover:bg-[#e45a5a] text-white font-semibold text-lg rounded-full px-9 py-4 shadow-md transition-all duration-150 min-w-[143px] min-h-[59px]"
                        >
                            <XCircle className="w-7 h-7 mr-3" />
                            Kết thúc
                        </Button>
                        {/* Center: Ghi âm (biggest, green, round, tooltip) */}
                        <div className="relative flex flex-col items-center justify-center">
                            {/* Tooltip above (only when not recording) */}
                            {!isListening && (
                                <div className="mt-3 flex items-center justify-center">
                                    <div className="bg-[#232B22] text-white text-base px-6 py-2 rounded-2xl shadow-lg relative z-10 flex items-center justify-center">
                                        Bấm để xác nhận câu trả lời
                                        <span className="absolute left-1/2 top-8 -translate-x-1/2 bg-[#232B22] rotate-45 z-0" style={{clipPath:'polygon(0 0, 100% 0, 100% 100%, 0 100%)', width: '16px', height: '16px'}}></span>
                                    </div>
                                </div>
                            )}
                            <Button
                                onClick={toggleListening}
                                disabled={isTimeUp || isPaused || !selectedLanguage}
                            className={`flex items-center justify-center rounded-full shadow-xl transition-all duration-150 min-w-[216px] min-h-[72px] text-3xl p-0 border-none ${isListening ? 'bg-[#F37C5A] hover:bg-[#e45a5a] text-white ring-4 ring-[#e45a5a]' : 'bg-[#C6F89C] hover:bg-[#A8E063] text-[#232B22]'}`}
                                style={{ fontSize: '2.25rem' }}
                            >
                                {isListening ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="6" y="6" width="12" height="12" rx="3" fill="currentColor" /></svg>
                                ) : (
                                    <Mic className="w-20 h-20" />
                                )}
                            </Button>
                            {/* Tooltip below (only when recording) */}
                            {isListening && (
                                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-20">
                                    <div className="bg-[#232B22] text-white text-sm px-4 py-1.5 rounded-2xl shadow-lg flex items-center justify-center">
                                        Bấm để xác nhận câu trả lời
                                        <span className="absolute left-1/2 -top-2 -translate-x-1/2 bg-[#232B22] rotate-45 z-0" style={{clipPath:'polygon(0 0, 100% 0, 100% 100%, 0 100%)', width: '12px', height: '12px'}}></span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Right: Tạm dừng/Bắt đầu */}
                        <Button
                            onClick={togglePause}
                            disabled={!selectedLanguage}
                            className="flex items-center justify-center bg-white hover:bg-[#F8F6F2] text-[#232B22] font-semibold text-lg rounded-full px-9 py-4 shadow-md border border-[#E0D6C3] min-w-[143px] min-h-[59px]"
                        >
                            {isPaused ? <><PlayCircle className="w-7 h-7 mr-3" />Bắt đầu</> : <><PauseCircle className="w-7 h-7 mr-3" />Tạm dừng</>}
                        </Button>
                    </div>
                {/* Overlay hiển thị khi đang phân tích kết quả */}
                {isAnalyzing && <AnalysisOverlay />}
            </div>
        </div>
    );
};

export default ScenarioContent; 