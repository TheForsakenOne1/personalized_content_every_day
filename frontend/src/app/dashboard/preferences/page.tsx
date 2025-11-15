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
} from "lucide-react";

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
                className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
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
