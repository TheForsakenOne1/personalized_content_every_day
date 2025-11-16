"use client";

import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white mb-4 leading-tight">
            Profile
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Manage your account settings
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-16 max-w-2xl space-y-8"
        >
          {/* Profile Info */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-8">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white">
                  {user?.email || "Not available"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Username
                </label>
                <p className="text-gray-900 dark:text-white">
                  {user?.username || "Not available"}
                </p>
              </div>
              {user?.fullName && (
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    Full Name
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {user.fullName}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Account Stats */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-8">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Account Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-2xl p-6 border border-pink-100 dark:border-pink-900/30">
                <div className="text-3xl font-semibold text-gray-900 dark:text-white mb-1">
                  127
                </div>
                <div className="text-sm text-pink-600 dark:text-pink-400 font-medium">
                  Items read
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  +12 this week
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/30">
                <div className="text-3xl font-semibold text-gray-900 dark:text-white mb-1">
                  34
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Bookmarks
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  6 unread
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-900/30">
                <div className="text-3xl font-semibold text-gray-900 dark:text-white mb-1">
                  42
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Days active
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Member since {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : "Jan 2024"}
                </div>
              </div>
            </div>
          </div>

          {/* Reading Activity */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-8">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Reading Activity
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  45
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Articles
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  28
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Videos
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  54
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Papers
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  23h
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Total Time
                </div>
              </div>
            </div>
          </div>

          {/* Top Interests */}
          <div>
            <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Top Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Astronomy", count: 34 },
                { name: "History", count: 28 },
                { name: "Technology", count: 25 },
                { name: "Geopolitics", count: 21 },
                { name: "Climate Science", count: 19 },
              ].map((interest) => (
                <div
                  key={interest.name}
                  className="px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-950/30 dark:to-rose-950/30 rounded-full border border-pink-200 dark:border-pink-900/50"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {interest.name}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                    {interest.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
