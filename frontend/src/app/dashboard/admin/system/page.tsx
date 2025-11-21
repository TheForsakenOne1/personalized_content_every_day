"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AdminRoute } from "@/components/auth/admin-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminService, type SystemHealth } from "@/services/api";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import {
  Activity,
  Database,
  Server,
  Clock,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  TrendingUp,
  MemoryStick,
  HardDrive,
} from "lucide-react";

export default function SystemHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [aggregating, setAggregating] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    fetchHealth();
    fetchActivities();

    // Auto-refresh health every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemHealth();
      setHealth(data);
    } catch (error: any) {
      logger.error("Failed to fetch system health", error);
      toast.error("Failed to load system health", {
        description: error.message || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const data = await adminService.getActivityLogs({ limit: 20 });
      setActivities(data.activities);
    } catch (error: any) {
      logger.error("Failed to fetch activities", error);
    } finally {
      setLoadingActivities(false);
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

      // Refresh health
      fetchHealth();
      fetchActivities();
    } catch (error: any) {
      logger.error("Failed to trigger aggregation", error);
      toast.error("Aggregation failed", {
        description: error.message || "Please try again later",
      });
    } finally {
      setAggregating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "warning":
      case "pending":
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case "error":
      case "disconnected":
      case "failed":
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Activity className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
      case "success":
        return "text-green-600 dark:text-green-400";
      case "warning":
      case "pending":
        return "text-yellow-600 dark:text-yellow-400";
      case "error":
      case "disconnected":
      case "failed":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-8 w-8 text-pink-500" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  System Health
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor system status and performance
              </p>
            </div>
            <Button
              onClick={fetchHealth}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Loading State */}
          {loading && !health ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
          ) : (
            <>
              {/* Overall Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(health?.status || "unknown")}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        System Status:{" "}
                        <span className={getStatusColor(health?.status || "unknown")}>
                          {health?.status?.toUpperCase() || "UNKNOWN"}
                        </span>
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        All systems operational and running smoothly
                      </p>
                    </div>
                    {health?.uptime && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatUptime(health.uptime)}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    System Actions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <span className="text-xs opacity-90">Fetch new content now</span>
                    </Button>

                    <Button
                      onClick={fetchActivities}
                      disabled={loadingActivities}
                      variant="outline"
                      className="gap-2 h-auto py-4 flex-col border-2 hover:border-pink-300 dark:hover:border-pink-700"
                    >
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-semibold">Refresh Activities</span>
                      <span className="text-xs opacity-70">Update activity log</span>
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* System Components */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Database Status */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Database className="h-6 w-6 text-blue-500" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Database
                      </h2>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(health?.database.status || "unknown")}
                          <span
                            className={`font-semibold capitalize ${getStatusColor(
                              health?.database.status || "unknown"
                            )}`}
                          >
                            {health?.database.status || "Unknown"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Response Time
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {health?.database.responseTime
                            ? `${health.database.responseTime}ms`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Memory Usage */}
                {health?.memoryUsage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <MemoryStick className="h-6 w-6 text-purple-500" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Memory Usage
                        </h2>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Used</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {(health.memoryUsage.used / 1024 / 1024 / 1024).toFixed(2)} GB
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {(health.memoryUsage.total / 1024 / 1024 / 1024).toFixed(2)} GB
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 dark:text-gray-400">
                              Usage
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {health.memoryUsage.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                health.memoryUsage.percentage > 90
                                  ? "bg-red-500"
                                  : health.memoryUsage.percentage > 70
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${health.memoryUsage.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Last Aggregation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-6 w-6 text-orange-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Last Content Aggregation
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Status
                      </p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(health?.lastAggregation.status || "never")}
                        <span
                          className={`font-semibold capitalize ${getStatusColor(
                            health?.lastAggregation.status || "never"
                          )}`}
                        >
                          {health?.lastAggregation.status || "Never"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Timestamp
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {health?.lastAggregation.timestamp
                          ? formatDate(health.lastAggregation.timestamp)
                          : "Never run"}
                      </p>
                    </div>
                    {health?.lastAggregation.duration && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Duration
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {health.lastAggregation.duration}s
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Recent Activity
                    </h2>
                    {loadingActivities && (
                      <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
                    )}
                  </div>
                  {activities.length === 0 ? (
                    <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                      No recent activity
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activities.slice(0, 10).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <Activity className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white">
                              <span className="font-semibold">
                                {activity.user?.username || "System"}
                              </span>{" "}
                              {activity.activityType.replace(/_/g, " ").toLowerCase()}
                              {activity.entityType && (
                                <span className="text-gray-600 dark:text-gray-400">
                                  {" "}
                                  on {activity.entityType}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {formatDate(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}
