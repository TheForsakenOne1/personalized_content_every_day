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
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Logo */}
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
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-3xl shadow-2xl">
                <GraduationCap className="h-16 w-16 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduHub
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Your personalized learning companion. Discover research papers,
              articles, and videos tailored to your interests.
            </p>
          </motion.div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Register */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/auth/register"
                className="block group bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all shadow-lg hover:shadow-xl"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <UserPlus className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Create Account
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sign up to start your learning journey
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Login */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href="/auth/login"
                className="block group bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all shadow-lg hover:shadow-xl"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <LogIn className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Sign In
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account? Log in
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Dev Mode */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-yellow-200 dark:border-yellow-800 shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mb-4">
                    <Keyboard className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Dev Mode
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Skip authentication for demo
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-semibold">
                    <Keyboard className="h-3 w-3" />
                    Press Shift + A
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Development Mode Available
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Press <kbd className="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs font-mono">Shift</kbd> +{" "}
                  <kbd className="px-2 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs font-mono">A</kbd>{" "}
                  anywhere to bypass authentication and explore the platform with mock data. Perfect for testing and demos!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-12 text-center"
          >
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
            >
              Preview Onboarding Experience
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
