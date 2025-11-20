"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  TrendingUp,
  Zap,
  BookOpen,
  Globe2,
  ArrowRight,
} from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

const features = [
  {
    icon: Sparkles,
    title: "Personalized Learning",
    description: "Content curated just for you based on your interests",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: BookOpen,
    title: "Diverse Sources",
    description: "Research papers, articles, and videos all in one place",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Monitor your learning journey and stay motivated",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Globe2,
    title: "Expand Horizons",
    description: "Explore topics from astronomy to technology",
    color: "from-orange-500 to-orange-600",
  },
];

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.8,
          }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-3xl blur-xl opacity-50"></div>
            <div className="relative bg-gradient-to-br from-pink-600 to-rose-600 p-6 rounded-3xl shadow-2xl">
              <GraduationCap className="h-16 w-16 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Vidya
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your personalized learning companion. Discover, learn, and grow with
            content tailored to your interests.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative flex items-center gap-2">
              Get Started
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </span>
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}
