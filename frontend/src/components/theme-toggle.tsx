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

      {/* Tooltip with Arrow */}
      <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[9999] group-hover:translate-y-0 translate-y-1">
        <div className="relative">
          {/* Arrow */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900 dark:bg-gray-100"></div>
          {/* Tooltip Box */}
          <div className="relative px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium rounded-lg whitespace-nowrap shadow-lg">
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </div>
        </div>
      </div>
    </div>
  );
}
