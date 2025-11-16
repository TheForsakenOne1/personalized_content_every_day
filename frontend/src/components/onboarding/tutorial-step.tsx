"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Eye,
  Settings,
  TrendingUp,
  Search,
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface TutorialStepProps {
  onComplete: () => void;
  onBack: () => void;
}

const tutorialFeatures = [
  {
    icon: Search,
    title: "Search & Discover",
    description: "Use the search bar to find specific topics or browse by category.",
    color: "from-blue-500 to-blue-600",
    tips: [
      "Filter by content type (papers, videos, articles)",
      "Use category filters for focused browsing",
      "Search works across titles, descriptions, and tags",
    ],
  },
  {
    icon: Bookmark,
    title: "Save for Later",
    description: "Bookmark content to read later and build your personal library.",
    color: "from-yellow-500 to-yellow-600",
    tips: [
      "Click the bookmark icon on any content card",
      "Access saved items from the sidebar",
      "Organize your saved content by category",
    ],
  },
  {
    icon: Eye,
    title: "Track Your Progress",
    description: "Mark content as read to track your learning journey.",
    color: "from-green-500 to-green-600",
    tips: [
      "Content automatically marked as read when viewed",
      "See your weekly reading stats in the sidebar",
      "Filter to show only unread content",
    ],
  },
  {
    icon: Settings,
    title: "Customize Preferences",
    description: "Adjust topic priorities and content frequency to match your needs.",
    color: "from-purple-500 to-purple-600",
    tips: [
      "Set priority levels for each topic",
      "Choose daily, weekly, or monthly updates",
      "Enable/disable topics anytime",
    ],
  },
  {
    icon: Bell,
    title: "Stay Updated",
    description: "Get notified about new content in your areas of interest.",
    color: "from-red-500 to-red-600",
    tips: [
      "Receive notifications for trending content",
      "Get alerts for new papers in your field",
      "Weekly digest of your top recommendations",
    ],
  },
  {
    icon: TrendingUp,
    title: "Discover Trending",
    description: "Explore what's popular in your communities and beyond.",
    color: "from-orange-500 to-orange-600",
    tips: [
      "See trending content across all categories",
      "Discover popular papers and articles",
      "Join discussions on trending topics",
    ],
  },
];

export function TutorialStep({ onComplete, onBack }: TutorialStepProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const feature = tutorialFeatures[currentFeature];
  const Icon = feature.icon;

  const handleNext = () => {
    if (currentFeature < tutorialFeatures.length - 1) {
      setCurrentFeature(currentFeature + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentFeature > 0) {
      setCurrentFeature(currentFeature - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Tutorial
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Learn the key features to get the most out of Vidya
          </p>
        </motion.div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-12">
          {tutorialFeatures.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentFeature(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentFeature
                  ? "w-8 bg-blue-600"
                  : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Feature Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFeature}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 md:p-12 mb-12"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex justify-center mb-8"
            >
              <div
                className={`p-6 bg-gradient-to-br ${feature.color} rounded-3xl shadow-xl`}
              >
                <Icon className="h-12 w-12 text-white" />
              </div>
            </motion.div>

            {/* Title & Description */}
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {feature.description}
              </p>
            </div>

            {/* Tips */}
            <div className="space-y-4 max-w-2xl mx-auto">
              {feature.tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="p-1 bg-green-500 rounded-full">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{tip}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrev}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            {currentFeature === 0 ? "Back" : "Previous"}
          </motion.button>

          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {currentFeature + 1} of {tutorialFeatures.length}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg shadow-xl transition-all ${
              currentFeature === tutorialFeatures.length - 1
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            }`}
          >
            {currentFeature === tutorialFeatures.length - 1 ? (
              <>
                Get Started
                <Check className="h-5 w-5" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </motion.button>
        </div>

        {/* Skip Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <button
            onClick={onComplete}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Skip tutorial
          </button>
        </motion.div>
      </div>
    </div>
  );
}
