"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, setIsLoading, logout } =
    useAuthStore();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        const userData = await authApi.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuthenticated && !isLoading) {
      loadUser();
    }
  }, [isAuthenticated, isLoading, router, setUser, setIsLoading]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Educational Content Aggregator
              </h1>
              <p className="text-sm text-gray-600">
                Your personalized learning feed
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.fullName || user.username}
                </p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold mb-4">
            Welcome to Your Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            This is a placeholder for your personalized content feed. Phase 1
            development is complete!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                Today's Feed
              </h3>
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-sm text-blue-700">New articles waiting</p>
            </div>

            <div className="p-6 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Read Today</h3>
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-sm text-green-700">Articles completed</p>
            </div>

            <div className="p-6 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Saved</h3>
              <p className="text-2xl font-bold text-purple-600">0</p>
              <p className="text-sm text-purple-700">Items bookmarked</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Phase 1 Completed ✅</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Frontend setup with Next.js and Tailwind CSS</li>
              <li>✓ Backend API with Express.js and TypeScript</li>
              <li>✓ PostgreSQL database with Prisma ORM</li>
              <li>✓ JWT authentication system</li>
              <li>✓ User registration and login</li>
              <li>✓ Professional UI with shadcn/ui</li>
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Next Steps:</h3>
            <p className="text-sm text-gray-600">
              Phase 2 will add content aggregation with n8n workflows for
              YouTube, arXiv, and RSS feeds.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
