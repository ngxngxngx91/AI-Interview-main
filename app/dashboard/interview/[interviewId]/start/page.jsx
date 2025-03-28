"use client";
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import QuestionSection from './_components/QuestionSection';
import RecordAnswerSection from './_components/RecordAnswerSection';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

// Animation variants
const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  slideInLeft: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { delay: 0.2 }
  },
  slideInRight: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { delay: 0.4 }
  }
};

// Sub-components
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl" />
      <div className="relative p-8 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Preparing Your Interview...
        </p>
      </div>
    </motion.div>
  </div>
);

const ThemeToggle = ({ theme, setTheme }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    className="rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all duration-300"
  >
    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-blue-600" />
    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
  </Button>
);

const InterviewHeader = ({ currentQuestion, totalQuestions, theme, setTheme, progress }) => (
  <div className="container mx-auto px-4 py-6">
    <motion.div {...ANIMATION_VARIANTS.slideInLeft} className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl blur-xl" />
      <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Interview Session
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Question {currentQuestion} of {totalQuestions}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <div className="w-32">
              <Progress 
                value={progress} 
                className="h-2 bg-gray-200 dark:bg-gray-700"
                indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
                {Math.round(progress)}% Complete
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

// Custom Hook for Interview Data
const useInterviewData = (interviewId) => {
  const [interviewData, setInterviewData] = useState(null);
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      if (!interviewId) return;

      try {
        setIsLoading(true);
        setError(null);
        
        const result = await db.select()
          .from(MockInterview)
          .where(eq(MockInterview.mockID, interviewId));

        if (result.length > 0) {
          const jsonMockResp = JSON.parse(result[0]?.jsonMockResp || "[]");
          setMockInterviewQuestion(jsonMockResp);
          setInterviewData(result[0]);
        } else {
          setError("No interview data found.");
        }
      } catch (error) {
        console.error("Error fetching interview details:", error);
        setError("Failed to load interview data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviewDetails();
  }, [interviewId]);

  return { interviewData, mockInterviewQuestion, isLoading, error };
};

// Main Component
function StartInterview({ params }) {
  const { theme, setTheme } = useTheme();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [videoBlob, setVideoBlob] = useState(null);
  const [bodyLanguageFeedback, setBodyLanguageFeedback] = useState(null);
  
  const { 
    interviewData, 
    mockInterviewQuestion, 
    isLoading, 
    error 
  } = useInterviewData(params.interviewId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  const progress = ((activeQuestionIndex + 1) / mockInterviewQuestion.length) * 100;

  return (
    <motion.div 
      {...ANIMATION_VARIANTS.fadeIn} 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
    >
      <div className="container mx-auto px-4 py-6">
        <motion.div {...ANIMATION_VARIANTS.slideInLeft} className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl blur-xl" />
          <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Interview Session
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Question {activeQuestionIndex + 1} of {mockInterviewQuestion.length}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle theme={theme} setTheme={setTheme} />
                <div className="w-32">
                  <Progress 
                    value={progress} 
                    className="h-2 bg-gray-200 dark:bg-gray-700"
                    indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">
                    {Math.round(progress)}% Complete
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            {...ANIMATION_VARIANTS.slideInLeft}
            className="lg:sticky lg:top-6"
          >
            <QuestionSection
              mockInterviewQuestion={mockInterviewQuestion}
              activeQuestionIndex={activeQuestionIndex}
              setActiveQuestionIndex={setActiveQuestionIndex}
              interviewData={interviewData}
              setVideoBlob={setVideoBlob}
              bodyLanguageFeedback={bodyLanguageFeedback}
            />
          </motion.div>

          <motion.div {...ANIMATION_VARIANTS.slideInRight}>
            <RecordAnswerSection
              mockInterviewQuestion={mockInterviewQuestion}
              activeQuestionIndex={activeQuestionIndex}
              interviewData={interviewData}
              setVideoBlob={setVideoBlob}
              setBodyLanguageFeedback={setBodyLanguageFeedback}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default StartInterview;
