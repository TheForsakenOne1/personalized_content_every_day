"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
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
          <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-3">
            <Image
              src={content.thumbnailUrl}
              alt={content.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover group-hover:brightness-95 transition-all duration-200"
            />
            {/* Save Button Overlay */}
            <button
              onClick={handleSave}
              className={cn(
                "absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all",
                isSaved
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-lg"
                  : "bg-white/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:scale-110"
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
        )}

        {/* Content */}
        <div className="space-y-2">
          {/* Category & Source */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {content.category}
            </span>
            <span className="text-gray-400">·</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {content.source}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
            {content.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {content.description}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
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
      </Link>
    </article>
  );
}
