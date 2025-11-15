"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Telescope,
  Globe2,
  History,
  MapPin,
  Code,
  BookMarked,
  Star,
  TrendingUp,
  Filter,
  Settings,
  ChevronRight,
  FileText,
  Video,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onClose?: () => void;
}

const categories = [
  { name: "All Content", icon: Home, slug: "all", count: 156 },
  { name: "Astronomy", icon: Telescope, slug: "astronomy", count: 42 },
  { name: "Geopolitics", icon: Globe2, slug: "geopolitics", count: 38 },
  { name: "History", icon: History, slug: "history", count: 31 },
  { name: "Geography", icon: MapPin, slug: "geography", count: 25 },
  { name: "Software", icon: Code, slug: "software", count: 20 },
];

const contentTypes = [
  { name: "All Types", icon: FileText, value: "all" },
  { name: "Research Papers", icon: FileCode, value: "paper" },
  { name: "Videos", icon: Video, value: "video" },
  { name: "Articles", icon: FileText, value: "article" },
];

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeContentType, setActiveContentType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Quick Actions */}
      <div className="p-4 space-y-1">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
            pathname === "/dashboard"
              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
              : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
          )}
        >
          <Home className="h-5 w-5" />
          <span className="font-medium">Today's Feed</span>
        </Link>

        <Link
          href="/dashboard/bookmarks"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
            pathname === "/dashboard/bookmarks"
              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
              : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
          )}
        >
          <BookMarked className="h-5 w-5" />
          <span className="font-medium">Saved</span>
          <span className="ml-auto text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
            12
          </span>
        </Link>

        <Link
          href="/dashboard/trending"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
            pathname === "/dashboard/trending"
              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
              : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
          )}
        >
          <TrendingUp className="h-5 w-5" />
          <span className="font-medium">Trending</span>
        </Link>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800" />

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Topics Section */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Topics
            </h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => {
                    setActiveCategory(category.slug);
                    onClose?.();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
                    activeCategory === category.slug
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                  )}
                >
                  <category.icon className="h-5 w-5" />
                  <span className="flex-1 text-left font-medium text-sm">
                    {category.name}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      activeCategory === category.slug
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    )}
                  >
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Type Filter */}
          <div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <span>Content Type</span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  showFilters ? "rotate-90" : ""
                )}
              />
            </button>
            <motion.div
              initial={false}
              animate={{ height: showFilters ? "auto" : 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-1">
                {contentTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setActiveContentType(type.value)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200 text-sm",
                      activeContentType === type.value
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <type.icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{type.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-2">
        <Link
          href="/dashboard/preferences"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 transition-all duration-200"
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium text-sm">Topic Preferences</span>
        </Link>

        {/* Stats Card */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Star className="h-4 w-4 text-primary" fill="currentColor" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              Your Progress
            </h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            You've read 42 articles this week!
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-[70%] bg-primary rounded-full"></div>
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              70%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
