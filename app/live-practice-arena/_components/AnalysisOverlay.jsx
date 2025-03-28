"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const AnalysisOverlay = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md mx-4 text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Analyzing Scenario Content
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Processing your conversation and preparing feedback...
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              (~10 seconds)
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalysisOverlay; 