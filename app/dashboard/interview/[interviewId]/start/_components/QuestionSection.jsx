import { LightbulbIcon, Volume2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Constants
const INTERVIEW_TIPS = [
  'Structure your answer using the STAR method',
  'Maintain eye contact with the camera',
  'Speak clearly and at a moderate pace',
  'Use relevant examples from your experience',
];

const ANIMATION_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

// Sub-components
const QuestionNavigation = ({ questions, activeIndex, onQuestionChange }) => (
  <Card className="border-2 border-transparent hover:border-blue-500/20 transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
    <CardHeader className="pb-3">
      <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Interview Progress
      </CardTitle>
      <CardDescription>Track your journey through the questions</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-2">
        {questions.map((_, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Badge
              variant={activeIndex === index ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 text-sm transition-all duration-300 ${
                activeIndex === index
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg'
                  : 'hover:border-blue-500/50'
              }`}
              onClick={() => onQuestionChange(index)}
            >
              Q{index + 1}
            </Badge>
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const CurrentQuestion = ({ question, questionIndex, isSpeaking, onSpeak }) => (
  <Card className="border-2">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-center">
        <CardTitle>Question {questionIndex + 1}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSpeak(question)}
          className={`transition-all ${isSpeaking ? 'text-primary' : ''}`}
        >
          <Volume2 className="h-5 w-5" />
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-lg leading-relaxed">{question}</p>
    </CardContent>
  </Card>
);

const TipsSection = ({ showTips, setShowTips, bodyLanguageFeedback }) => (
  <Card className="border-2 border-primary/20 bg-primary/5">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-center">
        <CardTitle className="flex items-center gap-2">
          <LightbulbIcon className="h-5 w-5 text-primary" />
          Interview Tips
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTips(!showTips)}
        >
          {showTips ? 'Hide' : 'Show'} Tips
        </Button>
      </div>
    </CardHeader>
    <AnimatePresence>
      {showTips && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Key Reminders:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {INTERVIEW_TIPS.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </motion.div>
      )}
    </AnimatePresence>
  </Card>
);

const NavigationButtons = ({ activeIndex, totalQuestions, onPrevious, onNext, interviewId }) => (
  <div className="flex justify-between items-center pt-4">
    <Button
      variant="outline"
      onClick={onPrevious}
      disabled={activeIndex === 0}
      className="flex items-center gap-2"
    >
      <ChevronLeft className="h-4 w-4" /> Previous
    </Button>

    {activeIndex === totalQuestions - 1 ? (
      <Link href={`/dashboard/interview/${interviewId}/feedback`}>
        <Button 
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          Get Results and Feedbacks
        </Button>
      </Link>
    ) : (
      <Button
        onClick={onNext}
        className="flex items-center gap-2"
      >
        Next <ChevronRight className="h-4 w-4" />
      </Button>
    )}
  </div>
);

// Main Component
function QuestionSection({ 
  mockInterviewQuestion, 
  activeQuestionIndex, 
  setActiveQuestionIndex, 
  interviewData, 
  bodyLanguageFeedback 
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTips, setShowTips] = useState(true);

  const handleTextToSpeech = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Sorry, your browser does not support text-to-speech');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const speech = new SpeechSynthesisUtterance(text);
    speech.onend = () => setIsSpeaking(false);
    speech.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(speech);
  };

  if (!mockInterviewQuestion) return null;

  return (
    <div className="space-y-6">
      <QuestionNavigation 
        questions={mockInterviewQuestion}
        activeIndex={activeQuestionIndex}
        onQuestionChange={setActiveQuestionIndex}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeQuestionIndex}
          {...ANIMATION_VARIANTS}
        >
          <CurrentQuestion 
            question={mockInterviewQuestion[activeQuestionIndex]?.question}
            questionIndex={activeQuestionIndex}
            isSpeaking={isSpeaking}
            onSpeak={handleTextToSpeech}
          />
        </motion.div>
      </AnimatePresence>

      <TipsSection 
        showTips={showTips}
        setShowTips={setShowTips}
        bodyLanguageFeedback={bodyLanguageFeedback}
      />

      <NavigationButtons 
        activeIndex={activeQuestionIndex}
        totalQuestions={mockInterviewQuestion.length}
        onPrevious={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
        onNext={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
        interviewId={interviewData?.mockID}
      />
    </div>
  );
}

export default QuestionSection;
