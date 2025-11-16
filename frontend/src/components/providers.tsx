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
          toastOptions={{
            classNames: {
              toast: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg",
              title: "text-gray-900 dark:text-gray-100 font-semibold",
              description: "text-gray-600 dark:text-gray-400",
              actionButton: "bg-primary text-white",
              cancelButton: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100",
              error: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800",
              success: "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800",
              warning: "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800",
              info: "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800",
            },
          }}
          richColors
          closeButton
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
