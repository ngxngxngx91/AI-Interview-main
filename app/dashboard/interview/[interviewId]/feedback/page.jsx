"use client"
import { db } from '@/utils/db'
import { UserAnswer, OverallFeedback } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
    Trophy,
    ChevronDown,
    Star,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Lightbulb,
    MessageSquare,
    AlertCircle,
    Video
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import confetti from 'canvas-confetti'

function Feedback({ params }) {
    const [feedbackList, setFeedbackList] = useState([]);
    const [bodyLanguageFeedback, setBodyLanguageFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const router = useRouter();

    useEffect(() => {
        getFeedback();
        // Trigger confetti animation on load
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, []);

    const getFeedback = async () => {
        try {
            setIsLoading(true);
            const [answerResults, bodyLanguageResults] = await Promise.all([
                db.select()
                    .from(UserAnswer)
                    .where(eq(UserAnswer.mockIdRef, params.interviewId))
                    .orderBy(UserAnswer.id),
                db.select()
                    .from(OverallFeedback)
                    .where(eq(OverallFeedback.mockIdRef, params.interviewId))
                    .orderBy(OverallFeedback.createdAt, "desc")
                    .limit(1)
            ]);

            setFeedbackList(answerResults);
            if (bodyLanguageResults.length > 0) {
                const latestFeedback = bodyLanguageResults[0];
                console.log("Latest feedback timestamp:", latestFeedback.createdAt);
                setBodyLanguageFeedback(latestFeedback.bodyLanguageFeedback);
            }
        } catch (error) {
            console.error("Error fetching feedback:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateOverallScore = () => {
        if (!feedbackList.length) return 0;
        const ratings = feedbackList.map(item => {
            const rating = item.rating.toLowerCase();
            if (rating.includes('excellent')) return 5;
            if (rating.includes('good')) return 4;
            if (rating.includes('average')) return 3;
            if (rating.includes('fair')) return 2;
            return 1;
        });
        return (ratings.reduce((a, b) => a + b, 0) / (ratings.length * 5)) * 100;
    };

    const handleRewatchInterview = () => {
        // Temporary placeholder - will be updated once we know how to access the video
        alert('This feature is coming soon! Video playback will be available in a future update.');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl" />
                    <div className="relative p-8 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="mt-4 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Analyzing your performance...
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (feedbackList?.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
            >
                <Card className="w-full max-w-md text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 blur-xl" />
                    <CardHeader className="relative">
                        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                            <AlertCircle className="h-6 w-6 text-yellow-500" />
                            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                No Interview Record
                            </span>
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            We couldn't find any interview records for this session.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                        <Button
                            onClick={() => router.replace("/dashboard")}
                            className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    const overallScore = calculateOverallScore();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-8 px-4"
        >
            {/* Enhanced Header Section */}
            <div className="container mx-auto text-center mb-12">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-2xl" />
                    <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-6 relative z-10" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-3">
                        Interview Complete!
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Great job! Here's your comprehensive performance analysis
                    </p>
                </motion.div>
            </div>

            {/* Enhanced Overall Score Card */}
            <div className="container mx-auto max-w-4xl">
                <Card className="mb-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-xl" />
                    <CardHeader className="relative">
                        <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Overall Performance
                        </CardTitle>
                        <CardDescription>Your interview performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">Overall Score</span>
                                    <span className="text-sm font-medium">{Math.round(overallScore)}%</span>
                                </div>
                                <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${overallScore}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                    />
                                </div>
                            </div>

                            {bodyLanguageFeedback && (
                                <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                                    <h3 className="font-semibold flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-300">
                                        <MessageSquare className="h-4 w-4" />
                                        Body Language Analysis
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        {bodyLanguageFeedback.split(',').map((feedback, index) => (
                                            <motion.li
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                                            >
                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                                                <span>{feedback.trim()}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Enhanced Question Analysis Section */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Question-by-Question Analysis
                    </h2>
                    {feedbackList.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Collapsible
                                open={selectedQuestion === index}
                                onOpenChange={() => setSelectedQuestion(selectedQuestion === index ? null : index)}
                            >
                                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg">
                                    <CollapsibleTrigger className="w-full">
                                        <div className="p-4 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <Badge 
                                                    variant="outline"
                                                    className="bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                                                >
                                                    Q{index + 1}
                                                </Badge>
                                                <span className="font-medium text-left group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {item.question}
                                                </span>
                                            </div>
                                            <ChevronDown 
                                                className={`h-5 w-5 transition-transform duration-300 ${
                                                    selectedQuestion === index ? "transform rotate-180" : ""
                                                }`}
                                            />
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <CardContent className="space-y-4 pt-0">
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                                className="space-y-4"
                                            >
                                                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                                                    <Star className="h-5 w-5 text-yellow-500" />
                                                    <span className="font-medium">Rating: {item.rating}</span>
                                                </div>

                                                <div className="space-y-4">
                                                    {/* Your Answer Section */}
                                                    <div className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                                                        <h3 className="font-medium mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                                            <MessageSquare className="h-4 w-4" />
                                                            Your Answer
                                                        </h3>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{item.userAns}</p>
                                                    </div>

                                                    {/* Suggested Answer Section */}
                                                    <div className="p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                                                        <h3 className="font-medium mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                            Suggested Answer
                                                        </h3>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{item.suggestAns}</p>
                                                    </div>

                                                    {/* Feedback Section */}
                                                    <div className="p-4 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                                                        <h3 className="font-medium mb-2 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                                                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                                                            Feedback & Improvements
                                                        </h3>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">{item.feedback}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>
                        </motion.div>
                    ))}
                </div>

                {/* Enhanced Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center gap-4 mt-12"
                >
                    <Button
                        variant="outline"
                        onClick={() => router.replace("/dashboard")}
                        className="gap-2 border-2 hover:border-blue-500/50 transition-all duration-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Return to Dashboard
                    </Button>
                    <Button
                        onClick={handleRewatchInterview}
                        className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                        <Video className="h-4 w-4" />
                        Rewatch Interview
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default Feedback;