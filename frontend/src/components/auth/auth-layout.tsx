"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackToLogin?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showBackToLogin = false,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center"
        >
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-primary p-3 rounded-2xl group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">EduHub</span>
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-8 text-center"
        >
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white dark:bg-gray-900 py-10 px-6 border border-gray-200 dark:border-gray-800 sm:rounded-3xl sm:px-12">
          {children}
        </div>

        {/* Back to Login Link */}
        {showBackToLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6 text-center"
          >
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              ← Back to login
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="mt-10 text-center text-sm text-gray-500 dark:text-gray-500"
      >
        <p>
          © {new Date().getFullYear()} EduHub. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
