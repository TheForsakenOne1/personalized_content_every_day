"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white mb-4 leading-tight">
            Search
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Find papers, articles, and videos
          </p>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow"
            />
          </div>
        </motion.div>

        <div className="mt-16 text-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Start typing to search
          </p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
