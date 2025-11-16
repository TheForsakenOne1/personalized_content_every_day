"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  TopicPreferenceCard,
  TopicPreference,
} from "@/components/preferences/topic-preference-card";
import { toast } from "sonner";
import {
  Telescope,
  Globe2,
  History,
  MapPin,
  Code,
  BookOpen,
  FileText,
  Database,
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
} from "lucide-react";

interface PaperSource {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

const initialPaperSources: PaperSource[] = [
  {
    id: "arxiv",
    name: "arXiv",
    description: "Open access preprints in physics, mathematics, computer science",
    enabled: true,
  },
  {
    id: "pubmed",
    name: "PubMed",
    description: "Biomedical and life sciences research articles",
    enabled: true,
  },
  {
    id: "ieee",
    name: "IEEE Xplore",
    description: "Engineering, computer science, and technology papers",
    enabled: false,
  },
  {
    id: "springer",
    name: "Springer",
    description: "Multidisciplinary scientific research papers",
    enabled: false,
  },
  {
    id: "nature",
    name: "Nature",
    description: "High-impact research across all sciences",
    enabled: true,
  },
  {
    id: "sciencedirect",
    name: "ScienceDirect",
    description: "Peer-reviewed journals and book chapters",
    enabled: false,
  },
];

const initialTopics: TopicPreference[] = [
  {
    id: "astronomy",
    name: "Astronomy",
    description: "Space exploration, celestial phenomena, and cosmic discoveries",
    icon: Telescope,
    enabled: true,
    priority: 2,
    frequency: "daily",
    color: "bg-gradient-to-br from-pink-500 to-pink-600",
  },
  {
    id: "geopolitics",
    name: "Geopolitics",
    description: "International relations, global affairs, and political analysis",
    icon: Globe2,
    enabled: true,
    priority: 1,
    frequency: "weekly",
    color: "bg-gradient-to-br from-pink-400 to-pink-500",
  },
  {
    id: "history",
    name: "History",
    description: "Historical events, civilizations, and archaeological findings",
    icon: History,
    enabled: true,
    priority: 1,
    frequency: "weekly",
    color: "bg-gradient-to-br from-pink-600 to-rose-600",
  },
  {
    id: "geography",
    name: "Geography",
    description: "Earth sciences, climate studies, and environmental research",
    icon: MapPin,
    enabled: false,
    priority: 0,
    frequency: "monthly",
    color: "bg-gradient-to-br from-rose-500 to-pink-500",
  },
  {
    id: "software",
    name: "Software Development",
    description: "Programming, technology trends, and software engineering",
    icon: Code,
    enabled: true,
    priority: 2,
    frequency: "daily",
    color: "bg-gradient-to-br from-pink-500 to-rose-500",
  },
  {
    id: "literature",
    name: "Literature & Arts",
    description: "Books, artistic movements, and cultural studies",
    icon: BookOpen,
    enabled: false,
    priority: 0,
    frequency: "monthly",
    color: "bg-gradient-to-br from-rose-400 to-pink-400",
  },
  {
    id: "physics",
    name: "Physics",
    description: "Quantum mechanics, particle physics, and theoretical physics",
    icon: Atom,
    enabled: false,
    priority: 0,
    frequency: "weekly",
    color: "bg-gradient-to-br from-pink-500 to-pink-600",
  },
  {
    id: "psychology",
    name: "Psychology",
    description: "Human behavior, cognitive science, and mental health",
    icon: Brain,
    enabled: false,
    priority: 0,
    frequency: "weekly",
    color: "bg-gradient-to-br from-rose-500 to-pink-600",
  },
  {
    id: "medicine",
    name: "Medicine & Health",
    description: "Medical research, healthcare innovations, and wellness",
    icon: HeartPulse,
    enabled: false,
    priority: 0,
    frequency: "weekly",
    color: "bg-gradient-to-br from-pink-400 to-rose-400",
  },
  {
    id: "philosophy",
    name: "Philosophy",
    description: "Ethics, logic, metaphysics, and philosophical thought",
    icon: Lightbulb,
    enabled: false,
    priority: 0,
    frequency: "monthly",
    color: "bg-gradient-to-br from-pink-600 to-rose-500",
  },
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Pure and applied mathematics, statistics, and algorithms",
    icon: Calculator,
    enabled: false,
    priority: 0,
    frequency: "weekly",
    color: "bg-gradient-to-br from-rose-600 to-pink-600",
  },
  {
    id: "music",
    name: "Music",
    description: "Music theory, composition, and musical history",
    icon: Music,
    enabled: false,
    priority: 0,
    frequency: "monthly",
    color: "bg-gradient-to-br from-pink-500 to-rose-400",
  },
  {
    id: "visual-arts",
    name: "Visual Arts",
    description: "Painting, sculpture, digital art, and design",
    icon: Palette,
    enabled: false,
    priority: 0,
    frequency: "monthly",
    color: "bg-gradient-to-br from-rose-400 to-pink-500",
  },
  {
    id: "environmental-science",
    name: "Environmental Science",
    description: "Climate change, ecology, and conservation",
    icon: Leaf,
    enabled: false,
    priority: 0,
    frequency: "weekly",
    color: "bg-gradient-to-br from-pink-400 to-pink-500",
  },
  {
    id: "linguistics",
    name: "Linguistics",
    description: "Language structure, evolution, and communication",
    icon: Languages,
    enabled: false,
    priority: 0,
    frequency: "monthly",
    color: "bg-gradient-to-br from-pink-600 to-rose-600",
  },
  {
    id: "economics",
    name: "Economics",
    description: "Economic theory, markets, and financial systems",
    icon: TrendingUp,
    enabled: false,
    priority: 0,
    frequency: "weekly",
    color: "bg-gradient-to-br from-rose-500 to-pink-500",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    description: "Digital security, cryptography, and threat analysis",
    icon: Shield,
    enabled: false,
    priority: 0,
    frequency: "weekly",
    color: "bg-gradient-to-br from-pink-500 to-rose-600",
  },
  {
    id: "film",
    name: "Film & Cinema",
    description: "Film theory, cinematography, and movie history",
    icon: Film,
    enabled: false,
    priority: 0,
    frequency: "monthly",
    color: "bg-gradient-to-br from-rose-600 to-pink-500",
  },
];

