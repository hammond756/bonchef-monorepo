"use client"

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProgressModalProps {
  progressSteps: string[];
  stepDuration?: number;
  loop?: boolean;
}

export function ProgressModal({ progressSteps, stepDuration = 3000, loop = false }: ProgressModalProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex < progressSteps.length - 1 || loop) {
      const timeout = setTimeout(() => {
        setStepIndex((prev) => (prev + 1) % progressSteps.length);
      }, stepDuration);
      return () => clearTimeout(timeout);
    }
  }, [stepIndex]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-xl px-12 py-16 w-full max-w-2xl min-h-[300px] text-center space-y-8 flex flex-col justify-center">
        <div className="flex justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-lg font-medium"
          >
            {progressSteps[stepIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ProgressModal; 