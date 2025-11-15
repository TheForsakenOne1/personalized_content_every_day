"use client";

import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function TrendingPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white mb-4 leading-tight">
            Trending
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Discover what's popular in your communities
          </p>
        </motion.div>

        <div className="mt-16 text-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No trending content available
          </p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
