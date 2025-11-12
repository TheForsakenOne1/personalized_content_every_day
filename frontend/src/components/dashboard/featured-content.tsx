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
      className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl overflow-hidden shadow-2xl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Star className="h-6 w-6 text-white" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">
                Today's Featured Research
              </h2>
              <p className="text-white/80 text-sm">
                Curated just for you based on your interests
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className={cn(
              "p-3 rounded-xl backdrop-blur-sm transition-colors",
              isSaved
                ? "bg-yellow-400/30 text-yellow-100"
                : "bg-white/20 text-white hover:bg-white/30"
            )}
          >
            {isSaved ? (
              <BookmarkCheck className="h-6 w-6" fill="currentColor" />
            ) : (
              <Bookmark className="h-6 w-6" />
            )}
          </motion.button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Content */}
          <div className="space-y-4">
            {/* Category Badge */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold">
                <FileCode className="h-4 w-4" />
                {category}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm">
                <TrendingUp className="h-4 w-4" />
                {Math.round(qualityScore * 100)}% Match
              </span>
            </div>

            {/* Title */}
            <h3 className="text-3xl font-bold text-white leading-tight">
              {title}
            </h3>

            {/* Description */}
            <p className="text-white/90 text-lg leading-relaxed line-clamp-3">
              {description}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="font-medium">{author}</span>
              <span>•</span>
              <span>{source}</span>
              <span>•</span>
              <span>{formatDate(publishedAt)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {readTime} min read
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-lg"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* CTA Button */}
            <motion.a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all mt-4"
            >
              Read Full Paper
              <ExternalLink className="h-5 w-5" />
            </motion.a>
          </div>

          {/* Right Thumbnail/Visual */}
          {thumbnailUrl ? (
            <div className="relative lg:block hidden">
              <div className="relative h-full min-h-[300px] rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={thumbnailUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </div>
          ) : (
            <div className="relative lg:block hidden">
              <div className="h-full min-h-[300px] bg-white/10 backdrop-blur-sm rounded-xl p-8 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <FileCode className="h-24 w-24 text-white/50 mx-auto" />
                  <p className="text-white/80 text-lg">
                    Research Paper
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quality Score Bar */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center justify-between text-white/80 text-sm mb-2">
            <span>Relevance to your interests</span>
            <span className="font-semibold">{Math.round(qualityScore * 100)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${qualityScore * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
