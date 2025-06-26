"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Brain, ChevronUp, ChevronDown, PlayCircle, PauseCircle, Mic, MicOff, XCircle } from "lucide-react";
import { generateWithRetry } from "@/utils/GeminiAIModal";
import { analyzeResponse } from "@/utils/responseAnalyzer";
import ConversationBox from "./ConversationBox";
import AnalysisOverlay from "./AnalysisOverlay";
import Image from 'next/image';

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
    const [previousGreetings, setPreviousGreetings] = useState([]);

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

            const analyzedUserMessages = await Promise.all(analysisPromises);

            // Tính điểm trung bình
            const scores = analyzedUserMessages
                .map(msg => msg.analysis?.overallScore || 0)
                .filter(score => score > 0);

            const averageScore = scores.length > 0
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : 0;

            // Thu thập tất cả điểm mạnh và điểm yếu
            const strengths = analyzedUserMessages
                .flatMap(msg => msg.analysis?.strengths || [])
                .filter((value, index, self) => self.indexOf(value) === index);

            const weaknesses = analyzedUserMessages
                .flatMap(msg => msg.analysis?.weaknesses || [])
                .filter((value, index, self) => self.indexOf(value) === index);

            // Chuẩn bị dữ liệu phản hồi với toàn bộ cuộc hội thoại
            const feedbackData = {
                scenario: scenarioData,
                conversation: messages, // Lưu toàn bộ cuộc hội thoại (cả user và AI)
                analyzedUserMessages: analyzedUserMessages, // Chỉ các tin nhắn user đã được phân tích
                duration: timeLimit * 60 - timeRemaining,
                timestamp: new Date().toISOString(),
                averageScore,
                strengths,
                weaknesses,
                detailedFeedback: analyzedUserMessages.map(msg => msg.analysis?.feedback).filter(Boolean),
                messageAnalysis: analyzedUserMessages.map(msg => ({
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

    // Hàm xử lý kết thúc phỏng vấn thủ công (từ button)
    const handleManualStopInterview = useCallback(async () => {
        // Dừng timer và set trạng thái time up để ngăn chặn các tương tác khác
        setIsTimeUp(true);
        setIsPaused(true);
        if (isListening) {
            recognition?.stop();
        }

        // Gọi hàm xử lý kết thúc
        await handleStopInterview();
    }, [isListening, recognition, handleStopInterview]);

    // Tự động kết thúc khi hết thời gian (chỉ khi timer tự động kết thúc)
    useEffect(() => {
        if (isTimeUp && timeRemaining === 0) {
            handleStopInterview();
        }
    }, [isTimeUp, timeRemaining, handleStopInterview]);

    // Xử lý thay đổi ngôn ngữ và tạo câu chào đầu tiên
    const handleLanguageChange = useCallback(async (languageCode) => {
        setSelectedLanguage(languageCode);
        if (hasInitialMessage) return;

        // Defensive check for scenarioData and required fields
        if (!scenarioData || !scenarioData.role) {
            console.error('Invalid scenarioData:', scenarioData);
            setMessages([{
                id: Date.now(),
                type: 'ai',
                content: 'Xin lỗi, dữ liệu kịch bản phỏng vấn không hợp lệ. Vui lòng thử lại hoặc chọn kịch bản khác.',
                timestamp: new Date()
            }]);
            setHasInitialMessage(true);
            return;
        }

        const scenarioText = scenarioData.description || scenarioData.scenario || '';
        const customerQuery = scenarioData.customerQuery || '';
        let greeting = '';
        let tries = 0;
        let newGreetingFound = false;
        let lastPrompt = '';
        let lastResultText = '';
        while (!newGreetingFound && tries < 3) {
            const rolePrompt = `You are the interviewer. The user is the candidate interviewing for the role of ${scenarioData.role}.

SCENARIO CONTEXT:
${scenarioText ? '- ' + scenarioText : ''}
${customerQuery ? '- Situation: ' + customerQuery : ''}

Your task:
- Begin the interview with a warm, welcoming, and natural greeting and opening question in ${availableLanguages.find(lang => lang.code === languageCode)?.name}.
- Your greeting and question MUST be directly relevant to the scenario context and situation above, not just the role.
- Use the scenario context as background for your questions, but do NOT role-play as the customer or scenario character. Always speak as the interviewer.
- Do NOT use or mention a candidate name. You do NOT know the candidate's name.
- Make your greeting and opening question feel unique, human, and not overly formal or repetitive.
- Avoid using the same template as before.
- Do not use the phrase 'Rất vui được gặp bạn hôm nay' or any direct translation of 'Nice to meet you today.'
- Do not repeat any of these previous greetings: ${previousGreetings.map(g => `"${g}"`).join(', ')}
- Use a conversational, friendly tone as if you are a real interviewer meeting the candidate for the first time.
- You may reference the candidate's role or the scenario context if appropriate, but do not invent personal details.
- Respond ONLY with the interview greeting and opening question as a single, natural sentence or two.
- DO NOT include any JSON, curly braces, brackets, or code block formatting.
- DO NOT include any scenario data, context, or metadata in your output.
- DO NOT mention that you are an AI or interviewer.
- DO NOT include any fields like "scenario", "customerQuery", or "expectedResponse".
- Just write your response directly as if in a natural conversation.
- Do not use any curly braces or brackets in your response.
- Keep your response concise and focused.`;
            lastPrompt = rolePrompt;
            try {
                const resultText = await generateWithRetry(rolePrompt);
                lastResultText = resultText;
                let initialMessage = cleanResponse(resultText);
                // Remove common formal phrase manually as a last resort
                if (initialMessage.includes('Rất vui được gặp bạn hôm nay')) {
                    initialMessage = initialMessage.replace(/Rất vui được gặp bạn hôm nay[.,!\s]*/gi, '').trim();
                }
                // Check for forbidden phrase or previous greetings
                const isRepeat = previousGreetings.some(g => initialMessage.trim().toLowerCase() === g.trim().toLowerCase());
                const isForbidden = initialMessage.includes('Rất vui được gặp bạn hôm nay');
                if (!isRepeat && !isForbidden && initialMessage.trim() !== '') {
                    greeting = initialMessage;
                    newGreetingFound = true;
                } else {
                    tries++;
                }
            } catch (error) {
                console.error('Error generating greeting (try', tries, '):', error, '\nPrompt:', lastPrompt, '\nResult:', lastResultText);
                tries++;
            }
        }
        if (!newGreetingFound) {
            greeting = 'Chào bạn! Chúng ta hãy bắt đầu buổi phỏng vấn. Bạn có thể chia sẻ về lý do bạn quan tâm đến vị trí này không?';
        }
        setMessages([{
            id: Date.now(),
            type: 'ai',
            content: greeting,
            timestamp: new Date()
        }]);
        setPreviousGreetings(prev => [...prev, greeting]);
        setHasInitialMessage(true);
    }, [hasInitialMessage, scenarioData, previousGreetings]);

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
            const scenarioText = scenarioData.description || scenarioData.scenario || '';
            const customerQuery = scenarioData.customerQuery || '';
            const responsePrompt = `You are the interviewer. The user is the candidate interviewing for the role of ${scenarioData.role}.

SCENARIO CONTEXT:
${scenarioText ? '- ' + scenarioText : ''}
${customerQuery ? '- Situation: ' + customerQuery : ''}

Your task:
- Respond to the candidate's answer below as a real, professional interviewer.
- The candidate just said: "${transcript}"
- Your response should be human, and directly relevant to the scenario context and situation above.
- If the candidate's answer is off-topic, out-of-scope, or unclear, gently redirect the conversation, ask for clarification, or help them get back on track in a supportive way.
- Always act as the interviewer, not the customer or scenario character. Use the scenario context as background for your questions, but do NOT role-play as the customer or scenario character.
- Do NOT use or mention a candidate name. You do NOT know the candidate's name.
- Make your response unique, human, and not overly formal or repetitive.
- Avoid using the same template as before.
- Do not spam use the phrase 'Rất vui được gặp bạn hôm nay' or any direct translation of 'Nice to meet you today.' or 'Rất vui được hỏi bạn về...' or any direct translation of 'Tôi hiểu rằng'
- Use a conversational, friendly tone as if you are a real interviewer.
- You may reference the candidate's role or the scenario context if appropriate, but do not invent personal details.
- Respond ONLY with a single, natural interviewer response (question, comment, or follow-up) as if in a real conversation.
- Your response must be in ${availableLanguages.find(lang => lang.code === selectedLanguage)?.name || 'English'}.
- DO NOT include any JSON, curly braces, brackets, or code block formatting.
- DO NOT include any scenario data, context, or metadata in your output.
- DO NOT mention that you are an AI or interviewer.
- DO NOT include any fields like "scenario", "customerQuery", or "expectedResponse".
- DO NOT keep saying the same structure of response.
- Just write your response directly as if in a natural conversation.
- Do not use any curly braces or brackets in your response.
- Keep your response concise and focused.`;

            const result = await generateWithRetry(responsePrompt);
            let aiResponse = cleanResponse(result);

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
                        className={`flex-1 flex flex-col w-full min-w-[220px] max-w-[1000px] transition-all duration-300 ${showScenarioPanel ? 'md:mr-4' : ''} max-h-[690px] min-h-[690px] ${!showScenarioPanel ? 'mx-auto' : ''}`}
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
                                className="max-md:hidden md:block w-[450px] max-w-full bg-white rounded-[28px] shadow-lg flex flex-col z-20 h-[300px] sm:h-[690px] lg:h-[690px] lg:max-h-[690px] lg:min-h-[690px] min-h-0"
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
                                                                    <circle cx="10" cy="10" r="10" fill="#D1FADF" />
                                                                    <path d="M6 10.5l2.5 2.5L14 8.5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                                <div className="w-[90vw] max-w-xs h-full bg-white rounded-l-2xl shadow-2xl flex flex-col min-h-0 relative">
                                    {/* Close button */}
                                    <button
                                        className="absolute top-3 right-3 z-50 p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                                        aria-label="Đóng"
                                        onClick={() => setShowScenarioPanel(false)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
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
                                                                        <circle cx="10" cy="10" r="10" fill="#D1FADF" />
                                                                        <path d="M6 10.5l2.5 2.5L14 8.5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                {/* Overlay Control Bar: fixed at bottom center, overlays ConversationBox */}
                <div className="fixed left-1/2 bottom-8 transform -translate-x-1/2 flex flex-row flex-wrap justify-center items-end gap-3 max-sm:gap-0 rounded-2xl px-4 py-2 w-full"
                    style={{ pointerEvents: 'auto' }}>
                    {/* End Button */}
                    <div className="flex-shrink-0 mb-1.5">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    disabled={isTimeUp}
                                    title="Kết thúc phỏng vấn"
                                    className="flex items-center justify-center bg-[#F37C5A] hover:bg-[#e45a5a] text-white font-semibold rounded-full px-2 py-2 sm:px-3 sm:py-2 md:px-5 md:py-3 shadow-md w-[143px] h-[59px] max-sm:w-[50px] max-sm:h-[50px] text-xs sm:text-sm md:text-base"
                                >
                                    <Image src='/end-chat.png' alt='End Chat' width={20} height={20} />
                                    <span className="hidden sm:inline">Kết thúc</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-black">Bạn có chắc chắn muốn kết thúc cuộc phỏng vấn?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Hành động này sẽ kết thúc cuộc phỏng vấn và lưu lại kết quả phỏng vấn. Bạn không thể quay lại sau khi kết thúc.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="text-black hover:bg-white hover:text-black">Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleManualStopInterview}
                                        className="bg-[#F37C5A] hover:bg-[#e45a5a] text-white"
                                    >
                                        Kết thúc phỏng vấn
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    {/* Record Button */}
                    <div className="relative flex flex-col items-center justify-center flex-shrink-0">
                        {/* Tooltip above (always, label changes by state) */}
                        <div className="mb-1 flex items-center justify-center">
                            <div className="bg-[#232B22] text-white text-[10px] max-sm:text-sm sm:text-sm md:text-sm px-2 sm:px-3 md:px-4 py-1 rounded-2xl shadow-lg relative z-10 flex items-center justify-center max-w-[80vw] break-words text-center">
                                {isListening ? 'Bấm để xác nhận câu trả lời' : 'Bấm để ghi âm và trả lời'}
                                <span className="absolute left-1/2 top-5 sm:top-[1.25rem] -translate-x-1/2 bg-[#232B22] rotate-45 z-0" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', width: '8px', height: '12px' }}></span>
                            </div>
                        </div>
                        <Button
                            onClick={toggleListening}
                            disabled={isTimeUp || isPaused || !selectedLanguage}
                            title={isListening ? 'Gửi câu trả lời' : 'Bắt đầu ghi âm'}
                            className={`w-full max-w-[180px] sm:max-w-[220px] md:max-w-[300px] flex items-center justify-center rounded-full shadow-xl transition-all duration-150 h-[72px] max-sm:w-[120px] sm:min-w-[56px] sm:min-h-[48px] md:min-w-[90px] md:min-h-[56px] text-base sm:text-xl md:text-2xl p-0 border-none ${isListening ? 'bg-[#F37C5A] hover:bg-[#e45a5a] text-white ring-2 sm:ring-4 ring-[#e45a5a]' : 'bg-[#C6F89C] hover:bg-[#A8E063] text-[#232B22]'}`}
                            style={{ fontSize: undefined }}
                        >
                            {isListening ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-10 sm:h-10 md:w-14 md:h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="6" y="6" width="12" height="12" rx="3" fill="currentColor" /></svg>
                            ) : (
                                <Image src='/chat-mic.png' alt='Chat Mic' width={20} height={20} />
                            )}
                        </Button>
                    </div>
                    {/* Pause/Start Button */}
                    <div className="flex-shrink-0 mb-1.5">
                        <Button
                            onClick={togglePause}
                            disabled={!selectedLanguage}
                            title={isPaused ? 'Bắt đầu' : 'Tạm dừng'}
                            className="flex items-center justify-center bg-white hover:bg-[#F8F6F2] text-[#232B22] font-semibold rounded-full px-2 py-2 sm:px-3 sm:py-2 md:px-5 md:py-3 shadow-md border border-[#E0D6C3] w-[143px] h-[59px] max-sm:w-[50px] max-sm:h-[50px] sm:min-w-[60px] sm:min-h-[40px] md:min-w-[100px] md:min-h-[48px] text-xs sm:text-sm md:text-base"
                        >
                            {isPaused ? <><PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-0 sm:mr-2" /><span className="hidden sm:inline">Bắt đầu</span></> : <><PauseCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-0 sm:mr-2" /><span className="hidden sm:inline">Tạm dừng</span></>}
                        </Button>
                    </div>
                </div>
                {/* Overlay hiển thị khi đang phân tích kết quả */}
                {isAnalyzing && <AnalysisOverlay />}
            </div>
        </div>
    );
};

export default ScenarioContent; 