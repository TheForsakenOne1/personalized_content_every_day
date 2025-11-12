"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  User,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Eye,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

export interface ArticleData {
  id: string;
  title: string;
  author: string;
  source: string;
  publishedDate: string;
  featuredImage?: string;
  content: string;
  excerpt: string;
  readTime: number;
  tags: string[];
  externalUrl?: string;
  relatedArticles?: {
    id: string;
    title: string;
    source: string;
    thumbnailUrl?: string;
  }[];
}

interface ArticleViewProps {
  article: ArticleData;
  onMarkAsRead?: () => void;
  onSave?: () => void;
  isRead?: boolean;
  isSaved?: boolean;
}

export function ArticleView({
  article,
  onMarkAsRead,
  onSave,
  isRead = false,
  isSaved = false,
}: ArticleViewProps) {
  const [showFullContent, setShowFullContent] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Type Badge */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
            <FileText className="h-4 w-4" />
            Article
          </span>
          {isRead && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
              <Eye className="h-4 w-4" />
              Read
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
          {article.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{article.source}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(article.publishedDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{article.readTime} min read</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4">
          {onMarkAsRead && !isRead && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onMarkAsRead}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg transition-colors"
            >
              <Eye className="h-5 w-5" />
              Mark as Read
            </motion.button>
          )}

          {onSave && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSave}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors ${
                isSaved
                  ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/30"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="h-5 w-5" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="h-5 w-5" />
                  Save for Later
                </>
              )}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold shadow-lg transition-colors"
          >
            <Share2 className="h-5 w-5" />
            Share
          </motion.button>

          {article.externalUrl && (
            <motion.a
              href={article.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold shadow-lg transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
              Read on {article.source}
            </motion.a>
          )}
        </div>
      </motion.div>

      {/* Featured Image */}
      {article.featuredImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative w-full h-96 rounded-xl overflow-hidden shadow-lg"
        >
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Content */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8"
      >
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {showFullContent ? (
            <div
              className="text-gray-700 dark:text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {article.excerpt}
              </p>
              {article.content && article.content !== article.excerpt && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFullContent(true)}
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 rounded-lg font-semibold transition-colors"
                >
                  Read More
                  <ExternalLink className="h-4 w-4" />
                </motion.button>
              )}
            </>
          )}
        </div>
      </motion.article>

      {/* Related Articles */}
      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Related Articles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {article.relatedArticles.map((relatedArticle, index) => (
              <motion.div
                key={relatedArticle.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {relatedArticle.thumbnailUrl && (
                  <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-700">
                    <img
                      src={relatedArticle.thumbnailUrl}
                      alt={relatedArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {relatedArticle.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {relatedArticle.source}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