export default function PreferencesPage() {
  const [topics, setTopics] = useState<TopicPreference[]>(initialTopics);
  const [paperSources, setPaperSources] = useState<PaperSource[]>(initialPaperSources);
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

  const handlePaperSourceToggle = (id: string) => {
    setPaperSources((prev) =>
      prev.map((source) =>
        source.id === id ? { ...source, enabled: !source.enabled } : source
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Preferences saved successfully");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-1">
              Content Preferences
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Choose topics and set your content delivery preferences
            </p>
          </motion.div>

          {/* Topic Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
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

          {/* Research Papers Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-pink-500" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Research Paper Sources
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select sources to discover and store research papers
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paperSources.map((source, index) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  className={`relative bg-white dark:bg-gray-900 rounded-xl border-2 p-4 transition-all cursor-pointer ${
                    source.enabled
                      ? "border-pink-500 dark:border-pink-500 shadow-lg shadow-pink-500/20"
                      : "border-gray-200 dark:border-gray-800 hover:border-pink-200 dark:hover:border-pink-900/50"
                  }`}
                  onClick={() => handlePaperSourceToggle(source.id)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        source.enabled
                          ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      }`}
                    >
                      <Database className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {source.name}
                        </h3>
                        {source.enabled && (
                          <div className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-medium rounded-full">
                            Active
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {source.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Suggested Papers */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-2xl p-6 border border-pink-200 dark:border-pink-900/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Suggested Papers for You
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Based on your interests in{" "}
                <span className="font-medium text-pink-600 dark:text-pink-400">
                  {topics
                    .filter((t) => t.enabled)
                    .map((t) => t.name)
                    .join(", ")}
                </span>
                , we'll suggest relevant research papers from your enabled sources.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Active sources:
                </span>
                <span className="text-pink-600 dark:text-pink-400 font-semibold">
                  {paperSources.filter((s) => s.enabled).length} of{" "}
                  {paperSources.length}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </motion.div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
