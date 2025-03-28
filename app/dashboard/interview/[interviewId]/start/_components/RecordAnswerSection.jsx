import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModal";
import { UserAnswer, OverallFeedback } from "@/utils/schema";
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Camera, CameraOff, Loader2, Timer, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { eq, inArray } from "drizzle-orm";

function RecordAnswerSection({ mockInterviewQuestion, activeQuestionIndex, interviewData, setBodyLanguageFeedback }) {
    const [userAnswer, setUserAnswer] = useState("");
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [isInterviewRecording, setIsInterviewRecording] = useState(false);
    // Temporarily disabled for Vercel deployment
    // const [isAnalyzing, setIsAnalyzing] = useState(false);
    // const [cameraEnabled, setCameraEnabled] = useState(true);
    const [audioTranscriptProgress, setAudioTranscriptProgress] = useState(0);
    const [timeLimit, setTimeLimit] = useState(120); // Default 2 minutes
    const [remainingTime, setRemainingTime] = useState(timeLimit);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [answerDuration, setAnswerDuration] = useState(0);
    const [isReadyToAnswer, setIsReadyToAnswer] = useState(false);
    const timerRef = useRef(null);

    // Temporarily disabled for Vercel deployment
    // // Webcam and Video Recording
    // const webcamRef = useRef(null);
    // const mediaRecorderRef = useRef(null);
    // const recordedChunks = useRef([]);

    // Speech-to-Text
    const {
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults
    } = useSpeechToText({ continuous: true, useLegacyResults: false });

    useEffect(() => {
        if (results.length > 0) {
            setUserAnswer(results.map(result => result.transcript).join(" "));
            setAudioTranscriptProgress(prev => Math.min(100, prev + 10));
        }
    }, [results]);

    useEffect(() => {
        if (!isRecording && userAnswer.length > 10) {
            UpdateUserAnswer();
        }
    }, [userAnswer]);

    useEffect(() => {
        if (isTimerRunning && remainingTime > 0) {
            timerRef.current = setInterval(() => {
                setRemainingTime(prev => {
                    if (prev <= 1) {
                        stopSpeechToText();
                        clearInterval(timerRef.current);
                        setIsTimerRunning(false);
                        toast.warning("Time's up! Recording stopped.");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTimerRunning]);

    useEffect(() => {
        setTimeLimit(120);
        setRemainingTime(120);
        setIsTimerRunning(false);
        if (isInterviewRecording) {
            setIsReadyToAnswer(true);
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    }, [activeQuestionIndex, isInterviewRecording]);

    // Temporarily disabled for Vercel deployment
    // useEffect(() => {
    //     if (cameraEnabled) {
    //         if (webcamRef.current) {
    //             webcamRef.current.video = null;
    //         }
    //     } else {
    //         if (mediaRecorderRef.current) {
    //             mediaRecorderRef.current = null;
    //         }
    //         recordedChunks.current = [];
    //     }
    // }, [cameraEnabled]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startInterviewRecording = () => {
        // Temporarily disabled for Vercel deployment
        // if (cameraEnabled) {
        //     if (!webcamRef.current?.video?.srcObject) {
        //         setTimeout(() => {
        //             if (!webcamRef.current?.video?.srcObject) {
        //                 toast.error("Webcam not initialized. Please ensure camera access is granted.");
        //                 return;
        //             }
        //             startRecording();
        //         }, 1000);
        //         return;
        //     }
        //     startRecording();
        // } else {
            setIsInterviewRecording(true);
            setIsReadyToAnswer(true);
            setRemainingTime(timeLimit);
            toast.success("Ready to record. Click 'Start Answer Recording' to begin.");
        // }
    };

    // Temporarily disabled for Vercel deployment
    // const startRecording = () => {
    //     if (cameraEnabled) {
    //         try {
    //             recordedChunks.current = [];
    //             const stream = webcamRef.current.video.srcObject;
    //             const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    //             mediaRecorder.ondataavailable = (event) => {
    //                 if (event.data.size > 0) recordedChunks.current.push(event.data);
    //             };
    //             mediaRecorder.onstop = async () => {
    //                 if (recordedChunks.current.length > 0) {
    //                     const blob = new Blob(recordedChunks.current, { type: "video/webm" });
    //                     console.log("Recorded Interview Video Blob:", blob);

    //                     setIsAnalyzing(true);
    //                     toast.info("Analyzing body language... Please wait.");

    //                     try {
    //                         const bodyLanguageAnalysis = await analyzeBodyLanguage(blob);
    //                         console.log("Received Body Language Feedback:", bodyLanguageAnalysis);

    //                         if (bodyLanguageAnalysis && bodyLanguageAnalysis.bodyLanguageFeedback) {
    //                             setBodyLanguageFeedback(bodyLanguageAnalysis.bodyLanguageFeedback);
    //                             toast.success("Body language analysis complete!");

    //                             await db.delete(OverallFeedback)
    //                                 .where(eq(OverallFeedback.mockIdRef, interviewData?.mockID));

    //                             await db.insert(OverallFeedback).values({
    //                                 mockIdRef: interviewData?.mockID,
    //                                 userEmail: user?.primaryEmailAddress?.emailAddress,
    //                                 createdAt: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
    //                                 bodyLanguageFeedback: Array.isArray(bodyLanguageAnalysis.bodyLanguageFeedback) 
    //                                     ? bodyLanguageAnalysis.bodyLanguageFeedback.join(", ") 
    //                                     : bodyLanguageAnalysis.bodyLanguageFeedback
    //                             });
    //                         } else {
    //                             console.log("No valid feedback received from API");
    //                             toast.error("Failed to retrieve body language feedback.");
    //                         }
    //                     } catch (error) {
    //                         console.error("Error analyzing body language:", error);
    //                         toast.error("Error analyzing body language.");
    //                     } finally {
    //                         setIsAnalyzing(false);
    //                     }
    //                 }
    //             };
    //             mediaRecorderRef.current = mediaRecorder;
    //             mediaRecorder.start();
    //             setIsInterviewRecording(true);
    //             setIsReadyToAnswer(true);
    //             toast.success("Video recording started! Click 'Start Answer Recording' when you're ready to answer.");
    //         } catch (error) {
    //             console.error("Error starting MediaRecorder:", error);
    //             toast.error("Failed to start recording. Please try again.");
    //             return;
    //         }
    //     }
    // };

    const stopInterviewRecording = () => {
        // Temporarily disabled for Vercel deployment
        // if (cameraEnabled && mediaRecorderRef.current && isInterviewRecording) {
        //     mediaRecorderRef.current.stop();
        // }
        setIsInterviewRecording(false);
        setIsReadyToAnswer(false);
        setIsTimerRunning(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        toast.success("Recording stopped.");
    };

    // Temporarily disabled for Vercel deployment
    // const analyzeBodyLanguage = async (videoBlob) => {
    //     const formData = new FormData();
    //     formData.append("video", videoBlob, "interview-video.mp4");

    //     try {
    //         const response = await fetch("http://127.0.0.1:8000/analyze-body-language/", {
    //             method: "POST",
    //             body: formData,
    //         });

    //         if (!response.ok) {
    //             throw new Error(`Server response was not OK: ${response.status}`);
    //         }

    //         const result = await response.json();
            
    //         if (result?.bodyLanguageFeedback) {
    //             await db.delete(OverallFeedback)
    //                 .where(eq(OverallFeedback.mockIdRef, interviewData?.mockID));

    //             await db.insert(OverallFeedback).values({
    //                 mockIdRef: interviewData?.mockID,
    //                 userEmail: user?.primaryEmailAddress?.emailAddress,
    //                 createdAt: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
    //                 bodyLanguageFeedback: Array.isArray(result.bodyLanguageFeedback) 
    //                     ? result.bodyLanguageFeedback.join(", ") 
    //                     : result.bodyLanguageFeedback
    //             });
    //         }

    //         return result;
    //     } catch (error) {
    //         console.error("Error analyzing video:", error);
    //         throw error;
    //     }
    // };

    const UpdateUserAnswer = async () => {
        if (!userAnswer || userAnswer.trim().length === 0) return;

        setLoading(true);
        try {
            const existingAnswers = await db.select().from(UserAnswer)
                .where(eq(UserAnswer.mockIdRef, interviewData?.mockID));

            const questionExists = existingAnswers.some(answer => 
                answer.questionIndex === activeQuestionIndex
            );

            if (questionExists) {
                await db.delete(UserAnswer)
                    .where(inArray(UserAnswer.mockIdRef, [interviewData?.mockID]))
                    .where(inArray(UserAnswer.questionIndex, [activeQuestionIndex]));
            }

            await db.insert(UserAnswer).values({
                mockIdRef: interviewData?.mockID,
                userEmail: user?.primaryEmailAddress?.emailAddress,
                questionIndex: activeQuestionIndex,
                userAnswer: userAnswer,
                createdAt: moment().format("YYYY-MM-DD HH:mm:ss.SSS"),
            });

            const prompt = `You are an AI Interview Coach. Analyze the following answer to the question: "${mockInterviewQuestion}"\n\nCandidate's Answer: "${userAnswer}"\n\nProvide constructive feedback on:\n1. Content relevance\n2. Clarity and structure\n3. Areas for improvement\n4. Positive aspects\n\nBe specific and professional.`;

            const result = await chatSession.sendMessage(prompt);
            console.log("AI Feedback:", result.response.text());

        } catch (error) {
            console.error("Error updating answer:", error);
            toast.error("Failed to save answer. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleStartAnswer = () => {
        startSpeechToText();
        setIsTimerRunning(true);
        toast.success("Answer recording started!");
    };

    const handleStopAnswer = () => {
        stopSpeechToText();
        setIsTimerRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        toast.success("Answer recording completed!");
    };

    return (
        <div className="space-y-4">
            <Card className="border-2 border-transparent hover:border-blue-500/20 transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Record Your Answer
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                            <div className="flex items-center space-x-2">
                                <Timer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    Time Remaining: {formatTime(remainingTime)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-700 dark:text-gray-300">Time Limit (seconds)</Label>
                            <Input
                                type="number"
                                value={timeLimit}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (value > 0) {
                                        setTimeLimit(value);
                                        setRemainingTime(value);
                                    }
                                }}
                                min="1"
                                disabled={isTimerRunning}
                                className="border-2 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="flex justify-between space-x-2">
                            {!isInterviewRecording ? (
                                <Button
                                    onClick={startInterviewRecording}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                                >
                                    Start Interview Session
                                </Button>
                            ) : (
                                <Button
                                    onClick={stopInterviewRecording}
                                    variant="destructive"
                                    className="flex-1"
                                >
                                    End Interview Session
                                </Button>
                            )}
                        </div>

                        <AnimatePresence>
                            {isReadyToAnswer && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="flex justify-between space-x-2">
                                        {!isRecording ? (
                                            <Button
                                                onClick={handleStartAnswer}
                                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                                                disabled={loading || !isInterviewRecording}
                                            >
                                                <Mic className="mr-2 h-4 w-4" />
                                                Start Answer Recording
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleStopAnswer}
                                                variant="destructive"
                                                className="flex-1"
                                                disabled={loading}
                                            >
                                                <MicOff className="mr-2 h-4 w-4" />
                                                Stop Answer Recording
                                            </Button>
                                        )}
                                    </div>

                                    {loading && (
                                        <div className="flex items-center justify-center space-x-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Processing your answer...</span>
                                        </div>
                                    )}

                                    {userAnswer && (
                                        <div className="space-y-2">
                                            <Label>Your Answer (Transcript)</Label>
                                            <div className="rounded-lg border p-4 text-sm">
                                                {userAnswer}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default RecordAnswerSection;
