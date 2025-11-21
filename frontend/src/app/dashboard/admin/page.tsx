"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminService, type SystemStats } from "@/services/api";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import {
  Users,
  FileText,
  Activity,
  TrendingUp,
  RefreshCw,
  Settings,
  BarChart3,
  Clock,
  Loader2,
  Play,
  ShieldCheck,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [aggregating, setAggregating] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemStats();
      setStats(data);
    } catch (error: any) {
      logger.error("Failed to fetch admin stats", error);
      toast.error("Failed to load statistics", {
        description: error.message || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAggregation = async () => {
    try {
      setAggregating(true);
      toast.info("Starting content aggregation...", {
        description: "This may take a few minutes",
      });

      const result = await adminService.triggerAggregation();

      toast.success("Aggregation completed!", {
        description: `Added ${result.contentAdded} new content items in ${result.duration}s`,
      });

      // Refresh stats
      fetchStats();
    } catch (error: any) {
      logger.error("Failed to trigger aggregation", error);
      toast.error("Aggregation failed", {
        description: error.message || "Please try again later",
      });
    } finally {
      setAggregating(false);
    }
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="h-8 w-8 text-pink-500" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                System overview and management
              </p>
            </div>
            <Button
              onClick={fetchStats}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Loading State */}
          {loading && !stats ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
          ) : (
            <>
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-pink-200 dark:border-pink-900/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-pink-700 dark:text-pink-400 mb-1">
                          Total Users
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stats?.totalUsers || 0}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {stats?.activeUsers || 0} active
                        </p>
                      </div>
                      <div className="bg-pink-500 p-3 rounded-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                          Total Content
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stats?.totalContent || 0}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {stats?.recentActivity.contentAddedToday || 0} today
                        </p>
                      </div>
                      <div className="bg-blue-500 p-3 rounded-lg">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-900/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                          New Users Today
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stats?.recentActivity.newUsersToday || 0}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Registration trend
                        </p>
                      </div>
                      <div className="bg-green-500 p-3 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-900/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-1">
                          Interactions Today
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stats?.recentActivity.interactionsToday || 0}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          User activity
                        </p>
                      </div>
                      <div className="bg-purple-500 p-3 rounded-lg">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* Quick Actions Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                      onClick={handleTriggerAggregation}
                      disabled={aggregating}
                      className="gap-2 h-auto py-4 flex-col bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                    >
                      {aggregating ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                      <span className="font-semibold">Trigger Aggregation</span>
                      <span className="text-xs opacity-90">Fetch new content</span>
                    </Button>

                    <Link href="/dashboard/admin/system" className="block">
                      <Button
                        variant="outline"
                        className="w-full gap-2 h-auto py-4 flex-col border-2 hover:border-pink-300 dark:hover:border-pink-700"
                      >
                        <Activity className="h-5 w-5" />
                        <span className="font-semibold">System Health</span>
                        <span className="text-xs opacity-70">View status</span>
                      </Button>
                    </Link>

                    <Link href="/dashboard/admin/users" className="block">
                      <Button
                        variant="outline"
                        className="w-full gap-2 h-auto py-4 flex-col border-2 hover:border-pink-300 dark:hover:border-pink-700"
                      >
                        <Users className="h-5 w-5" />
                        <span className="font-semibold">Manage Users</span>
                        <span className="text-xs opacity-70">
                          {stats?.totalUsers || 0} users
                        </span>
                      </Button>
                    </Link>

                    <Link href="/dashboard/admin/content" className="block">
                      <Button
                        variant="outline"
                        className="w-full gap-2 h-auto py-4 flex-col border-2 hover:border-pink-300 dark:hover:border-pink-700"
                      >
                        <FileText className="h-5 w-5" />
                        <span className="font-semibold">Manage Content</span>
                        <span className="text-xs opacity-70">
                          {stats?.totalContent || 0} items
                        </span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>

              {/* Content Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Content by Type
                    </h2>
                    <div className="space-y-3">
                      {stats?.contentByType &&
                        Object.entries(stats.contentByType).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                              {type}
                            </span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full"
                                  style={{
                                    width: `${stats.totalContent > 0 ? (count / stats.totalContent) * 100 : 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white w-12 text-right">
                                {count}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Top Categories
                    </h2>
                    <div className="space-y-3">
                      {stats?.contentByCategory?.slice(0, 5).map((cat, index) => (
                        <div key={cat.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-pink-600 dark:text-pink-400 w-6">
                              #{index + 1}
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {cat.name}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {cat.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* System Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Status
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          stats?.systemHealth.status === "healthy"
                            ? "bg-green-500"
                            : stats?.systemHealth.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Overall Status
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          {stats?.systemHealth.status || "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Last Aggregation
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {stats?.systemHealth.lastAggregation
                            ? new Date(stats.systemHealth.lastAggregation).toLocaleString()
                            : "Never"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Database Size
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {stats?.systemHealth.databaseSize || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}
