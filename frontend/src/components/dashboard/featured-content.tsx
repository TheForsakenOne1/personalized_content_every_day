"use client";

import { motion } from "framer-motion";
import {
  Star,
  Clock,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  FileCode,
  TrendingUp,
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 rounded-3xl overflow-hidden border border-primary/20"
    >
      <div className="relative p-8 md:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Star className="h-7 w-7 text-primary" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-white font-semibold text-2xl">
                Featured Today
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Handpicked for your interests
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className={cn(
              "p-3 rounded-2xl transition-all duration-200",
              isSaved
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            )}
          >
            {isSaved ? (
              <BookmarkCheck className="h-6 w-6" fill="currentColor" />
            ) : (
              <Bookmark className="h-6 w-6" />
            )}
          </motion.button>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left Content */}
          <div className="space-y-5">
            {/* Category Badge */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                <FileCode className="h-4 w-4 text-primary" />
                {category}
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-xl text-sm font-medium text-primary">
                <TrendingUp className="h-4 w-4" />
                {Math.round(qualityScore * 100)}% Match
              </span>
            </div>

            {/* Title */}
            <h3 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-tight">
              {title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              {description}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
              <span className="font-medium">{author}</span>
              <span>•</span>
              <span>{source}</span>
              <span>•</span>
              <span>{formatDate(publishedAt)}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {readTime} min read
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA Button */}
            <motion.a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all mt-2"
            >
              Read Full Paper
              <ExternalLink className="h-5 w-5" />
            </motion.a>
          </div>

          {/* Right Thumbnail/Visual */}
          {thumbnailUrl ? (
            <div className="relative lg:block hidden">
              <div className="relative h-full min-h-[350px] rounded-3xl overflow-hidden">
                <img
                  src={thumbnailUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="relative lg:block hidden">
              <div className="h-full min-h-[350px] bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                <div className="text-center space-y-4">
                  <FileCode className="h-24 w-24 text-gray-400 dark:text-gray-600 mx-auto" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                    Research Paper
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quality Score Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 text-sm mb-3">
            <span className="font-medium">Relevance to your interests</span>
            <span className="font-semibold text-primary">{Math.round(qualityScore * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${qualityScore * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
