"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Telescope,
  Globe2,
  History,
  MapPin,
  Code,
  BookOpen,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicsStepProps {
  onNext: (selectedTopics: string[]) => void;
  onBack: () => void;
}

const topics = [
  {
    id: "astronomy",
    name: "Astronomy",
    description: "Explore the cosmos and celestial phenomena",
    icon: Telescope,
    color: "from-purple-500 to-purple-600",
    bgGradient: "from-purple-50 to-purple-100",
    darkBg: "from-purple-900/20 to-purple-800/20",
  },
  {
    id: "geopolitics",
    name: "Geopolitics",
    description: "Global affairs and international relations",
    icon: Globe2,
    color: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-50 to-blue-100",
    darkBg: "from-blue-900/20 to-blue-800/20",
  },
  {
    id: "history",
    name: "History",
    description: "Historical events and civilizations",
    icon: History,
    color: "from-amber-500 to-amber-600",
    bgGradient: "from-amber-50 to-amber-100",
    darkBg: "from-amber-900/20 to-amber-800/20",
  },
  {
    id: "geography",
    name: "Geography",
    description: "Earth sciences and environmental research",
    icon: MapPin,
    color: "from-green-500 to-green-600",
    bgGradient: "from-green-50 to-green-100",
    darkBg: "from-green-900/20 to-green-800/20",
  },
  {
    id: "software",
    name: "Software Development",
    description: "Programming and technology trends",
    icon: Code,
    color: "from-indigo-500 to-indigo-600",
    bgGradient: "from-indigo-50 to-indigo-100",
    darkBg: "from-indigo-900/20 to-indigo-800/20",
  },
  {
    id: "literature",
    name: "Literature & Arts",
    description: "Books, arts, and cultural studies",
    icon: BookOpen,
    color: "from-pink-500 to-pink-600",
    bgGradient: "from-pink-50 to-pink-100",
    darkBg: "from-pink-900/20 to-pink-800/20",
  },
];

export function TopicsStep({ onNext, onBack }: TopicsStepProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleNext = () => {
    if (selectedTopics.length > 0) {
      onNext(selectedTopics);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-6 shadow-xl"
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Interests
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select the topics you're passionate about. We'll curate personalized
            content just for you.
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedTopics.length === 0 ? (
                "Select at least one topic to continue"
              ) : (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {selectedTopics.length} topic{selectedTopics.length !== 1 && "s"}{" "}
                  selected ✓
                </span>
              )}
            </span>
          </motion.div>
        </motion.div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {topics.map((topic, index) => {
            const isSelected = selectedTopics.includes(topic.id);
            const Icon = topic.icon;

            return (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleTopic(topic.id)}
                className={cn(
                  "relative group p-6 rounded-xl border-2 transition-all text-left overflow-hidden",
                  isSelected
                    ? "border-blue-500 dark:border-blue-400 shadow-xl shadow-blue-500/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm"
                )}
              >
                {/* Background Gradient */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity",
                    isSelected ? "opacity-100" : "group-hover:opacity-50",
                    topic.bgGradient,
                    "dark:from-transparent dark:to-transparent",
                    isSelected && `dark:${topic.darkBg}`
                  )}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon and Check */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        "p-3 rounded-xl bg-gradient-to-br shadow-lg transition-all",
                        topic.color,
                        isSelected ? "scale-110" : ""
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="p-1.5 bg-blue-500 rounded-full shadow-lg"
                        >
                          <Check className="h-4 w-4 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Text */}
                  <h3
                    className={cn(
                      "text-lg font-semibold mb-2 transition-colors",
                      isSelected
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-800 dark:text-gray-200"
                    )}
                  >
                    {topic.name}
                  </h3>
                  <p
                    className={cn(
                      "text-sm transition-colors",
                      isSelected
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-600 dark:text-gray-400"
                    )}
                  >
                    {topic.description}
                  </p>
                </div>

                {/* Selection Ring Animation */}
                {isSelected && (
                  <motion.div
                    layoutId="selection-ring"
                    className="absolute inset-0 border-2 border-blue-500 dark:border-blue-400 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors"
          >
            ← Back
          </motion.button>

          <motion.button
            whileHover={selectedTopics.length > 0 ? { scale: 1.05 } : {}}
            whileTap={selectedTopics.length > 0 ? { scale: 0.95 } : {}}
            onClick={handleNext}
            disabled={selectedTopics.length === 0}
            className={cn(
              "group px-8 py-4 rounded-xl font-semibold text-lg shadow-xl transition-all flex items-center gap-2",
              selectedTopics.length > 0
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            )}
          >
            Continue
            {selectedTopics.length > 0 && (
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
