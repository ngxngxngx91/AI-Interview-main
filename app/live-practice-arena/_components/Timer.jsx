"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer as TimerIcon, 
  AlertCircle, 
  PauseCircle, 
  PlayCircle,
  Bell
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Timer = ({ timeRemaining, isPaused, isTimeUp, onTogglePause }) => {
  const audioContext = useRef(null);
  const [showWarning, setShowWarning] = useState(false);
  const [showBeep, setShowBeep] = useState(false);
  const progressRef = useRef(null);

  // Initialize Audio Context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const playBeep = () => {
    if (audioContext.current) {
      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.current.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);

      oscillator.start();
      oscillator.stop(audioContext.current.currentTime + 0.1);
    }
  };

  // Handle warnings and beeps
  useEffect(() => {
    if (timeRemaining === 30 && !isPaused && !isTimeUp) {
      setShowWarning(true);
      setShowBeep(true);
      playBeep();
      setTimeout(() => setShowBeep(false), 1000);
    }
  }, [timeRemaining, isPaused, isTimeUp]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerStyles = () => {
    if (isTimeUp) return 'text-red-500';
    if (timeRemaining <= 30) return 'text-red-500 animate-pulse';
    return 'text-primary';
  };

  const getProgressColor = () => {
    if (isTimeUp) return 'bg-red-500';
    if (timeRemaining <= 30) return 'bg-red-500';
    return 'bg-primary';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TimerIcon className={`w-5 h-5 ${getTimerStyles()}`} />
            </div>
            <div>
              <h3 className="font-semibold">Practice Timer</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isPaused ? 'Timer Paused' : 'Time Remaining'}
              </p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onTogglePause}
                  className="gap-2"
                >
                  {isPaused ? (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <PauseCircle className="w-4 h-4" />
                      Pause
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to {isPaused ? 'resume' : 'pause'} the timer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            key={timeRemaining}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <span className={`text-4xl font-bold tracking-wider ${getTimerStyles()}`}>
              {formatTime(timeRemaining)}
            </span>
            <AnimatePresence>
              {showBeep && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-6 -top-6"
                >
                  <Bell className="w-6 h-6 text-red-500 animate-bounce" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={(timeRemaining / (timeRemaining + 1)) * 100} 
            className={`h-2 ${getProgressColor()}`}
            ref={progressRef}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Time Remaining</span>
            <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Warning Badge */}
        <AnimatePresence>
          {showWarning && timeRemaining <= 30 && !isTimeUp && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2 text-red-500"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Less than 30 seconds remaining!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Timer; 