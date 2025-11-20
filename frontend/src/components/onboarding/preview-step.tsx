"use client";

import { motion } from "framer-motion";
import {
  FileCode,
  Video,
  FileText,
  Clock,
  Bookmark,
  Eye,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface PreviewStepProps {
  onNext: () => void;
  onBack: () => void;
  selectedTopics: string[];
}

const sampleContent = [
  {
    type: "video",
    title: "The James Webb Space Telescope: First Year Discoveries",
    description:
      "An in-depth analysis of the groundbreaking discoveries made by JWST in its first year",
    source: "NASA",
    duration: "20 min",
    thumbnail: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800",
    category: "Astronomy",
    icon: Video,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/20",
  },
  {
    type: "paper",
    title: "Artificial Neural Networks in Medical Diagnosis: A Survey",
    description:
      "Comprehensive review of ANN applications in medical diagnosis over the past decade",
    source: "Medical AI Journal",
    duration: "15 min read",
    thumbnail: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800",
    category: "Software",
    icon: FileCode,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
  {
    type: "article",
    title: "Understanding the Russia-Ukraine Conflict: A Geopolitical Analysis",
    description:
      "Comprehensive analysis of the historical and strategic factors driving the ongoing conflict",
    source: "Foreign Affairs",
    duration: "12 min read",
    thumbnail: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800",
    category: "Geopolitics",
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
];

export function PreviewStep({
  onNext,
  onBack,
  selectedTopics,
}: PreviewStepProps) {
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
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex p-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl mb-6 shadow-xl"
          >
            <Eye className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Here's What Awaits You
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Based on your interests, we'll curate high-quality content from trusted
            sources. Here's a preview of what you'll discover.
          </p>
        </motion.div>

        {/* Sample Content Cards */}
        <div className="space-y-6 mb-12">
          {sampleContent.map((content, index) => {
            const Icon = content.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail */}
                  <div className="relative w-full md:w-64 h-48 md:h-auto bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      src={content.thumbnail}
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${content.bgColor} ${content.color} rounded-full text-xs font-semibold backdrop-blur-sm`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {content.category}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {content.source}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {content.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {content.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {content.duration}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Bookmark className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </motion.button>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="h-5 w-5" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-6 border border-pink-200 dark:border-pink-800 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Your feed will get smarter over time
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                As you read and save content, our algorithm learns your preferences and
                delivers even more relevant recommendations tailored to your interests.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="group px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
          >
            Continue
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
