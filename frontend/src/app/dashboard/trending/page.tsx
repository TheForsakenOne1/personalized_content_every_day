"use client";

import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ContentItem } from "@/components/dashboard/content-card";
import { Flame, Clock } from "lucide-react";
import Link from "next/link";

const mockTrending: ContentItem[] = [
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
  },
];

export default function TrendingPage() {
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

          {/* Trending Content List */}
          <div className="space-y-3">
            {mockTrending.map((item, index) => (
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
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
