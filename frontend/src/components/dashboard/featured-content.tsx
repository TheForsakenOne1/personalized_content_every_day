"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FeaturedContentProps {
  title: string;
  description: string;
  author: string;
  source: string;
  publishedAt: string;
  thumbnailUrl?: string;
  url: string;
  category: string;
  tags: string[];
  readTime: number;
  qualityScore: number;
  isSaved?: boolean;
  onSave?: () => void;
}

export function FeaturedContent({
  title,
  description,
  author,
  source,
  publishedAt,
  thumbnailUrl,
  url,
  category,
  tags,
  readTime,
  qualityScore,
  isSaved: initialSaved = false,
  onSave,
}: FeaturedContentProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
      <div className="p-8 lg:p-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Featured Today
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {category}
            </p>
          </div>

          <button
            onClick={handleSave}
            className={cn(
              "p-3 rounded-lg transition-colors",
              isSaved
                ? "bg-primary/10 text-primary"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            {isSaved ? (
              <BookmarkCheck className="h-5 w-5" fill="currentColor" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Content */}
          <div className="space-y-6">
            {/* Title */}
            <h3 className="text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white leading-tight">
              {title}
            </h3>

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {description}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{author}</span>
              <span>·</span>
              <span>{source}</span>
              <span>·</span>
              <span>{formatDate(publishedAt)}</span>
              <span>·</span>
              <span>{readTime} min read</span>
            </div>

            {/* CTA Button */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Read article
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Right Thumbnail/Visual */}
          {thumbnailUrl && (
            <div className="relative lg:block hidden">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
                <Image
                  src={thumbnailUrl}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 0px, 400px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
