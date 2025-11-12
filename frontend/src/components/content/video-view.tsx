"use client";

import { motion } from "framer-motion";
import {
  Video,
  Calendar,
  Clock,
  User,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Eye,
  ArrowLeft,
  Share2,
  FileText,
  Play,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

export interface VideoData {
  id: string;
  title: string;
  channel: string;
  publishedDate: string;
  duration: number; // in seconds
  description: string;
  videoUrl: string; // YouTube URL or embed URL
  thumbnailUrl?: string;
  tags: string[];
  transcript?: string;
  relatedVideos?: {
    id: string;
    title: string;
    channel: string;
    thumbnailUrl?: string;
    duration: number;
  }[];
}

interface VideoViewProps {
  video: VideoData;
  onMarkAsRead?: () => void;
  onSave?: () => void;
  isRead?: boolean;
  isSaved?: boolean;
}

export function VideoView({
  video,
  onMarkAsRead,
  onSave,
  isRead = false,
  isSaved = false,
}: VideoViewProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Video Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl aspect-video">
          <iframe
            src={getYouTubeEmbedUrl(video.videoUrl)}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </motion.div>

      {/* Video Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Type Badge */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold">
            <Video className="h-4 w-4" />
            Video
          </span>
          {isRead && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
              <Eye className="h-4 w-4" />
              Watched
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
          {video.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="font-medium">{video.channel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(video.publishedDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(video.duration)}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {video.tags.map((tag) => (
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
              Mark as Watched
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

          <motion.a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold shadow-lg transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
            Watch on YouTube
          </motion.a>
        </div>
      </motion.div>

      {/* Description */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Description
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
          {video.description}
        </p>
      </motion.section>

      {/* Transcript */}
      {video.transcript && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Transcript
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTranscript(!showTranscript)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 rounded-lg text-sm font-medium transition-colors"
            >
              <FileText className="h-4 w-4" />
              {showTranscript ? "Hide" : "Show"} Transcript
            </motion.button>
          </div>

          <motion.div
            initial={false}
            animate={{
              height: showTranscript ? "auto" : 0,
              opacity: showTranscript ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {video.transcript}
              </p>
            </div>
          </motion.div>
        </motion.section>
      )}

      {/* Related Videos */}
      {video.relatedVideos && video.relatedVideos.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Related Videos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {video.relatedVideos.map((relatedVideo, index) => (
              <motion.div
                key={relatedVideo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-700">
                  {relatedVideo.thumbnailUrl ? (
                    <>
                      <img
                        src={relatedVideo.thumbnailUrl}
                        alt={relatedVideo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-12 w-12 text-white drop-shadow-lg" />
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
                        {formatDuration(relatedVideo.duration)}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {relatedVideo.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {relatedVideo.channel}
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
