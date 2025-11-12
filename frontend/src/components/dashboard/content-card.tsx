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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all",
        content.isRead && "opacity-75"
      )}
    >
      <Link
        href={`/dashboard/content/${content.id}`}
        onClick={handleRead}
        className="block"
      >
        {/* Thumbnail */}
        {content.thumbnailUrl && (
          <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <img
              src={content.thumbnailUrl}
              alt={content.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Content Type Badge */}
            <div className="absolute top-3 left-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm",
                  contentTypeColors[content.type]
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
              </span>
            </div>

            {/* Read Indicator */}
            {content.isRead && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                  <Eye className="h-3 w-3" />
                  Read
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          {/* Category & Source */}
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center text-xs font-medium text-blue-600 dark:text-blue-400">
              {content.category}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(content.publishedAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {content.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {content.description}
          </p>

          {/* Tags */}
          {content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {content.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                >
                  #{tag}
                </span>
              ))}
              {content.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                  +{content.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {/* Author/Source */}
              <span className="truncate max-w-[150px]">
                {content.author || content.source}
              </span>

              {/* Duration or Read Time */}
              {content.type === "video" && content.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.floor(content.duration / 60)}m
                </span>
              )}
              {content.type !== "video" && content.readTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {content.readTime} min read
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSave}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isSaved
                    ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                )}
                aria-label={isSaved ? "Unsave" : "Save"}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </motion.button>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
                className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"
              >
                <ExternalLink className="h-5 w-5" />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
