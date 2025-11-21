"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  BookOpen,
  Clock,
  TrendingUp,
  Star,
  Bookmark,
  Award,
  Target,
  Loader2,
  Calendar,
  PieChart,
  Activity,
  Zap,
  Brain,
} from "lucide-react";
import { analyticsService, type AnalyticsFilters } from "@/services/api";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

type DateRangeFilter = '7d' | '30d' | '90d' | 'all';

interface AnalyticsData {
  readingStats: {
    totalContentRead: number;
    totalReadingTimeMinutes: number;
    averageReadingTimeMinutes: number;
    contentCompletionRate: number;
  } | null;
  categoryStats: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
    percentage: number;
  }>;
  contentTypeBreakdown: Array<{
    contentType: string;
    count: number;
    percentage: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    count: number;
    readingTimeMinutes: number;
  }>;
  engagementMetrics: {
    savedContentCount: number;
    ratedContentCount: number;
    averageRating: number;
    mostEngagedCategories: Array<{
      categoryId: string;
      categoryName: string;
      engagementScore: number;
    }>;
  } | null;
  learningInsights: {
    topCategories: Array<{
      categoryId: string;
      categoryName: string;
      count: number;
    }>;
    contentDiversityScore: number;
    recommendedTopics: string[];
    personalGrowthMetrics: {
      weeklyGrowth: number;
      monthlyGrowth: number;
      consistencyScore: number;
    };
  } | null;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRangeFilter>('30d');
  const [data, setData] = useState<AnalyticsData>({
    readingStats: null,
    categoryStats: [],
    contentTypeBreakdown: [],
    timeSeriesData: [],
    engagementMetrics: null,
    learningInsights: null,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const filters: AnalyticsFilters = { period: dateRange };

      const [readingStats, categoryStats, contentTypeBreakdown, timeSeriesData, engagementMetrics, learningInsights] = await Promise.all([
        analyticsService.getReadingStats(filters).catch(() => null),
        analyticsService.getCategoryStats(filters).catch(() => []),
        analyticsService.getContentTypeBreakdown(filters).catch(() => []),
        analyticsService.getTimeSeriesData(filters).catch(() => []),
        analyticsService.getEngagementMetrics(filters).catch(() => null),
        analyticsService.getLearningInsights(filters).catch(() => null),
      ]);

      setData({
        readingStats,
        categoryStats,
        contentTypeBreakdown,
        timeSeriesData,
        engagementMetrics,
        learningInsights,
      });
    } catch (error) {
      logger.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const hasData = data.readingStats && data.readingStats.totalContentRead > 0;

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!hasData) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="h-8 w-8 text-pink-500" />
              <h1 className="text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white">
                Analytics
              </h1>
            </div>

            <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
              <CardContent className="pt-12 pb-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Analytics Data Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Start reading content to see your personalized analytics and insights.
                  Your reading stats, patterns, and recommendations will appear here.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-pink-500" />
              <h1 className="text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white">
                Analytics
              </h1>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
              {(['7d', '30d', '90d', 'all'] as DateRangeFilter[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    dateRange === range
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : range === '90d' ? 'Last 3 months' : 'All time'}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={BookOpen}
              label="Content Read"
              value={data.readingStats?.totalContentRead || 0}
              color="pink"
            />
            <StatCard
              icon={Clock}
              label="Total Reading Time"
              value={formatTime(data.readingStats?.totalReadingTimeMinutes || 0)}
              color="purple"
            />
            <StatCard
              icon={Target}
              label="Avg. Time per Piece"
              value={formatTime(data.readingStats?.averageReadingTimeMinutes || 0)}
              color="rose"
            />
            <StatCard
              icon={TrendingUp}
              label="Completion Rate"
              value={`${Math.round((data.readingStats?.contentCompletionRate || 0) * 100)}%`}
              color="orange"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Content Type Breakdown */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-pink-500" />
                  <CardTitle>Content by Type</CardTitle>
                </div>
                <CardDescription>Distribution of content you've consumed</CardDescription>
              </CardHeader>
              <CardContent>
                {data.contentTypeBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {data.contentTypeBreakdown.map((item, index) => (
                      <div key={item.contentType}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                            {item.contentType}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {item.count} ({Math.round(item.percentage)}%)
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className={cn(
                              "h-full rounded-full",
                              index === 0 && "bg-gradient-to-r from-pink-500 to-rose-500",
                              index === 1 && "bg-gradient-to-r from-purple-500 to-pink-500",
                              index === 2 && "bg-gradient-to-r from-blue-500 to-purple-500",
                              index === 3 && "bg-gradient-to-r from-orange-500 to-pink-500"
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                    No content type data available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-pink-500" />
                  <CardTitle>Top Categories</CardTitle>
                </div>
                <CardDescription>Your most explored topics</CardDescription>
              </CardHeader>
              <CardContent>
                {data.categoryStats.length > 0 ? (
                  <div className="space-y-4">
                    {data.categoryStats.slice(0, 5).map((item, index) => (
                      <div key={item.categoryId}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.categoryName}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {item.count}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                    No category data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reading Activity Chart */}
          {data.timeSeriesData.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-pink-500" />
                  <CardTitle>Reading Activity</CardTitle>
                </div>
                <CardDescription>Your content consumption over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-48 gap-2">
                  {data.timeSeriesData.map((item, index) => {
                    const maxCount = Math.max(...data.timeSeriesData.map(d => d.count));
                    const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    const date = new Date(item.date);
                    const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    return (
                      <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="relative w-full flex items-end justify-center" style={{ height: '100%' }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className="w-full bg-gradient-to-t from-pink-500 to-rose-400 rounded-t-lg hover:from-pink-600 hover:to-rose-500 transition-colors cursor-pointer relative"
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              {item.count} items
                            </div>
                          </motion.div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 rotate-0 lg:rotate-0">
                          {dayLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Engagement Metrics */}
          {data.engagementMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={Bookmark}
                label="Saved Content"
                value={data.engagementMetrics.savedContentCount}
                color="blue"
              />
              <StatCard
                icon={Star}
                label="Rated Content"
                value={data.engagementMetrics.ratedContentCount}
                color="yellow"
              />
              <StatCard
                icon={Award}
                label="Average Rating"
                value={data.engagementMetrics.averageRating.toFixed(1)}
                suffix="/ 5"
                color="pink"
              />
              <StatCard
                icon={Zap}
                label="Engagement Level"
                value={data.engagementMetrics.mostEngagedCategories.length > 0
                  ? Math.round(data.engagementMetrics.mostEngagedCategories[0].engagementScore)
                  : 0}
                suffix="%"
                color="purple"
              />
            </div>
          )}

          {/* Learning Insights */}
          {data.learningInsights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Growth Metrics */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-pink-500" />
                    <CardTitle>Personal Growth</CardTitle>
                  </div>
                  <CardDescription>Track your learning progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Weekly Growth
                        </span>
                        <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
                          {data.learningInsights.personalGrowthMetrics.weeklyGrowth > 0 ? '+' : ''}
                          {data.learningInsights.personalGrowthMetrics.weeklyGrowth}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                          style={{ width: `${Math.min(Math.abs(data.learningInsights.personalGrowthMetrics.weeklyGrowth), 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Monthly Growth
                        </span>
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {data.learningInsights.personalGrowthMetrics.monthlyGrowth > 0 ? '+' : ''}
                          {data.learningInsights.personalGrowthMetrics.monthlyGrowth}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${Math.min(Math.abs(data.learningInsights.personalGrowthMetrics.monthlyGrowth), 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Content Diversity
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {Math.round(data.learningInsights.contentDiversityScore * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${data.learningInsights.contentDiversityScore * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Consistency Score
                        </span>
                        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                          {Math.round(data.learningInsights.personalGrowthMetrics.consistencyScore * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                          style={{ width: `${data.learningInsights.personalGrowthMetrics.consistencyScore * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Topics */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-pink-500" />
                    <CardTitle>Recommended Topics</CardTitle>
                  </div>
                  <CardDescription>Expand your knowledge</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.learningInsights.recommendedTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {data.learningInsights.recommendedTopics.map((topic, index) => (
                        <motion.div
                          key={topic}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="px-4 py-2 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border border-pink-200 dark:border-pink-900/50 rounded-full text-sm font-medium text-pink-700 dark:text-pink-400 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          {topic}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                      Keep reading to get personalized recommendations
                    </p>
                  )}

                  {/* Top Categories */}
                  {data.learningInsights.topCategories.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Your Top Interests
                      </h4>
                      <div className="space-y-2">
                        {data.learningInsights.topCategories.slice(0, 3).map((category, index) => (
                          <div
                            key={category.categoryId}
                            className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900"
                          >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {category.categoryName}
                            </span>
                            <span className="text-xs font-bold text-pink-600 dark:text-pink-400 px-2 py-1 bg-pink-100 dark:bg-pink-950/30 rounded-full">
                              {category.count} items
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  suffix?: string;
  color?: 'pink' | 'purple' | 'blue' | 'orange' | 'rose' | 'yellow';
}

function StatCard({ icon: Icon, label, value, suffix, color = 'pink' }: StatCardProps) {
  const colorClasses = {
    pink: 'from-pink-500 to-rose-500',
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-purple-500',
    orange: 'from-orange-500 to-pink-500',
    rose: 'from-rose-500 to-pink-500',
    yellow: 'from-yellow-500 to-orange-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{label}</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {value}
                </p>
                {suffix && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{suffix}</span>
                )}
              </div>
            </div>
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-br shadow-md",
              colorClasses[color]
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
