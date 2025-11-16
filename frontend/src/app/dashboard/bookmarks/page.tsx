"use client";

import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ContentCard, ContentItem } from "@/components/dashboard/content-card";
import { BookmarkCheck, Sparkles } from "lucide-react";

const mockBookmarks: ContentItem[] = [
  {
    id: "bm-1",
    type: "article",
    title: "The Future of Quantum Computing: A Comprehensive Analysis",
    description: "Exploring the latest developments in quantum computing and their potential impact on cryptography, drug discovery, and artificial intelligence.",
    source: "MIT Technology Review",
    author: "Dr. Sarah Chen",
    publishedAt: "2024-01-10",
    thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    url: "/content/bm-1",
    category: "Technology",
    tags: ["quantum computing", "AI", "cryptography"],
    readTime: 12,
    isRead: true,
    isSaved: true,
  },
  {
    id: "bm-2",
    type: "video",
    title: "Mars Colony Architecture: Building the First Human Settlement",
    description: "NASA engineers discuss the challenges and innovative solutions for constructing sustainable habitats on the Red Planet.",
    source: "NASA JPL",
    author: "Jessica Martinez",
    publishedAt: "2024-01-08",
    thumbnailUrl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&q=80",
    url: "/content/bm-2",
    category: "Astronomy",
    tags: ["mars", "space exploration", "engineering"],
    duration: 1260,
    isRead: false,
    isSaved: true,
  },
  {
    id: "bm-3",
    type: "paper",
    title: "Climate Tipping Points: A Statistical Analysis of Global Warming Thresholds",
    description: "A peer-reviewed study examining critical temperature thresholds that could trigger irreversible climate changes.",
    source: "Nature Climate Change",
    author: "Prof. Michael Zhang et al.",
    publishedAt: "2024-01-05",
    thumbnailUrl: "https://images.unsplash.com/photo-1569163139394-de4798aa62b5?w=800&q=80",
    url: "/content/bm-3",
    category: "Climate Science",
    tags: ["climate change", "statistics", "environmental science"],
    readTime: 25,
    isRead: true,
    isSaved: true,
  },
  {
    id: "bm-4",
    type: "article",
    title: "The Rise and Fall of the Byzantine Empire: New Archaeological Evidence",
    description: "Recent excavations in Istanbul reveal new insights into the political and economic factors that led to Constantinople's fall in 1453.",
    source: "History Today",
    author: "Dr. Elena Dimitrov",
    publishedAt: "2023-12-28",
    thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
    url: "/content/bm-4",
    category: "History",
    tags: ["Byzantine Empire", "archaeology", "medieval history"],
    readTime: 15,
    isRead: false,
    isSaved: true,
  },
  {
    id: "bm-5",
    type: "video",
    title: "Understanding Black Holes: From Theory to First Images",
    description: "Astrophysicists explain how the Event Horizon Telescope captured the first-ever image of a black hole and what it means for our understanding of the universe.",
    source: "Veritasium",
    author: "Derek Muller",
    publishedAt: "2023-12-20",
    thumbnailUrl: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800&q=80",
    url: "/content/bm-5",
    category: "Astronomy",
    tags: ["black holes", "astrophysics", "cosmology"],
    duration: 1680,
    isRead: true,
    isSaved: true,
  },
  {
    id: "bm-6",
    type: "article",
    title: "Neuroplasticity and Learning: How Your Brain Rewires Itself",
    description: "New research shows how the brain's ability to reorganize itself can be harnessed to improve learning outcomes and recover from injury.",
    source: "Scientific American",
    author: "Dr. Rachel Morrison",
    publishedAt: "2023-12-15",
    thumbnailUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
    url: "/content/bm-6",
    category: "Neuroscience",
    tags: ["brain science", "learning", "neuroplasticity"],
    readTime: 10,
    isRead: false,
    isSaved: true,
  },
];

export default function BookmarksPage() {
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
                <BookmarkCheck className="h-8 w-8 text-pink-500" />
                <h1 className="text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white leading-tight">
                  Bookmarks
                </h1>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {mockBookmarks.length} saved items
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
          >
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-2xl p-6 border border-pink-100 dark:border-pink-900/30">
              <div className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-1">
                Read
              </div>
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                {mockBookmarks.filter((item) => item.isRead).length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-900/30">
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                To Read
              </div>
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                {mockBookmarks.filter((item) => !item.isRead).length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-900/30">
              <div className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
                Videos
              </div>
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                {mockBookmarks.filter((item) => item.type === "video").length}
              </div>
            </div>
          </motion.div>

          {/* Bookmarked Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockBookmarks.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <ContentCard content={item} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
