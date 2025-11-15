"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Clock,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Eye,
  FileText,
  Video,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContentItem {
  id: string;
  type: "paper" | "video" | "article";
  title: string;
  description: string;
  source: string;
  author?: string;
  publishedAt: string;
  thumbnailUrl?: string;
  url: string;
  category: string;
  tags: string[];
  readTime?: number;
  duration?: number;
  isRead: boolean;
  isSaved: boolean;
}

interface ContentCardProps {
  content: ContentItem;
  onSave?: (id: string) => void;
  onRead?: (id: string) => void;
}

const contentTypeIcons = {
  paper: FileCode,
  video: Video,
  article: FileText,
};

const contentTypeColors = {
  paper: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  video: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  article: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
};

export function ContentCard({ content, onSave, onRead }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(content.isSaved);

  const Icon = contentTypeIcons[content.type];

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.(content.id);
  };

  const handleRead = () => {
    onRead?.(content.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300",
        content.isRead && "opacity-70"
      )}
    >
      <Link
        href={`/dashboard/content/${content.id}`}
        onClick={handleRead}
        className="block"
      >
        {/* Thumbnail */}
        {content.thumbnailUrl && (
          <div className="relative h-56 bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <img
              src={content.thumbnailUrl}
              alt={content.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Content Type Badge */}
            <div className="absolute top-4 left-4">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md bg-white/90 dark:bg-gray-900/90",
                  content.type === "paper" && "text-purple-600 dark:text-purple-400",
                  content.type === "video" && "text-red-600 dark:text-red-400",
                  content.type === "article" && "text-blue-600 dark:text-blue-400"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
              </span>
            </div>

            {/* Read Indicator */}
            {content.isRead && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-xl backdrop-blur-md">
                  <Eye className="h-3 w-3" />
                  Read
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
            {content.title}
          </h3>

          {/* Category & Date */}
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-primary">
              {content.category}
            </span>
            <span>•</span>
            <span>{formatDate(content.publishedAt)}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
            {content.description}
          </p>

          {/* Tags */}
          {content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {content.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg"
                >
                  {tag}
                </span>
              ))}
              {content.tags.length > 3 && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-medium rounded-lg">
                  +{content.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              {/* Duration or Read Time */}
              {content.type === "video" && content.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{Math.floor(content.duration / 60)} min</span>
                </span>
              )}
              {content.type !== "video" && content.readTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{content.readTime} min read</span>
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-200",
                  isSaved
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                )}
                aria-label={isSaved ? "Unsave" : "Save"}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
