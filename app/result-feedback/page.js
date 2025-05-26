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

    useEffect(() => {
        const sessionParam = searchParams.get("session");
        if (sessionParam) {
            try {
                const decodedData = JSON.parse(decodeURIComponent(sessionParam));
                setSessionData(decodedData);
            } catch (error) {
                console.error("Error parsing session data:", error);
                router.push("/dashboard");
            }
        } else {
            router.push("/dashboard");
        }
        setIsLoading(false);
    }, [searchParams, router]);

    const handleSavePDF = () => {
        generateSessionPDF(sessionData);
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

    const averageScore = Math.round(
        sessionData.conversation
            .filter(msg => msg.type === 'user' && msg.analysis?.overallScore)
            .reduce((acc, msg) => acc + msg.analysis.overallScore, 0) /
        sessionData.conversation.filter(msg => msg.type === 'user' && msg.analysis?.overallScore).length
    );

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 origin-left z-50"
                style={{ scaleX }}
            />

            {/* Fixed Top Bar */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-gray-900/90 via-blue-900/80 to-purple-900/90 backdrop-blur-lg border-b border-blue-700/40 z-40 shadow-lg"
            >
                <div className="max-w-4xl mx-auto px-4 h-full flex items-center justify-between">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg"
                    >
                        Interview Feedback
                    </motion.h1>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/dashboard")}
                            className="hover:bg-blue-900/30 text-blue-300 border border-blue-700/40 rounded-full gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Dashboard
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/practice")}
                            className="hover:bg-purple-900/30 text-purple-300 border border-purple-700/40 rounded-full gap-2"
                        >
                            <GraduationCap className="w-4 h-4" />
                            Practice Again
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="pt-24 pb-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Score Overview Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <Card className="overflow-hidden border-2 border-blue-700/40 bg-gradient-to-br from-gray-900/80 to-blue-950/80 shadow-xl rounded-2xl backdrop-blur-lg">
                            <div className="p-6 relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 pointer-events-none" />
                                <div className="relative">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                                                {sessionData.scenario.title}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Badge variant="outline" className="bg-blue-900/40 border-blue-700/40 text-blue-300 gap-1 px-2 py-1">
                                                    <Clock className="w-4 h-4 text-blue-400" />
                                                    {Math.floor(sessionData.duration / 60)}m {sessionData.duration % 60}s
                                                </Badge>
                                                <Badge variant="outline" className="bg-purple-900/40 border-purple-700/40 text-purple-200 gap-1 px-2 py-1">
                                                    <Target className="w-4 h-4 text-purple-400" />
                                                    {sessionData.scenario.difficulty}
                                                </Badge>
                                                <Badge variant="outline" className="bg-emerald-900/40 border-emerald-700/40 text-emerald-200 gap-1 px-2 py-1">
                                                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                                                    {sessionData.conversation.length} Messages
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-400">Overall Score</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                                    {averageScore}
                                                </p>
                                            </div>
                                            <div className="w-16 h-16">
                                                <CircularProgress value={averageScore} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 font-semibold">
                        {["overview", "conversation", "feedback", "recommendations"].map((tab) => (
                            <Button
                                key={tab}
                                variant={activeTab === tab ? "default" : "outline"}
                                onClick={() => setActiveTab(tab)}
                                className={`capitalize transition-all duration-300 font-semibold rounded-full px-6 py-2 text-sm shadow-md
                                    ${activeTab === tab
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                        : 'bg-gray-900/60 border-blue-700/40 text-gray-300 hover:border-blue-500/50'}
                                `}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === "overview" && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Performance Overview */}
                                <Card className="p-6 border-blue-700/40 bg-gradient-to-br from-gray-900/80 to-blue-950/80 shadow rounded-2xl">
                                    <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-blue-400" />
                                        Analysis Overview
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-gray-400">Overall Score</span>
                                                <span className="text-sm font-medium text-blue-300">{averageScore}/100</span>
                                            </div>
                                            <Progress value={averageScore} className="h-2 bg-blue-700/40" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-green-900/30 rounded-lg">
                                                <h4 className="font-bold text-green-300 mb-2">Strengths</h4>
                                                <ul className="space-y-2">
                                                    {sessionData.conversation
                                                        .filter(msg => msg.type === 'user' && msg.analysis?.strengths)
                                                        .flatMap(msg => msg.analysis.strengths)
                                                        .filter((strength, index, self) => self.indexOf(strength) === index)
                                                        .slice(0, 3)
                                                        .map((strength, index) => (
                                                            <li key={index} className="flex items-center gap-2 text-sm text-green-200">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                {strength}
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>
                                            <div className="p-4 bg-red-900/30 rounded-lg">
                                                <h4 className="font-bold text-red-300 mb-2">Areas to Improve</h4>
                                                <ul className="space-y-2">
                                                    {sessionData.conversation
                                                        .filter(msg => msg.type === 'user' && msg.analysis?.weaknesses)
                                                        .flatMap(msg => msg.analysis.weaknesses)
                                                        .filter((weakness, index, self) => self.indexOf(weakness) === index)
                                                        .slice(0, 3)
                                                        .map((weakness, index) => (
                                                            <li key={index} className="flex items-center gap-2 text-sm text-red-200">
                                                                <XCircle className="w-4 h-4" />
                                                                {weakness}
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Key Insights */}
                                <Card className="p-6 border-blue-700/40 bg-gradient-to-br from-gray-900/80 to-blue-950/80 shadow rounded-2xl">
                                    <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                                        Detailed Analysis
                                    </h3>
                                    <div className="space-y-4">
                                        {sessionData.conversation
                                            .filter(msg => msg.type === 'user' && msg.analysis?.feedback)
                                            .map((msg, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="p-4 bg-gray-900/70 rounded-lg"
                                                >
                                                    <p className="text-gray-300">{msg.analysis.feedback}</p>
                                                </motion.div>
                                            ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === "conversation" && (
                            <motion.div
                                key="conversation"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-4"
                            >
                                {sessionData.conversation.map((message, index) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`flex items-start gap-3 ${message.type === "user" ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-4 ${message.type === "user"
                                                    ? "bg-orange-900/30 text-orange-200"
                                                    : "bg-blue-900/30 text-blue-200"
                                                }`}
                                        >
                                            <p className="text-base">{message.content}</p>
                                            {message.type === "user" && message.analysis && (
                                                <div className="mt-3 pt-3 border-t border-orange-700/40">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="font-medium">Score:</span>
                                                        <span>{message.analysis.overallScore}/100</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === "feedback" && (
                            <motion.div
                                key="feedback"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Detailed Feedback */}
                                <Card className="p-6 border-blue-700/40 bg-gradient-to-br from-gray-900/80 to-blue-950/80 shadow rounded-2xl">
                                    <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-blue-400" />
                                        Detailed Feedback
                                    </h3>
                                    <div className="space-y-6">
                                        {sessionData.conversation
                                            .filter(msg => msg.type === 'user' && msg.analysis)
                                            .map((msg, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="p-4 bg-gray-900/70 rounded-lg"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-gray-300">Message {index + 1}</span>
                                                        <Badge variant="outline" className="bg-blue-900/40 border-blue-700/40 text-blue-300">
                                                            Score: {msg.analysis.overallScore}/100
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-green-300 mb-1">Strengths</h4>
                                                            <ul className="space-y-1">
                                                                {msg.analysis.strengths.map((strength, idx) => (
                                                                    <li key={idx} className="flex items-center gap-2 text-sm text-green-200">
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                        {strength}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-medium text-red-300 mb-1">Areas to Improve</h4>
                                                            <ul className="space-y-1">
                                                                {msg.analysis.weaknesses.map((weakness, idx) => (
                                                                    <li key={idx} className="flex items-center gap-2 text-sm text-red-200">
                                                                        <XCircle className="w-4 h-4" />
                                                                        {weakness}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {activeTab === "recommendations" && (
                            <motion.div
                                key="recommendations"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <Card className="p-6 border-blue-700/40 bg-gradient-to-br from-gray-900/80 to-blue-950/80 shadow rounded-2xl">
                                    <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                        Recommendations
                                    </h3>
                                    <div className="space-y-4">
                                        {sessionData.conversation
                                            .filter(msg => msg.type === 'user' && msg.analysis?.weaknesses)
                                            .flatMap(msg => msg.analysis.weaknesses)
                                            .filter((weakness, index, self) => self.indexOf(weakness) === index)
                                            .map((weakness, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="p-4 bg-gray-900/70 rounded-lg"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-emerald-900/40 rounded-full">
                                                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-emerald-300 mb-2">
                                                                Focus on: {weakness}
                                                            </h4>
                                                            <p className="text-sm text-gray-300">
                                                                Practice this aspect in your next interview to improve your performance.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row justify-end gap-4 mt-8"
                    >
                        <Button
                            onClick={() => router.push("/dashboard")}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg transition-all duration-300 rounded-full px-6 py-3 font-semibold"
                        >
                            Back to Dashboard
                        </Button>
                        <Button
                            onClick={handleSavePDF}
                            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg transition-all duration-300 gap-2 rounded-full px-6 py-3 font-semibold"
                        >
                            <Download className="w-4 h-4" />
                            Save as PDF
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Add this new component for the circular progress
const CircularProgress = ({ value }) => (
    <div className="relative w-full h-full">
        <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
                d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#eee"
                strokeWidth="3"
                className="dark:stroke-gray-700"
            />
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