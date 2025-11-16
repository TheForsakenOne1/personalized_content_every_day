"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ContentCard, ContentItem } from "@/components/dashboard/content-card";
import { userService } from "@/services/api";
import { toast } from "sonner";
import { Bookmark, Loader2, Filter } from "lucide-react";

export default function BookmarksPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "read" | "unread" | "videos">("all");

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const savedContent = await userService.getSavedContent();

        // Transform API data to match ContentItem interface
        const transformedContent: ContentItem[] = savedContent.map((item: any) => ({
          id: item.id,
          type: item.contentType as "video" | "article" | "paper",
          title: item.title,
          description: item.description || "",
          source: item.source,
          author: item.author || "Unknown",
          publishedAt: item.publishedAt || new Date().toISOString(),
          thumbnailUrl: item.thumbnailUrl || "",
          url: item.url,
          category: item.category?.name || "General",
          tags: item.tags?.map((t: any) => t.tag.name) || [],
          duration: item.duration,
          readTime: item.wordCount ? Math.ceil(item.wordCount / 200) : undefined,
          isRead: false, // TODO: Get from user interactions
          isSaved: true,
        }));

        setContent(transformedContent);
      } catch (error: any) {
        console.error("Failed to fetch bookmarks:", error);
        toast.error("Failed to load saved content", {
          description: error.message || "Please try again later",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const filteredContent = content.filter((item) => {
    if (filter === "read") return item.isRead;
    if (filter === "unread") return !item.isRead;
    if (filter === "videos") return item.type === "video";
    return true;
  });

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Saved Content
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your bookmarked articles, papers, and videos
            </p>
          </div>

          {/* Stats and Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Bookmark className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {content.length}
              </p>
            </div>
            <button
              onClick={() => setFilter(filter === "read" ? "all" : "read")}
              className={`bg-white dark:bg-gray-800 p-4 rounded-xl border ${
                filter === "read"
                  ? "border-green-500 ring-2 ring-green-500/20"
                  : "border-gray-200 dark:border-gray-700"
              } text-left hover:border-green-500 transition-all`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Read</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {content.filter((item) => item.isRead).length}
              </p>
            </button>
            <button
              onClick={() => setFilter(filter === "unread" ? "all" : "unread")}
              className={`bg-white dark:bg-gray-800 p-4 rounded-xl border ${
                filter === "unread"
                  ? "border-yellow-500 ring-2 ring-yellow-500/20"
                  : "border-gray-200 dark:border-gray-700"
              } text-left hover:border-yellow-500 transition-all`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Unread</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {content.filter((item) => !item.isRead).length}
              </p>
            </button>
            <button
              onClick={() => setFilter(filter === "videos" ? "all" : "videos")}
              className={`bg-white dark:bg-gray-800 p-4 rounded-xl border ${
                filter === "videos"
                  ? "border-purple-500 ring-2 ring-purple-500/20"
                  : "border-gray-200 dark:border-gray-700"
              } text-left hover:border-purple-500 transition-all`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Videos</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {content.filter((item) => item.type === "video").length}
              </p>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredContent.length === 0 && (
            <div className="text-center py-20">
              <Bookmark className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No saved content
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start bookmarking articles, papers, and videos to build your collection
              </p>
            </div>
          )}

          {/* Content Grid */}
          {!loading && filteredContent.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ContentCard {...item} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
