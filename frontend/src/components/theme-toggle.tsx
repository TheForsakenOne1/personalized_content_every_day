"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
        <div className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2 hover:bg-pink-50 dark:hover:bg-pink-950/20 rounded-lg transition-all hover:scale-110 border border-transparent hover:border-pink-200 dark:hover:border-pink-900/50"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-pink-500 dark:text-pink-400" />
        ) : (
          <Moon className="h-5 w-5 text-pink-500 dark:text-pink-400" />
        )}
      </button>

      {/* Tooltip */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </div>
    </div>
  );
}
