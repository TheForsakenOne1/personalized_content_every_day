"use client";

import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ContentCard, ContentItem } from "@/components/dashboard/content-card";
import { TrendingUp, Flame, Eye, MessageCircle, Share2 } from "lucide-react";

interface TrendingItem extends ContentItem {
  views: number;
  comments: number;
  shares: number;
  trendingScore: number;
}

const mockTrending: TrendingItem[] = [
  {
    id: "tr-1",
    type: "video",
    title: "AI Breakthrough: GPT-5 Demonstrates True Reasoning Capabilities",
    description: "OpenAI's latest model shows unprecedented problem-solving abilities and contextual understanding, marking a significant leap in artificial general intelligence.",
    source: "TechCrunch",
    author: "Alex Thompson",
    publishedAt: "2024-01-15",
    thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    url: "/content/tr-1",
    category: "Technology",
    tags: ["AI", "GPT", "machine learning"],
    duration: 900,
    isRead: false,
    isSaved: false,
    views: 125400,
    comments: 3200,
    shares: 8900,
    trendingScore: 98,
  },
  {
    id: "tr-2",
    type: "article",
    title: "James Webb Telescope Discovers Earth-Like Exoplanet with Biosignatures",
    description: "Astronomers detect potential signs of life on planet in habitable zone, 120 light-years away. This discovery could revolutionize our understanding of life in the universe.",
    source: "NASA",
    author: "Dr. Emily Rodriguez",
    publishedAt: "2024-01-14",
    thumbnailUrl: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&q=80",
    url: "/content/tr-2",
    category: "Astronomy",
    tags: ["exoplanets", "JWST", "astrobiology"],
    readTime: 8,
    isRead: false,
    isSaved: true,
    views: 98200,
    comments: 2450,
    shares: 5600,
    trendingScore: 95,
  },
  {
    id: "tr-3",
    type: "article",
    title: "Geopolitical Shift: New Alliance Forms in Response to Global Economic Changes",
    description: "Major economies announce unprecedented cooperation framework that could reshape international trade and diplomatic relations for decades.",
    source: "The Economist",
    author: "James Patterson",
    publishedAt: "2024-01-14",
    thumbnailUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80",
    url: "/content/tr-3",
    category: "Geopolitics",
    tags: ["international relations", "economy", "diplomacy"],
    readTime: 15,
    isRead: false,
    isSaved: false,
    views: 87500,
    comments: 1890,
    shares: 4200,
    trendingScore: 92,
  },
  {
    id: "tr-4",
    type: "paper",
    title: "Fusion Energy Breakthrough: Net Positive Energy Production Achieved Repeatedly",
    description: "Scientists successfully replicate last year's fusion ignition experiment multiple times, moving closer to commercial fusion power generation.",
    source: "Nature Energy",
    author: "National Ignition Facility Team",
    publishedAt: "2024-01-13",
    thumbnailUrl: "https://images.unsplash.com/photo-1530603907829-659ab5ec057b?w=800&q=80",
    url: "/content/tr-4",
    category: "Energy",
    tags: ["fusion", "clean energy", "physics"],
    readTime: 20,
    isRead: false,
    isSaved: true,
    views: 76800,
    comments: 1650,
    shares: 3800,
    trendingScore: 89,
  },
  {
    id: "tr-5",
    type: "video",
    title: "Ancient Roman Computer: How the Antikythera Mechanism Really Worked",
    description: "New analysis reveals the 2000-year-old device was far more sophisticated than previously thought, challenging our understanding of ancient technology.",
    source: "History Channel",
    author: "Prof. Marcus Stone",
    publishedAt: "2024-01-13",
    thumbnailUrl: "https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?w=800&q=80",
    url: "/content/tr-5",
    category: "History",
    tags: ["ancient technology", "archaeology", "Rome"],
    duration: 1440,
    isRead: true,
    isSaved: false,
    views: 64200,
    comments: 1320,
    shares: 2900,
    trendingScore: 85,
  },
  {
    id: "tr-6",
    type: "article",
    title: "Revolutionary Cancer Treatment Shows 90% Success Rate in Clinical Trials",
    description: "New immunotherapy approach using engineered T-cells demonstrates remarkable effectiveness against previously untreatable forms of cancer.",
    source: "The Lancet",
    author: "Dr. Lisa Anderson",
    publishedAt: "2024-01-12",
    thumbnailUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80",
    url: "/content/tr-6",
    category: "Medicine",
    tags: ["cancer research", "immunotherapy", "clinical trials"],
    readTime: 12,
    isRead: false,
    isSaved: true,
    views: 58900,
    comments: 980,
    shares: 2400,
    trendingScore: 82,
  },
];

export default function TrendingPage() {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

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
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Discover what's popular across your interests
              </p>
            </div>
          </div>

          {/* Trending Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-orange-50 via-pink-50 to-rose-50 dark:from-orange-950/20 dark:via-pink-950/20 dark:to-rose-950/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-900/30 mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white dark:bg-gray-900 rounded-xl">
                  <Eye className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    511K
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Views
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white dark:bg-gray-900 rounded-xl">
                  <MessageCircle className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    11.5K
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Comments
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white dark:bg-gray-900 rounded-xl">
                  <Share2 className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    27.8K
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Shares
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white dark:bg-gray-900 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {mockTrending.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Trending Now
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trending Content List */}
          <div className="space-y-6">
            {mockTrending.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-pink-200 dark:hover:border-pink-900/50 transition-colors"
              >
                <div className="flex items-start gap-6">
                  {/* Ranking */}
                  <div className="flex flex-col items-center">
                    <div className="text-4xl font-bold text-transparent bg-gradient-to-br from-orange-500 via-pink-500 to-rose-500 bg-clip-text">
                      #{index + 1}
                    </div>
                    <div className="mt-2 px-2 py-1 bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-950/50 dark:to-pink-950/50 rounded-full">
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                        {item.trendingScore}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <ContentCard content={item} />
                  </div>

                  {/* Engagement Stats */}
                  <div className="hidden lg:flex flex-col gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Eye className="h-4 w-4" />
                      <span className="font-medium">{formatNumber(item.views)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-medium">{formatNumber(item.comments)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Share2 className="h-4 w-4" />
                      <span className="font-medium">{formatNumber(item.shares)}</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Engagement Stats */}
                <div className="lg:hidden flex items-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">{formatNumber(item.views)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium">{formatNumber(item.comments)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Share2 className="h-4 w-4" />
                    <span className="font-medium">{formatNumber(item.shares)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
