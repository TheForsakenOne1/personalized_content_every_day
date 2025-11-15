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
    <article className="group relative">
      <Link
        href={`/dashboard/content/${content.id}`}
        onClick={handleRead}
        className="block"
      >
        {/* Thumbnail */}
        {content.thumbnailUrl && (
          <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-4">
            <img
              src={content.thumbnailUrl}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          {/* Category & Date */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {content.category}
            </span>
            <span className="text-gray-500 dark:text-gray-500">
              {formatDate(content.publishedAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
            {content.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {content.description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            {/* Duration/Read Time */}
            <div className="text-sm text-gray-500 dark:text-gray-500">
              {content.type === "video" && content.duration && (
                <span>{Math.floor(content.duration / 60)} min</span>
              )}
              {content.type !== "video" && content.readTime && (
                <span>{content.readTime} min read</span>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isSaved
                  ? "text-primary"
                  : "text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400"
              )}
              aria-label={isSaved ? "Unsave" : "Save"}
            >
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5" fill="currentColor" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}
