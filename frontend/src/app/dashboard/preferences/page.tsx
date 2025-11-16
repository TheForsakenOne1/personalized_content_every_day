"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { toast } from "sonner";
import {
  Telescope,
  Globe2,
  History,
  MapPin,
  Code,
  BookOpen,
  Atom,
  Brain,
  HeartPulse,
  Lightbulb,
  Music,
  Palette,
  Calculator,
  Leaf,
  Languages,
  TrendingUp,
  Shield,
  Film,
  FileText,
  Check,
  Sparkles,
} from "lucide-react";

interface Topic {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
}

interface PaperSource {
  id: string;
  name: string;
  enabled: boolean;
}

const topics: Topic[] = [
  {
    id: "software",
    name: "Software Development",
    description: "Programming, tech trends, and engineering",
    icon: Code,
    enabled: true,
  },
  {
    id: "astronomy",
    name: "Astronomy",
    description: "Space exploration and cosmic discoveries",
    icon: Telescope,
    enabled: true,
  },
  {
    id: "history",
    name: "History",
    description: "Historical events and civilizations",
    icon: History,
    enabled: true,
  },
  {
    id: "physics",
    name: "Physics",
    description: "Quantum mechanics and theoretical physics",
    icon: Atom,
    enabled: true,
  },
  {
    id: "medicine",
    name: "Medicine & Health",
    description: "Medical research and healthcare innovations",
    icon: HeartPulse,
    enabled: true,
  },
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Pure and applied mathematics",
    icon: Calculator,
    enabled: true,
  },
  {
    id: "geopolitics",
    name: "Geopolitics",
    description: "International relations and global affairs",
    icon: Globe2,
    enabled: true,
  },
  {
    id: "economics",
    name: "Economics",
    description: "Economic theory and financial systems",
    icon: TrendingUp,
    enabled: true,
  },
  {
    id: "psychology",
    name: "Psychology",
    description: "Human behavior and cognitive science",
    icon: Brain,
    enabled: true,
  },
  {
    id: "philosophy",
    name: "Philosophy",
    description: "Ethics, logic, and metaphysics",
    icon: Lightbulb,
    enabled: true,
  },
  {
    id: "environmental-science",
    name: "Environmental Science",
    description: "Climate change and conservation",
    icon: Leaf,
    enabled: true,
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    description: "Digital security and cryptography",
    icon: Shield,
    enabled: true,
  },
  {
    id: "geography",
    name: "Geography",
    description: "Earth sciences and climate studies",
    icon: MapPin,
    enabled: true,
  },
  {
    id: "literature",
    name: "Literature & Arts",
    description: "Books and artistic movements",
    icon: BookOpen,
    enabled: true,
  },
  {
    id: "music",
    name: "Music",
    description: "Music theory and composition",
    icon: Music,
    enabled: true,
  },
  {
    id: "visual-arts",
    name: "Visual Arts",
    description: "Painting, sculpture, and design",
    icon: Palette,
    enabled: true,
  },
  {
    id: "linguistics",
    name: "Linguistics",
    description: "Language structure and evolution",
    icon: Languages,
    enabled: true,
  },
  {
    id: "film",
    name: "Film & Cinema",
    description: "Film theory and cinematography",
    icon: Film,
    enabled: true,
  },
];

const paperSources: PaperSource[] = [
  { id: "arxiv", name: "arXiv", enabled: true },
  { id: "pubmed", name: "PubMed", enabled: true },
  { id: "ieee", name: "IEEE Xplore", enabled: false },
  { id: "springer", name: "Springer", enabled: false },
  { id: "nature", name: "Nature", enabled: true },
  { id: "sciencedirect", name: "ScienceDirect", enabled: false },
];

export default function PreferencesPage() {
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>(topics);
  const [selectedSources, setSelectedSources] = useState<PaperSource[]>(paperSources);
  const [isSaving, setIsSaving] = useState(false);

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.map((topic) =>
        topic.id === id ? { ...topic, enabled: !topic.enabled } : topic
      )
    );
  };

  const toggleSource = (id: string) => {
    setSelectedSources((prev) =>
      prev.map((source) =>
        source.id === id ? { ...source, enabled: !source.enabled } : source
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Your preferences have been saved!");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const enabledCount = selectedTopics.filter((t) => t.enabled).length;
  const sourcesCount = selectedSources.filter((s) => s.enabled).length;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Personalize Your Feed
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                  Choose topics you care about and we'll curate content just for you
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-6">
              <div className="px-4 py-2 bg-pink-50 dark:bg-pink-950/20 rounded-full border border-pink-200 dark:border-pink-900/50">
                <span className="text-sm font-medium text-pink-700 dark:text-pink-400">
                  {enabledCount} topics selected
                </span>
              </div>
              <div className="px-4 py-2 bg-pink-50 dark:bg-pink-950/20 rounded-full border border-pink-200 dark:border-pink-900/50">
                <span className="text-sm font-medium text-pink-700 dark:text-pink-400">
                  {sourcesCount} sources active
                </span>
              </div>
            </div>
          </motion.div>

          {/* Topics Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Content Topics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedTopics.map((topic, index) => {
                const Icon = topic.icon;
                return (
                  <motion.button
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    onClick={() => toggleTopic(topic.id)}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-105 ${
                      topic.enabled
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20 shadow-lg shadow-pink-500/10 scale-[1.02]"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-pink-300 dark:hover:border-pink-900/50"
                    }`}
                  >
                    {/* Check badge */}
                    {topic.enabled && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="h-4 w-4 text-white" strokeWidth={3} />
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-xl ${
                          topic.enabled
                            ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold mb-1 ${
                            topic.enabled
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {topic.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {topic.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Research Papers Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Research Paper Sources
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Select academic databases to discover research papers
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedSources.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => toggleSource(source.id)}
                    className={`p-4 rounded-xl border-2 text-center font-medium transition-all hover:scale-105 ${
                      source.enabled
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 shadow-md"
                        : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-pink-300 dark:hover:border-pink-900/50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {source.enabled && (
                        <div className="w-2 h-2 bg-pink-500 rounded-full" />
                      )}
                      <span>{source.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Info box */}
              <div className="mt-6 p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-xl border border-pink-200 dark:border-pink-900/30">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-medium mb-1">
                      We'll suggest relevant research papers
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Based on your {enabledCount} selected topics from {sourcesCount}{" "}
                      active sources
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </button>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
