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
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  0
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Items read
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  0
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Bookmarks
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Member since
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
