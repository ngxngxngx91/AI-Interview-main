"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    MessageSquare,
    Sparkles,
    Mic,
    MicOff,
    AlertCircle,
    Globe,
    PlayCircle,
    PauseCircle,
    Clock,
    Bell,
    XCircle
} from 'lucide-react';
import Message from './Message';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
    onStopInterview
}) => {
    const messagesEndRef = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef(null);
    const [showWarning, setShowWarning] = useState(false);
    const [showBeep, setShowBeep] = useState(false);
    const audioContext = useRef(null);
    const [showConfirm, setShowConfirm] = useState(false);

    // Audio context for beep
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return () => audioContext.current?.close();
    }, []);

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

    // Show warning and beep at 30 seconds
    useEffect(() => {
        if (timeRemaining === 30 && !isPaused && !isTimeUp) {
            setShowWarning(true);
            setShowBeep(true);
            playBeep();
            setTimeout(() => setShowBeep(false), 1000);
        }
    }, [timeRemaining, isPaused, isTimeUp]);

    // Scroll handling
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowScrollButton(false);
    };
    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
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

    // Timer formatting and style
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    const getTimerStyles = () => {
        if (isTimeUp) return 'text-red-500';
        if (timeRemaining <= 30) return 'text-red-500 animate-pulse';
        return 'text-blue-400';
    };

    // Empty state
    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-4">
                <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
        </div>
    );

    // Message list
    const renderMessages = () => (
        <div className="space-y-4 p-4">
            <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05, type: "spring", stiffness: 100, damping: 15 }}
                    >
                        <Message message={message} />
                    </motion.div>
                ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-blue-700/40 hover:border-blue-500/40 transition-all duration-300"
        >
            {/* Header - More compact */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-blue-700/40 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-t-2xl">
                {/* Left: Title and Status - More compact */}
                <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <h3 className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate">
                                Interview Box
                            </h3>
                            {messages.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-green-900/60 text-green-300 animate-pulse">Active</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Center: Timer and Controls - More compact */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-800/50 border border-blue-700/40">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <motion.span
                            key={timeRemaining}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`text-sm font-bold ${getTimerStyles()}`}
                        >
                            {formatTime(timeRemaining)}
                        </motion.span>
                        <AnimatePresence>
                            {showBeep && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                >
                                    <Bell className="w-3.5 h-3.5 text-red-500 animate-bounce" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex items-center gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onTogglePause}
                                        disabled={!selectedLanguage}
                                        className={`gap-1.5 border-2 transition-colors font-semibold h-8 px-2.5 ${!selectedLanguage
                                                ? 'border-gray-700/40 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                                                : timeRemaining <= 30 && !isTimeUp
                                                    ? 'border-red-500/50 hover:border-red-500/80 bg-gray-800 text-gray-100'
                                                    : 'border-blue-700/40 hover:border-blue-500/50 bg-gray-800 text-gray-100'
                                            }`}
                                    >
                                        {isPaused ? (
                                            <>
                                                <PlayCircle className="w-3.5 h-3.5" />
                                                Start
                                            </>
                                        ) : (
                                            <>
                                                <PauseCircle className="w-3.5 h-3.5" />
                                                Pause
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{!selectedLanguage ? 'Please select a language first' : isPaused ? 'Start the interview' : 'Pause the interview'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="relative">
                                        <Button
                                            variant={isListening ? "destructive" : "default"}
                                            size="sm"
                                            onClick={onToggleListening}
                                            disabled={isTimeUp || isPaused || !selectedLanguage}
                                            className={`gap-1.5 transition-all duration-300 font-semibold h-8 px-2.5 ${isListening
                                                    ? 'bg-red-500 hover:bg-red-600'
                                                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                                                }`}
                                        >
                                            {isListening ? (
                                                <>
                                                    <MicOff className="w-3.5 h-3.5" />
                                                    Stop
                                                </>
                                            ) : (
                                                <>
                                                    <Mic className="w-3.5 h-3.5" />
                                                    Record
                                                </>
                                            )}
                                        </Button>
                                        {isListening && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"
                                            />
                                        )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{isListening ? 'Click to stop recording' : 'Click to start recording your answer'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* Right: End Interview button - More compact */}
                <div className="flex items-center gap-2">
                    {(messages.length > 0 || !isPaused) && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setShowConfirm(true)}
                                        disabled={isTimeUp}
                                        className="gap-1.5 font-semibold h-8 px-3 opacity-60 hover:opacity-80 focus:opacity-80 transition-opacity"
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                        End Interview
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>End the interview and view feedback</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {/* Language Selector - More compact */}
                    {!selectedLanguage && (
                        <div className="flex items-center gap-2">
                            <Select
                                value={selectedLanguage}
                                onValueChange={onLanguageChange}
                            >
                                <SelectTrigger className="w-[100px] h-8 border-2 border-blue-700/40 hover:border-blue-500/50 transition-colors font-semibold bg-gray-800 text-gray-100">
                                    <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableLanguages.map((lang) => (
                                        <SelectItem key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            {/* Warning Message - More compact */}
            <AnimatePresence>
                {showWarning && timeRemaining <= 30 && !isTimeUp && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center gap-2 text-red-300 bg-red-900/30 rounded-lg px-2 py-1.5 mx-3 mt-2"
                    >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-xs">Less than 30 seconds remaining!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages Container - Expanded height */}
            <div
                ref={containerRef}
                className="h-[calc(100vh-12rem)] overflow-y-auto scroll-smooth relative bg-gradient-to-br from-gray-900/60 to-gray-800/80"
            >
                {messages.length === 0 ? renderEmptyState() : renderMessages()}
            </div>

            {/* Scroll to Bottom Button - More compact */}
            <AnimatePresence>
                {showScrollButton && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute bottom-3 right-3"
                    >
                        <Button
                            size="icon"
                            onClick={scrollToBottom}
                            className="h-8 w-8 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        >
                            <ChevronDown className="w-3.5 h-3.5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Stop Dialog - More compact */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>End Interview?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to stop the interview? You will be taken to the feedback page and cannot return to this session.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirm(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => { setShowConfirm(false); onStopInterview(); }}>
                            Yes, End Interview
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default ConversationBox; 