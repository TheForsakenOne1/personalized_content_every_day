"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  BookMarked,
  TrendingUp,
  Settings,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    icon: Home,
    label: "Home",
  },
  {
    href: "/dashboard/search",
    icon: Search,
    label: "Search",
  },
  {
    href: "/dashboard/bookmarks",
    icon: BookMarked,
    label: "Saved",
  },
  {
    href: "/dashboard/trending",
    icon: TrendingUp,
    label: "Trending",
  },
  {
    href: "/dashboard/preferences",
    icon: Settings,
    label: "Settings",
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-white"
              )}
            >
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 dark:bg-blue-400 rounded-b-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon with scale animation */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1"
              >
                <Icon
                  className={cn(
                    "h-6 w-6 transition-transform",
                    isActive && "scale-110"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive && "font-semibold"
                  )}
                >
                  {item.label}
                </span>
              </motion.div>

              {/* Ripple effect on tap */}
              <motion.div
                className="absolute inset-0 bg-blue-500/10 rounded-lg"
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 1, opacity: [0.5, 0] }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
