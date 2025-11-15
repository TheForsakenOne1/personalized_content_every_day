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
        "relative bg-white dark:bg-gray-800 rounded-xl border transition-all h-full",
        topic.enabled
          ? "border-gray-900 dark:border-white shadow-sm"
          : "border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "p-2.5 rounded-lg",
                topic.enabled ? topic.color : "bg-gray-100 dark:bg-gray-700"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  topic.enabled ? "text-white" : "text-gray-400 dark:text-gray-500"
                )}
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-0.5">
                {topic.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
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
          <div className="space-y-5 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Priority Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Priority
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
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
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {frequencyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFrequencyChange(topic.id, option.value)}
                    className={cn(
                      "relative p-2 rounded-lg border transition-all text-center",
                      topic.frequency === option.value
                        ? "border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-900"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <div
                      className={cn(
                        "text-xs font-semibold",
                        topic.frequency === option.value
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {option.label}
                    </div>
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
