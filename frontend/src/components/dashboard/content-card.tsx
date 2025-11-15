"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Clock,
  Bookmark,
  BookmarkCheck,
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

export function ContentCard({ content, onSave, onRead }: ContentCardProps) {
  const [isSaved, setIsSaved] = useState(content.isSaved);

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
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <article className="group relative border-b border-gray-200 dark:border-gray-800 pb-6 last:border-b-0">
      <Link
        href={`/dashboard/content/${content.id}`}
        onClick={handleRead}
        className="block"
      >
        <div className="flex gap-6">
          {/* Thumbnail */}
          {content.thumbnailUrl && (
            <div className="hidden sm:block relative w-48 h-32 flex-shrink-0 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
              <img
                src={content.thumbnailUrl}
                alt={content.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Category & Source */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {content.category}
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {content.source}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              {content.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
              {content.description}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
              {content.author && <span>{content.author}</span>}
              {content.author && <span>·</span>}
              <span>{formatDate(content.publishedAt)}</span>
              <span>·</span>
              {content.type === "video" && content.duration && (
                <span>{Math.floor(content.duration / 60)} min</span>
              )}
              {content.type !== "video" && content.readTime && (
                <span>{content.readTime} min read</span>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={cn(
              "flex-shrink-0 p-2 h-fit rounded-lg transition-colors",
              isSaved
                ? "text-gray-900 dark:text-white"
                : "text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white"
            )}
            aria-label={isSaved ? "Unsave" : "Save"}
          >
            {isSaved ? (
              <BookmarkCheck className="h-6 w-6" fill="currentColor" />
            ) : (
              <Bookmark className="h-6 w-6" />
            )}
          </button>
        </div>
      </Link>
    </article>
  );
}
