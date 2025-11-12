"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export interface TopicPreference {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  priority: number;
  frequency: "daily" | "weekly" | "monthly";
  color: string;
}

interface TopicPreferenceCardProps {
  topic: TopicPreference;
  onToggle: (id: string) => void;
  onPriorityChange: (id: string, priority: number) => void;
  onFrequencyChange: (id: string, frequency: "daily" | "weekly" | "monthly") => void;
}

const priorityLabels = ["Low", "Medium", "High"];
const frequencyOptions = [
  { value: "daily", label: "Daily", description: "Get content every day" },
  { value: "weekly", label: "Weekly", description: "Get content once a week" },
  { value: "monthly", label: "Monthly", description: "Get content once a month" },
] as const;

export function TopicPreferenceCard({
  topic,
  onToggle,
  onPriorityChange,
  onFrequencyChange,
}: TopicPreferenceCardProps) {
  const Icon = topic.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-xl border-2 transition-all",
        topic.enabled
          ? "border-blue-200 dark:border-blue-900 shadow-lg shadow-blue-500/10"
          : "border-gray-200 dark:border-gray-700 shadow-sm"
      )}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "p-3 rounded-xl",
                topic.enabled ? topic.color : "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6",
                  topic.enabled ? "text-white" : "text-gray-400 dark:text-gray-500"
                )}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {topic.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {topic.description}
              </p>
            </div>
          </div>
          <Switch
            checked={topic.enabled}
            onCheckedChange={() => onToggle(topic.id)}
          />
        </div>

        {/* Controls - Only show when enabled */}
        <motion.div
          initial={false}
          animate={{
            height: topic.enabled ? "auto" : 0,
            opacity: topic.enabled ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Priority Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priority Level
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                  {priorityLabels[topic.priority]}
                </span>
              </div>
              <Slider
                value={topic.priority}
                onValueChange={(value) => onPriorityChange(topic.id, value)}
                min={0}
                max={2}
                step={1}
                showLabels
                labels={priorityLabels}
              />
            </div>

            {/* Frequency Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Content Frequency
              </label>
              <div className="grid grid-cols-3 gap-3">
                {frequencyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFrequencyChange(topic.id, option.value)}
                    className={cn(
                      "relative p-3 rounded-lg border-2 transition-all text-left",
                      topic.frequency === option.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <div
                      className={cn(
                        "text-sm font-semibold mb-1",
                        topic.frequency === option.value
                          ? "text-blue-700 dark:text-blue-400"
                          : "text-gray-900 dark:text-white"
                      )}
                    >
                      {option.label}
                    </div>
                    <div
                      className={cn(
                        "text-xs",
                        topic.frequency === option.value
                          ? "text-blue-600 dark:text-blue-500"
                          : "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {option.description}
                    </div>
                    {topic.frequency === option.value && (
                      <motion.div
                        layoutId={`frequency-${topic.id}`}
                        className="absolute inset-0 rounded-lg border-2 border-blue-500"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Disabled Overlay */}
      {!topic.enabled && (
        <div className="absolute inset-0 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl pointer-events-none" />
      )}
    </motion.div>
  );
}
