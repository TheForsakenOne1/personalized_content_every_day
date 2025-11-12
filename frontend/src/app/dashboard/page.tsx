"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Clock } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { FeaturedContent } from "@/components/dashboard/featured-content";
import { ContentCard, ContentItem } from "@/components/dashboard/content-card";
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

export default function DashboardPage() {
  const [content, setContent] = useState<ContentItem[]>(mockContent);
  const [filter, setFilter] = useState<"all" | "unread" | "saved">("all");

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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Good morning! Ready to learn?
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Here's your personalized content for today
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-100">
                  Today's Content
                </h3>
                <TrendingUp className="h-5 w-5 text-blue-200" />
              </div>
              <p className="text-3xl font-bold">{content.length}</p>
              <p className="text-sm text-blue-100 mt-1">
                {content.filter((c) => !c.isRead).length} unread
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-100">
                  Completed
                </h3>
                <Clock className="h-5 w-5 text-green-200" />
              </div>
              <p className="text-3xl font-bold">
                {content.filter((c) => c.isRead).length}
              </p>
              <p className="text-sm text-green-100 mt-1">Articles read</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-purple-100">Saved</h3>
                <Sparkles className="h-5 w-5 text-purple-200" />
              </div>
              <p className="text-3xl font-bold">
                {content.filter((c) => c.isSaved).length}
              </p>
              <p className="text-sm text-purple-100 mt-1">For later</p>
            </motion.div>
          </div>

          {/* Featured Content */}
          <div>
            <FeaturedContent
              {...featuredPaper}
              onSave={() =>
                toast.success("Featured paper saved successfully")
              }
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
            {(["all", "unread", "saved"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                  filter === tab
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {filter === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Content Grid */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {filter === "all" && "All Content"}
              {filter === "unread" && "Unread Content"}
              {filter === "saved" && "Saved Content"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ContentCard
                    content={item}
                    onSave={handleSave}
                    onRead={handleRead}
                  />
                </motion.div>
              ))}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No content found for this filter
                </p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
