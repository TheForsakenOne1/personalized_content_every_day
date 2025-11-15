"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  GraduationCap,
  LogIn,
  UserPlus,
  Keyboard,
  Sparkles,
  ArrowRight,
  BookOpen,
  Video,
  FileText,
  Star,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-16"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3.5 rounded-2xl">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                EduHub
              </span>
            </div>
          </motion.div>

          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-semibold text-gray-900 dark:text-white mb-6 leading-tight">
              Your personalized learning journey starts here
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Discover curated research papers, articles, and videos tailored to your interests. Stay informed, stay inspired.
            </p>
          </motion.div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-16">
            {/* Register */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Link
                href="/auth/register"
                className="block group bg-primary hover:bg-primary/90 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  <UserPlus className="h-5 w-5 text-white" />
                  <span className="text-lg font-semibold text-white">
                    Create Account
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Login */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <Link
                href="/auth/login"
                className="block group bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  <LogIn className="h-5 w-5 text-gray-900 dark:text-white" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sign In
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Research Papers
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access cutting-edge academic research tailored to your field of study
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Curated Articles
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated with expert-written articles on trending topics
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
                <Video className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Video Content
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Watch educational videos from leading experts and institutions
              </p>
            </div>
          </motion.div>

          {/* Dev Mode Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <Keyboard className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
                    Development Mode
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs font-mono mx-1">Shift</kbd> +{" "}
                    <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs font-mono mx-1">A</kbd>{" "}
                    to explore the platform with demo data
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Social Proof / Stats Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="border-t border-gray-200 dark:border-gray-800 py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                10K+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Research Papers
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                5K+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Articles
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                2K+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Videos
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                1K+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Learners
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
