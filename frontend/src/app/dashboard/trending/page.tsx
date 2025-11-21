"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ContentItem } from "@/components/dashboard/content-card";
import { Flame, Clock, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { contentService, contentRefreshService, type Content } from "@/services/api";

// Helper function to convert Content to ContentItem
const convertToContentItem = (content: Content): ContentItem => {
  return {
    id: content.id,
    type: content.contentType as "paper" | "video" | "article",
    title: content.title,
    description: content.description || "",
    source: content.source,
    author: content.author,
    publishedAt: content.publishedAt || content.createdAt,
    thumbnailUrl: content.thumbnailUrl,
    url: content.url,
    category: content.category?.name || "General",
    tags: content.tags?.map(t => t.tag.name) || [],
    readTime: content.wordCount ? Math.ceil(content.wordCount / 225) : undefined,
    duration: content.duration,
    isRead: false, // We don't have this info from trending endpoint
    isSaved: false, // We don't have this info from trending endpoint
  };
};

export default function TrendingPage() {
  const [trending, setTrending] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Check if content is stale and trigger refresh if needed
        const refreshTriggered = await contentRefreshService.smartRefresh();

        if (refreshTriggered) {
          setIsRefreshing(true);
          console.log('Content is stale, refresh triggered in background');
        }

        const data = await contentService.getTrendingContent(7, 20); // Last 7 days, max 20 items
        const converted = data.map(convertToContentItem);
        setTrending(converted);
      } catch (error) {
        console.error('Failed to fetch trending content:', error);
        // Don't fallback to mock data - show empty state instead
        setTrending([]);
      } finally {
        setLoading(false);
        // Reset refreshing state after 3 seconds
        setTimeout(() => setIsRefreshing(false), 3000);
      }
    };

    fetchTrending();
  }, []);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl"
        >
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Flame className="h-8 w-8 text-orange-500" />
                <h1 className="text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white leading-tight">
                  Trending
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Discover what's popular across your interests
                </p>
                {isRefreshing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="flex items-center gap-2 px-3 py-1 bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/50 rounded-full text-sm text-pink-700 dark:text-pink-400"
                  >
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Refreshing content...</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Trending Content List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
          ) : trending.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              No trending content available at the moment.
            </div>
          ) : (
            <div className="space-y-3">
              {trending.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/dashboard/content/${item.id}`}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-900/50 transition-all group hover:shadow-lg hover:scale-[1.02]"
                >
                  {/* Ranking Badge */}
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500 rounded-full text-white text-sm font-bold shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-pink-600 dark:text-pink-400">
                        {item.category}
                      </span>
                      <span>•</span>
                      <span>{item.source}</span>
                      {(item.readTime || item.duration) && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {item.type === "video" && item.duration
                                ? `${Math.floor(item.duration / 60)} min`
                                : `${item.readTime} min read`}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            </div>
          )}
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
