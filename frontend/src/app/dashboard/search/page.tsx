"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Search Content
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Search for papers, articles, and videos
            </p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
