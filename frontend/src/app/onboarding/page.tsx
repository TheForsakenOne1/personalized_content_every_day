"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboardingStore";
import { WelcomeStep } from "@/components/onboarding/welcome-step";
import { TopicsStep } from "@/components/onboarding/topics-step";
import { PreviewStep } from "@/components/onboarding/preview-step";
import { TutorialStep } from "@/components/onboarding/tutorial-step";
import { toast } from "sonner";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const {
    currentStep,
    setCurrentStep,
    selectedTopics,
    setSelectedTopics,
    completeOnboarding,
    hasCompletedOnboarding,
  } = useOnboardingStore();

  const [step, setStep] = useState(0);

  useEffect(() => {
    // Redirect if already completed onboarding
    if (hasCompletedOnboarding) {
      router.push("/dashboard");
    }
  }, [hasCompletedOnboarding, router]);

  const handleNext = () => {
    setStep((prev) => prev + 1);
    setCurrentStep(step + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(0, prev - 1));
    setCurrentStep(Math.max(0, step - 1));
  };

  const handleTopicsSelected = (topics: string[]) => {
    setSelectedTopics(topics);
    handleNext();
    toast.success(`${topics.length} topics selected!`);
  };

  const handleComplete = () => {
    completeOnboarding();
    toast.success("Welcome to EduHub! 🎉", {
      description: "Your personalized feed is ready.",
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Skip Button */}
      {step > 0 && step < TOTAL_STEPS - 1 && (
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          onClick={handleComplete}
          className="fixed top-6 right-6 z-50 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Skip
        </motion.button>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
          >
            <WelcomeStep onNext={handleNext} />
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="topics"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <TopicsStep onNext={handleTopicsSelected} onBack={handleBack} />
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <PreviewStep
              onNext={handleNext}
              onBack={handleBack}
              selectedTopics={selectedTopics}
            />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="tutorial"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <TutorialStep onComplete={handleComplete} onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>
    </div>
  );
}
