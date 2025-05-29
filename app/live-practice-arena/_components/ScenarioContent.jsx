"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ChevronUp, ChevronDown } from "lucide-react";
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
    const [isExpanded, setIsExpanded] = useState(true);

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Card hiển thị thông tin kịch bản phỏng vấn */}
            <Card className="bg-gray-900/90 backdrop-blur-lg border border-blue-700/40 rounded-2xl shadow-xl hover:border-blue-500/40 transition-all duration-300">
                <CardContent className="p-6">
                    {/* Header của card với icon và nút mở rộng/thu gọn */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Interview Scenario
                            </h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="gap-2 font-semibold text-blue-400 hover:text-blue-200"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="w-4 h-4" />
                                    Collapse
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4" />
                                    Expand
                                </>
                            )}
                        </Button>
                    </div>
                    {/* Nội dung chi tiết của kịch bản phỏng vấn */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-4">
                                    {/* Phần câu hỏi */}
                                    <div>
                                        <span className="block text-xs text-blue-400 font-semibold mb-1">Question</span>
                                        <p className="text-gray-300 font-semibold">
                                            {scenarioData.scenario?.customerQuery || scenarioData.customerQuery || ""}
                                        </p>
                                    </div>
                                    {/* Phần câu trả lời mong đợi */}
                                    <div>
                                        <span className="block text-xs text-purple-400 font-semibold mb-1">Expected Response</span>
                                        <p className="text-gray-300 font-semibold">
                                            {scenarioData.scenario?.expectedResponse || scenarioData.expectedResponse || ""}
                                        </p>
                                    </div>
                                    {/* Phần ngữ cảnh kịch bản */}
                                    <div>
                                        <span className="block text-xs text-emerald-400 font-semibold mb-1">Scenario Context</span>
                                        <p className="text-gray-300 font-semibold">
                                            {scenarioData.scenario?.scenario || scenarioData.scenario || ""}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* Hộp thoại phỏng vấn với các tính năng tương tác */}
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
            />

            {/* Overlay hiển thị khi đang phân tích kết quả */}
            {isAnalyzing && <AnalysisOverlay />}
        </motion.div>
    );
};

export default ScenarioContent; 