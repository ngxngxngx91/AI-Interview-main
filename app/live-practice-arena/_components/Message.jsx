"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Bot, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Star,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Message = ({ message }) => {
  const isUser = message.type === 'user';
  const hasAnalysis = message.analysis && message.type === 'user';
  const [showAnalysis, setShowAnalysis] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-green-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md
          ${isUser ? 
            'bg-gradient-to-br from-orange-400 to-rose-400' : 
            'bg-gradient-to-br from-blue-400 to-purple-400'} text-white`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </motion.div>

      {/* Message Content */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`flex-1 max-w-[80%] rounded-2xl px-4 py-3 shadow-sm
          ${isUser ? 
            'bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-950/30 dark:to-rose-950/30' : 
            'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30'}`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${isUser ? 'text-orange-900 dark:text-orange-100' : 'text-blue-900 dark:text-blue-100'}`}>
            {message.content}
          </p>
          {isUser && (
            <div className="flex items-center gap-2">
              {message.analysis === null ? (
                <Loader2 className="w-4 h-4 animate-spin text-orange-600 dark:text-orange-400" />
              ) : message.analysis.error ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className={`p-1.5 rounded-full transition-colors
                    ${showAnalysis ? 
                      'bg-orange-200 dark:bg-orange-800' : 
                      'hover:bg-orange-100 dark:hover:bg-orange-900'}`}
                >
                  {showAnalysis ? (
                    <ChevronUp className="w-4 h-4 text-orange-700 dark:text-orange-300" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-orange-700 dark:text-orange-300" />
                  )}
                </motion.button>
              )}
            </div>
          )}
        </div>
        
        {/* Analysis Section */}
        <AnimatePresence>
          {hasAnalysis && showAnalysis && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-orange-200/50 dark:border-orange-700/50"
            >
              {/* Score Badge */}
              <div className="flex items-center gap-3 mb-4">
                <Badge 
                  className={`bg-gradient-to-r ${getScoreColor(message.analysis.overallScore)} text-white px-3 py-1`}
                >
                  <Star className="w-3.5 h-3.5 mr-1" />
                  Score: {message.analysis.overallScore}
                </Badge>
                <Progress 
                  value={message.analysis.overallScore} 
                  className={`h-2 w-24 bg-gray-200 dark:bg-gray-700
                    [&>div]:bg-gradient-to-r ${getScoreColor(message.analysis.overallScore)}`}
                />
              </div>

              {/* Strengths */}
              {message.analysis.strengths.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 bg-green-50/50 dark:bg-green-950/30 rounded-xl p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                      Key Strengths
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {message.analysis.strengths.map((strength, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {strength}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
              
              {/* Areas for Improvement */}
              {message.analysis.weaknesses.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 bg-red-50/50 dark:bg-red-950/30 rounded-xl p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900">
                      <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">
                      Growth Areas
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {message.analysis.weaknesses.map((weakness, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        {weakness}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Feedback */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-blue-50/50 dark:bg-blue-950/30 rounded-xl p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Personalized Feedback
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {message.analysis.feedback}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Message; 