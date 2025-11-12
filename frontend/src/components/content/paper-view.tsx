"use client";

import { motion } from "framer-motion";
import {
  FileCode,
  Calendar,
  Users,
  BookOpen,
  Download,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export interface PaperData {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publishedDate: string;
  journal: string;
  doi?: string;
  pdfUrl?: string;
  citationCount?: number;
  tags: string[];
  relatedPapers?: {
    id: string;
    title: string;
    authors: string[];
  }[];
}

interface PaperViewProps {
  paper: PaperData;
  onMarkAsRead?: () => void;
  onSave?: () => void;
  isRead?: boolean;
  isSaved?: boolean;
}

export function PaperView({
  paper,
  onMarkAsRead,
  onSave,
  isRead = false,
  isSaved = false,
}: PaperViewProps) {
  const [citationCopied, setCitationCopied] = useState(false);

  const handleCopyCitation = () => {
    const citation = `${paper.authors.join(", ")}. "${paper.title}". ${paper.journal}, ${paper.publishedDate}. ${paper.doi ? `DOI: ${paper.doi}` : ""}`;
    navigator.clipboard.writeText(citation);
    setCitationCopied(true);
    toast.success("Citation copied to clipboard");
    setTimeout(() => setCitationCopied(false), 2000);
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
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-sm font-semibold">
            <FileCode className="h-4 w-4" />
            Research Paper
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
          {paper.title}
        </h1>

        {/* Authors */}
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Users className="h-5 w-5" />
          <p className="text-lg">{paper.authors.join(", ")}</p>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>{paper.journal}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(paper.publishedDate)}</span>
          </div>
          {paper.citationCount && (
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {paper.citationCount} citations
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {paper.tags.map((tag) => (
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

          {paper.pdfUrl && (
            <motion.a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold shadow-lg transition-colors"
            >
              <Download className="h-5 w-5" />
              Download PDF
            </motion.a>
          )}

          {paper.doi && (
            <motion.a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold shadow-lg transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
              View on Journal
            </motion.a>
          )}
        </div>
      </motion.div>

      {/* Abstract */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Abstract
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
          {paper.abstract}
        </p>
      </motion.section>

      {/* Citation */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Citation
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyCitation}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 rounded-lg text-sm font-medium transition-colors"
          >
            {citationCopied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </motion.button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-mono leading-relaxed">
          {paper.authors.join(", ")}. "{paper.title}". {paper.journal},{" "}
          {paper.publishedDate}.
          {paper.doi && ` DOI: ${paper.doi}`}
        </p>
      </motion.section>

      {/* Related Papers */}
      {paper.relatedPapers && paper.relatedPapers.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Related Papers
          </h3>
          <div className="space-y-4">
            {paper.relatedPapers.map((relatedPaper, index) => (
              <motion.div
                key={relatedPaper.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {relatedPaper.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {relatedPaper.authors.join(", ")}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
