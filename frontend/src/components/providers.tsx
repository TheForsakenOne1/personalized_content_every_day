"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster
          position="top-right"
          expand={true}
          toastOptions={{
            duration: 3000,
            classNames: {
              toast: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-sm",
              title: "text-gray-900 dark:text-gray-100 font-semibold text-sm",
              description: "text-gray-600 dark:text-gray-400 text-xs",
              actionButton: "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 transition-all",
              cancelButton: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all",
              error: "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 shadow-red-500/20",
              success: "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800 shadow-green-500/20",
              warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800 shadow-yellow-500/20",
              info: "bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-800 shadow-pink-500/20",
            },
          }}
          richColors
          closeButton
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
