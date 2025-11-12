"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Telescope,
  Globe2,
  History,
  MapPin,
  Code,
  BookOpen,
  Save,
  Sparkles,
  ArrowLeft,
  Check,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  TopicPreferenceCard,
  TopicPreference,
} from "@/components/preferences/topic-preference-card";
import { toast } from "sonner";
import Link from "next/link";

const initialTopics: TopicPreference[] = [
  {
    id: "astronomy",
    name: "Astronomy",
    description: "Space exploration, celestial phenomena, and cosmic discoveries",
    icon: Telescope,
    enabled: true,
    priority: 2,
    frequency: "daily",
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
  },
  {
    id: "geopolitics",
    name: "Geopolitics",
    description: "International relations, global affairs, and political analysis",
    icon: Globe2,
    enabled: true,
    priority: 1,
    frequency: "weekly",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
  },
  {
    id: "history",
    name: "History",
    description: "Historical events, civilizations, and archaeological findings",
    icon: History,
    enabled: true,
    priority: 1,
    frequency: "weekly",
    color: "bg-gradient-to-br from-amber-500 to-amber-600",
  },
  {
    id: "geography",
    name: "Geography",
    description: "Earth sciences, climate studies, and environmental research",
    icon: MapPin,
    enabled: false,
    priority: 0,
    frequency: "monthly",
    color: "bg-gradient-to-br from-green-500 to-green-600",
  },
  {
    id: "software",
    name: "Software Development",
    description: "Programming, technology trends, and software engineering",
    icon: Code,
    enabled: true,
    priority: 2,
    frequency: "daily",
    color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
  },
  {
    id: "literature",
    name: "Literature & Arts",
    description: "Books, artistic movements, and cultural studies",
    icon: BookOpen,
    enabled: false,
    priority: 0,
    frequency: "monthly",
    color: "bg-gradient-to-br from-pink-500 to-pink-600",
  },
];

export default function PreferencesPage() {
  const [topics, setTopics] = useState<TopicPreference[]>(initialTopics);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (id: string) => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === id ? { ...topic, enabled: !topic.enabled } : topic
      )
    );
    setHasChanges(true);
  };

  const handlePriorityChange = (id: string, priority: number) => {
    setTopics((prev) =>
      prev.map((topic) => (topic.id === id ? { ...topic, priority } : topic))
    );
    setHasChanges(true);
  };

  const handleFrequencyChange = (
    id: string,
    frequency: "daily" | "weekly" | "monthly"
  ) => {
    setTopics((prev) =>
      prev.map((topic) => (topic.id === id ? { ...topic, frequency } : topic))
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In production, you would call your API here:
      // await preferencesApi.updateTopicPreferences(topics);

      toast.success("Preferences saved successfully!", {
        description: "Your content feed will be updated based on your preferences.",
        icon: <Check className="h-5 w-5" />,
      });
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save preferences", {
        description: "Please try again later.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const enabledCount = topics.filter((t) => t.enabled).length;
  const highPriorityCount = topics.filter(
    (t) => t.enabled && t.priority === 2
  ).length;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Content Preferences
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 ml-[60px]">
                  Customize your learning experience by selecting topics and
                  setting preferences
                </p>
              </div>
            </motion.div>
          </div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Active Topics</p>
                  <p className="text-3xl font-bold">{enabledCount}</p>
                  <p className="text-blue-100 text-xs mt-1">
                    out of {topics.length} total
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">High Priority</p>
                  <p className="text-3xl font-bold">{highPriorityCount}</p>
                  <p className="text-purple-100 text-xs mt-1">topics marked</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1">Daily Content</p>
                  <p className="text-3xl font-bold">
                    {topics.filter((t) => t.enabled && t.frequency === "daily").length}
                  </p>
                  <p className="text-green-100 text-xs mt-1">
                    topics subscribed
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <Globe2 className="h-6 w-6" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  How it works
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Enable topics you're interested in, set priority levels to
                  influence content recommendations, and choose how frequently you
                  want to receive content for each topic. Your personalized feed
                  will be updated automatically.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Topic Cards */}
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <TopicPreferenceCard
                  topic={topic}
                  onToggle={handleToggle}
                  onPriorityChange={handlePriorityChange}
                  onFrequencyChange={handleFrequencyChange}
                />
              </motion.div>
            ))}
          </div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="sticky bottom-6 flex items-center justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Save className="h-5 w-5" />
                  </motion.div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {hasChanges ? "Save Preferences" : "No Changes"}
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
