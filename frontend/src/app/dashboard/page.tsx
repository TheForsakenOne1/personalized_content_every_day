"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { FeaturedContent } from "@/components/dashboard/featured-content";
import { ContentCard, ContentItem } from "@/components/dashboard/content-card";
import { useOnboardingStore } from "@/store/onboardingStore";
import { userService, contentService, contentRefreshService } from "@/services/api";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { logger } from "@/lib/logger";

export default function DashboardPage() {
  const router = useRouter();
  const { hasCompletedOnboarding } = useOnboardingStore();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [featuredContent, setFeaturedContent] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "saved">("all");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.push("/onboarding");
    }
  }, [hasCompletedOnboarding, router]);

  // Fetch user feed
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);

        // Check if content is stale and trigger refresh if needed
        const refreshTriggered = await contentRefreshService.smartRefresh();

        if (refreshTriggered) {
          setIsRefreshing(true);
          logger.info('Content is stale, refresh triggered in background');
        }

        const feedContent = await userService.getFeed(filter);

        // Transform API data to match ContentItem interface
        const transformedContent: ContentItem[] = feedContent.map((item: any) => ({
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
          isSaved: false, // TODO: Get from user interactions
        }));

        setContent(transformedContent);

        // Set first high-quality item as featured
        if (transformedContent.length > 0) {
          setFeaturedContent({
            title: transformedContent[0].title,
            description: transformedContent[0].description,
            author: transformedContent[0].author,
            source: transformedContent[0].source,
            publishedAt: transformedContent[0].publishedAt,
            thumbnailUrl: transformedContent[0].thumbnailUrl,
            url: transformedContent[0].url,
            category: transformedContent[0].category,
            tags: transformedContent[0].tags,
            readTime: transformedContent[0].readTime,
            qualityScore: 0.9,
            isSaved: transformedContent[0].isSaved,
          });
        }
      } catch (error: any) {
        logger.error("Failed to fetch content", error);
        toast.error("Failed to load content", {
          description: error.message || "Please try again later",
        });
      } finally {
        setLoading(false);
        // Reset refreshing state after 3 seconds
        setTimeout(() => setIsRefreshing(false), 3000);
      }
    };

    fetchContent();
  }, [filter]);

  if (!hasCompletedOnboarding) {
    return null;
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Filter Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
              {[
                { value: "all", label: "All" },
                { value: "unread", label: "Unread" },
                { value: "saved", label: "Saved" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value as typeof filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === tab.value
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {/* Empty State */}
          {!loading && content.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No content yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back later for personalized content based on your interests.
              </p>
            </div>
          )}

          {/* Content Grid */}
          {!loading && content.length > 0 && (
            <>
              {/* Featured Content */}
              {featuredContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <FeaturedContent {...featuredContent} />
                </motion.div>
              )}

              {/* Today's Feed */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {filter === "all"
                      ? "Today's Feed"
                      : filter === "unread"
                      ? "Unread Content"
                      : "Saved Content"}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {content.length} items
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {content.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ContentCard content={item} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
