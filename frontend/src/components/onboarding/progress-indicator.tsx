"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  steps,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={index} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-shrink-0">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-full transition-all",
                    isCompleted &&
                      "bg-gradient-to-br from-green-500 to-green-600 shadow-lg",
                    isCurrent &&
                      "bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg ring-4 ring-blue-200 dark:ring-blue-900/50",
                    isUpcoming &&
                      "bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600"
                  )}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  ) : (
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isCurrent && "text-white",
                        isUpcoming && "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {index + 1}
                    </span>
                  )}

                  {/* Pulse Animation for Current Step */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-blue-600"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </motion.div>

                {/* Step Label */}
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className={cn(
                    "mt-2 text-xs font-medium text-center hidden sm:block",
                    isCurrent &&
                      "text-blue-600 dark:text-blue-400 font-semibold",
                    isCompleted &&
                      "text-green-600 dark:text-green-400 font-semibold",
                    isUpcoming && "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {step}
                </motion.span>
              </div>

              {/* Connector Line */}
              {index < totalSteps - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                  {index < currentStep && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
