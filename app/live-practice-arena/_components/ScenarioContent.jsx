"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Mic,
  MicOff,
  PauseCircle,
  PlayCircle,
  Brain,
  Clock,
  Target,
  Sparkles,
  MessageSquare,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Globe
} from "lucide-react";
import { chatSession } from "@/utils/GeminiAIModal";
import { analyzeResponse } from "@/utils/responseAnalyzer";
import ConversationBox from "./ConversationBox";
import Timer from "./Timer";
import AnalysisOverlay from "./AnalysisOverlay";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ScenarioContent = ({ scenarioData, timeLimit }) => {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [recognition, setRecognition] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showTips, setShowTips] = useState(true);
  const finalTranscriptRef = useRef('');
  const transcriptBufferRef = useRef('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [speechMode, setSpeechMode] = useState('continuous'); // 'continuous' or 'manual'
  const [selectedLanguage, setSelectedLanguage] = useState(''); // Empty string as initial value
  const [hasInitialMessage, setHasInitialMessage] = useState(false);

  // Available languages for speech recognition
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

  // Interview tips
  const interviewTips = [
    {
      icon: Brain,
      title: "Think Before Speaking",
      tip: "Take a moment to organize your thoughts before responding"
    },
    {
      icon: Target,
      title: "Stay Focused",
      tip: "Keep your responses relevant to the question"
    },
    {
      icon: MessageSquare,
      title: "Be Clear",
      tip: "Communicate your points clearly and concisely"
    }
  ];

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage;

        recognition.onstart = () => {
          setIsListening(true);
          if (speechMode === 'manual') {
            finalTranscriptRef.current = '';
            transcriptBufferRef.current = '';
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

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
          setInterimTranscript(currentTranscript);

          if (isFinal && currentTranscript) {
            if (!transcriptBufferRef.current.includes(currentTranscript)) {
              if (speechMode === 'continuous') {
                // In continuous mode, just use the current transcript
                handleUserMessage(currentTranscript);
                transcriptBufferRef.current = '';
                finalTranscriptRef.current = '';
              } else {
                // In manual mode, accumulate the transcript
                transcriptBufferRef.current += (transcriptBufferRef.current ? ' ' : '') + currentTranscript;
                finalTranscriptRef.current = transcriptBufferRef.current;
              }
            }
          }
        };

        recognition.onerror = (event) => {
          setIsListening(false);
        };

        setRecognition(recognition);
      }
    }
  }, [speechMode, selectedLanguage]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !isTimeUp && !isPaused) {
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
    }
  }, [timeRemaining, isTimeUp, isPaused]);

  // Handle time up and analysis
  useEffect(() => {
    if (isTimeUp && !isAnalyzing) {
      setIsAnalyzing(true);
      if (isListening) {
        recognition?.stop();
      }

      setTimeout(() => {
        const sessionData = {
          scenario: scenarioData,
          conversation: messages,
          duration: timeLimit * 60 - timeRemaining,
          timestamp: new Date().toISOString()
        };

        router.push(`/result-feedback?session=${encodeURIComponent(JSON.stringify(sessionData))}`);
      }, 3000);
    }
  }, [isTimeUp, isAnalyzing, messages, scenarioData, timeLimit, timeRemaining, router, isListening, recognition]);

  // Handle language selection
  const handleLanguageChange = async (languageCode) => {
    setSelectedLanguage(languageCode);
    if (!hasInitialMessage) {
      try {
        const result = await chatSession.sendMessage(
          `You are a customer in the following scenario. Please provide an initial welcome message to start the conversation in ${availableLanguages.find(lang => lang.code === languageCode)?.name}. Scenario: ${scenarioData.scenario.scenario}`
        );
        const initialMessage = result.response.text();
        setMessages([
          {
            id: Date.now(),
            type: 'ai',
            content: initialMessage,
            timestamp: new Date()
          }
        ]);
        setHasInitialMessage(true);
      } catch (error) {
        console.error('Error generating initial response:', error);
      }
    }
  };

  const handleUserMessage = async (transcript) => {
    if (!transcript.trim()) return;

    // First, add the message immediately without analysis
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: transcript,
      timestamp: new Date(),
      analysis: null // Initially null to show loading state
    };
    setMessages(prev => [...prev, userMessage]);

    // Start AI response generation immediately
    try {
      const result = await chatSession.sendMessage(
        `Based on the scenario: "${scenarioData.scenario.scenario}", and the user's message: "${transcript}", provide a natural response as the customer in ${availableLanguages.find(lang => lang.code === selectedLanguage)?.name || 'English'}. Keep the response concise and conversational.`
      );
      const aiResponse = result.response.text();

      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error generating AI response:', error);
    }

    // Perform analysis in the background
    try {
      const analysis = await analyzeResponse(transcript, scenarioData.scenario.scenario);
      // Update the message with analysis results
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id
          ? { ...msg, analysis }
          : msg
      ));
    } catch (error) {
      console.error('Error analyzing response:', error);
      // Update the message with error state
      setMessages(prev => prev.map(msg =>
        msg.id === userMessage.id
          ? { ...msg, analysis: { error: 'Failed to analyze response' } }
          : msg
      ));
    }
  };

  const toggleListening = async () => {
    if (isListening) {
      recognition?.stop();
      // Only process final transcript in manual mode
      if (speechMode === 'manual' && finalTranscriptRef.current) {
        await handleUserMessage(finalTranscriptRef.current);
      }
      // Only clear buffers in manual mode
      if (speechMode === 'manual') {
        transcriptBufferRef.current = '';
        finalTranscriptRef.current = '';
      }
    } else {
      try {
        await recognition?.start();
      } catch (error) {
        setIsListening(false);
      }
    }
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
    if (isListening) {
      recognition?.stop();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Welcome Message with Language Selection */}
      {!hasInitialMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-xl shadow-lg p-6 border border-blue-100 dark:border-blue-900"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sẵn sàng bắt đầu phỏng vấn
              </h3>
              <p className="mt-1 text-gray-600 dark:text-gray-400 font-semibold">
              Chọn ngôn ngữ phù hợp để bắt đầu cuộc trò chuyện
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header with Timer and Controls */}
      <div className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 
        ${timeRemaining <= 60 && !isTimeUp 
          ? 'border-red-500/50 shadow-red-500/20' 
          : 'border-transparent'}`}
      >
        {/* Background pulse effect when time is low */}
        {timeRemaining <= 60 && !isTimeUp && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 animate-pulse" />
        )}
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${
              timeRemaining <= 60 && !isTimeUp 
                ? 'bg-gradient-to-r from-red-500 to-orange-500 animate-pulse' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}>
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${
                timeRemaining <= 60 && !isTimeUp 
                  ? 'text-red-500' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
              }`}>
                Cài đặt phỏng vấn
              </h2>
              <p className={`text-sm font-semibold ${
                timeRemaining <= 60 && !isTimeUp 
                  ? 'text-red-500/70' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} còn lại
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Select
              value={selectedLanguage}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="w-[180px] border-2 hover:border-blue-500/50 transition-colors font-semibold">
                <SelectValue placeholder="Chọn ngôn ngữ" />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSpeechMode(prev => prev === 'continuous' ? 'manual' : 'continuous')}
              className="gap-2 border-2 hover:border-purple-500/50 transition-colors font-semibold"
            >
              {speechMode === 'continuous' ? (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Thủ công
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Tự động
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={togglePause}
              className={`gap-2 border-2 transition-colors font-semibold ${
                timeRemaining <= 60 && !isTimeUp 
                  ? 'hover:border-red-500/50' 
                  : 'hover:border-blue-500/50'
              }`}
            >
              {isPaused ? (
                <>
                  <PlayCircle className="w-4 h-4" />
                  Bắt đầu
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4" />
                  Tạm dừng
                </>
              )}
            </Button>

            <Button
              variant={isListening ? "destructive" : "default"}
              size="sm"
              onClick={toggleListening}
              disabled={isTimeUp || isPaused}
              className={`gap-2 transition-all duration-300 font-semibold ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  Dừng
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Ghi âm câu trả lời
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Scenario Context with improved styling */}
      <Card className="bg-white dark:bg-gray-800 border-2 hover:border-blue-500/20 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Kịch bản phỏng vấn</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2 font-semibold"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Thu gọn
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Mở rộng
                </>
              )}
            </Button>
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="text-gray-600 dark:text-gray-400 font-semibold">
                  {scenarioData.scenario.scenario}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Conversation */}
      <ConversationBox messages={messages} />

      {/* Time Up Alert with improved styling */}
      {isTimeUp && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-medium text-gradient bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Hết Giờ!
            </h3>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Tuyệt vời! đang phân tích buổi phỏng vấn...
          </p>
        </motion.div>
      )}

      {/* Analysis Overlay */}
      {isAnalyzing && <AnalysisOverlay />}
    </motion.div>
  );
};

export default ScenarioContent; 