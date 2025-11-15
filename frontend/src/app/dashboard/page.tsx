"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { FeaturedContent } from "@/components/dashboard/featured-content";
import { ContentCard, ContentItem } from "@/components/dashboard/content-card";
import { useOnboardingStore } from "@/store/onboardingStore";
import { toast } from "sonner";

// Mock data - In production, this would come from your API
const featuredPaper = {
  title:
    "Quantum Computing: A Revolutionary Approach to Solving Complex Problems",
  description:
    "This groundbreaking research explores the fundamental principles of quantum computing and its potential applications in cryptography, drug discovery, and artificial intelligence. The paper presents novel algorithms that demonstrate significant speedup over classical computing methods.",
  author: "Dr. Sarah Johnson",
  source: "Nature Quantum Information",
  publishedAt: "2024-01-15",
  thumbnailUrl:
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
  url: "https://example.com/quantum-computing-paper",
  category: "Software",
  tags: ["quantum-computing", "algorithms", "cryptography", "ai"],
  readTime: 15,
  qualityScore: 0.95,
  isSaved: false,
};

const mockContent: ContentItem[] = [
  {
    id: "1",
    type: "video",
    title: "The James Webb Space Telescope: First Year Discoveries",
    description:
      "An in-depth analysis of the groundbreaking discoveries made by JWST in its first year of operation, including exoplanet atmospheres and early universe observations.",
    source: "NASA",
    author: "Dr. Michelle Thaller",
    publishedAt: "2024-01-20",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800",
    url: "https://example.com/jwst-discoveries",
    category: "Astronomy",
    tags: ["space", "telescope", "exoplanets"],
    duration: 1200,
    isRead: false,
    isSaved: false,
  },
  {
    id: "2",
    type: "article",
    title: "Understanding the Russia-Ukraine Conflict: A Geopolitical Analysis",
    description:
      "Comprehensive analysis of the historical, economic, and strategic factors driving the ongoing conflict between Russia and Ukraine, with implications for global security.",
    source: "Foreign Affairs",
    author: "Prof. Michael Cohen",
    publishedAt: "2024-01-18",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800",
    url: "https://example.com/geopolitical-analysis",
    category: "Geopolitics",
    tags: ["conflict", "international-relations", "security"],
    readTime: 12,
    isRead: true,
    isSaved: true,
  },
  {
    id: "3",
    type: "paper",
    title: "The Fall of Constantinople: Reassessing Historical Evidence",
    description:
      "New archaeological findings and document analysis provide fresh insights into the siege and fall of Constantinople in 1453, challenging long-held assumptions.",
    source: "Journal of Medieval History",
    author: "Dr. Elena Papadopoulos",
    publishedAt: "2024-01-16",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800",
    url: "https://example.com/constantinople-fall",
    category: "History",
    tags: ["medieval", "byzantium", "archaeology"],
    readTime: 20,
    isRead: false,
    isSaved: false,
  },
  {
    id: "4",
    type: "article",
    title: "React 19: What's New in the Latest Release",
    description:
      "Explore the new features and improvements in React 19, including enhanced concurrent rendering, automatic batching, and the new use hook.",
    source: "React Blog",
    author: "React Team",
    publishedAt: "2024-01-19",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
    url: "https://example.com/react-19",
    category: "Software",
    tags: ["react", "javascript", "web-development"],
    readTime: 8,
    isRead: false,
    isSaved: false,
  },
  {
    id: "5",
    type: "video",
    title: "Climate Change Impact on Ocean Currents",
    description:
      "Scientists discuss how global warming is affecting major ocean currents like the Gulf Stream, with potential implications for weather patterns worldwide.",
    source: "National Geographic",
    author: "Dr. Robert Thompson",
    publishedAt: "2024-01-17",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    url: "https://example.com/ocean-currents",
    category: "Geography",
    tags: ["climate", "oceanography", "environment"],
    duration: 900,
    isRead: false,
    isSaved: false,
  },
  {
    id: "6",
    type: "paper",
    title: "Artificial Neural Networks in Medical Diagnosis: A Survey",
    description:
      "Comprehensive review of machine learning applications in medical imaging and diagnosis, covering recent breakthroughs and challenges in the field.",
    source: "Medical AI Journal",
    author: "Dr. Priya Sharma",
    publishedAt: "2024-01-14",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800",
    url: "https://example.com/medical-ai",
    category: "Software",
    tags: ["machine-learning", "healthcare", "ai"],
    readTime: 25,
    isRead: false,
    isSaved: true,
  },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function DashboardPage() {
  const router = useRouter();
  const { hasCompletedOnboarding } = useOnboardingStore();
  const [content, setContent] = useState<ContentItem[]>(mockContent);
  const [filter, setFilter] = useState<"all" | "unread" | "saved">("all");

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.push("/onboarding");
    }
  }, [hasCompletedOnboarding, router]);

  const handleSave = (id: string) => {
    setContent((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSaved: !item.isSaved } : item
      )
    );
    const item = content.find((c) => c.id === id);
    if (item) {
      toast.success(item.isSaved ? "Removed from saved" : "Saved successfully");
    }
  };

  const handleRead = (id: string) => {
    setContent((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  const filteredContent = content.filter((item) => {
    if (filter === "unread") return !item.isRead;
    if (filter === "saved") return item.isSaved;
    return true;
  });

  // Calculate counts for stats and tabs
  const unreadCount = content.filter((item) => !item.isRead).length;
  const savedCount = content.filter((item) => item.isSaved).length;
  const newItemsToday = content.filter((item) => {
    const publishDate = new Date(item.publishedAt);
    const today = new Date();
    return publishDate.toDateString() === today.toDateString();
  }).length;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Welcome Header with Stats */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between gap-6"
          >
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-1">
                {getGreeting()} 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-right">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {newItemsToday}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  New today
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {savedCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Saved
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filter Tabs with Counts */}
          <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800">
            {(["all", "unread", "saved"] as const).map((tab) => {
              const count =
                tab === "all" ? content.length :
                tab === "unread" ? unreadCount :
                savedCount;

              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`pb-3 font-medium text-sm transition-colors border-b-2 ${
                    filter === tab
                      ? "text-gray-900 dark:text-white border-gray-900 dark:border-white"
                      : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} ({count})
                </button>
              );
            })}
          </div>

          {/* Content Grid */}
          <div>
            {filteredContent.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredContent.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <ContentCard
                      content={item}
                      onSave={handleSave}
                      onRead={handleRead}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No {filter !== "all" && filter} content
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {filter === "saved"
                    ? "Start saving content by clicking the bookmark icon"
                    : filter === "unread"
                    ? "You've read everything! Check back later for new content"
                    : "New content will appear here"}
                </p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
